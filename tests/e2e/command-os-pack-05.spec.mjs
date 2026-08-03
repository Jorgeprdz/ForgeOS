import { test, expect } from '@playwright/test';

test('preserves ambiguity and opens the selected person workspace', async ({ page }) => {
  await page.goto('/tests/e2e/fixtures/command-os-pack-05/index.html');
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.commandOsMaterial3NavigationBridge)).toBe('ready');

  const resolution = await page.evaluate(() => globalThis.pack05.search('mariana'));
  expect(resolution.status).toBe('AMBIGUOUS');
  expect(resolution.candidates).toHaveLength(2);

  await page.evaluate(() => globalThis.pack05.open(1));
  await expect(page).toHaveURL(/nav=persona/);
  await expect(page).toHaveURL(/person=person-2/);
  await expect(page.locator('[data-forge-application]')).toHaveAttribute('data-forge-route', 'persona');
  await expect(page.locator('[data-forge-person-workspace-module]')).toBeVisible();
  await expect(page.locator('#receipt')).toContainText('person-2');
  await expect(page.locator('#receipt')).toContainText('pipeline');
});
