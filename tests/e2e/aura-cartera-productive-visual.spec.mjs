import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const BASE = 'http://127.0.0.1:4173/tests/fixtures/aura-cartera-visual.html';
const OUT = path.resolve('test-results/aura-cartera-visual');
fs.mkdirSync(OUT, { recursive: true });

async function shot(page, name) {
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: true });
}

async function ready(page, mode = '') {
  await page.goto(`${BASE}${mode ? `?mode=${mode}` : ''}`, { waitUntil: 'networkidle' });
  await expect(page.locator('#fixture-main')).toHaveAttribute('data-cartera-state', /READY|EMPTY/);
}

async function noHorizontalOverflow(page) {
  return page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1);
}

test('desktop home, attention, panorama and protected beneficiary projection', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await ready(page);
  await expect(page.getByRole('heading', { name: '¿Cómo está mi cartera?' })).toBeVisible();
  await expect(page.locator('.cartera-attention-item')).toHaveCount(2);
  await expect(page.getByText('Pagos por revisar')).toBeVisible();
  await expect(page.getByRole('button', { name: /Agregar póliza/ })).toBeVisible();
  await expect(page.locator('body')).not.toContainText('RESTRICTED_SYNTHETIC_VALUE');
  await shot(page, '01-cartera-home-desktop');
});

test('mobile home recomposes without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await ready(page);
  expect(await noHorizontalOverflow(page)).toBeTruthy();
  await expect(page.getByRole('button', { name: /Agregar póliza/ })).toBeVisible();
  await shot(page, '02-cartera-home-mobile');
});

test('tablet home preserves hierarchy instead of compressing desktop', async ({ page }) => {
  await page.setViewportSize({ width: 834, height: 1112 });
  await ready(page);
  await expect(page.getByRole('heading', { name: '¿Cómo está mi cartera?' })).toBeVisible();
  await expect(page.locator('.cartera-attention-item')).toHaveCount(2);
  expect(await noHorizontalOverflow(page)).toBeTruthy();
  await shot(page, '03-cartera-home-tablet');
});

test('PDF is primary entry, loading is explicit, preview requires human confirmation', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await ready(page);
  const trigger = page.getByRole('button', { name: /Agregar póliza/ });
  await trigger.click();
  await expect(page.getByRole('heading', { name: 'Agregar póliza' })).toBeVisible();
  await expect(page.getByText('Sube la carátula de la póliza')).toBeVisible();
  await expect(page.getByText(/¿Ya tienes una cartera?/)).toBeVisible();
  await expect(page.getByText(/¿No tienes el documento?/)).toBeVisible();
  await expect(page.getByRole('dialog')).toBeVisible();
  await shot(page, '04-add-policy-pdf-primary');

  await page.locator('[data-pdf-input]').setInputFiles({ name: 'synthetic-policy.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.7\nsynthetic fixture only') });
  await expect(page.getByText('Procesando documento…')).toBeVisible();
  await expect(page.getByText(/todavía no crea Policy Truth/)).toBeVisible();
  await shot(page, '05-pdf-processing');

  await expect(page.getByText('PÓLIZA DETECTADA')).toBeVisible({ timeout: 3000 });
  await expect(page.getByText(/Coberturas detectadas: no disponibles en este parser/)).toBeVisible();
  await expect(page.getByText(/No se asumirá por nombre/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Confirmar e incorporar' })).toBeVisible();
  await shot(page, '06-pdf-preview-human-review');
});

test('dialog keyboard contract traps focus, Escape closes and returns focus', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await ready(page);
  const trigger = page.getByRole('button', { name: /Agregar póliza/ });
  await trigger.focus();
  await trigger.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Shift+Tab');
  await expect(dialog.locator(':focus')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('Policy Workspace renders multiple independent coverages and honest unknowns', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await ready(page);
  await page.locator('[data-directory-kind="POLICY"]').click();
  await expect(page.getByText('POLICY WORKSPACE')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Coberturas' })).toBeVisible();
  await expect(page.getByText('Fallecimiento')).toBeVisible();
  await expect(page.getByText('Invalidez total y permanente')).toBeVisible();
  await expect(page.getByText('Muerte accidental')).toBeVisible();
  await expect(page.locator('.coverage-row')).toHaveCount(3);
  await expect(page.locator('body')).not.toContainText('RESTRICTED_SYNTHETIC_VALUE');
  await shot(page, '07-policy-workspace-multi-coverage');
});

test('Relationship workspace composes useful context without technical subsystem navigation', async ({ page }) => {
  await page.setViewportSize({ width: 834, height: 1194 });
  await ready(page);
  await page.locator('[data-directory-kind="PERSON"]').click();
  await expect(page.getByText('RELACIÓN COMERCIAL')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Relación' })).toBeVisible();
  await expect(page.getByText(/Información confirmada que te ayuda a dar continuidad/)).toBeVisible();
  await expect(page.locator('body')).not.toContainText(/Relationship Memory 040|Growth 060|Capital 090/);
  await shot(page, '08-person-workspace');
});

test('empty state tells the advisor what to do next', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await ready(page, 'empty');
  await expect(page.getByRole('heading', { name: 'Tu cartera empieza aquí.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Subir carátula' })).toBeVisible();
  await expect(page.getByText(/Importar Excel o CSV/)).toBeVisible();
  await expect(page.locator('body')).not.toContainText('No hay datos.');
  await shot(page, '09-empty-state');
});

test('attention state remains capped, explanatory and non-automatic', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await ready(page);
  await expect(page.locator('.cartera-attention-item')).toHaveCount(2);
  await expect(page.getByText(/Ninguna acción se ejecuta automáticamente/)).toBeVisible();
  await shot(page, '10-attention-state');
});

test('200% zoom equivalent reflows and keeps primary controls visible', async ({ page }) => {
  // At 200% browser zoom a 1440 device-pixel viewport exposes about 720 CSS px.
  await page.setViewportSize({ width: 720, height: 900 });
  await ready(page);
  await expect(page.getByRole('heading', { name: '¿Cómo está mi cartera?' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Agregar póliza/ })).toBeVisible();
  expect(await noHorizontalOverflow(page)).toBeTruthy();
  await shot(page, '11-zoom-200');
});

test('prefers-reduced-motion retains the same information hierarchy', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1280, height: 800 });
  await ready(page);
  await expect(page.getByRole('heading', { name: '¿Cómo está mi cartera?' })).toBeVisible();
  await expect(page.locator('.cartera-attention-item')).toHaveCount(2);
  await expect(page.getByRole('button', { name: /Agregar póliza/ })).toBeVisible();
  await shot(page, '12-reduced-motion');
});
