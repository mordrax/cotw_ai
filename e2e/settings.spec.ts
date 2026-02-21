import { test, expect } from '@playwright/test';

test('settings scene renders canvas', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('canvas', { timeout: 10_000 });
  await page.waitForTimeout(1000);

  // Navigate to Settings: RIGHT 3 times (New Game → View Map → View Sprites → Settings), then ENTER
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);

  await page.screenshot({ path: 'screenshots/settings.png' });
});
