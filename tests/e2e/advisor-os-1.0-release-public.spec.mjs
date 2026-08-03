import { test, expect } from '@playwright/test';

const canonical = process.env.FORGE_RELEASE_URL || 'https://jorgeprdz.github.io/ForgeOS/static-preview/forge-alive/';
const buildInfo = process.env.FORGE_BUILD_INFO_URL || 'https://jorgeprdz.github.io/ForgeOS/build-info.json';
const expectedSha = process.env.FORGE_EXPECTED_RELEASE_SHA;
const metadataOnly = process.env.FORGE_RELEASE_METADATA_ONLY === 'true';

const expectedSandboxServiceWorkerError = message => (
  message.includes("Failed to read the 'serviceWorker' property from 'Navigator'")
  && message.includes("context is sandboxed")
  && message.includes("allow-same-origin")
);

test('canonical Pages serves the exact release commit without overrides', async ({ page, request }) => {
  expect(expectedSha, 'FORGE_EXPECTED_RELEASE_SHA is required').toBeTruthy();

  const infoResponse = await request.get(buildInfo, { headers: { 'cache-control': 'no-cache' } });
  expect(infoResponse.ok()).toBeTruthy();
  const info = await infoResponse.json();
  expect(info.commitSha).toBe(expectedSha);
  expect(info.artifact).toBe('forge-pages');

  const htmlResponse = await request.get(`${canonical}?release-check=${Date.now()}`, {
    headers: { 'cache-control': 'no-cache' },
  });
  expect(htmlResponse.ok()).toBeTruthy();
  const html = await htmlResponse.text();
  expect(html).toContain(`app.js?v=${expectedSha}`);
  expect(html).not.toContain('Muestra segura · solo lectura');

  if (metadataOnly) return;

  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  const response = await page.goto(`${canonical}?release-check=${Date.now()}`, { waitUntil: 'domcontentloaded' });
  expect(response?.ok()).toBeTruthy();
  await page.waitForTimeout(1500);

  const result = await page.evaluate(() => ({
    title: document.title,
    bodyText: document.body?.innerText?.trim() || '',
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    hasAuth: Boolean(document.querySelector('[data-forge-auth-login-view],[data-forge-auth-shell]')),
    hasApplication: Boolean(document.querySelector('[data-forge-application]')),
    demoBanner: document.querySelector('[data-forge-demo-banner]')?.textContent || '',
  }));

  expect(result.title.length).toBeGreaterThan(0);
  expect(result.bodyText.length).toBeGreaterThan(20);
  expect(result.scrollWidth).toBeLessThanOrEqual(result.clientWidth + 1);
  expect(result.hasAuth || result.hasApplication).toBeTruthy();
  if (result.demoBanner) expect(result.demoBanner).toMatch(/Datos ficticios|Modo demostración/i);

  const actionableErrors = pageErrors.filter(message => !expectedSandboxServiceWorkerError(message));
  expect(actionableErrors).toEqual([]);
});
