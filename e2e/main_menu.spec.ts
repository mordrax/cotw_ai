import { test, expect } from '@playwright/test';

test('main menu scene renders canvas', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('canvas', { timeout: 10_000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screenshots/main_menu.png' });
});
