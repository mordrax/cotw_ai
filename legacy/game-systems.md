# Game Systems — Scope Overview

What cotwelm implemented versus what remains for a complete Castle of the Winds rewrite.

## Implemented in cotwelm

- **Tile-based movement** — 8-directional grid movement
- **Melee combat** — Full hit/damage formula with critical hits
- **68 monster types** — Complete stat tables, AI via A* pathfinding
- **Field of view** — Room-based reveal system
- **Equipment/inventory/containers** — Slot-based equipping, weight and bulk
- **4 shops** — 2 fully stocked with buy/sell
- **Loot drops** — Based on monster type and dungeon level
- **Character stats + leveling** — Experience thresholds, stat progression
- **Dungeon generation** — Procedural, 8 levels with multiple room shapes
- **3 hand-crafted maps** — Village, farm, mines entrance
- **Seedable randomness** — PCG generator for reproducible dungeons
- **Dungeon editor** — In-browser tool for testing level generation

## Remaining for Full Rewrite

### Magic System
- 6 spell categories: Flame, Lightning, Cold/Ice, Mana Blast, Healing, Misc/Utility
- Mana pool resource
- Spell books (learn/forget spells)
- Casting mechanics and spell targeting

### Consumables and Charged Items
- Potions, scrolls, wands, staves
- Charges system for wands/staves
- Identification states: unknown, identified, cursed

### Ranged Combat
- Bows and thrown weapons
- Projectile trajectory on the tile grid

### Traps
- Floor traps and trapped chests
- Trap detection skill
- Trap disarming

### Keys and Locked Doors
- Key items that unlock specific doors
- Locked door mechanics

### Town NPCs
- **Temple** — Heal, remove curse, resurrect
- **Bank** — Deposit and withdraw gold
- **Sage** — Identify items for a fee

### Part II Content
- 3 additional towns
- 25-level Castle dungeon
- 2 boss encounters

### Persistence
- Save/load game state

### Audio
- Sound effects
- Music

### Combat Extensions
- Elemental resistances: fire, cold, lightning resistance modifiers in the damage formula
- Status effects: poison, paralysis, confusion, and others
