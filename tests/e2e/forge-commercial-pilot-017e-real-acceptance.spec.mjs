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
  await expect(page.locator('[data-aura-cartera-radar-017e]')).toHaveCount(1);
  expect(await page.locator('[data-aura-cartera-radar-017e] .glass-widget').count()).toBeGreaterThan(0);

  const heartbeat = await page.evaluate(() => new Promise(resolve => {
    let beats = 0;
    const interval = setInterval(() => {
      beats += 1;
      if (beats >= 3) {
        clearInterval(interval);
        clearTimeout(deadline);
        resolve(beats);
      }
    }, 25);
    const deadline = setTimeout(() => {
      clearInterval(interval);
      resolve(beats);
    }, 500);
  }));
  expect(heartbeat).toBeGreaterThanOrEqual(3);

  const convergence = await page.evaluate(async () => {
    const root = document.querySelector('.aura-route-host-013.aura-cartera');
    const host = root?.querySelector('[data-aura-cartera-radar-017e]');
    if (!root || !host) return { ready: false };

    let additionalRadarHosts = 0;
    const observer = new MutationObserver(records => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (!(node instanceof Element)) continue;
          if (node.matches?.('[data-aura-cartera-radar-017e]')) additionalRadarHosts += 1;
          additionalRadarHosts += node.querySelectorAll?.('[data-aura-cartera-radar-017e]').length || 0;
        }
      }
    });
    observer.observe(root, { childList: true, subtree: true });

    const probe = document.createElement('span');
    probe.dataset.aura017eConvergenceProbe = 'true';
    root.append(probe);
    await Promise.resolve();
    await Promise.resolve();
    probe.remove();
    await Promise.resolve();
    await Promise.resolve();
    observer.disconnect();

    const current = root.querySelector('[data-aura-cartera-radar-017e]');
    return {
      ready: true,
      sameHost: current === host,
      hostCount: root.querySelectorAll('[data-aura-cartera-radar-017e]').length,
      additionalRadarHosts,
      functionalRadarPresent: Boolean(current?.querySelector('.glass-widget')),
    };
  });

  expect(convergence.ready).toBe(true);
  expect(convergence.sameHost).toBe(true);
  expect(convergence.hostCount).toBe(1);
  expect(convergence.additionalRadarHosts).toBeLessThanOrEqual(0);
  expect(convergence.functionalRadarPresent).toBe(true);

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
      heartbeat: heartbeat >= 3 ? 'ALIVE' : 'DEAD',
      mutationReconciliationConverges: convergence.sameHost && convergence.hostCount === 1 && convergence.additionalRadarHosts === 0,
      domMutationCount: convergence.additionalRadarHosts,
      domMutationCountLimit: 0,
      functionalRadarPresent: convergence.functionalRadarPresent,
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