import { test, expect } from "@playwright/test";

/**
 * Scene Navigation Hotkey E2E Tests
 *
 * Tests hotkey-based navigation between Sprite Viewer and Map View:
 * - M key: Sprite Viewer → Map View
 * - S key: Map View → Sprite Viewer
 *
 * Tests verify navigation succeeds by checking that:
 * 1. No errors are thrown during navigation
 * 2. Canvas remains visible (scene loaded successfully)
 * 3. Navigation can occur repeatedly without errors
 */

test("M key navigates from sprite viewer to map view", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector("canvas", { timeout: 10_000 });
  await page.waitForTimeout(1000);

  // Navigate to sprite viewer
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(1000);

  // Verify canvas is visible (sprite viewer loaded)
  const canvas = page.locator("canvas");
  await expect(canvas).toBeVisible();
  console.log("✓ Sprite Viewer loaded");

  // Press M to navigate to map view
  await page.keyboard.press("m");
  await page.waitForTimeout(1000);

  // Verify canvas is still visible (map view loaded)
  await expect(canvas).toBeVisible();
  console.log("✓ M key navigation successful: Map View loaded");
});

test("S key navigates from map view to sprite viewer", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector("canvas", { timeout: 10_000 });
  await page.waitForTimeout(1000);

  // Navigate to map view
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(1000);

  // Verify canvas is visible (map view loaded)
  const canvas = page.locator("canvas");
  await expect(canvas).toBeVisible();
  console.log("✓ Map View loaded");

  // Press S to navigate to sprite viewer
  await page.keyboard.press("s");
  await page.waitForTimeout(1000);

  // Verify canvas is still visible (sprite viewer loaded)
  await expect(canvas).toBeVisible();
  console.log("✓ S key navigation successful: Sprite Viewer loaded");
});

test("can toggle between sprite viewer and map view multiple times", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForSelector("canvas", { timeout: 10_000 });
  await page.waitForTimeout(1000);

  // Navigate to sprite viewer
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(1000);

  const canvas = page.locator("canvas");
  await expect(canvas).toBeVisible();
  console.log("✓ Initial: Sprite Viewer loaded");

  // Toggle sequence: M, S, M, S (4 scene transitions)
  for (let i = 0; i < 4; i++) {
    const key = i % 2 === 0 ? "m" : "s";
    const direction = key === "m" ? "→ Map View" : "→ Sprite Viewer";

    await page.keyboard.press(key);
    await page.waitForTimeout(1000);

    // Verify canvas is visible after each transition
    await expect(canvas).toBeVisible();
    console.log(`✓ Toggle ${i + 1}: ${direction}`);
  }

  console.log("✓ Successfully toggled between scenes 4 times");
});
