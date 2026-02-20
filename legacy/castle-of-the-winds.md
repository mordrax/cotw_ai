# Castle of the Winds — Original Game

**Developer:** Rick Saada
**Publisher:** Epic MegaGames
**Platform:** Windows 3.1
**Years:** 1989 (Part I), 1993 (Part II)

## Overview

A tile-based roguelike RPG set in Norse mythology. The player's village is destroyed and they embark on a quest for revenge, dungeon crawling through mines, forests, crypts, and ultimately a castle.

## Structure

- **Part I: "A Question of Vengeance"** — Free/shareware, approximately 15 dungeon levels
- **Part II: "Lifthransir's Bane"** — Commercial, approximately 25 additional levels (~40 total)

## Character Stats

Standard RPG attributes:

| Stat | Effect |
|------|--------|
| STR  | Melee damage bonus, carry capacity |
| INT  | Spell power, mana pool |
| CON  | Hit points, HP regeneration |
| DEX  | Hit chance, dodge, armor class |

## Combat

Turn-based on a tile grid. Melee hit chance formula:

```
hit_chance = attacker_DEX + level_bonuses - target_AC - bulk_penalty - encumbrance_penalty +/- size_modifiers
```

## Spell System

Six categories, approximately 30 spells total:

1. **Flame** — Fire-based attack spells
2. **Lightning** — Electrical attack spells
3. **Cold/Ice** — Ice-based attack spells
4. **Mana Blast** — Pure magical energy attacks
5. **Healing** — HP restoration, cure status effects
6. **Misc/Utility** — Teleport, identify, light, protection

## Item Types

- **Weapons:** Swords, maces, axes, bows
- **Armor:** Helm, shield, body armor, gloves, boots, gauntlets
- **Consumables:** Potions, scrolls
- **Charged items:** Wands, staves
- **Accessories:** Rings, amulets
- **Identification system:** Items can be unidentified or cursed; scrolls of identify reveal properties

## Town Services

- **Temple** — Healing, curse removal, resurrection
- **Bank** — Deposit and withdraw gold
- **Shops** — Buy and sell equipment
- **Sage** — Identify items for a fee

## Technical

- Win3.1 tile-based graphics
- 32x32 pixel tiles
- Grid-based movement (8-directional)
