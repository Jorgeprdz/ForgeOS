import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const BASE = 'http://127.0.0.1:4173/tests/fixtures/aura-cartera-person-workspace-016.html';
const OUT = path.resolve('test-results/aura-cartera-person-016');
fs.mkdirSync(OUT, { recursive: true });

async function shot(page, name) {
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: true });
}

async function noHorizontalOverflow(page) {
  return page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1);
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('#fixture-main')).toHaveAttribute('data-fixture-state', 'directory-ready');
});

test('Galaxy-size directory removes browser-native button chrome and preserves distinct entities', async ({ page }) => {
  const rows = page.locator('button.cartera-directory-row[data-directory-reference]');
  await expect(rows).toHaveCount(2);
  await expect(page.getByText('Alex Ejemplo')).toBeVisible();
  await expect(page.getByText('Imagina Ser 65 15 Pagos UDI')).toBeVisible();
  await expect(page.getByText('••••••6169 · Póliza')).toBeVisible();
  await expect(page.locator('body')).not.toContainText('product:imagina-ser-65-15-pagos-udi');

  const style = await rows.first().evaluate(element => {
    const computed = getComputedStyle(element);
    return {
      appearance: computed.appearance,
      webkitAppearance: computed.webkitAppearance,
      borderRightWidth: computed.borderRightWidth,
      borderBottomWidth: computed.borderBottomWidth,
      backgroundColor: computed.backgroundColor,
      minHeight: element.getBoundingClientRect().height,
    };
  });
  expect(['none', '']).toContain(style.appearance);
  expect(['none', '']).toContain(style.webkitAppearance);
  expect(style.borderRightWidth).toBe('0px');
  expect(style.borderBottomWidth).toBe('0px');
  expect(style.minHeight).toBeGreaterThanOrEqual(44);
  expect(await noHorizontalOverflow(page)).toBeTruthy();
  await shot(page, '01-directory-galaxy-s25');
});

test('Person Workspace shows authorized contact projection and honest missing fields', async ({ page }) => {
  await page.locator('[data-directory-kind="PERSON"]').click();
  await expect(page.locator('#fixture-main')).toHaveAttribute('data-fixture-state', 'person-ready');
  await expect(page.getByRole('heading', { name: 'Alex Ejemplo' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Cliente' })).toBeVisible();
  await expect(page.getByText('+525500001616')).toBeVisible();
  await expect(page.getByText('Pipeline vinculado · no implica consentimiento de contacto')).toBeVisible();
  await expect(page.getByText('No informado')).toHaveCount(2);
  await expect(page.getByText('1 · 1 activa')).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Historial' })).toHaveCount(0);
  await expect(page.locator('.cartera-dialog-layer')).toHaveCount(0);

  const workspacePadding = await page.locator('.cartera-workspace').evaluate(element => parseFloat(getComputedStyle(element).paddingBottom));
  expect(workspacePadding).toBeGreaterThanOrEqual(104);
  expect(await noHorizontalOverflow(page)).toBeTruthy();
  await shot(page, '02-person-summary-galaxy-s25');
});

test('Pólizas and Relación are real accessible tabs with keyboard navigation', async ({ page }) => {
  await page.locator('[data-directory-kind="PERSON"]').click();
  const summary = page.getByRole('tab', { name: 'Resumen' });
  const policies = page.getByRole('tab', { name: 'Pólizas' });
  const relationship = page.getByRole('tab', { name: 'Relación' });

  await expect(summary).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#cartera-person-panel-policies')).toBeHidden();
  await policies.click();
  await expect(policies).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#cartera-person-panel-policies')).toBeVisible();
  await expect(page.getByText('Imagina Ser 65 15 Pagos UDI')).toBeVisible();
  await expect(page.getByText('••••••6169 · Activa')).toBeVisible();
  await expect(page.locator('body')).not.toContainText('product:imagina-ser-65-15-pagos-udi');
  await shot(page, '03-person-policies-galaxy-s25');

  await policies.focus();
  await page.keyboard.press('ArrowRight');
  await expect(relationship).toBeFocused();
  await expect(relationship).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#cartera-person-panel-relationship')).toBeVisible();
  await expect(page.getByText(/Candidatos de relación no equivalen a oportunidad/)).toBeVisible();
  expect(await noHorizontalOverflow(page)).toBeTruthy();
  await shot(page, '04-person-relationship-galaxy-s25');
});
