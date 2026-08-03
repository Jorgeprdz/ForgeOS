import { test, expect } from '@playwright/test';

const fixture = '/tests/e2e/fixtures/command-os-pack-03/index.html';

test('keyboard search navigates to cartera', async ({ page }) => {
  await page.goto(fixture);
  await page.keyboard.press('Control+K');
  await expect(page.locator('#command-palette')).toBeVisible();
  await page.locator('#universal-command-input').fill('cartera');
  await expect(page.locator('[data-command-id="open-cartera"]')).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page.locator('#route-receipt')).toHaveAttribute('data-route', 'cartera');
});

test('mobile touch navigates to pipeline', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(fixture);
  await page.locator('#command-os-mobile-trigger').click();
  await page.locator('#universal-command-input').fill('pipeline');
  await page.locator('[data-command-id="open-pipeline"]').click();
  await expect(page.locator('#route-receipt')).toHaveAttribute('data-route', 'advisor-sales-pipeline');
});
