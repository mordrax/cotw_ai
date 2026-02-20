import { z } from "zod";

export const upsertTaskMemorySchema = {
  task_id: z.string().min(1).describe("Stable task key, e.g. COTW-001-movement-system"),
  task_summary: z.string().min(1).describe("One-line summary of the task"),
  result_summary: z
    .string()
    .optional()
    .describe("Optional one-line result summary. If omitted, keeps previous result or pending."),
  author: z.string().min(1).describe("Task author as 'Name <email>'"),
  prompt_summary: z
    .string()
    .min(1)
    .describe("Required one-line summary of this prompt/update. Appended to task detail prompt log."),
  plan_summary: z.string().optional().describe("Optional plan summary for the task detail Plan section."),
  date: z.string().optional().describe("Optional YYYY-MM-DD. Defaults to current date if not provided."),
} as const;

export const listMemorySchema = {
  limit: z.number().int().min(1).max(200).default(20),
} as const;

export const getTaskDetailSchema = {
  task_id: z.string().min(1),
} as const;

export type UpsertTaskMemoryInput = {
  task_id: string;
  task_summary: string;
  result_summary?: string;
  author: string;
  prompt_summary: string;
  plan_summary?: string;
  date?: string;
};

export type ListMemoryInput = {
  limit: number;
};

export type GetTaskDetailInput = {
  task_id: string;
};
