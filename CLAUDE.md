# CLAUDE.md — cotw_ai

AI-agent-driven rewrite of Castle of the Winds, a 1989 Norse-mythology tile-based dungeon crawler RPG.

## Stack

- **Phaser 3** — 2D game engine (rendering, input, audio, tilemaps, scenes)
- **bitECS** — High-performance Entity Component System (TypedArrays, SoA layout)
- **Vite** — HMR dev server (<1s hot reload)
- **Vitest** — Unit tests (instant, runs via Bun)
- **TypeScript** — Strict mode, no `any`
- **Biome** — Format + lint
- **Bun** — Exclusive runtime for scripts, tooling, and package management

## Agent Workflow

1. Read memory MCP: `list_memory` for prior context
2. Derive a stable `task_id` (e.g. `COTW-001-movement-system`)
3. Call `upsert_task_memory` at start with plan/prompt summary
4. Work: write code → validate → iterate
5. Call `upsert_task_memory` on completion with `result_summary`

## Validation Loop

After making changes, run validation to zero errors:

```bash
bun scripts/validate.ts
```

Pipeline: `tsc --noEmit` → `biome check` → `vitest run`

All errors must be resolved before presenting work.

## Commands

| Command | Purpose |
|---|---|
| `bun install` | Install dependencies |
| `bun run dev` | Vite dev server (port 8080) |
| `bun run build` | Typecheck + Vite production build |
| `bun run typecheck` | `tsc --noEmit` |
| `bun run lint` | `biome check src/ tests/` |
| `bun run lint:fix` | `biome check --write src/ tests/` |
| `bun run test` | `vitest run` |
| `bun run test:watch` | `vitest` (watch mode) |
| `bun run validate` | Full validation pipeline |

## Project Structure

```
src/
  main.ts           — Phaser game entry point
  scenes/           — Phaser scenes (Boot, Game, UI)
  systems/          — ECS systems (pure functions over component data)
  components/       — bitECS component definitions
  entities/         — Entity factory functions
  assets/           — Type-safe asset manifest
tests/              — Vitest unit tests
legacy/             — Historical documentation from prior rewrites
docs/               — Tech docs and design docs
tools/memory-mcp/   — Memory MCP server (TypeScript + Bun)
scripts/            — Validation and build scripts
public/assets/      — Sprites, tilesets
```

## Coding Conventions

- **Casing**: `snake_case` for filenames, `camelCase` for variables/functions, `PascalCase` for types/classes, `UPPER_CASE` for constants
- **Strict typing**: never typecast to `any`
- **Booleans**: prefix with `is`, `has`, `can`, `should`
- **Functions**: prefer `function` over arrow (except inline); use `verb` + `noun` naming
- **Biome**: line width 120, 2-space indent, trailing commas, double quotes
- **ECS pattern**: components are pure data, systems are pure functions, entities are just IDs

## Branch Workflow

- Feature branches: `cotw-NNN-short-description`
- Commit messages: `cotw-NNN: description of change`
- PRs target `main`

## Memory MCP Server

Located at `tools/memory-mcp/`. Config for Cursor/Claude:

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
