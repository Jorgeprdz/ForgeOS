import { expect, test } from '@playwright/test';

const FIXTURE = '/tests/fixtures/forge-beta2-post-release-productive-recovery-010i.html';
const FIXTURE_ROUTE = '**/tests/fixtures/forge-beta2-post-release-productive-recovery-010i.html*';

function watchErrors(page) {
  const pageErrors = [];
  const failed = [];
  page.on('pageerror', error => pageErrors.push(String(error)));
  page.on('response', response => {
    const url = new URL(response.url());
    if (url.origin === 'http://127.0.0.1:4178' && response.status() >= 400) {
      failed.push(`${response.status()} ${url.pathname}`);
    }
  });
  return { pageErrors, failed };
}

async function completeFixtureClient(page) {
  await page.route(FIXTURE_ROUTE, async route => {
    const response = await route.fetch();
    const source = await response.text();
    const needle = `    const client = {\n      auth: {`;
    const replacement = `    const client = {\n      functions: {\n        async invoke(name) {\n          window.__RECOVERY_010I_TRACE__.unexpectedFunction = name;\n          return { data: null, error: { message: 'EDGE_FUNCTION_NOT_EXPECTED_IN_READ_RECOVERY_E2E' } };\n        },\n      },\n      auth: {`;
    if (!source.includes(needle)) throw new Error('010I_FIXTURE_CLIENT_BOUNDARY_NOT_FOUND');
    await route.fulfill({ response, body: source.replace(needle, replacement) });
  });
}

async function ready(page, suffix = '') {
  const errors = watchErrors(page);
  await completeFixtureClient(page);
  await page.goto(`${FIXTURE}${suffix}`, { waitUntil: 'networkidle' });
  await expect(page.locator('html')).toHaveAttribute('data-recovery010i', 'READY');
  return errors;
}

test('010I confirmed review recovery shows one canonical Policy, recovered evidence, named participants and connected contact actions', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const errors = await ready(page);

  const cartera = page.locator('#cartera-root');
  await expect(cartera.getByText('1 Pólizas')).toBeVisible();
  await expect(cartera.getByText('Evidencia pendiente')).toHaveCount(0);
  await expect(cartera.locator('.cartera-directory > header > span')).toHaveText('1 persona · 1 póliza');

  await cartera.locator('[data-directory-kind="POLICY"]').click();
  const workspace = cartera.locator('.cartera-workspace');
  await expect(workspace).toBeVisible();
  await expect(workspace.getByText('Adrián Ortiz García', { exact: true }).first()).toBeVisible();
  await expect(workspace.getByRole('heading', { name: 'Documento y evidencia recuperada' })).toBeVisible();
  await expect(workspace.getByText('VI0003006169', { exact: true })).toBeVisible();
  await expect(workspace.getByText(/Estado de evidencia: CONFIRMED/)).toBeVisible();

  const pipeline = page.locator('#pipeline-root');
  const whatsapp = pipeline.locator('button[data-action="whatsapp"]').last();
  await expect(whatsapp).toBeEnabled();
  await expect(pipeline.locator('a[href="tel:+525512345678"]').last()).toBeVisible();
  await whatsapp.click();
  await expect.poll(() => page.evaluate(() => window.__RECOVERY_010I_TRACE__.opens.at(-1) || ''))
    .toContain('https://wa.me/525512345678');

  expect(await page.evaluate(() => window.__RECOVERY_010I_TRACE__.unexpectedFunction || null)).toBeNull();
  expect(errors.pageErrors).toEqual([]);
  expect(errors.failed).toEqual([]);
});

test('010I genuinely pending Evidence opens the document review instead of the Policy opener', async ({ page }) => {
  const errors = await ready(page, '?pending=1');
  const cartera = page.locator('#cartera-root');

  await expect(cartera.getByText('Evidencia pendiente').first()).toBeVisible();
  await expect(cartera.getByRole('button', { name: 'Revisar documento' })).toHaveCount(1);
  await cartera.getByRole('button', { name: 'Revisar documento' }).click();

  const dialog = page.locator('[data-evidence-review-layer="010i"]');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('[data-evidence-packet-review]')).toBeVisible();
  await expect(dialog.getByText('Documento de póliza', { exact: true })).toBeVisible();
  await expect(dialog.getByText('IMAGINA SER 65 - 15 PAGOS UDI', { exact: true })).toBeVisible();
  await expect(page.getByText('No pudimos abrir la póliza')).toHaveCount(0);

  expect(await page.evaluate(() => window.__RECOVERY_010I_TRACE__.unexpectedFunction || null)).toBeNull();
  expect(errors.pageErrors).toEqual([]);
  expect(errors.failed).toEqual([]);
});
