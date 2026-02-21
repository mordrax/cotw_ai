/**
 * Memory Management CLI Script
 *
 * Manages memory.md and detail files from the command line.
 * Reuses storage logic from tools/memory-mcp/src/storage.ts
 *
 * Commands:
 *   upsert <task_id> <task_summary> <prompt_summary> [--result <text>] [--plan <text>] [--author <text>] [--date <YYYY-MM-DD>]
 *   list [--limit N]
 *   detail <task_id>
 *
 * Usage:
 *   bun scripts/memory.ts upsert COTW-001 "Task summary" "Prompt summary" --plan "Plan text" --result "Result text"
 *   bun scripts/memory.ts list
 *   bun scripts/memory.ts detail COTW-001
 */

import path from "node:path";
import {
  loadMemory,
  appendMemoryLineWithLock,
  getUniqueDetailFilePath,
  getRelativeDetailPath,
  formatLine,
  sanitizeField,
  sanitizeMarkdownInline,
  getTodayDateString,
  upsertDetailFile,
  memoryFilePath,
  detailDirPath,
  memoryRootPath,
} from "../tools/memory-mcp/src/storage";
import type { TaskEntry, DetailPayload } from "../tools/memory-mcp/src/types";

// --- Argument parsing ---

interface ParsedArgs {
  command: string;
  positionalArgs: string[];
  options: Record<string, string>;
}

function parseArguments(): ParsedArgs {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    printUsage();
    process.exit(1);
  }

  const command = args[0];
  const positionalArgs: string[] = [];
  const options: Record<string, string> = {};

  let i = 1;
  while (i < args.length) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      if (i + 1 < args.length && !args[i + 1].startsWith("--")) {
        options[key] = args[i + 1];
        i += 2;
      } else {
        options[key] = "true";
        i += 1;
      }
    } else {
      positionalArgs.push(arg);
      i += 1;
    }
  }

  return { command, positionalArgs, options };
}

function printUsage(): void {
  console.log(`Memory Management CLI

Usage:
  bun scripts/memory.ts upsert <task_id> <task_summary> <prompt_summary> [options]
  bun scripts/memory.ts list [--limit N]
  bun scripts/memory.ts detail <task_id>

Commands:
  upsert    Create or update a task memory entry
  list      List all task entries
  detail    Show detail file for a task

Options for upsert:
  --result <text>  Result summary (appended to Execution Summary)
  --plan <text>    Plan summary (set-once in Plan section)
  --author <text>  Author name (defaults to "Claude Haiku 4.5 <noreply@anthropic.com>")
  --date <YYYY-MM-DD>  Date (defaults to today)

Environment variables:
  MEMORY_FILE_PATH           Path to memory.md (defaults to <project_root>/memory.md)
  MEMORY_DETAIL_DIR_PATH     Path to detail files dir (defaults to <project_root>/memory)
`);
}

// --- Main commands ---

async function handleUpsert(
  taskId: string,
  taskSummary: string,
  promptSummary: string,
  options: Record<string, string>,
): Promise<void> {
  const author = options.author || "Claude Haiku 4.5 <noreply@anthropic.com>";
  const date = options.date || getTodayDateString();
  const planSummary = options.plan || "";
  const resultSummary = options.result || "";

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    console.log("[ERROR] Invalid date format. Use YYYY-MM-DD.");
    process.exit(1);
  }

  try {
    const entries = await loadMemory();

    // Check if entry already exists
    const existing = entries.find((e) => e.taskId === taskId);
    if (existing) {
      console.log(`[OK] Task ${taskId} already exists. Updating detail file...`);
      const detailAbsPath = path.resolve(memoryRootPath, existing.detailFile);
      const payload: DetailPayload = {
        promptSummary: sanitizeMarkdownInline(promptSummary),
        planSummary: sanitizeMarkdownInline(planSummary),
        resultSummary: sanitizeMarkdownInline(resultSummary),
      };
      await upsertDetailFile(existing, payload);
      console.log(`[OK] ${formatLine(existing)}`);
      return;
    }

    // Create new entry
    const detailAbsPath = await getUniqueDetailFilePath(entries, date, taskSummary);
    const detailRelPath = getRelativeDetailPath(detailAbsPath);

    const newEntry: TaskEntry = {
      date,
      taskId: sanitizeField(taskId),
      taskSummary: sanitizeField(taskSummary),
      resultSummary: "",
      author: sanitizeField(author),
      detailFile: detailRelPath,
    };

    // Write detail file
    const payload: DetailPayload = {
      promptSummary: sanitizeMarkdownInline(promptSummary),
      planSummary: sanitizeMarkdownInline(planSummary),
      resultSummary: sanitizeMarkdownInline(resultSummary),
    };
    await upsertDetailFile(newEntry, payload);

    // Append to index
    await appendMemoryLineWithLock(newEntry);

    console.log(`[OK] ${formatLine(newEntry)}`);
  } catch (error) {
    console.log(`[ERROR] ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

async function handleList(options: Record<string, string>): Promise<void> {
  try {
    const entries = await loadMemory();
    const limit = options.limit ? parseInt(options.limit, 10) : Infinity;

    if (entries.length === 0) {
      console.log("[OK] No memory entries found.");
      return;
    }

    console.log(`[OK] Listing ${Math.min(entries.length, limit)} of ${entries.length} entries:\n`);

    const toDisplay = limit === Infinity ? entries : entries.slice(0, limit);
    for (const entry of toDisplay) {
      console.log(formatLine(entry));
    }
  } catch (error) {
    console.log(`[ERROR] ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

async function handleDetail(taskId: string): Promise<void> {
  try {
    const entries = await loadMemory();
    const entry = entries.find((e) => e.taskId === taskId);

    if (!entry) {
      console.log(`[ERROR] Task ${taskId} not found.`);
      process.exit(1);
    }

    const detailAbsPath = path.resolve(memoryRootPath, entry.detailFile);
    const content = await Bun.file(detailAbsPath).text();

    console.log(`[OK] Detail file for ${taskId}:\n`);
    console.log(content);
  } catch (error) {
    console.log(`[ERROR] ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

// --- Main ---

async function main(): Promise<void> {
  const { command, positionalArgs, options } = parseArguments();

  switch (command) {
    case "upsert": {
      if (positionalArgs.length < 3) {
        console.log("[ERROR] upsert requires: <task_id> <task_summary> <prompt_summary>");
        printUsage();
        process.exit(1);
      }
      const [taskId, taskSummary, promptSummary] = positionalArgs;
      await handleUpsert(taskId, taskSummary, promptSummary, options);
      break;
    }

    case "list": {
      await handleList(options);
      break;
    }

    case "detail": {
      if (positionalArgs.length < 1) {
        console.log("[ERROR] detail requires: <task_id>");
        printUsage();
        process.exit(1);
      }
      const [taskId] = positionalArgs;
      await handleDetail(taskId);
      break;
    }

    default: {
      console.log(`[ERROR] Unknown command: ${command}`);
      printUsage();
      process.exit(1);
    }
  }
}

main().catch((error) => {
  console.log(`[ERROR] ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
