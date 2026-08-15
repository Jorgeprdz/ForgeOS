import { expect, test } from '@playwright/test';

const EMAIL_A = 'forge.acceptance.a@forge.invalid';
const siteRelative = 'artifacts/rep16e-r2-pages-site';
const AURA = `/${siteRelative}/static-preview/forge-aura/index.html?route=cartera`;
const SUPABASE_URL = String(process.env.SUPABASE_URL || '').replace(/\/$/, '');
const ANON = String(process.env.SUPABASE_ANON_KEY || '');
const PASSWORD = String(process.env.FORGE_ACCEPTANCE_A_PASSWORD || '');

for (const [name, value] of [['SUPABASE_URL', SUPABASE_URL], ['SUPABASE_ANON_KEY', ANON], ['FORGE_ACCEPTANCE_A_PASSWORD', PASSWORD]]) {
  if (!value.trim()) throw new Error(`${name}_MISSING`);
}

async function installGovernedPublicConfig(page) {
  const config = {
    SUPABASE_URL,
    SUPABASE_KEY: ANON,
    SUPABASE_ANON_KEY: ANON,
    DEMO_MODE: 'false',
    ENABLE_TEST_ADVISOR_LOGIN: 'false',
  };
  await page.route('**/env.js*', route => route.fulfill({
    status: 200,
    contentType: 'application/javascript; charset=utf-8',
    body: `globalThis.__ENV__=Object.freeze(${JSON.stringify(config)});`,
  }));
}

async function authenticate(page) {
  await expect(page.locator('[data-aura-login-form]')).toBeVisible({ timeout: 20_000 });
  await page.locator('input[name="email"]').fill(EMAIL_A);
  await page.locator('input[name="password"]').fill(PASSWORD);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page.locator('[data-aura-login-form]')).toHaveCount(0, { timeout: 20_000 });
  await expect(page.locator('[data-aura-shell]')).toBeVisible();
}

async function settled(page, route = 'cartera') {
  await expect(page.locator('[data-aura-shell]')).toHaveAttribute('data-aura-active-route', route, { timeout: 20_000 });
  await expect(page.locator('[data-aura-main]')).toHaveAttribute('data-aura-route-state', 'READY', { timeout: 25_000 });
  await expect(page.locator('[data-aura-app]')).toHaveAttribute('aria-busy', 'false');
}

function expectedViewport(projectName) {
  if (projectName === 'chromium-dex-002c') return { width: 1600, height: 900 };
  if (projectName === 'chromium-mobile-002c') return { width: 390, height: 844 };
  return { width: 1440, height: 900 };
}

test('POST-017E HOTFIX 002C REAL: visible truth, navigation and exact geometry', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const expected = expectedViewport(testInfo.project.name);
  const pageErrors = [];
  const failedModules = [];

  page.on('pageerror', error => pageErrors.push(String(error?.stack || error)));
  page.on('response', response => {
    if (response.status() >= 400 && /\.(?:js|mjs)(?:$|\?)/.test(response.url())) {
      failedModules.push(`${response.status()} ${new URL(response.url()).pathname}`);
    }
  });

  await installGovernedPublicConfig(page);
  await page.goto(AURA, { waitUntil: 'domcontentloaded' });
  await authenticate(page);
  await settled(page);

  const radar = page.locator('[data-aura-cartera-radar-017e]');
  await expect(radar).toHaveCount(1);
  await expect(radar).toBeVisible();
  await expect(page.locator('#cartera-attention-title:visible')).toHaveCount(0);

  const visibleText = await page.locator('body').innerText();
  expect(visibleText).not.toMatch(/person:cartera:/i);
  expect(visibleText).not.toMatch(/policy:cartera:/i);
  expect(visibleText).not.toMatch(/account:[A-Za-z0-9._:@/-]+/i);
  expect(visibleText).not.toMatch(/POLICY_PACKET:AURA:/i);
  expect(visibleText).not.toMatch(/\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i);
  expect(visibleText).not.toContain('Información de póliza por revisar');
  expect(visibleText).toContain('Pólizas con datos incompletos');

  const measurements = await page.evaluate(() => {
    const rect = selector => {
      const node = document.querySelector(selector);
      if (!node) return null;
      const box = node.getBoundingClientRect();
      return { width: box.width, left: box.left, right: box.right };
    };
    const radarNode = document.querySelector('[data-aura-cartera-radar-017e]');
    const carteraRoot = document.querySelector('.cartera-header')?.parentElement || document.querySelector('[data-aura-main]');
    const box = node => {
      if (!node) return null;
      const r = node.getBoundingClientRect();
      return { width: r.width, left: r.left, right: r.right };
    };
    const main = document.querySelector('[data-aura-main]');
    return {
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      deviceScaleFactor: window.devicePixelRatio,
      visualViewportScale: window.visualViewport?.scale ?? 1,
      documentZoom: getComputedStyle(document.documentElement).zoom || '1',
      shell: rect('[data-aura-shell]'),
      main: box(main),
      cartera: box(carteraRoot),
      radar: box(radarNode),
      mainClientWidth: main?.clientWidth ?? null,
      mainScrollWidth: main?.scrollWidth ?? null,
      bodyClientWidth: document.body.clientWidth,
      bodyScrollWidth: document.body.scrollWidth,
    };
  });

  console.log(`CARTERA_002C_GEOMETRY project=${testInfo.project.name} ${JSON.stringify(measurements)}`);
  expect(measurements.viewportWidth).toBe(expected.width);
  expect(measurements.viewportHeight).toBe(expected.height);
  expect(measurements.visualViewportScale).toBe(1);
  expect(measurements.mainScrollWidth).toBeLessThanOrEqual((measurements.mainClientWidth || 0) + 1);
  expect(measurements.bodyScrollWidth).toBeLessThanOrEqual(measurements.bodyClientWidth + 1);
  expect(measurements.radar?.width || 0).toBeGreaterThan(0);
  expect(measurements.cartera?.width || 0).toBeGreaterThan(0);
  expect((measurements.radar?.width || 0) / (measurements.cartera?.width || 1)).toBeGreaterThanOrEqual(0.9);

  if (testInfo.project.name === 'chromium-dex-002c') {
    expect(measurements.deviceScaleFactor).toBe(1);
    expect(Number(measurements.documentZoom)).toBe(1);
  }

  await page.locator('[data-aura-route-link="inicio"]:visible').first().click({ noWaitAfter: true });
  await settled(page, 'inicio');
  await page.locator('[data-aura-route-link="cartera"]:visible').first().click({ noWaitAfter: true });
  await settled(page, 'cartera');
  await expect(page.locator('[data-aura-cartera-radar-017e]')).toHaveCount(1);

  expect(pageErrors, pageErrors.join('\n')).toEqual([]);
  expect(failedModules, failedModules.join('\n')).toEqual([]);
});
