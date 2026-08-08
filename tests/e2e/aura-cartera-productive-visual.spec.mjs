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

test('desktop home, attention, panorama and protected beneficiary projection', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await ready(page);
  await expect(page.getByRole('heading', { name: '¿Cómo está mi cartera?' })).toBeVisible();
  await expect(page.locator('.cartera-attention-item')).toHaveCount(3);
  await expect(page.getByText('Pagos por revisar')).toBeVisible();
  await expect(page.getByRole('button', { name: /Agregar póliza/ })).toBeVisible();
  await expect(page.locator('body')).not.toContainText('RESTRICTED_SYNTHETIC_VALUE');
  await shot(page, '01-cartera-home-desktop');
});

test('mobile home recomposes without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await ready(page);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  expect(overflow).toBeFalsy();
  await expect(page.getByRole('button', { name: /Agregar póliza/ })).toBeVisible();
  await shot(page, '02-cartera-home-mobile');
});

test('PDF is primary entry, loading is explicit, preview requires human confirmation', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await ready(page);
  await page.getByRole('button', { name: /Agregar póliza/ }).click();
  await expect(page.getByRole('heading', { name: 'Agregar póliza' })).toBeVisible();
  await expect(page.getByText('Sube la carátula de la póliza')).toBeVisible();
  await expect(page.getByText(/¿Ya tienes una cartera?/)).toBeVisible();
  await expect(page.getByText(/¿No tienes el documento?/)).toBeVisible();
  await shot(page, '03-add-policy-pdf-primary');

  await page.locator('[data-pdf-input]').setInputFiles({ name: 'synthetic-policy.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.7\nsynthetic fixture only') });
  await expect(page.getByText('Procesando documento…')).toBeVisible();
  await expect(page.getByText(/todavía no crea Policy Truth/)).toBeVisible();
  await shot(page, '04-pdf-processing');

  await expect(page.getByText('PÓLIZA DETECTADA')).toBeVisible({ timeout: 3000 });
  await expect(page.getByText(/Coberturas detectadas: no disponibles en este parser/)).toBeVisible();
  await expect(page.getByText(/No se asumirá por nombre/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Confirmar e incorporar' })).toBeVisible();
  await shot(page, '05-pdf-preview-human-review');
});

test('Policy Workspace renders multiple independent coverages and honest unknowns', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await ready(page);
  await page.getByRole('button', { name: /SYN-2026-0001|0001/ }).click();
  await expect(page.getByText('POLICY WORKSPACE')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Coberturas' })).toBeVisible();
  await expect(page.getByText('Fallecimiento')).toBeVisible();
  await expect(page.getByText('Invalidez total y permanente')).toBeVisible();
  await expect(page.getByText('Muerte accidental')).toBeVisible();
  await expect(page.locator('.coverage-row')).toHaveCount(3);
  await expect(page.locator('body')).not.toContainText('RESTRICTED_SYNTHETIC_VALUE');
  await shot(page, '06-policy-workspace-multi-coverage');
});

test('Person Workspace composes relationship context without technical subsystem navigation', async ({ page }) => {
  await page.setViewportSize({ width: 834, height: 1194 });
  await ready(page);
  await page.getByRole('button', { name: /Ana/ }).click();
  await expect(page.getByText('PERSON WORKSPACE')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Relación' })).toBeVisible();
  await expect(page.getByText(/Candidatos de relación no equivalen a oportunidad/)).toBeVisible();
  await expect(page.locator('body')).not.toContainText(/Relationship Memory 040|Growth 060|Capital 090/);
  await shot(page, '07-person-workspace-tablet');
});

test('empty state tells the advisor what to do next', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await ready(page, 'empty');
  await expect(page.getByRole('heading', { name: 'Tu cartera empieza aquí.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Subir carátula' })).toBeVisible();
  await expect(page.getByText(/Importar Excel o CSV/)).toBeVisible();
  await expect(page.locator('body')).not.toContainText('No hay datos.');
  await shot(page, '08-empty-state');
});

test('200% zoom and reduced motion retain the operating hierarchy', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await ready(page);
  await page.evaluate(() => { document.documentElement.style.zoom = '2'; });
  await expect(page.getByRole('heading', { name: '¿Cómo está mi cartera?' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Agregar póliza/ })).toBeVisible();
  await shot(page, '09-zoom-200-reduced-motion');
});
