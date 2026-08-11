import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const fixture = '/tests/e2e/fixtures/forge-commercial-compass-015/index.html';

async function patchRealModule(page, { routeGlob, sourcePath, replacements }) {
  let source = await readFile(new URL(`../../${sourcePath}`, import.meta.url), 'utf8');
  for (const [from, to] of replacements) {
    if (!source.includes(from)) throw new Error(`PHASE015_HARNESS_IMPORT_NOT_FOUND:${sourcePath}:${from}`);
    source = source.replace(from, to);
  }
  await page.route(routeGlob, async route => {
    await route.fulfill({ status: 200, contentType: 'application/javascript; charset=utf-8', body: source });
  });
}

async function mountHome(page, mode = 'ready') {
  await patchRealModule(page, {
    routeGlob: '**/docs/static-preview/forge-aura/home/home-module-015.js*',
    sourcePath: 'docs/static-preview/forge-aura/home/home-module-015.js',
    replacements: [[
      "import { createHomeModule as createBaseHomeModule } from './home-module-008.js?v=forge-commercial-compass-015-base';",
      "import { createHomeModule as createBaseHomeModule } from '/tests/e2e/fixtures/forge-commercial-compass-015/home-base-stub.js';",
    ]],
  });
  await page.goto(fixture);
  await page.evaluate(async mode => {
    window.__HOME_MODE_015 = mode;
    const root = document.querySelector('#root');
    const { createHomeModule } = await import(`/docs/static-preview/forge-aura/home/home-module-015.js?accept015=${Date.now()}`);
    window.__nav015 = [];
    const module = createHomeModule({ root, onNavigate: (route, context) => window.__nav015.push({ route, context }) });
    await module.mount();
    window.__module015 = module;
  }, mode);
}

async function mountPipeline(page) {
  await page.goto(fixture);
  await page.evaluate(async () => {
    const NativeObserver = window.MutationObserver;
    window.__observerInstances015 = 0;
    window.MutationObserver = class extends NativeObserver {
      constructor(callback) {
        window.__observerInstances015 += 1;
        super(callback);
      }
    };
    const root = document.querySelector('#root');
    const { createPipelineModule } = await import(`/docs/static-preview/forge-aura/recomposition/pipeline-consumer-bridge-015.js?accept015=${Date.now()}`);
    const module = createPipelineModule({ root, client: {}, windowRef: window });
    await module.mount();
    window.__pipeline015 = module;
  });
}

async function mountCartera(page) {
  await patchRealModule(page, {
    routeGlob: '**/docs/static-preview/forge-aura/cartera/cartera-module-v12-015.js*',
    sourcePath: 'docs/static-preview/forge-aura/cartera/cartera-module-v12-015.js',
    replacements: [[
      "import { createCarteraModule as createBaseCarteraModule } from './cartera-module-v10-013.js?v=forge-commercial-compass-015-base';",
      "import { createCarteraModule as createBaseCarteraModule } from '/tests/e2e/fixtures/forge-commercial-compass-015/cartera-base-stub.js';",
    ]],
  });
  await page.goto(fixture);
  await page.evaluate(async () => {
    const root = document.querySelector('#root');
    const { createCarteraModule } = await import(`/docs/static-preview/forge-aura/cartera/cartera-module-v12-015.js?accept015=${Date.now()}`);
    const module = createCarteraModule({ root, client: {}, windowRef: window });
    const input = document.createElement('input');
    input.type = 'file';
    input.dataset.pdfInput = 'true';
    document.body.append(input);
    const file = new File(['%PDF-1.7\nfixture'], 'poliza-fixture.pdf', { type: 'application/pdf' });
    const transfer = new DataTransfer();
    transfer.items.add(file);
    input.files = transfer.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await module.mount();
    window.__cartera015 = module;
  });
}

test('CC-01 browser: Commercial Compass makes META -> GAP -> OPORTUNIDAD -> ACCION legible', async ({ page }, testInfo) => {
  await mountHome(page, 'ready');
  const compass = page.locator('[data-commercial-compass-015]');
  await expect(compass).toBeVisible();
  await expect(compass).toContainText('1 · META');
  await expect(compass).toContainText('2 · GAP');
  await expect(compass).toContainText('3 · OPORTUNIDAD');
  await expect(compass).toContainText('4 · ACCIÓN');
  await expect(compass).toContainText('Ingreso estimado actual');
  await expect(compass).toContainText('Escenario con Pipeline');
  await expect(compass).toContainText('Meta del mes');
  await expect(compass).toContainText('Escenario, no ingreso confirmado');
  await page.getByRole('button', { name: 'Año', exact: true }).click();
  await expect(compass).toContainText('Ingreso estimado del año');
  await expect(compass).toContainText('Pólizas confirmadas del año');
  await expect(compass).toContainText('Meta anual de pólizas calculada desde tu meta mensual');
  await page.screenshot({ path: `artifacts/forge-commercial-compass-015-${testInfo.project.name}.png`, fullPage: true });
});

test('CC-02 browser: first-use goals flow is short, optional and annual policies are editable', async ({ page }) => {
  await mountHome(page, 'missing');
  await expect(page.getByText('Para poder decirte cómo vas, primero necesito saber qué quieres lograr.')).toBeVisible();
  await page.getByRole('button', { name: 'Definir mis metas' }).click();
  await expect(page.getByText('1 de 4 · Ingreso del mes')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Omitir por ahora' })).toBeVisible();
  await page.locator('input[name="targetMonthlyIncomeMxn"]').fill('100000');
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.locator('input[name="targetMonthlyPolicyCount"]').fill('10');
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await expect(page.locator('input[name="targetAnnualIncomeMxn"]')).toHaveValue('1200000');
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await expect(page.locator('input[name="targetAnnualPolicyCount"]')).toHaveValue('120');
  await expect(page.getByText('Calculada desde tu meta mensual. Puedes editarla.')).toBeVisible();
  await page.locator('input[name="targetAnnualPolicyCount"]').fill('100');
  await expect(page.getByText('Meta anual personalizada.')).toBeVisible();
  await page.getByRole('button', { name: 'Guardar metas' }).click();
  await expect(page.locator('[data-commercial-compass-015]')).toHaveAttribute('data-compass-state', 'READY');
  await expect(page.locator('[data-commercial-compass-015]')).toContainText('100 pólizas');
});

test('WA-01 browser: real bridge 015 adds all goals, humanizes the workspace and creates zero observers', async ({ page }) => {
  await mountPipeline(page);
  await page.getByRole('button', { name: 'WhatsApp' }).click();
  const layer = page.locator('[data-aura-conversation-workspace]');
  await expect(layer).toBeVisible();
  const goalSelect = layer.locator('select[data-message-goal]');
  await expect(goalSelect).toBeVisible();
  await expect(goalSelect.locator('option')).toHaveCount(9);
  for (const label of ['Primer contacto','Seguimiento','Retomar conversación','Cobranza','Firma de solicitud','Confirmar cita','Reprogramar','Después de llamada','Otro / Personalizado']) {
    await expect(goalSelect.locator('option', { hasText: label })).toHaveCount(1);
  }
  await expect(layer).toContainText('¿Qué necesitas lograr con este mensaje?');
  await expect(layer).toContainText('Preparar mensaje');
  await expect(layer).toContainText('Aprobar este texto');
  await expect(layer).toContainText('Abrir WhatsApp');
  await expect(layer).toContainText('Ayuda con objeciones');
  await expect(layer).toContainText('Qué podría estar pasando');
  await expect(layer).toContainText('Cómo abordarla');
  await expect(layer).toContainText('Siguiente movimiento');
  await expect(layer).not.toContainText('Generado por IA');
  await expect(layer).not.toContainText('NASH Combat');
  await expect(layer.locator('[data-conversation-technical]')).toBeHidden();
  expect(await page.evaluate(() => window.__observerInstances015)).toBe(0);
  expect(await page.evaluate(() => window.__pipeline015.diagnostics().mutationObservers)).toBe(0);
});

test('PDF-02 browser: review body scrolls on mobile and Guardar poliza remains reachable', async ({ page }, testInfo) => {
  await mountCartera(page);
  await expect(page.getByRole('heading', { name: 'Póliza' })).toBeVisible();
  await expect(page.getByText('No encontramos información suficiente sobre las coberturas.')).toBeVisible();
  const dialog = page.locator('.cartera-dialog');
  const body = dialog.locator('.cartera-dialog__body');
  const save = dialog.getByRole('button', { name: 'Guardar póliza' });
  await expect(dialog).toBeVisible();
  await expect(save).toBeAttached();
  const geometry = await body.evaluate(node => ({
    overflowY: getComputedStyle(node).overflowY,
    minHeight: getComputedStyle(node).minHeight,
    scrollHeight: node.scrollHeight,
    clientHeight: node.clientHeight,
    scrollWidth: node.scrollWidth,
    clientWidth: node.clientWidth,
  }));
  expect(geometry.overflowY).toBe('auto');
  expect(geometry.scrollHeight).toBeGreaterThan(geometry.clientHeight);
  expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth + 1);
  await body.evaluate(node => { node.scrollTop = node.scrollHeight; });
  await expect(save).toBeInViewport();
  const sticky = await dialog.locator('.cartera-semantic-confirm').evaluate(node => ({ position: getComputedStyle(node).position, bottom: getComputedStyle(node).bottom }));
  expect(sticky.position).toBe('sticky');
  expect(sticky.bottom).toBe('0px');
  const perf = await page.evaluate(() => window.__FORGE_015_PDF_PERF__);
  expect(perf.active.T0Ms).toBe(0);
  expect(perf.active.T1Ms).toBeGreaterThanOrEqual(0);
  expect(perf.active.T6Ms).toBeGreaterThanOrEqual(0);
  expect(perf.active.T7Ms).toBeGreaterThanOrEqual(0);
  await page.screenshot({ path: `artifacts/forge-pdf-review-015-${testInfo.project.name}.png`, fullPage: true });
});
