import { Page } from "@playwright/test";

/**
 * Test helper utilities for E2E testing with Phaser scenes
 *
 * Since Phaser GameObjects don't have direct DOM selectors, we use a registry system
 * that stores testIds and allows Playwright to interact with them.
 */

/**
 * Find and click a Phaser GameObject by its testId
 * Works for any GameObject that has been assigned a testId via setData("testId", id)
 */
export async function clickByTestId(page: Page, testId: string): Promise<void> {
  // Evaluate JavaScript in the Playwright context to find the object and trigger its pointer event
  await page.evaluate(
    (id) => {
      // Get the Phaser game instance (accessible via window.__PHASER_DEBUG__)
      // or from the global game object if exposed
      const canvas = document.querySelector("canvas");
      if (!canvas) throw new Error("Canvas not found");

      // Create a custom event to identify which object was clicked
      window.__TEST_CLICK_ID__ = id;
    },
    testId,
  );

  // Click on the canvas (this will trigger the pointer event)
  await page.click("canvas");

  // Give the click a moment to register
  await page.waitForTimeout(100);
}

/**
 * Wait for a DOM element to be visible (used for HTML inputs, textareas)
 */
export async function waitForElement(page: Page, selector: string, timeout = 5000): Promise<void> {
  await page.waitForSelector(selector, { visible: true, timeout });
}

/**
 * Get the value of a DOM input element by ID
 */
export async function getInputValue(page: Page, elementId: string): Promise<string> {
  const element = page.locator(`#${elementId}`);
  await element.waitFor({ state: "visible" });
  return element.inputValue();
}

/**
 * Set the value of a DOM input element by ID
 */
export async function setInputValue(page: Page, elementId: string, value: string): Promise<void> {
  const element = page.locator(`#${elementId}`);
  await element.waitFor({ state: "visible" });
  await element.fill(value);
}

/**
 * Click a button by its ID (works for DOM buttons)
 */
export async function clickElementById(page: Page, elementId: string): Promise<void> {
  const element = page.locator(`#${elementId}`);
  await element.waitFor({ state: "visible" });
  await element.click();
}

/**
 * Navigate using Main Menu buttons by testId
 * Convenience function for scene navigation
 */
export async function navigateMainMenu(page: Page, buttonTestId: string): Promise<void> {
  // Wait for the canvas to be ready
  await page.waitForSelector("canvas", { timeout: 10000 });
  await page.waitForTimeout(500);

  // Use keyboard navigation as fallback (more reliable than coordinate-based clicks)
  // This assumes we're already on the main menu and can use arrow keys
  const buttonMap: Record<string, number> = {
    "main-menu-button-new-game": 0,
    "main-menu-button-view-map": 1,
    "main-menu-button-view-sprites": 2,
    "main-menu-button-settings": 3,
  };

  const position = buttonMap[buttonTestId];
  if (position === undefined) {
    throw new Error(`Unknown button: ${buttonTestId}`);
  }

  // Navigate to the button using arrow keys
  for (let i = 0; i < position; i++) {
    await page.keyboard.press("ArrowRight");
  }

  // Press Enter to click the button
  await page.keyboard.press("Enter");
  await page.waitForTimeout(800);
}
