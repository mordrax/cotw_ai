# Character Creation (CharacterCreationScene)

Reached via "New Game" from MainMenuScene. Player configures their character before entering the game world.

---

## Reference: cotwelm Implementation

The Elm version (`src/CharCreation.elm` + `src/View/CharCreation.elm`) had:

### Fields
- **Name**: text input, placeholder "What word did your mother utter as you came kicking and screaming into this world?", default "Conan the destroyer"
- **Attributes**: STR, INT, CON, DEX — point pool of 100, each starts at 50, slider (range input) per stat + vertical bar visualisation
- **Gender**: Male / Female radio buttons, with avatar preview (sprite toggles between male/female hero tile)
- **Difficulty**: Easy / Intermediate / Hard / Impossible — radio buttons, each with a visual icon
- **Buttons**: OK / Cancel / View Icon / Help (horizontal row at bottom)

### Attribute System
- 100 available points total, distributed across 4 stats
- Each stat 0–100, where 50 = average human
- "Available" pool shows remaining unallocated points as a blue bar
- Sliders adjust stats, deducting/returning from the available pool
- Humorous descriptions per stat at each 10-point threshold (most were TODO/placeholder)

### Layout (from View/CharCreation.elm)
```
┌─────────────────────────────────────────┐
│  Character name: [________________]     │
│                                         │
│  [Available] [STR] [INT] [DEX] [CON]   │
│   (bars + sliders for each)             │
│                                         │
│  ┌─ Character Gender ─┐  ┌─ Avatar ─┐  │
│  │ ○ Male  ○ Female   │  │  [sprite] │  │
│  └────────────────────┘  └──────────┘  │
│                                         │
│  ┌─ Game Difficulty ──────────────────┐ │
│  │ Easy  Intermediate  Hard  Impossible│ │
│  └────────────────────────────────────┘ │
│                                         │
│  [ OK ]  [ Cancel ]  [View Icon] [Help] │
└─────────────────────────────────────────┘
```

---

## Plan for cotw_ai

### Scene Flow
```
MainMenuScene → "New Game" → CharacterCreationScene → GameScene
                                    ↑
                              "Cancel" returns to MainMenuScene
```

### Fields

| Field | Type | Details |
|---|---|---|
| **Name** | Text input | rexUI `inputText` (DOM-based for proper cursor/IME). Default: empty, placeholder text. |
| **Attributes** | Sliders | 4 rexUI sliders (STR, INT, CON, DEX). Pool of 100 points, each starts at 50. Available counter shows remaining points. Dragging one slider reclaims/spends from the pool. |
| **Gender** | Radio buttons | Male / Female. rexUI buttons or custom toggle. Updates avatar sprite preview. |
| **Difficulty** | Radio buttons | Easy / Intermediate / Hard / Impossible. Affects starting stats or monster scaling (TBD). |
| **Avatar** | Sprite preview | 32×32 hero sprite from `monsters.png`, frame depends on gender selection. |

### Derived Stats (shown as preview)
| Stat | Formula |
|---|---|
| Max HP | CON × 5 |
| Max Mana | INT × 4 |
| Base AC | DEX ÷ 4 |
| Carry capacity | STR × 10 (in weight units) |

### Attribute Descriptions
Port the cotwelm humorous descriptions (filling in the TODO placeholders):

| Range | STR example | INT example |
|---|---|---|
| 0–10 | "Unable to push open a door whose hinges were just serviced with WD40." | "Struggles to count past ten without removing shoes." |
| 40–50 | "Of average strength!" | "Smart enough to be at the peak of the bell curve." |
| 90–100 | "Hammers are for wimps! You hit with your FISTS!" | "Can solve differential equations while dungeon crawling." |

### Layout (800×600)
```
┌──────────────────────────────────────────┐
│        Castle of the Winds               │  (blue title, smaller)
│    Chapter 1: Quest for Vengeance        │  (subtitle)
│                                          │
│  Character name: [____________________]  │
│                                          │
│  ┌─ Attributes ────────────────────────┐ │
│  │ Available: ████████ 0               │ │
│  │ STR: ────●──── 50  [description]    │ │
│  │ INT: ────●──── 50  [description]    │ │
│  │ CON: ────●──── 50  [description]    │ │
│  │ DEX: ────●──── 50  [description]    │ │
│  └─────────────────────────────────────┘ │
│                                          │
│  ┌ Gender ──┐  ┌ Difficulty ──────────┐  │
│  │ ○M  ○F   │  │ ○Easy ○Med ○Hard ○! │  │
│  │ [avatar] │  └─────────────────────┘  │
│  └──────────┘                            │
│                                          │
│  ┌ Derived Stats ──────────────────────┐ │
│  │ HP: 250  Mana: 200  AC: 12         │ │
│  └─────────────────────────────────────┘ │
│                                          │
│      [ Begin Adventure ]    [ Cancel ]   │
└──────────────────────────────────────────┘
```

### Implementation

#### New files
- `src/scenes/character_creation_scene.ts` — the scene
- `src/components/player_stats.ts` — ECS component for stats
- `src/data/attribute_descriptions.ts` — humorous description text per stat per threshold

#### Modified files
- `src/scenes/main_menu_scene.ts` — "New Game" → `CharacterCreationScene` (not GameScene)
- `src/entities/player.ts` — accept stat block from character creation
- `src/main.ts` — register CharacterCreationScene

#### rexUI components used
- `rexUI.add.slider()` — 4 attribute sliders (horizontal, track + thumb)
- `rexUI.add.buttons()` — gender toggle, difficulty radio group
- `rexUI.add.label()` — stat labels, derived stat display
- `rexUI.add.sizer()` — layout containers (vertical + horizontal)
- `inputText` (DOM) — character name text input

#### Data passed to GameScene
```ts
interface CharacterConfig {
  name: string;
  gender: "male" | "female";
  difficulty: "easy" | "intermediate" | "hard" | "impossible";
  attributes: {
    str: number;  // 0–100
    int: number;
    con: number;
    dex: number;
  };
}

// CharacterCreationScene → GameScene
this.scene.start("GameScene", { character: config });
```

#### Attribute slider logic
- Total pool: 100 points
- Each stat starts at 50 (total = 200, available = 100 - but wait...)

Actually, matching cotwelm: pool starts at 100 available, each stat starts at 50. The available pool is separate — it represents BONUS points you can allocate. So total stat points = 200 (base) + 100 (pool) = 300 potential across 4 stats.

Wait, re-reading cotwelm: `ava = 100, str = 50, dex = 50, con = 50, int = 50`. When you increase STR by 5, ava decreases by 5. So the pool is additive on top of the base 50s. Each stat ranges 0–100, and you can redistribute freely as long as available stays ≥ 0.

Port this logic exactly.
