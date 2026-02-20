import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import fs from "node:fs/promises";
import path from "node:path";
import {
  loadMemory,
  appendMemoryLineWithLock,
  getUniqueDetailFilePath,
  getRelativeDetailPath,
  addEntryIfNew,
  upsertDetailFile,
  formatLine,
  sanitizeField,
  getTodayDateString,
  memoryFilePath,
  memoryRootPath,
} from "./storage";
import { upsertTaskMemorySchema, listMemorySchema, getTaskDetailSchema } from "./schema";
import type { UpsertTaskMemoryInput, ListMemoryInput, GetTaskDetailInput } from "./schema";
import type { TaskEntry } from "./types";

const server = new McpServer({
  name: "memory-md-mcp",
  version: "0.2.0",
});

server.tool(
  "upsert_task_memory",
  "Create or update one line in memory.md index and maintain detailed task file. Keeps one line per task_id.",
  upsertTaskMemorySchema,
  async ({ task_id, task_summary, result_summary, author, prompt_summary, plan_summary, date }: UpsertTaskMemoryInput) => {
    const entries = await loadMemory();
    const normalizedTaskId = sanitizeField(task_id);
    const existing = entries.find((x) => x.taskId === normalizedTaskId);

    let detailFile = existing?.detailFile ?? "";
    if (!detailFile) {
      const detailAbsPath = await getUniqueDetailFilePath(
        entries.filter((x) => x.taskId !== normalizedTaskId),
        sanitizeField(date || getTodayDateString()),
        task_summary,
      );
      detailFile = getRelativeDetailPath(detailAbsPath);
    }

    const indexEntry: TaskEntry = {
      date: sanitizeField(date || getTodayDateString()),
      taskId: normalizedTaskId,
      taskSummary: sanitizeField(task_summary),
      resultSummary: "",
      author: sanitizeField(author),
      detailFile: sanitizeField(detailFile),
    };

    const { indexModified } = addEntryIfNew(entries, indexEntry);
    if (indexModified) {
      await appendMemoryLineWithLock(indexEntry);
    }

    const persistedEntries = indexModified ? await loadMemory() : entries;
    const persistedEntry = persistedEntries.find((x) => x.taskId === normalizedTaskId);
    if (!persistedEntry) {
      throw new Error(`Unable to persist memory entry for task '${normalizedTaskId}'`);
    }

    await upsertDetailFile(persistedEntry, {
      promptSummary: sanitizeField(prompt_summary ?? ""),
      planSummary: sanitizeField(plan_summary ?? ""),
      resultSummary: sanitizeField(result_summary ?? ""),
    });

    const indexMsg = indexModified ? `${memoryFilePath} and ` : "";
    return {
      content: [
        {
          type: "text" as const,
          text: `Updated task '${persistedEntry.taskId}' in ${indexMsg}${persistedEntry.detailFile}`,
        },
      ],
    };
  },
);

server.tool(
  "list_memory",
  "Return the latest memory lines from memory.md for prompt context.",
  listMemorySchema,
  async ({ limit }: ListMemoryInput) => {
    const entries = await loadMemory();
    const lines = entries.slice(-limit).map(formatLine);

    return {
      content: [
        {
          type: "text" as const,
          text: lines.length > 0 ? lines.join("\n") : "(memory is empty)",
        },
      ],
    };
  },
);

server.tool(
  "get_task_detail",
  "Read detailed memory markdown for a task_id from the memory detail folder.",
  getTaskDetailSchema,
  async ({ task_id }: GetTaskDetailInput) => {
    const entries = await loadMemory();
    const taskId = sanitizeField(task_id);
    const entry = entries.find((x) => x.taskId === taskId);

    if (!entry) {
      return {
        content: [{ type: "text" as const, text: `Task '${taskId}' not found in ${memoryFilePath}` }],
      };
    }

    if (!entry.detailFile) {
      return {
        content: [{ type: "text" as const, text: `Task '${taskId}' has no detail file path in memory index` }],
      };
    }

    const detailAbsPath = path.resolve(memoryRootPath, entry.detailFile);
    try {
      const content = await fs.readFile(detailAbsPath, "utf8");
      return { content: [{ type: "text" as const, text: content }] };
    } catch {
      return {
        content: [{ type: "text" as const, text: `Detail file missing for task '${taskId}': ${detailAbsPath}` }],
      };
    }
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
