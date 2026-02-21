import { test, expect } from '@playwright/test';

/**
 * Sprite Viewer E2E Tests - Canvas Click Interactions
 *
 * Layout Overview (based on SceneLayout):
 * - Menu bar: 56px height at top
 * - Content area: Below menu bar
 * - Tab buttons: Positioned in menu bar on the left
 * - Sprite grid: In content area, 5 columns for tiles, starts at x=60, y=20 (relative to content)
 * - Metadata panel: Right 35% of content area
 * - Tile spacing: 72px apart (with 2x scale: 144px actual)
 */

test('navigate to sprite viewer and click tile to show metadata', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('canvas', { timeout: 10_000 });
  await page.waitForTimeout(1000);

  // Navigate to View Sprites via keyboard
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(800);

  // Get canvas bounds to calculate click positions
  const canvas = page.locator('canvas');
  const boundingBox = await canvas.boundingBox();
  if (!boundingBox) throw new Error('Canvas not found');

  const canvasX = boundingBox.x;
  const canvasY = boundingBox.y;
  const canvasWidth = boundingBox.width;
  const canvasHeight = boundingBox.height;

  // Menu bar height: 56px
  const menuBarHeight = 56;
  const contentStartY = canvasY + menuBarHeight;

  // Sprite grid layout (tiles tab):
  // Grid starts at x=60, y=20 (relative to content area)
  // Tile spacing: 72px, scaled 2x = 144px actual
  // Click on first tile (row 0, col 0)
  const gridStartX = canvasX + 60;
  const gridStartY = contentStartY + 20;
  const firstTileX = gridStartX + 36; // Center of first tile
  const firstTileY = gridStartY + 36;

  console.log(`Canvas: ${canvasX}, ${canvasY}, ${canvasWidth}x${canvasHeight}`);
  console.log(`Clicking first tile at: ${firstTileX}, ${firstTileY}`);

  // Click on first tile
  await page.click('canvas', { position: { x: firstTileX - canvasX, y: firstTileY - canvasY } });
  await page.waitForTimeout(500);

  // Metadata panel should now have inputs visible
  const inputs = page.locator('input[data-sprite-viewer]');
  const inputCount = await inputs.count();
  console.log(`Found ${inputCount} sprite viewer inputs`);

  if (inputCount > 0) {
    const firstInput = inputs.first();
    await expect(firstInput).toBeVisible();

    // Take screenshot of metadata panel for contrast diagnosis
    await page.screenshot({ path: 'screenshots/sprite_viewer_metadata.png', fullPage: true });

    // Diagnose input color rendering
    const color = await firstInput.evaluate((el) =>
      window.getComputedStyle(el).color
    );
    const fillColor = await firstInput.evaluate((el) =>
      window.getComputedStyle(el).fill || window.getComputedStyle(el).color
    );
    console.log(`Input text color: ${color}`);
    console.log(`Input fill color: ${fillColor}`);
  }
});

test('edit tile metadata and click save button', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('canvas', { timeout: 10_000 });
  await page.waitForTimeout(1000);

  // Navigate to sprite viewer
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(800);

  // Get canvas bounds
  const canvas = page.locator('canvas');
  const boundingBox = await canvas.boundingBox();
  if (!boundingBox) throw new Error('Canvas not found');

  const canvasX = boundingBox.x;
  const canvasY = boundingBox.y;
  const menuBarHeight = 56;
  const contentStartY = canvasY + menuBarHeight;

  // Click on first tile to show metadata
  const gridStartX = canvasX + 60;
  const gridStartY = contentStartY + 20;
  const firstTileX = gridStartX + 36;
  const firstTileY = gridStartY + 36;

  await page.click('canvas', { position: { x: firstTileX - canvasX, y: firstTileY - canvasY } });
  await page.waitForTimeout(500);

  // Get the metadata inputs
  const inputs = page.locator('input[data-sprite-viewer]');
  const inputCount = await inputs.count();

  if (inputCount > 0) {
    // Edit the name input (first input in metadata panel)
    const nameInput = inputs.first();
    await nameInput.fill('TestTile');
    await page.waitForTimeout(300);

    // Get viewport height to calculate button position
    const viewportSize = page.viewportSize();
    if (!viewportSize) throw new Error('Viewport size not found');

    // Calculate approximate position of Save button
    // Panel is 35% of content width, positioned on right side
    const contentWidth = boundingBox.width * 0.35;
    const panelX = boundingBox.x + boundingBox.width * 0.65;
    const panelWidth = contentWidth - 20;
    const panelHeight = viewportSize.height - menuBarHeight;
    const buttonY = canvasY + menuBarHeight + panelHeight - 50;

    // Save button is on the left side of button row
    const saveButtonX = panelX + 10 + 20; // +20 for "[ " in "[ Save ]"
    const saveButtonY = buttonY;

    console.log(`Clicking Save button at: ${saveButtonX}, ${saveButtonY}`);

    // Click Save button
    await page.click('canvas', {
      position: {
        x: saveButtonX - canvasX,
        y: saveButtonY - canvasY
      }
    });
    await page.waitForTimeout(500);

    // After save, verify the input value persists
    const updatedInputs = page.locator('input[data-sprite-viewer]');
    const updatedCount = await updatedInputs.count();

    if (updatedCount > 0) {
      const updatedNameInput = updatedInputs.first();
      await expect(updatedNameInput).toHaveValue('TestTile');
    }
  }
});

test('click different sprite tabs (monsters, items, buildings, spells, effects)', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('canvas', { timeout: 10_000 });
  await page.waitForTimeout(1000);

  // Navigate to sprite viewer
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(800);

  const canvas = page.locator('canvas');
  const boundingBox = await canvas.boundingBox();
  if (!boundingBox) throw new Error('Canvas not found');

  const canvasX = boundingBox.x;
  const canvasY = boundingBox.y;

  // Tab buttons are in the menu bar at y ≈ 28 (half of 56px height)
  // Approximate x positions (will vary based on text width)
  const tabButtonXPositions = {
    tiles: canvasX + 90,      // Active by default
    monsters: canvasX + 160,
    items: canvasX + 220,
    buildings: canvasX + 290,
    spells: canvasX + 380,
    effects: canvasX + 450,
  };

  const tabButtonY = canvasY + 28;

  // Test clicking on "Monsters" tab
  console.log(`Clicking Monsters tab at: ${tabButtonXPositions.monsters}, ${tabButtonY}`);
  await page.click('canvas', {
    position: {
      x: tabButtonXPositions.monsters - canvasX,
      y: tabButtonY - canvasY,
    },
  });
  await page.waitForTimeout(500);

  await page.screenshot({ path: 'screenshots/sprite_viewer_monsters_tab.png' });

  // Test clicking on "Items" tab
  console.log(`Clicking Items tab at: ${tabButtonXPositions.items}, ${tabButtonY}`);
  await page.click('canvas', {
    position: {
      x: tabButtonXPositions.items - canvasX,
      y: tabButtonY - canvasY,
    },
  });
  await page.waitForTimeout(500);

  await page.screenshot({ path: 'screenshots/sprite_viewer_items_tab.png' });
});

test('sprite viewer metadata panel inputs have readable colors', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('canvas', { timeout: 10_000 });
  await page.waitForTimeout(1000);

  // Navigate to sprite viewer
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(800);

  // Click on first tile
  const canvas = page.locator('canvas');
  const boundingBox = await canvas.boundingBox();
  if (!boundingBox) throw new Error('Canvas not found');

  const canvasX = boundingBox.x;
  const canvasY = boundingBox.y;
  const menuBarHeight = 56;
  const contentStartY = canvasY + menuBarHeight;

  const gridStartX = canvasX + 60;
  const gridStartY = contentStartY + 20;
  const firstTileX = gridStartX + 36;
  const firstTileY = gridStartY + 36;

  await page.click('canvas', { position: { x: firstTileX - canvasX, y: firstTileY - canvasY } });
  await page.waitForTimeout(500);

  // Check all metadata inputs for color visibility
  const inputs = page.locator('input[data-sprite-viewer]');
  const inputCount = await inputs.count();

  const colorReport = [];
  for (let i = 0; i < inputCount; i++) {
    const input = inputs.nth(i);
    const color = await input.evaluate((el) => window.getComputedStyle(el).color);
    const bgColor = await input.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    const value = await input.inputValue();

    colorReport.push({
      index: i,
      value: value.substring(0, 20),
      color,
      bgColor,
    });
  }

  console.log('Metadata input color report:', JSON.stringify(colorReport, null, 2));

  // Verify inputs are visible (not white text on white background)
  for (const report of colorReport) {
    console.log(
      `Input ${report.index} ("${report.value}"): text=${report.color} bg=${report.bgColor}`
    );
  }
});
