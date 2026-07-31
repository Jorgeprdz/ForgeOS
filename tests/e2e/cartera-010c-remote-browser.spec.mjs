import { test, expect } from '@playwright/test';

const fixtureUrl = '/tests/e2e/fixtures/cartera-010c/index.html';

async function openReadyRoute(page) {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(String(error?.message || error)));
  await page.goto(fixtureUrl);
  await expect(page.locator('html')).toHaveAttribute('data-cartera010c-ready', 'true');
  await expect(page.locator('#fixture-status')).toHaveText('ready');
  return pageErrors;
}

test('productive Cartera route opens and closes canonical Policy detail without privacy leakage', async ({ page }) => {
  const pageErrors = await openReadyRoute(page);

  await expect(page.getByRole('heading', { name: 'Cartera' })).toBeVisible();
  await expect(page.getByText('SOLO LECTURA')).toBeVisible();
  await expect(page.locator('[data-policy-reference="POLICY:BROWSER:010C"]')).toHaveCount(1);
  await expect(page.getByText('Ana Aceptación')).toBeVisible();
  await expect(page.getByText('Familia Aceptación')).toBeVisible();
  await expect(page.locator('#cartera-root')).toHaveAttribute(
    'style',
    /padding-bottom:calc\(112px \+ env\(safe-area-inset-bottom\)\)/,
  );

  const openButton = page.getByRole('button', { name: 'Ver detalle canónico' });
  await expect(openButton).toBeVisible();
  await openButton.click();

  const detailPanel = page.locator('#cartera-detail-panel');
  await expect(
    detailPanel.getByRole('heading', { name: 'VIDA_MUJER', level: 2 }),
  ).toBeVisible();
  await expect(detailPanel.getByText('010C-BROWSER-001')).toBeVisible();
  await expect(detailPanel.getByText(/24,000/)).toBeVisible();
  await expect(detailPanel.getByText(/1,500,000/)).toBeVisible();
  await expect(
    detailPanel.getByRole('heading', { name: 'Timeline canónico minimizado' }),
  ).toBeVisible();
  await expect(detailPanel.locator('[data-policy-timeline] [data-policy-event-type]')).toHaveCount(5);
  await expect(detailPanel.locator('[data-policy-event-type="POLICY_CONFIRMED"]')).toHaveCount(1);
  await expect(detailPanel.locator('[data-policy-event-type="POLICY_VERSION_CONFIRMED"]')).toHaveCount(1);
  await expect(detailPanel.locator('[data-policy-event-type="POLICY_EVIDENCE_CONFIRMED"]')).toHaveCount(1);
  await expect(detailPanel.locator('[data-policy-event-type="POLICY_ROLE_CONFIRMED"]')).toHaveCount(2);

  const bodyText = await page.locator('body').innerText();
  expect(bodyText).not.toContain('SENSITIVE_BENEFICIARY_BROWSER_FIXTURE');
  expect(bodyText).not.toContain('DO_NOT_RENDER');
  expect(bodyText).not.toContain('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
  expect(bodyText).not.toContain('clientId');

  const harness = await page.evaluate(() => window.__CARTERA010C_BROWSER_HARNESS__);
  expect(harness.directPolicyRolesRead).toBe(false);
  expect(harness.selectedRawEvidence).toBe(false);
  expect(harness.calls.some(call => (
    call.operation === 'rpc'
    && call.name === 'forge_cartera010b_list_general_policy_roles'
  ))).toBe(true);

  await detailPanel.getByRole('button', { name: 'Cerrar' }).click();
  await expect(page.locator('#cartera-detail-panel > section')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Ver detalle canónico' })).toBeVisible();

  await expect(page.getByRole('button', { name: /crear|editar|eliminar|importar/i })).toHaveCount(0);
  expect(pageErrors).toEqual([]);
});

test('search remains local and the mobile-safe route exposes no legacy fallback', async ({ page }) => {
  const pageErrors = await openReadyRoute(page);
  const search = page.getByLabel('BUSCAR EN PROYECCIÓN CANÓNICA');

  await search.fill('sin coincidencia');
  await expect(page.getByText('Sin coincidencias en la proyección actual.')).toBeVisible();
  await expect(page.locator('[data-policy-reference]')).toHaveCount(0);

  await search.fill('Ana');
  await expect(page.locator('[data-policy-reference="POLICY:BROWSER:010C"]')).toHaveCount(1);

  const bodyText = await page.locator('body').innerText();
  expect(bodyText).not.toContain('IndexedDB');
  expect(bodyText).not.toContain('SENSITIVE_BENEFICIARY_BROWSER_FIXTURE');
  expect(pageErrors).toEqual([]);
});
