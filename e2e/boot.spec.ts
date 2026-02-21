import { test, expect } from '@playwright/test';

test('boot scene renders canvas', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('canvas', { timeout: 10_000 });
  // Wait a bit to capture the boot/loading screen before scene transitions
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshots/boot.png' });
});
