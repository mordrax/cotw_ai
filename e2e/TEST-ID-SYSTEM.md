# Test ID System for E2E Testing

## Overview

All interactive UI elements in the game have been assigned unique `testId` identifiers to enable reliable E2E testing with Playwright. This replaces the previous unreliable approach of guessing button coordinates.

## Naming Convention

Test IDs follow a hierarchical pattern:

```
{scene-name}-{element-type}-{element-name}
```

Examples:
- `main-menu-button-new-game` — "New Game" button in main menu
- `sprite-viewer-tab-tiles` — "Tiles" tab in sprite viewer
- `sprite-viewer-input-name` — Name input in sprite viewer metadata panel
- `character-creation-slider-str-thumb` — Strength slider thumb in character creation

## Element Types

- `button` — Clickable buttons
- `input` — Text input fields (HTML DOM elements)
- `textarea` — Multi-line text areas (HTML DOM elements)
- `slider` — Slider thumbs and tracks
- `tab` — Tab buttons
- `sprite` — Sprite grid items

## Implementation in Scenes

### Phaser GameObjects

For Phaser GameObjects (text, containers, circles), testId is assigned via:

```typescript
gameObject.setData("testId", "scene-name-element-type-element-name");
```

Examples:
- **Main Menu buttons** (`src/scenes/main_menu_scene.ts:78-106`):
  ```typescript
  container.setData("testId", testId);
  ```

- **Sprite Viewer tabs** (`src/scenes/sprite_viewer_scene.ts:37-50`):
  ```typescript
  btn.setData("testId", `sprite-viewer-tab-${key}`);
  ```

- **Character Creation sliders** (`src/scenes/character_creation_scene.ts:189-191`):
  ```typescript
  thumb.setData("testId", `character-creation-slider-${attr}-thumb`);
  ```

### DOM Elements

For HTML input/textarea elements, testId is assigned as the `id` attribute:

```typescript
inputElement.id = "sprite-viewer-input-name";
```

Examples:
- **Sprite Viewer metadata inputs** (`src/scenes/sprite_viewer_scene.ts:315-360`):
  ```typescript
  if (testId) {
    inputElement.id = testId;
  }
  ```

- **Character Creation name input** (`src/scenes/character_creation_scene.ts:119`):
  ```typescript
  this.nameInput.id = "character-creation-input-name";
  ```

## Scene-Specific Test IDs

### Main Menu (`main_menu_scene.ts`)
- `main-menu-button-new-game`
- `main-menu-button-load-game`
- `main-menu-button-view-map`
- `main-menu-button-view-sprites`
- `main-menu-button-settings`

### Sprite Viewer (`sprite_viewer_scene.ts`)
**Tabs:**
- `sprite-viewer-tab-tiles`
- `sprite-viewer-tab-monsters`
- `sprite-viewer-tab-items`
- `sprite-viewer-tab-buildings`
- `sprite-viewer-tab-spells`
- `sprite-viewer-tab-effects`

**Sprites:**
- `sprite-viewer-sprite-{index}` (e.g., `sprite-viewer-sprite-0`, `sprite-viewer-sprite-1`)

**Metadata Inputs:**
- `sprite-viewer-input-name`
- `sprite-viewer-input-ascii`
- `sprite-viewer-input-category`
- `sprite-viewer-input-function`

**Buttons:**
- `sprite-viewer-button-save`
- `sprite-viewer-button-reset`

### Character Creation (`character_creation_scene.ts`)
**Inputs:**
- `character-creation-input-name`

**Sliders:**
- `character-creation-slider-str-thumb`
- `character-creation-slider-str-track`
- `character-creation-slider-int-thumb`
- `character-creation-slider-int-track`
- `character-creation-slider-con-thumb`
- `character-creation-slider-con-track`
- `character-creation-slider-dex-thumb`
- `character-creation-slider-dex-track`

**Buttons:**
- `character-creation-button-begin-adventure`

### Settings (`settings_scene.ts`)
*(To be added when settings scene is updated)*

### Map View (`map_view_scene.ts`)
*(To be added when map view has interactive elements)*

## Test Helpers

The `e2e/test-helpers.ts` file provides utilities for working with test IDs:

- `navigateMainMenu(page, buttonTestId)` — Navigate to scenes using main menu buttons
- `clickElementById(page, elementId)` — Click a DOM element by ID
- `setInputValue(page, elementId, value)` — Set input field value
- `getInputValue(page, elementId)` — Get input field value
- `waitForElement(page, selector, timeout)` — Wait for element visibility

## Using Test IDs in Tests

### Example 1: Navigate to Sprite Viewer and click a sprite

```typescript
import { navigateMainMenu } from "./test-helpers";

await navigateMainMenu(page, "main-menu-button-view-sprites");
await page.waitForTimeout(800);

// Click on sprite by finding its approximate position and clicking
const canvas = page.locator("canvas");
const boundingBox = await canvas.boundingBox();
// ... calculate position and click
```

### Example 2: Interact with metadata input

```typescript
import { setInputValue, getInputValue } from "./test-helpers";

// Set value
await setInputValue(page, "sprite-viewer-input-name", "TestTile");

// Get value
const value = await getInputValue(page, "sprite-viewer-input-name");
```

### Example 3: Wait for metadata panel to appear

```typescript
const nameInput = page.locator("#sprite-viewer-input-name");
await expect(nameInput).toBeVisible({ timeout: 5000 });
```

## Adding New Test IDs

When creating new interactive UI elements:

1. **For Phaser GameObjects**, add the testId in the creation code:
   ```typescript
   const button = this.add.text(...);
   button.setData("testId", "scene-name-element-type-name");
   ```

2. **For DOM elements**, set the id attribute:
   ```typescript
   const input = document.createElement("input");
   input.id = "scene-name-element-type-name";
   ```

3. **Update this document** with the new testId in the appropriate section

## Why This System Works

✅ **Reliable** — No coordinate guessing, direct element identification
✅ **Maintainable** — Clear naming convention makes IDs self-documenting
✅ **Hierarchical** — Scene + type + name prevents ID collisions
✅ **Testable** — Works with both Phaser objects (via `data`) and DOM elements (via `id`)
✅ **Debuggable** — Console logs and screenshots show which testIds were used
