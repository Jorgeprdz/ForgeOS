import { expect, test } from '@playwright/test';

const EMAIL_A = 'forge.acceptance.a@forge.invalid';
const siteRelative = 'artifacts/rep16e-r2-pages-site';
const AURA = `/${siteRelative}/static-preview/forge-aura/index.html?route=cartera`;

for (const name of ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'FORGE_ACCEPTANCE_A_PASSWORD']) {
  if (!String(process.env[name] || '').trim()) throw new Error(`${name}_MISSING`);
}

async function installGovernedPublicConfig(page) {
  const config = {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_KEY: process.env.SUPABASE_ANON_KEY,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
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
  await page.locator('input[name="password"]').fill(process.env.FORGE_ACCEPTANCE_A_PASSWORD);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page.locator('[data-aura-login-form]')).toHaveCount(0, { timeout: 20_000 });
  await expect(page.locator('[data-aura-shell]')).toBeVisible();
}

test('REP-16E-R2 Gate C REAL: Aura Cartera mounts with governed Supabase acceptance identity', async ({ page }, testInfo) => {
  test.setTimeout(90_000);

  const pageErrors = [];
  const routeLoadFailures = [];
  const failedJsModules = [];
  const requests400 = [];
  const alfredResponses = [];

  page.on('pageerror', error => pageErrors.push(String(error?.stack || error)));
  page.on('console', message => {
    const text = message.text();
    if (text.includes('AURA_ROUTE_LOAD_FAILED')) routeLoadFailures.push(text);
  });
  page.on('response', response => {
    const status = response.status();
    const url = response.url();
    if (status >= 400) requests400.push(`${status} ${url}`);
    if (status >= 400 && /\.(?:js|mjs)(?:$|\?)/.test(url)) {
      failedJsModules.push(`${status} ${new URL(url).pathname}`);
    }
    if (/\/static-preview\/forge-alive\/alfred-command-runtime\.js(?:$|\?)/.test(url)) {
      alfredResponses.push(status);
    }
  });

  await installGovernedPublicConfig(page);
  await page.goto(AURA, { waitUntil: 'domcontentloaded' });
  await authenticate(page);

  await expect(page.locator('[data-aura-shell]')).toHaveAttribute(
    'data-aura-active-route',
    'cartera',
    { timeout: 20_000 },
  );
  await expect(page.locator('[data-aura-main]')).toHaveAttribute(
    'data-aura-route-state',
    'READY',
    { timeout: 20_000 },
  );
  await expect(page.locator('.cartera-header')).toBeVisible({ timeout: 20_000 });
  await expect(page.locator('[data-aura-app]')).toHaveAttribute('aria-busy', 'false');

  const finalState = await page.locator('[data-aura-main]').getAttribute('data-aura-route-state');
  const activeRoute = await page.locator('[data-aura-shell]').getAttribute('data-aura-active-route');
  const routeRevision = await page.locator('[data-aura-main]').getAttribute('data-aura-route-revision');

  expect(routeLoadFailures, `AURA_ROUTE_LOAD_FAILED=${routeLoadFailures.join('\n')}`).toEqual([]);
  expect(pageErrors, `PRODUCT_PAGEERRORS=${pageErrors.join('\n')}`).toEqual([]);
  expect(failedJsModules, `FAILED_JS_MODULES=${failedJsModules.join('\n')}`).toEqual([]);

  await testInfo.attach('017e-real-acceptance-summary.json', {
    body: Buffer.from(JSON.stringify({
      viewport: testInfo.project.name,
      authenticated: true,
      activeRoute,
      routeState: finalState,
      routeRevision,
      carteraHeaderVisible: true,
      ariaBusy: false,
      auraRouteLoadFailed: routeLoadFailures.length,
      productPageErrors: pageErrors.length,
      failedJsModules,
      requests400,
      alfredResponses,
      supabaseUrlSource: 'CI_SECRET',
      supabaseKeySource: 'CI_SECRET',
      acceptanceUserSource: 'GOVERNED_SYNTHETIC_ACCEPTANCE_CONTROL_PLANE',
    }, null, 2)),
    contentType: 'application/json',
  });
});
