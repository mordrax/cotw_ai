import fs from "node:fs/promises";
import path from "node:path";
import lockfile from "proper-lockfile";
import type { TaskEntry, DetailPayload, AddEntryResult } from "./types";

// --- Configuration ---

const defaultMemoryPath = path.resolve(import.meta.dir, "../../../memory.md");
const memoryFilePath = process.env.MEMORY_FILE_PATH ?? defaultMemoryPath;
const memoryRootPath = path.dirname(memoryFilePath);
const detailDirPath = process.env.MEMORY_DETAIL_DIR_PATH ?? path.join(memoryRootPath, "memory");
const memoryLockfilePath = path.join(memoryRootPath, ".memory.md.lock");

export { memoryFilePath, memoryRootPath, detailDirPath };

// --- Helpers ---

export function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

function getNowIsoString(): string {
  return new Date().toISOString();
}

export function sanitizeField(value: string | undefined | null): string {
  return String(value ?? "")
    .replace(/\r?\n/g, " ")
    .replace(/\|/g, "/")
    .replace(/\s+/g, " ")
    .trim();
}

export function sanitizeMarkdownInline(value: string | undefined | null): string {
  return sanitizeField(value).replace(/`/g, "'");
}

export function slugify(value: string): string {
  const cleaned = sanitizeField(value).toLowerCase();
  const slug = cleaned
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/g, "")
    .replace(/-+$/g, "");
  return slug || "task";
}

// --- Index line format ---

export function formatLine(entry: TaskEntry): string {
  const author = entry.author.length > 0 ? entry.author : "unknown";
  const detailFile = entry.detailFile.length > 0 ? entry.detailFile : "memory/unknown.md";
  return `${entry.date} | ${entry.taskId} | ${entry.taskSummary} | ${author} | ${detailFile}`;
}

export function parseLine(line: string): TaskEntry | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const parts = trimmed.split(" | ").map((x) => x.trim());
  if (parts.length < 4) return null;

  const [date, taskId] = parts;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;

  // Backward compatibility: old formats with "task: ..." and "result: ..."
  if (parts[2]?.startsWith("task: ") && parts[3]?.startsWith("result: ")) {
    const authorPart = parts[4] ?? "";
    const legacyAuthor = authorPart.startsWith("author: ") ? authorPart.replace(/^author:\s*/, "") : authorPart;
    return {
      date,
      taskId: sanitizeField(taskId),
      taskSummary: sanitizeField(parts[2].replace(/^task:\s*/, "")),
      resultSummary: sanitizeField(parts[3].replace(/^result:\s*/, "")),
      author: sanitizeField(legacyAuthor),
      detailFile: "",
    };
  }

  // Legacy 6-part: date | task_id | summary | result | author | detail_file
  if (parts.length >= 6) {
    return {
      date,
      taskId: sanitizeField(taskId),
      taskSummary: sanitizeField(parts[2]),
      resultSummary: sanitizeField(parts[3]),
      author: sanitizeField(parts[4]),
      detailFile: sanitizeField(parts[5]),
    };
  }

  // Current 5-part: date | task_id | summary | author | detail_file
  if (parts.length >= 5) {
    return {
      date,
      taskId: sanitizeField(taskId),
      taskSummary: sanitizeField(parts[2]),
      resultSummary: "",
      author: sanitizeField(parts[3]),
      detailFile: sanitizeField(parts[4]),
    };
  }

  return null;
}

// --- File operations ---

async function ensureMemoryFile(): Promise<void> {
  await fs.mkdir(path.dirname(memoryFilePath), { recursive: true });
  await fs.mkdir(detailDirPath, { recursive: true });
  try {
    await fs.access(memoryFilePath);
  } catch {
    await fs.writeFile(memoryFilePath, "", "utf8");
  }
}

export async function loadMemory(): Promise<TaskEntry[]> {
  await ensureMemoryFile();
  const content = await fs.readFile(memoryFilePath, "utf8");
  const lines = content
    .split(/\r?\n/)
    .map((x) => x.trim())
    .filter(Boolean);

  const entries: TaskEntry[] = [];
  for (const line of lines) {
    const parsed = parseLine(line);
    if (parsed) entries.push(parsed);
  }
  return entries;
}

export async function appendMemoryLineWithLock(entry: TaskEntry): Promise<void> {
  const release = await lockfile.lock(memoryFilePath, {
    lockfilePath: memoryLockfilePath,
    stale: 10000,
    retries: {
      retries: 5,
      minTimeout: 100,
      maxTimeout: 1000,
    },
  });

  try {
    const currentEntries = await loadMemory();
    const alreadyExists = currentEntries.some((x) => x.taskId === entry.taskId);
    if (!alreadyExists) {
      await fs.appendFile(memoryFilePath, `${formatLine(entry)}\n`, "utf8");
    }
  } finally {
    await release();
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function getRelativeDetailPath(detailAbsPath: string): string {
  return path.relative(memoryRootPath, detailAbsPath).replaceAll(path.sep, "/");
}

export async function getUniqueDetailFilePath(
  entries: readonly TaskEntry[],
  date: string,
  taskTitle: string,
): Promise<string> {
  const titleSlug = slugify(taskTitle);
  const baseName = `${date}-${titleSlug}`;
  const usedRelativePaths = new Set(entries.map((x) => x.detailFile).filter(Boolean));

  for (let i = 1; i <= 999; i += 1) {
    const suffix = i === 1 ? "" : `-${i}`;
    const fileName = `${baseName}${suffix}.md`;
    const candidateAbs = path.join(detailDirPath, fileName);
    const candidateRel = getRelativeDetailPath(candidateAbs);
    const isUsedByIndex = usedRelativePaths.has(candidateRel);
    const existsOnDisk = await fileExists(candidateAbs);
    if (!isUsedByIndex && !existsOnDisk) {
      return candidateAbs;
    }
  }

  throw new Error(`Unable to allocate detail file name for task '${taskTitle}'`);
}

export { getRelativeDetailPath };

export function addEntryIfNew(entries: readonly TaskEntry[], incoming: TaskEntry): AddEntryResult {
  const exists = entries.some((x) => x.taskId === incoming.taskId);
  if (exists) {
    return { entries, indexModified: false };
  }
  return { entries: [...entries, incoming], indexModified: true };
}

// --- Detail file operations ---

function getTemplateDetailContent(entry: TaskEntry, payload: DetailPayload): string {
  const now = getNowIsoString();
  const promptLine =
    payload.promptSummary.length > 0
      ? `- ${now} | prompt: ${payload.promptSummary} | result: ${sanitizeMarkdownInline(payload.resultSummary || "pending")}\n`
      : "";
  const planText = payload.planSummary || "pending";
  const execLine =
    payload.resultSummary.length > 0 ? `- ${now} | ${sanitizeMarkdownInline(payload.resultSummary)}\n` : "";
  const detailFile = entry.detailFile || "";

  return `# Task Detail: ${sanitizeMarkdownInline(entry.taskId)}

## Metadata
<!-- MEMORY_META_START -->
- Date: ${sanitizeMarkdownInline(entry.date)}
- Task ID: ${sanitizeMarkdownInline(entry.taskId)}
- Author: ${sanitizeMarkdownInline(entry.author || "unknown")}
- Index File: ${sanitizeMarkdownInline(path.basename(memoryFilePath))}
- Detail File: ${sanitizeMarkdownInline(detailFile)}
<!-- MEMORY_META_END -->

## Plan
<!-- PLAN_START -->
${sanitizeMarkdownInline(planText)}
<!-- PLAN_END -->

## Execution Summary
<!-- EXEC_SUMMARY_START -->
${execLine}<!-- EXEC_SUMMARY_END -->

## Prompt Log
<!-- PROMPT_LOG_START -->
${promptLine}<!-- PROMPT_LOG_END -->
`;
}

function getBetweenMarkers(content: string, startMarker: string, endMarker: string): string {
  const pattern = new RegExp(`${startMarker}\\n([\\s\\S]*?)\\n${endMarker}`);
  const match = content.match(pattern);
  if (!match) return "";
  return match[1] ?? "";
}

function replaceBetweenMarkers(
  content: string,
  startMarker: string,
  endMarker: string,
  nextBody: string,
): string {
  const pattern = new RegExp(`${startMarker}\\n([\\s\\S]*?)\\n${endMarker}`);
  if (!pattern.test(content)) return content;
  return content.replace(pattern, `${startMarker}\n${nextBody}\n${endMarker}`);
}

function shouldHydrateSection(existingBody: string | undefined): boolean {
  const text = sanitizeField(existingBody || "");
  return text.length === 0 || text.toLowerCase() === "pending";
}

export async function upsertDetailFile(entry: TaskEntry, payload: DetailPayload): Promise<void> {
  const detailAbsPath = path.resolve(memoryRootPath, entry.detailFile);
  const planText = sanitizeMarkdownInline(payload.planSummary || "");
  const promptText = sanitizeMarkdownInline(payload.promptSummary || "");
  const resultText = sanitizeMarkdownInline(payload.resultSummary || "");

  const exists = await fileExists(detailAbsPath);
  if (!exists) {
    const content = getTemplateDetailContent(entry, payload);
    await fs.writeFile(detailAbsPath, content, "utf8");
    return;
  }

  let content = await fs.readFile(detailAbsPath, "utf8");
  if (!content.includes("<!-- MEMORY_META_START -->")) {
    content = getTemplateDetailContent(entry, payload);
    await fs.writeFile(detailAbsPath, content, "utf8");
    return;
  }

  // Plan is immutable once set, unless missing/pending.
  const existingPlanBody = getBetweenMarkers(content, "<!-- PLAN_START -->", "<!-- PLAN_END -->");
  if (planText.length > 0 && shouldHydrateSection(existingPlanBody)) {
    content = replaceBetweenMarkers(content, "<!-- PLAN_START -->", "<!-- PLAN_END -->", planText);
  }

  // Execution Summary: append-only.
  if (resultText.length > 0) {
    const execBody = getBetweenMarkers(content, "<!-- EXEC_SUMMARY_START -->", "<!-- EXEC_SUMMARY_END -->");
    const trimmedExecBody = execBody.trim();
    const now = getNowIsoString();
    const nextLine = `- ${now} | ${resultText}`;
    const nextExecBody = trimmedExecBody.length > 0 ? `${trimmedExecBody}\n${nextLine}` : nextLine;
    content = replaceBetweenMarkers(content, "<!-- EXEC_SUMMARY_START -->", "<!-- EXEC_SUMMARY_END -->", nextExecBody);
  }

  // Prompt Log: append-only.
  if (promptText.length > 0) {
    const logBody = getBetweenMarkers(content, "<!-- PROMPT_LOG_START -->", "<!-- PROMPT_LOG_END -->");
    const trimmedLogBody = logBody.trim();
    const now = getNowIsoString();
    const nextLine = `- ${now} | prompt: ${promptText} | result: ${resultText || "pending"}`;
    const nextLogBody = trimmedLogBody.length > 0 ? `${trimmedLogBody}\n${nextLine}` : nextLine;
    content = replaceBetweenMarkers(content, "<!-- PROMPT_LOG_START -->", "<!-- PROMPT_LOG_END -->", nextLogBody);
  }

  await fs.writeFile(detailAbsPath, content, "utf8");
}
