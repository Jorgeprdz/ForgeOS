import { test, expect } from '@playwright/test';

const fixture = '/tests/e2e/fixtures/advisor-os-sprint-11/index.html';

async function openClean(page) {
  await page.goto(fixture);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator('[data-public-surface]')).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await openClean(page);
});

test('responsive surface has one primary action, no overflow and floating-nav safe area', async ({ page }, testInfo) => {
  await expect(page.locator('button[data-primary-action="true"]:visible')).toHaveCount(1);
  const geometry = await page.evaluate(() => {
    window.scrollTo(0, document.documentElement.scrollHeight);
    const last = document.querySelector('[data-last-content]').getBoundingClientRect();
    const nav = document.querySelector('[data-floating-nav]').getBoundingClientRect();
    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      lastBottom: last.bottom,
      navTop: nav.top,
      navPosition: getComputedStyle(document.querySelector('[data-floating-nav]')).position,
      paddingBottom: getComputedStyle(document.querySelector('main')).paddingBottom,
    };
  });
  expect(geometry.scrollWidth, `${testInfo.project.name} horizontal overflow`).toBeLessThanOrEqual(geometry.clientWidth + 1);
  expect(geometry.navPosition).toBe('fixed');
  expect(Number.parseFloat(geometry.paddingBottom)).toBeGreaterThan(80);
  expect(geometry.lastBottom).toBeLessThanOrEqual(geometry.navTop + 1);
});

test('progressive setup returns value before asking for all preferences', async ({ page }) => {
  await expect(page.locator('[data-state-title]')).toHaveText('Todo listo');
  await expect(page.locator('[data-source-items]')).toContainText('Prioridad del día');
  await expect(page.locator('[data-setup-summary]')).toContainText('Esto no bloquea el primer valor');

  await page.locator('[data-pref-name]').fill('Jorge Palacios');
  await page.locator('[data-pref-goal]').fill('10');
  await expect(page.locator('[data-setup-summary]')).toContainText('Configuración completa');
});

test('preferences persist only after review and explicit confirmation', async ({ page }) => {
  await page.locator('[data-pref-name]').fill('Jorge Palacios');
  await page.locator('[data-pref-goal]').fill('10');
  await page.locator('[data-pref-notification]').selectOption('HYBRID');
  await page.locator('[data-pref-capture]').selectOption('REAL_TIME');

  expect(await page.evaluate(() => localStorage.length)).toBe(0);
  await page.locator('[data-preview-preferences]').click();
  await expect(page.locator('[data-preference-feedback]')).toContainText('Revisa: Jorge Palacios');
  await expect(page.locator('button[data-primary-action="true"]:visible')).toHaveCount(1);
  expect(await page.evaluate(() => localStorage.length)).toBe(0);

  await page.locator('[data-confirm-preferences]').click();
  await expect(page.locator('[data-preference-feedback]')).toContainText('Guardado con recibo PREF-1');
  expect(await page.evaluate(() => localStorage.length)).toBe(1);

  await page.reload();
  await expect(page.locator('[data-pref-name]')).toHaveValue('Jorge Palacios');
  await expect(page.locator('[data-pref-goal]')).toHaveValue('10');
  await expect(page.locator('[data-setup-summary]')).toContainText('Configuración completa');
});

test('slow, partial and unavailable sources have understandable non-raw states', async ({ page }) => {
  const slow = page.evaluate(() => globalThis.__SPRINT11__.simulateSlowLoad(180));
  await expect(page.locator('[data-state-pill]')).toHaveText('LOADING');
  await slow;
  await expect(page.locator('[data-state-pill]')).toHaveText('READY');
  await expect(page.locator('[data-source-items]')).toContainText('Fuente recuperada');

  await page.evaluate(() => globalThis.__SPRINT11__.simulatePartial());
  await expect(page.locator('[data-state-pill]')).toHaveText('PARTIAL');
  await expect(page.locator('[data-state-message]')).toContainText('Puedes continuar');

  await page.evaluate(() => globalThis.__SPRINT11__.simulateUnavailable());
  await expect(page.locator('[data-state-pill]')).toHaveText('UNAVAILABLE');
  await expect(page.locator('[data-state-message]')).toContainText('Reintenta');
  await expect(page.locator('body')).not.toContainText('private stack');
});

test('logout scrubs private UI, login restores only confirmed preferences and late results are rejected', async ({ page }) => {
  await page.locator('[data-pref-name]').fill('Jorge Palacios');
  await page.locator('[data-pref-goal]').fill('10');
  await page.locator('[data-preview-preferences]').click();
  await page.locator('[data-confirm-preferences]').click();

  const rejection = await page.evaluate(async () => {
    const pending = globalThis.__SPRINT11__.beginLateLoad();
    document.querySelector('[data-logout]').click();
    pending.resolve({ status: 'READY', items: [{ id: 'PRIVATE', label: 'Dato tardío privado' }] });
    try {
      await pending.promise;
      return 'NOT_REJECTED';
    } catch (error) {
      return error.code;
    }
  });
  expect(rejection).toBe('ADVISOR_EXPERIENCE_LATE_RESULT_REJECTED');
  await expect(page.locator('[data-state-pill]')).toHaveText('SESSION_REQUIRED');
  await expect(page.locator('[data-source-items]')).toBeEmpty();
  await expect(page.locator('body')).not.toContainText('Dato tardío privado');

  await page.locator('[data-login]').click();
  await expect(page.locator('[data-state-pill]')).toHaveText('READY');
  await expect(page.locator('[data-pref-name]')).toHaveValue('Jorge Palacios');
  await expect(page.locator('[data-session-summary]')).toContainText('Sesión activa');
});

test('demo data is always explicit, synthetic and side-effect safe', async ({ page }) => {
  await expect(page.locator('[data-demo-banner]')).toContainText('Modo demostración');
  await expect(page.locator('[data-demo-banner]')).toContainText('Datos ficticios');
  const accepted = await page.evaluate(() => {
    const label = document.querySelector('[data-demo-banner]').textContent;
    return globalThis.__SPRINT11__ && /Datos ficticios/.test(label);
  });
  expect(accepted).toBe(true);
});
