import { test, expect } from '@playwright/test';

test('Command OS preserves ambiguity and opens the selected person', async ({ page }) => {
  await page.goto('/tests/e2e/fixtures/crs10-relationship-intelligence/command-os-route-bridge.html');
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.commandOsMaterial3NavigationBridge)).toBe('ready');

  const resolution = await page.evaluate(() => globalThis.crs10CommandRoute.search('mariana'));
  expect(resolution.status).toBe('AMBIGUOUS');
  expect(resolution.candidates).toHaveLength(2);

  await page.evaluate(() => globalThis.crs10CommandRoute.open(1));
  await expect(page).toHaveURL(/nav=persona/);
  await expect(page).toHaveURL(/person=person-2/);
  await expect(page.locator('[data-forge-application]')).toHaveAttribute('data-forge-route', 'persona');
  await expect(page.locator('[data-forge-person-workspace-module]')).toBeVisible();
  await expect(page.locator('#receipt')).toContainText('person-2');
  await expect(page.locator('#receipt')).toContainText('pipeline');
});
