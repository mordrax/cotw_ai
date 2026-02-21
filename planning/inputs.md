# Input System — Phaser Interface Plan

## Context

Castle of the Winds uses a tile-based, turn-driven dungeon crawler design. Movement is discrete (one tile per turn). This plan describes how Phaser keyboard and mouse events are captured and piped into the ECS layer.

---

## Architecture

Input flows in two layers:

```
Phaser Scene (keyboard / mouse events)
          │
          ▼
src/systems/input_system.ts     ← samples Phaser state each frame, writes to Input component
          │
          ├──▶ src/systems/movement_system.ts    ← reads dx/dy, steps player on grid
          └──▶ src/systems/interaction_system.ts ← reads mouse events for UI + map
```

`GameScene.update()` calls `inputSystem(world, this)` first, before all other systems.

---

## Files

### `src/components/input.ts` _(new)_
bitECS component — per-entity input intent for the current frame:

```ts
export const Input = defineComponent({
  dx: Types.i8,         // -1 | 0 | 1  (column delta)
  dy: Types.i8,         // -1 | 0 | 1  (row delta)
  isInteract: Types.ui8,   // 1 = interact / open / confirm
  isInventory: Types.ui8,  // 1 = toggle inventory panel
  isMagic: Types.ui8,      // 1 = toggle spell panel
  isWait: Types.ui8,       // 1 = wait/rest one turn
});
```

### `src/systems/input_system.ts` _(new)_
`function inputSystem(world: IWorld, scene: Phaser.Scene): IWorld`

- Resets all Input fields to 0 at the start of every frame
- Reads arrow keys via `scene.input.keyboard.createCursorKeys()`
- Reads WASD via `scene.input.keyboard.addKey()`
- Reads numpad (1–9) for 8-directional + wait
- Uses `Phaser.Input.Keyboard.JustDown(key)` for one-shot actions (no auto-repeat)
- Writes computed `dx`/`dy` and action flags to `Input` component for the player entity

### `src/systems/interaction_system.ts` _(stub)_
`function interactionSystem(world: IWorld, scene: Phaser.Scene): IWorld`

- Reads `scene.input.activePointer` for mouse position each frame
- Listens on `scene.input.on('pointerdown', cb)` for click events
- Converts pointer world coords → tile coordinates for map interaction
- Emits `scene.events.emit('inventory:click', slotIndex)` for UI events
- Delegates inventory/map disambiguation by checking pointer position against UI bounds

---

## Keyboard Map

| Key(s) | Action | dx / dy |
|---|---|---|
| `↑` / `W` / Numpad `8` | Move North | 0, -1 |
| `↓` / `S` / Numpad `2` | Move South | 0, +1 |
| `←` / `A` / Numpad `4` | Move West | -1, 0 |
| `→` / `D` / Numpad `6` | Move East | +1, 0 |
| Numpad `7` | Move NW | -1, -1 |
| Numpad `9` | Move NE | +1, -1 |
| Numpad `1` | Move SW | -1, +1 |
| Numpad `3` | Move SE | +1, +1 |
| Numpad `5` / `.` | Wait one turn | — |
| `Space` / `Enter` | Interact / confirm | — |
| `I` | Toggle inventory | — |
| `M` | Toggle spell panel | — |
| `Esc` | Close menus | — |
| `G` | Pick up item | — |

---

## Mouse Map

| Action | Area | Intent |
|---|---|---|
| Left click | Map tile | Move-to or target tile |
| Left click | Inventory slot | Select / use item |
| Right click | Inventory slot | Context menu (use, drop, equip) |
| Left click | UI button | Trigger button action |

---

## Key Phaser APIs

| API | Usage |
|---|---|
| `scene.input.keyboard.createCursorKeys()` | Arrow key cursors |
| `scene.input.keyboard.addKey(KeyCodes.W)` | Individual key bindings |
| `Phaser.Input.Keyboard.JustDown(key)` | One-shot keypress (no hold-repeat) |
| `scene.input.activePointer` | Current mouse position each frame |
| `scene.input.on('pointerdown', cb)` | Mouse click handler |
| `scene.events.emit(event, data)` | Cross-scene communication (Game ↔ UI) |

---

## Integration Points

| File | Change |
|---|---|
| `src/components/input.ts` | New file |
| `src/components/index.ts` | Export `Input` |
| `src/systems/input_system.ts` | New file |
| `src/systems/interaction_system.ts` | New stub file |
| `src/systems/index.ts` | Export new systems |
| `src/scenes/game_scene.ts` | Call `inputSystem(world, this)` in `update()` |
| `src/systems/movement_system.ts` | Will later read `Input.dx`/`dy` instead of `Velocity` |

---

## Verification

1. `bun run dev` — verify arrow keys log directional intent to console (stub behavior)
2. Numpad diagonals produce correct dx/dy combinations
3. Mouse click on canvas logs tile coordinates to console
4. `bun run validate` — zero type errors, lint clean, tests pass
