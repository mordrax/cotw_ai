# Castle of the Winds — AI Edition

Castle of the Winds is a tile-based RPG made by Rick Saada in the late 80s. Many old school RPGers remember the game with fond memories and as such, this is my [~~first~~](https://github.com/mordrax/CoTWjs/) [~~second~~](https://github.com/mordrax/cotwmtor) [~~third~~](https://github.com/mordrax/cotwelm) fourth attempt to port the game into the modern era.

This time the twist is that I'm not writing the code — AI agents are. I'm the dungeon master; they're the adventuring party. What could go wrong?

## What is Castle of the Winds?

A Norse-mythology dungeon crawler from 1989. Two parts, ~40 dungeon levels, turn-based combat on a tile grid. You fight through mines, crypts, and forests to avenge your village, then storm a castle to defeat the final boss. Think roguelike with an inventory screen that would make Diablo jealous.

The original ran on Windows 3.1. We're bringing it to the browser with Phaser, bitECS, and an unhealthy amount of TypeScript.

## Previous Attempts

| Year | Repo | Stack | How far | Why it stopped |
|---|---|---|---|---|
| 2013 | [cotwjs](https://github.com/mordrax/CoTWjs) | TypeScript + jQuery | Basic engines | jQuery can't do game state |
| 2015 | [cotwmtor](https://github.com/mordrax/cotwmtor) | Meteor + React + Redux | Character creation, shops, dungeons | Framework churn (Meteor ↔ Webpack) |
| 2016–18 | [cotwelm](https://github.com/mordrax/cotwelm) | Elm 0.18 | 68 monsters, full combat, 8 dungeon levels | Elm ecosystem too small, 0.19 breaking changes |

See the [legacy/](legacy/) folder for detailed documentation on each attempt.

## Tech Stack

- **[Phaser 3](https://phaser.io/)** — 2D game engine (rendering, input, tilemaps, sprites)
- **[bitECS](https://github.com/NateTheGreatt/bitECS)** — Entity Component System (TypedArrays, cache-friendly)
- **[Vite](https://vitejs.dev/)** — HMR dev server (<1s hot reload)
- **[Vitest](https://vitest.dev/)** — Unit tests
- **[TypeScript](https://www.typescriptlang.org/)** — Strict mode
- **[Biome](https://biomejs.dev/)** — Format + lint
- **[Bun](https://bun.sh/)** — Runtime, package manager, script runner

For an educational deep-dive on why this stack was chosen, see [docs/tech-stack-comparison.md](docs/tech-stack-comparison.md).

## Prerequisites

- [Bun](https://bun.sh/) (v1.0+): `curl -fsSL https://bun.sh/install | bash`

That's it. Bun replaces Node, npm, and npx.

## Installation

```bash
git clone git@github.com:mordrax/cotw_ai.git
cd cotw_ai
bun install
```

## Running Locally

### Dev server (with HMR)

```bash
bun run dev
```

Opens at [http://localhost:8080](http://localhost:8080). Changes to any `.ts` file hot-reload in <1s.

### Run tests

```bash
bun run test
```

### Full validation (typecheck → lint → test)

```bash
bun run validate
```

### Production build

```bash
bun run build
```

Output goes to `dist/`.

## Project Structure

```
src/
  main.ts             Phaser game entry point
  scenes/             Phaser scenes (Boot, Game, UI)
  systems/            ECS systems — pure functions over component data
  components/         bitECS component definitions
  entities/           Entity factory functions
  assets/             Type-safe asset manifest
tests/                Vitest unit tests
legacy/               Historical docs from prior rewrites
docs/                 Tech docs and design docs
tools/memory-mcp/     Memory MCP server for AI agent context
scripts/              Validation and build scripts
public/assets/        Sprites and tilesets
```

## The Agentic Workflow

This project is built by AI coding agents (Claude, Cursor) using a tight feedback loop:

1. Agent reads prior context from the [memory MCP server](tools/memory-mcp/)
2. Agent writes TypeScript code
3. `tsc --noEmit` — instant typecheck
4. `vitest run` — instant tests
5. Vite HMR — see changes in browser in <1s
6. Agent records results back to memory

See [CLAUDE.md](CLAUDE.md) for full agent instructions.

## Devlog

History repeats itself, but this time with better tooling:

- **Attempt 1** taught me that jQuery is not a game engine
- **Attempt 2** taught me that framework stability matters more than framework features
- **Attempt 3** taught me that type safety is everything, but ecosystem size matters too
- **Attempt 4** is teaching me that if you can't beat the bugs, recruit an army of AI agents to fight them for you
