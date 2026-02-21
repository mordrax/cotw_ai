# Main Menu (MainMenuScene)

The hub screen after loading. Player chooses to start a new game, load, or change settings.

---

## Visual Design

### Title
- Text: `"Castle of the Winds"` — same blue serif style as loading screen
- Colour: **blue** (`#4a90d9`)
- Large, centred, top third of screen

### Subtitle
- Text: `"Chapter 1: Quest for Vengeance"`
- Smaller, muted blue-grey (`#8899bb`), below title

### Menu Buttons — Horizontal Layout
Three buttons arranged **horizontally** below the title/subtitle:

```
         Castle of the Winds
     Chapter 1: Quest for Vengeance

   [ New Game ]  [ Load Game ]  [ Settings ]
```

- Evenly spaced, centred as a group
- Style: rounded rectangles with text labels
- Hover: colour shift (background lightens or border highlight)
- Load Game: greyed out / disabled until save/load is implemented (Stage 5)

### Background
- Dark (`#0d1117`) matching loading screen
- Optional: subtle tile pattern or splash art if available

---

## Interactions

### Keyboard
- Left/Right arrows to navigate between buttons
- Enter to select

### Mouse
- Hover highlights the button
- Click to select

---

## Scene Flow

```
BootScene (load assets)
  → MainMenuScene
    → "New Game"  → CharacterCreationScene → GameScene
    → "Load Game" → GameScene (from saved state) [greyed until Stage 5]
    → "Settings"  → SettingsScene → back to MainMenuScene
```

---

## UI Library: rexUI (phaser3-rex-plugins)

Using **rexUI** for buttons, dropdowns, and all UI components throughout the game.

### Why rexUI
- Most complete Phaser 3 UI library (buttons, dropdowns, sliders, dialogs, panels, text inputs)
- Renders within the Phaser canvas (no DOM layer issues)
- Works with TypeScript and Vite
- Actively maintained

### Install
```bash
bun add phaser3-rex-plugins
```

### Register as scene plugin
```ts
// main.ts
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  // ...
  plugins: {
    scene: [{
      key: 'rexUI',
      plugin: RexUIPlugin,
      mapping: 'rexUI'
    }]
  }
};
```

### Scene usage
```ts
export class MainMenuScene extends Phaser.Scene {
  rexUI!: RexUIPlugin;

  create(): void {
    // Horizontal button group
    const buttons = this.rexUI.add.buttons({
      x: 400, y: 400,
      orientation: 'x',  // horizontal
      buttons: [
        createMenuButton(this, 'New Game'),
        createMenuButton(this, 'Load Game'),
        createMenuButton(this, 'Settings'),
      ],
      space: { item: 20 },
    }).layout();

    buttons.on('button.click', (button, index) => {
      // handle navigation
    });
  }
}
```

### Available rexUI components (used across the game)

| Component | Used in |
|---|---|
| `buttons` | Main menu, shop, dialogs |
| `dropDownList` | Settings (resolution, keybinds) |
| `label` | Button content, item tooltips |
| `dialog` | Confirmations, game over |
| `scrollablePanel` | Combat log, inventory list |
| `slider` | Volume, settings values |
| `inputText` | Character name entry (DOM-based) |
| `gridTable` | Inventory grid, shop listings |
| `sizer` / `gridSizer` | Layout containers for UI panels |
| `tabs` / `tabPages` | Inventory tabs (equipment, backpack, spells) |

---

## Files
- `src/scenes/main_menu_scene.ts` — new scene
- `src/main.ts` — register MainMenuScene + rexUI plugin
