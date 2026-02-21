# Castle of the Winds — Game Systems Skeleton

All systems required for a full rewrite, grouped into development stages.

---

## Rendering
- Tile grid renderer (32×32 sprites from spritesheet)
- Camera (follows player)
- Fog of war overlay (Hidden / Revealed / Visible tinting)
- Sprite animation (monster walk, spell effects)

## Input
- Keyboard: 8-directional movement (WASD/arrows/numpad), wait (period), inventory (I), magic (M), interact (space/enter)
- Mouse: click-to-move, click UI elements, drag inventory items

## Map
- TileMap data structure (2D array of TileType enum)
- Dungeon generator (room-based: rectangular/circular/cross/diamond rooms + L-shaped corridors)
- Seeded PCG randomness (reproducible generation)
- Hardcoded maps (village, farm — from the original)
- Level cache (floors persist when player leaves/returns)

## Field of View
- Room-based FOV (reveal full room on entry)
- Corridor line-of-sight while traversing
- Fog of war rendering

## Turn System
- Turn token (who acts next)
- Action queue (player acts → monsters act in order → next turn)
- Speed-based ordering (some monsters act every 2 turns, some every turn)

## Character
- Stats: STR, INT, CON, DEX
- Derived stats: MaxHP (CON-based), MaxMana (INT-based), BaseAC (DEX-based)
- Level + XP thresholds
- Level-up stat bonuses

## Movement
- Grid movement system (tile-based, checks wall collision)
- A* pathfinding (used by both AI and click-to-move)

## Combat
- Bump-to-attack initiation
- Hit formula: DEX + level×2 − targetAC − bulk − encumbrance ± size; d20 roll-under
- Critical hits at ≤20% of threshold
- Damage: weapon dice + STR bonus
- Elemental resistances (fire/cold/lightning modifier on damage)
- Status effects: poison, paralysis, confusion (applied by monsters/spells)
- Death + entity cleanup

## Monster AI
- States: Idle / Patrol / Chase / Attack
- Aggro: enters Chase when player in 8-tile radius or when damaged
- A* movement toward player in Chase state
- 68 monster types (data table: HP, AC, attack, speed, size, xpValue, resistances, loot table)
- Monster spawning per floor (scaled by depth)

## Inventory
- Backpack: 32 slots (8×4)
- Equipment slots: Head, Body, Hands, Boots, Shield, Weapon, Ring×2, Amulet
- Weight + bulk constraints (STR-based carry limit; encumbrance penalty)
- Pickup / drop / examine / use actions
- Container items (bags, chests)

## Items
- Weapons: swords, maces, axes, bows — damage dice + stat bonuses
- Armour: helm, body, gloves, boots, shield — AC values
- Accessories: rings, amulets — passive stat bonuses
- Potions: identified/unidentified; effects (heal, mana, resist, etc.)
- Scrolls: identified/unidentified; one-use spell effects
- Wands/staves: charges, charged spell effects
- Gold: pick up, coin denominations for shops
- Identification system: unknown → identified / cursed-identified

## Shops
- Buy/sell UI
- Coin change-making (gold pieces → silver → copper)
- 4 shop types (weapons, armour, general, magic)

## Town NPCs
- Temple: heal HP, remove curse, resurrect
- Bank: deposit/withdraw gold
- Sage: identify items (cost scales with item value)

## Magic
- Mana pool (INT-based max, slow per-turn regen)
- 6 spell categories: Flame, Lightning, Cold/Ice, Mana Blast, Healing, Misc/Utility
- ~30 spells total (data-driven table)
- Targeting modes: self, single tile, AoE radius, line/ray, directional
- Spell books as learnable inventory items
- Quick-slot hotbar (5 slots)

## Loot
- Per-monster loot tables
- Floor-depth scaling
- Ground item entities (dropped on death tile)

## Traps
- Floor traps (hidden until triggered or detected)
- Trapped chests
- Trap detection (DEX-based passive check on move)
- Disarm action

## Ranged Combat
- Bows: shoot in 8 directions, range limit, ammo
- Thrown weapons: arc trajectory, one-use
- Projectile entities (move per turn, hit on collision)

## Persistence
- Save: serialize world state → localStorage/IndexedDB
- Load: restore ECS world from JSON
- What's saved: player stats, position, floor number, inventory, equipment, floor map cache

## UI
- HUD: HP bar, Mana bar, level, floor number, gold
- Combat log: last 5 messages, scrollable
- Inventory panel (toggle I)
- Spell panel (toggle M)
- Spell targeting overlay (tile highlights)
- Shop screen
- Character sheet
- Game over screen

## Menus / Flow
- Loading screen (asset load progress bar)
- Main menu: New Game / Load Game / Settings
- Settings: keybinding display
- Character creation: name + point-buy stats
- Level transition (between dungeon floors)
- Town maps (separate TileMap from dungeon)

---

## Development Stages

Each stage leaves the game in a playable, demonstrable state.

| Stage | Name | Key deliverable |
|---|---|---|
| 1 | **Foundation** | Player sprite moves on tile grid; keyboard + mouse input; camera follows |
| 2 | **Dungeon + FOV** | Procedural dungeon generates; fog of war; stairs between floors |
| 3 | **Entry Flow** | Title screen → character creation → game; stats affect HP/mana |
| 4 | **Combat** | Monsters chase + fight; XP; leveling; death; combat log |
| 5 | **Inventory + Shops** | Items drop; pick up/equip; shop buy/sell; save/load |
| 6 | **Magic** | Spells learned from books; 6 categories castable; mana drains/regens |

Systems not in Stages 1–6 (ranged combat, traps, town NPCs, Part II content) are post-v1 work.
