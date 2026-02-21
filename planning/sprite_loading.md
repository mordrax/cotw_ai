# Castle of the Winds Sprite Sheet Loading Plan

## Context

Implement a complete sprite sheet loading system for Castle of the Winds in the cotw_ai Phaser project. Currently, the BootScene has commented-out asset loads and no asset loading infrastructure exists. The exploration revealed 9 sprite sheets with detailed frame data, grid layouts, and usage patterns from the cotwelm source.

The goal is to:
1. Create a planning document for sprite sheet loading strategy
2. Implement a module to load all COTW assets from `src/assets/original/`
3. Document all sprite sheets (buildings, equipment, items, monsters, spells, spell_effects, tiles, difficulty_level, RIP_blank)
4. Answer whether any sprite animations are missing
5. Create a test page to visualize loaded sprites during dev

---

## Sprite Sheets Inventory

From exploration of cotwelm source and asset files:

### Primary Sprite Sheets (All 32×32 frames)
1. **tiles.png** (224×320px): 70 frames total (48 currently mapped)
   - Core terrain: grass, rock, water, paths, stairs, doors, caves
   - Decorative: flowers, crops, fountains, altars, well, wagon

2. **monsters.png** (448×160px): 70 frames total (all mapped)
   - Hero variants (male/female), all enemy types (kobolds to dragons)
   - Includes boss monsters: surtur, dragons (red/blue/white/green)

3. **items.png** (320×928px): 290 frames total (87 item types used)
   - Potions, staffs, wands, weapons (8 types), armor (14 sets), helmets (4), accessory slots
   - Containers: purse, bag, pack, chest, enchanted-pack
   - Coins: copper, silver, gold, platinum
   - Special items: parchment, amulets, rings, belts, boots, gauntlets, cloaks, bracelets
   - Broken variants for damage state

4. **buildings.png** (736×448px): Variable-sized frames
   - Gate (96×32), Hut (64×64), Straw houses (96×96), Hut-temple (160×160)
   - Burnt variants available
   - 5 scaling variants: 1x-5x_buildings.png for different zoom levels

### Secondary Sprite Sheets (32×32 frames)
5. **spells.png** (192×96px): 18 frames total
   - Purpose: Spell icons for UI
   - Status: Load as static icons (no animation at this time)

6. **spell_effects.png** (128×128px): 16 frames total (4×4 grid)
   - Purpose: Visual effects for spells
   - Status: Load as static, TODO: Add animation when spell casting implemented

### Special Assets
7. **difficulty_level.png** (128×32px): 4 frames (Easy/Intermediate/Hard/Impossible)
   - Status: Skip for now - cotwelm uses pure CSS for difficulty icons

8. **RIP_blank.png** (428×336px): Single large tombstone image
   - Used for game-over screen
   - Load as single image, not sprite sheet

9. **equipment-dude.jpg** (233×569px): ~119 frames
   - Character equipment reference sheet
   - Status: Skip for now (reference asset only)

---

## Animation Strategy

**Sprites by animation requirement:**
- **Tiles**: Static sprites (no animation)
- **Monsters**: Static initially (animation support for future AI/movement)
- **Items**: Static sprites (one frame per item type)
- **Buildings**: Static sprites (multi-tile, non-animated)
- **Spells**: Static icons for UI/menus
- **Spell Effects**: Load as static, **TODO**: Implement animated sequences when spell casting mechanics added

---

## Implementation Tasks

### 1. Create Planning Document (SPRITE_LOADING_STRATEGY.md)
Contains asset manifest, frame dimensions, usage context, animation requirements, loading strategy.

### 2. Implement Asset Loading Module
**File**: `src/assets/assetLoader.ts`
- Function: `loadAllAssets(scene: Phaser.Scene): void`
- Loads all 9 sprite sheets with correct frame dimensions
- Each sprite sheet loaded via `scene.load.spritesheet()`

**File**: `src/assets/index.ts` (modify)
- Expand ASSET_KEYS with all sprite types
- Add frame metadata (width/height per sheet)
- Add BUILDING_VARIANTS for 1x-5x scaling

### 3. Integrate Asset Loading into BootScene
**File**: `src/scenes/boot_scene.ts` (modify)
- Call `loadAllAssets()` in `preload()`
- Transition to GameScene after loading

### 4. Create Sprite Viewer Scene
**File**: `src/scenes/sprite_viewer_scene.ts`
- Grid displays for tiles, monsters, items, buildings
- Scrollable list for items (290 frames)
- Back button to GameScene

### 5. Add Navigation in GameScene
**File**: `src/scenes/game_scene.ts` (modify)
- Add "[ View Sprites ]" button
- Navigate to SpriteViewerScene on click

### 6. Register New Scene
**File**: `src/main.ts` (modify)
- Import SpriteViewerScene
- Add to scene array

---

## Critical Files

| File | Action | Purpose |
|---|---|---|
| `src/assets/planning/SPRITE_LOADING_STRATEGY.md` | Create | Document sprite strategy |
| `src/assets/assetLoader.ts` | Create | Load all sprites |
| `src/assets/index.ts` | Modify | ASSET_KEYS manifest |
| `src/scenes/boot_scene.ts` | Modify | Call assetLoader in preload() |
| `src/scenes/sprite_viewer_scene.ts` | Create | Browse all sprites |
| `src/scenes/game_scene.ts` | Modify | Add View Sprites button |
| `src/main.ts` | Modify | Register SpriteViewerScene |

---

## Verification

1. Run `bun run dev` → Phaser starts on localhost:8080
2. BootScene loads all assets from `src/assets/original/`
3. GameScene displays title + "[ View Sprites ]" button
4. Click button → SpriteViewerScene launches
5. All 9 sprite sheets display in grids
6. No console errors
7. `bun run validate` passes (TypeScript, lint, tests)
