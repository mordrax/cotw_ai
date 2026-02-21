# Loading Screen (BootScene)

The first thing the player sees. Loads all game assets, shows progress, transitions to main menu.

---

## Visual Design

### Title
- Text: `"Castle of the Winds"` — large, centred
- Font: bold serif (e.g. Georgia, or a Norse/medieval web font)
- Colour: **blue** (e.g. `#4a90d9` or `#1e6bb8`)
- Note: the original 1989 game used plain Windows 3.1 system fonts (MS Sans Serif, black on grey). This rewrite uses blue as a deliberate modern interpretation, not a literal recreation.

### Subtitle
- Text: `"Chapter 1: Quest for Vengeance"`
- Font: smaller, lighter weight, same serif family
- Colour: muted blue-grey (`#8899bb`)

### Progress Bar
- Positioned below the subtitle, centred
- Bar fills left to right as assets load (`progress` event: 0.0 → 1.0)
- Track: dark rectangle; fill: blue matching the title
- Optional percentage text above or inside the bar

### Background
- Solid dark (`#0d1117`) or very subtle dark tile texture if available

---

## Assets to Load

| Key | File | Type |
|---|---|---|
| `tiles` | `public/assets/tiles.png` | spritesheet 32×32 |
| `monsters` | `public/assets/monsters.png` | spritesheet 32×32 |
| `items` | `public/assets/items.png` | spritesheet 32×32 |
| `spells` | `public/assets/spells.png` | spritesheet 32×32 |
| `spell_effects` | `public/assets/spell_effects.png` | spritesheet 32×32 |
| Buildings | `public/assets/buildings/*.png` | images |

All sprite sheets are ripped from the original Windows 3.1 game via `mordrax/CoTWjs/assets/resources/`.

---

## Phaser Implementation

```ts
// BootScene.preload()
this.load.spritesheet('tiles', 'assets/tiles.png', { frameWidth: 32, frameHeight: 32 });
this.load.spritesheet('monsters', 'assets/monsters.png', { frameWidth: 32, frameHeight: 32 });
this.load.spritesheet('items', 'assets/items.png', { frameWidth: 32, frameHeight: 32 });
this.load.spritesheet('spells', 'assets/spells.png', { frameWidth: 32, frameHeight: 32 });
this.load.spritesheet('spell_effects', 'assets/spell_effects.png', { frameWidth: 32, frameHeight: 32 });

// Progress bar
this.load.on('progress', (value: number) => {
  progressBarFill.setDisplaySize(barWidth * value, barHeight);
});

// Transition
this.load.on('complete', () => {
  this.scene.start('MainMenuScene');
});
```

---

## File
- `src/scenes/boot_scene.ts` — modify existing
