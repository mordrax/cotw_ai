import { test, expect } from '@playwright/test';

test('map view scene renders canvas', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('canvas', { timeout: 10_000 });
  await page.waitForTimeout(1000);

  // Navigate to View Map: RIGHT 1 time (New Game → View Map), then ENTER
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);

  await page.screenshot({ path: 'screenshots/map_view.png' });
});
