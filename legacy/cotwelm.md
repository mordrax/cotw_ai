# cotwelm (2016-2018) — Third Rewrite

**Stack:** Elm 0.18
**Repo:** mordrax/cotwelm

The most complete rewrite. Pure functional architecture with no runtime exceptions.

## Architecture

The Elm Architecture (TEA): Model / Update / View. Immutable state, pure functions, all side effects managed by the runtime.

## What Was Built

### Rendering
- 60+ tile types rendered via CSS background positioning on sprite sheets

### Maps
- 3 hand-built ASCII maps: village, farm, mines entrance
- 8 procedurally generated dungeon levels

### Combat
Full melee formula implemented:

```
hit_chance = attacker_DEX + (level * 2) - target_AC - bulk_penalty - encumbrance_penalty +/- size_modifier
```

- Critical hit triggers at less than 20% of the threshold
- Damage = weapon dice roll + STR bonus

### Field of View
Room-based FOV: rooms reveal fully when the player enters them.

### Pathfinding
A* algorithm used for both monster AI movement and player click-to-move.

### Monsters
68 monster types with full stat tables: HP, AC, speed, attacks, resistances.

### Shops
4 shops implemented, 2 fully stocked with item inventories.

### Inventory
Full equipment/inventory/container system with slot-based equipping.

### Loot
Drop system based on monster type and dungeon level.

### Character
Stats and level-up formula with experience thresholds.

### Randomness
Seedable PCG (permuted congruential generator) throughout for reproducible dungeon generation.

### Bonus
In-browser dungeon editor for testing and tuning level generation.

## Not Implemented

- Spells and magic system
- Potions, scrolls, wands, staves
- Ranged combat
- Traps
- Locked doors and keys
- Town NPCs (temple, bank, sage)
- Part II content
- Save/load
- Sound

## Why It Stopped

Elm's type system was excellent for catching bugs at compile time, and the pure functional architecture made state changes predictable. However, the Elm ecosystem was too small, and the Elm 0.19 release introduced breaking changes that were discouraging.

## Key Lesson

Strong type systems and pure functional architecture pay off in correctness. But ecosystem size and language stability matter for long-term projects.
