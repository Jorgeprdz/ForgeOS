import { expect, test } from '@playwright/test';

const EMAIL_A = 'forge.acceptance.a@forge.invalid';
const ROUTES = ['inicio', 'pipeline', 'cartera', 'actividad', 'comisiones', 'cotizaciones'];

if (!process.env.FORGE_ACCEPTANCE_A_PASSWORD) throw new Error('FORGE_ACCEPTANCE_A_PASSWORD_MISSING');

async function login(page) {
  await page.addInitScript(() => {
    const count = Number(sessionStorage.getItem('forge013DocumentLoads') || '0') + 1;
    sessionStorage.setItem('forge013DocumentLoads', String(count));
  });
  await page.goto('/docs/static-preview/forge-aura/index.html?route=inicio');
  await expect(page.locator('[data-aura-login-form]')).toBeVisible();
  await page.locator('input[name="email"]').fill(EMAIL_A);
  await page.locator('input[name="password"]').fill(process.env.FORGE_ACCEPTANCE_A_PASSWORD);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page.locator('[data-aura-login-form]')).toHaveCount(0);
  await expect(page.locator('[data-aura-shell]')).toBeVisible();
}

async function waitSettled(page, route, { ready = true } = {}) {
  await expect(page.locator('[data-aura-shell]')).toHaveAttribute('data-aura-active-route', route);
  await expect.poll(async () => page.locator('[data-aura-main]').getAttribute('data-aura-route-state'), {
    timeout: 25_000,
  }).not.toBe('LOADING');
  const state = await page.locator('[data-aura-main]').getAttribute('data-aura-route-state');
  if (ready) expect(state, `${route}_MUST_READY`).toBe('READY');
  await expect(page.locator('[data-aura-app]')).toHaveAttribute('aria-busy', 'false');
  const hosts = await page.locator('[data-aura-route-host]').count();
  expect(hosts, `${route}_ACTIVE_HOST_COUNT`).toBeLessThanOrEqual(1);
}

async function clickRoute(page, route) {
  const link = page.locator(`.aura-nav [data-aura-route-link="${route}"]`).first();
  await expect(link).toBeVisible();
  await link.click({ noWaitAfter: true });
  await waitSettled(page, route);
}

test('RU05 Level 3: all visible modules settle and 50 rapid transitions never deadlock the shell', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(String(error?.stack || error)));

  await login(page);
  await waitSettled(page, 'inicio');

  for (const route of ROUTES.slice(1)) await clickRoute(page, route);

  const burst = Array.from({ length: 50 }, (_, index) => ROUTES[index % ROUTES.length]);
  await page.evaluate(routes => {
    for (const route of routes) {
      document.querySelector(`.aura-nav [data-aura-route-link="${route}"]`)?.click();
    }
  }, burst);
  await waitSettled(page, burst.at(-1));

  expect(await page.evaluate(() => Number(sessionStorage.getItem('forge013DocumentLoads') || '0'))).toBe(1);
  expect(pageErrors, `RU05_PAGE_ERRORS:${pageErrors.join('\n')}`).toEqual([]);
  await expect(page.locator('[data-aura-main]')).not.toContainText(/Cargando…|Cargando\.\.\./i);
});

test('RU05 Level 3: back, forward and immediate A→B→A navigation settle on the latest route', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(String(error?.stack || error)));

  await login(page);
  await waitSettled(page, 'inicio');
  await clickRoute(page, 'pipeline');
  await clickRoute(page, 'actividad');

  await page.evaluate(() => history.back());
  await waitSettled(page, 'pipeline');
  await page.evaluate(() => history.forward());
  await waitSettled(page, 'actividad');

  await page.evaluate(() => {
    document.querySelector('.aura-nav [data-aura-route-link="cartera"]')?.click();
    document.querySelector('.aura-nav [data-aura-route-link="pipeline"]')?.click();
    document.querySelector('.aura-nav [data-aura-route-link="cartera"]')?.click();
  });
  await waitSettled(page, 'cartera');

  expect(await page.evaluate(() => Number(sessionStorage.getItem('forge013DocumentLoads') || '0'))).toBe(1);
  expect(await page.locator('[data-aura-route-host]').count()).toBe(1);
  expect(pageErrors, `RU05_PAGE_ERRORS:${pageErrors.join('\n')}`).toEqual([]);
});
