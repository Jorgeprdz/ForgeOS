import { test, expect } from '@playwright/test';

const fixtureUrl = '/tests/e2e/fixtures/cartera-010d/index.html';

async function openReadyRoute(page) {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(String(error?.message || error)));
  await page.goto(fixtureUrl);
  await expect(page.locator('html')).toHaveAttribute('data-cartera010d-ready', 'true');
  await expect(page.locator('#fixture-status')).toHaveText('ready');
  return pageErrors;
}

async function visibleDirectoryText(page) {
  return page.locator('#cartera-list').innerText();
}

test('productive route renders separate Person, Account and Policy entries without privacy leakage', async ({ page }) => {
  const pageErrors = await openReadyRoute(page);

  await expect(page.getByRole('heading', { name: 'Cartera' })).toBeVisible();
  await expect(page.getByText('SOLO LECTURA')).toBeVisible();
  await expect(page.locator('[data-directory-kind="COMMERCIAL_PERSON"]')).toHaveCount(1);
  await expect(page.locator('[data-directory-kind="COMMERCIAL_ACCOUNT"]')).toHaveCount(1);
  await expect(page.locator('[data-directory-kind="POLICY"]')).toHaveCount(1);
  await expect(page.locator('[data-directory-reference="PERSON:BROWSER:ANA:010D"]')).toBeVisible();
  await expect(page.locator('[data-directory-reference="ACCOUNT:BROWSER:FAMILY:010D"]')).toBeVisible();
  await expect(page.locator('[data-directory-reference="POLICY:BROWSER:010D"]')).toBeVisible();
  await expect(page.locator('#cartera-root')).toHaveAttribute(
    'style',
    /padding-bottom:calc\(112px \+ env\(safe-area-inset-bottom\)\)/,
  );

  const text = await visibleDirectoryText(page);
  expect(text).toContain('Ana Directora');
  expect(text).toContain('Familia Directora');
  expect(text).toContain('010D-BROWSER-001');
  expect(text).not.toContain('+525512345678');
  expect(text).not.toContain('ana.directory.private@example.com');
  expect(text).not.toContain('SENSITIVE_DIRECTORY_BROWSER_FIXTURE');

  const harness = await page.evaluate(() => window.__CARTERA010D_BROWSER_HARNESS__);
  expect(harness.directPolicyRolesRead).toBe(false);
  expect(harness.selectedRawEvidence).toBe(false);
  expect(harness.calls.some(call => (
    call.operation === 'rpc'
    && call.name === 'forge_cartera010b_list_general_policy_roles'
  ))).toBe(true);
  expect(harness.calls.some(call => (
    call.operation === 'from'
    && call.table === 'commercial_account_memberships'
  ))).toBe(true);
  expect(pageErrors).toEqual([]);
});

test('phone, email, direct entity and relationship searches remain private and correctly ranked', async ({ page }) => {
  const pageErrors = await openReadyRoute(page);
  const search = page.getByLabel('BUSCAR PERSONA, CUENTA O PÓLIZA');

  await search.fill('5512345678');
  await expect(page.locator('[data-directory-reference]')).toHaveCount(1);
  await expect(page.locator('[data-directory-reference="PERSON:BROWSER:ANA:010D"]')).toBeVisible();
  await expect(page.getByText('Coincidencia: Teléfono verificado')).toBeVisible();
  expect(await visibleDirectoryText(page)).not.toContain('+525512345678');

  await search.fill('ana.directory.private@example.com');
  await expect(page.locator('[data-directory-reference]')).toHaveCount(1);
  await expect(page.locator('[data-directory-reference="PERSON:BROWSER:ANA:010D"]')).toBeVisible();
  await expect(page.getByText('Coincidencia: Email verificado')).toBeVisible();
  expect(await visibleDirectoryText(page)).not.toContain('ana.directory.private@example.com');

  await search.fill('Familia Directora');
  await expect(page.locator('[data-directory-reference]').first()).toHaveAttribute(
    'data-directory-kind',
    'COMMERCIAL_ACCOUNT',
  );

  await search.fill('010D-BROWSER-001');
  await expect(page.locator('[data-directory-reference]').first()).toHaveAttribute(
    'data-directory-kind',
    'POLICY',
  );

  await search.fill('HOUSEHOLD_MEMBER');
  await expect(page.locator('[data-directory-reference="PERSON:BROWSER:ANA:010D"]')).toBeVisible();
  await expect(page.locator('[data-directory-reference="ACCOUNT:BROWSER:FAMILY:010D"]')).toBeVisible();
  await expect(page.locator('[data-directory-reference="POLICY:BROWSER:010D"]')).toHaveCount(0);

  const text = await visibleDirectoryText(page);
  expect(text).not.toContain('SENSITIVE_DIRECTORY_BROWSER_FIXTURE');
  expect(text).not.toContain('+525512345678');
  expect(text).not.toContain('ana.directory.private@example.com');
  expect(pageErrors).toEqual([]);
});

test('Policy result opens and closes the accepted canonical detail and minimized Timeline', async ({ page }) => {
  const pageErrors = await openReadyRoute(page);
  const policyCard = page.locator('[data-directory-reference="POLICY:BROWSER:010D"]');

  await policyCard.getByRole('button', { name: 'Ver detalle canónico' }).click();
  const detail = page.locator('#cartera-detail-panel > section');
  await expect(detail).toBeVisible();
  await expect(detail.getByRole('heading', { name: 'VIDA_MUJER' })).toBeVisible();
  await expect(detail.getByText('010D-BROWSER-001')).toBeVisible();
  await expect(detail.getByText(/24,000/)).toBeVisible();
  await expect(detail.getByText(/1,500,000/)).toBeVisible();
  await expect(detail.getByRole('heading', { name: 'Timeline canónico minimizado' })).toBeVisible();
  await expect(detail.locator('[data-policy-timeline] [data-policy-event-type]')).toHaveCount(5);

  const bodyText = await page.locator('body').innerText();
  expect(bodyText).not.toContain('SENSITIVE_DIRECTORY_BROWSER_FIXTURE');
  expect(bodyText).not.toContain('DO_NOT_RENDER');
  expect(bodyText).not.toContain('b'.repeat(64));
  expect(bodyText).not.toContain('+525512345678');
  expect(bodyText).not.toContain('ana.directory.private@example.com');
  expect(bodyText).not.toContain('clientId');

  await detail.getByRole('button', { name: 'Cerrar' }).click();
  await expect(page.locator('#cartera-detail-panel > section')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Ver detalle canónico' })).toBeVisible();
  await expect(page.getByRole('button', { name: /crear|editar|eliminar|importar/i })).toHaveCount(0);
  expect(pageErrors).toEqual([]);
});
