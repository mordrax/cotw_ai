# Memory MCP Server (cotw_ai)

Strongly-typed MCP server (TypeScript + Bun) that stores:

- One index line per task in `memory.md`
- One detailed markdown file per task in `memory/`

Ported from the h2x project's plain JavaScript version to TypeScript with strict types.

## Index line format

`YYYY-MM-DD | task-id | summary | author | detail_file`

## Immutability policy

- `memory.md` is append-only: only add new task rows, never change or delete existing rows.
- Each index row is immutable once written.
- Results live only in the task detail file, never in the index.
- Detail files are extend-only: append to Plan (if missing), Execution Summary, and Prompt Log.

## Install

```bash
cd tools/memory-mcp
bun install
```

## Run

```bash
bun run src/server.ts
```

## MCP config for Cursor/Claude

```json
{
  "mcpServers": {
    "memory-md": {
      "command": "bun",
      "args": ["run", "/Users/h2xni/code/cotw_ai/tools/memory-mcp/src/server.ts"],
      "env": {
        "MEMORY_FILE_PATH": "/Users/h2xni/code/cotw_ai/memory.md",
        "MEMORY_DETAIL_DIR_PATH": "/Users/h2xni/code/cotw_ai/memory"
      }
    }
  }
}
```

## Tools

- `upsert_task_memory` — Create or update one index row + detail file for a task.
- `list_memory` — Return latest memory lines for prompt context.
- `get_task_detail` — Read the full detail markdown for a task_id.

## Usage pattern for agents

1. Call `list_memory` first (for context).
2. Derive a stable `task_id` (e.g. `COTW-001-movement-system`).
3. Call `upsert_task_memory` at start with `task_summary`, `author`, `prompt_summary`.
4. Call `upsert_task_memory` again on follow-up prompts with `result_summary`.
5. On completion, call with final `result_summary`.
