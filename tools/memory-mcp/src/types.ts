/** A single row in the memory.md index file. */
export interface TaskEntry {
  readonly date: string;
  readonly taskId: string;
  readonly taskSummary: string;
  readonly resultSummary: string;
  readonly author: string;
  readonly detailFile: string;
}

/** Payload for creating/updating a detail file. */
export interface DetailPayload {
  readonly promptSummary: string;
  readonly planSummary: string;
  readonly resultSummary: string;
}

/** Result of attempting to add an entry to the index. */
export interface AddEntryResult {
  readonly entries: readonly TaskEntry[];
  readonly indexModified: boolean;
}
