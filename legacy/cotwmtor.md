# cotwmtor (2015) — Second Rewrite

**Stack:** Meteor + React + Redux
**Repo:** mordrax/cotwmtor
**Devlog:** mordrax.github.io/cotwmtor

## Architecture

Redux action/reducer pattern for centralized game state. React components for rendering.

## What Was Built

- **Character creation** — Full stat allocation system
- **Maps** — Village area + farm area with tile-based movement
- **Inventory** — Drag-and-drop via React DnD library, weight and bulk constraints
- **Shops** — Buy/sell system with coin change-making algorithm
- **Dungeon generation** — A* pathfinding, multiple room shapes:
  - Rectangular
  - Circular
  - Cross-shaped
  - Diamond

## Why It Stopped

Repeated framework churn destabilised the codebase:

1. Started with Meteor
2. Migrated to Webpack
3. Migrated back to Meteor

Each migration broke things and consumed development time. The developer moved to Elm, seeking type safety and architectural purity.

## Key Lesson

Framework stability matters. Chasing tooling changes instead of building features kills momentum. Type safety prevents entire categories of bugs.
