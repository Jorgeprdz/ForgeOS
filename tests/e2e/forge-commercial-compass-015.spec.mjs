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

async function mountConsumer(page, forecastMode = 'ready') {
  await page.evaluate(async forecastMode => {
    const readModel = forecastMode === 'ready' ? {
      activityRequirement: {
        status: 'READY',
        recommendedActions: [
          { actionType: 'PROSPECTING_CONTACTS', requiredCount: 25 },
          { actionType: 'APPOINTMENTS', requiredCount: 6 },
          { actionType: 'PRESENTATIONS', requiredCount: 3 },
        ],
      },
    } : { activityRequirement: { status: 'INSUFFICIENT_DATA', recommendedActions: [] } };
    globalThis.ForgeAdvisorForecastRuntimeAcceptance = {
      getReadModel: () => readModel,
    };
    await import(`/docs/static-preview/forge-aura/home/commercial-compass-consumer-015.js?accept015=${Date.now()}`);
    globalThis.ForgeCommercialCompassConsumer015?.reconcile?.();
  }, forecastMode);
}

async function mountPipeline(page, { productiveWorkspace = false } = {}) {
  if (productiveWorkspace) {
    await patchRealModule(page, {
      routeGlob: '**/docs/static-preview/forge-aura/recomposition/pipeline-consumer-bridge-015.js*',
      sourcePath: 'docs/static-preview/forge-aura/recomposition/pipeline-consumer-bridge-015.js',
      replacements: [[
        "import { createConversationWorkspaceController } from '../pipeline/pipeline-conversation-workspace.js?v=forge-commercial-compass-015-owner';",
        "import { createConversationWorkspaceController } from '/docs/static-preview/forge-aura/pipeline/pipeline-conversation-workspace.js?forge-commercial-compass-015r-evidence';",
      ]],
    });
  }
  await page.goto(fixture);
  await page.evaluate(async () => {
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = '/docs/static-preview/forge-aura/pipeline/pipeline-conversation-workspace.css?v=015r';
    document.head.append(stylesheet);
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

async function mountCarteraRelationshipEvidence(page) {
  await patchRealModule(page, {
    routeGlob: '**/docs/static-preview/forge-aura/cartera/cartera-module-v12-015.js*',
    sourcePath: 'docs/static-preview/forge-aura/cartera/cartera-module-v12-015.js',
    replacements: [[
      "import { createCarteraModule as createBaseCarteraModule } from './cartera-module-v10-013.js?v=forge-commercial-compass-015-base';",
      "import { createCarteraModule as createBaseCarteraModule } from '/docs/static-preview/forge-aura/cartera/cartera-module.js?forge-commercial-compass-015r-evidence';",
    ]],
  });
  await patchRealModule(page, {
    routeGlob: '**/docs/static-preview/forge-aura/cartera/cartera-module.js?forge-commercial-compass-015r-evidence',
    sourcePath: 'docs/static-preview/forge-aura/cartera/cartera-module.js',
    replacements: [[
      "import {createCarteraAdapter} from './cartera-adapter-pages-v1.js';",
      "import {createCarteraAdapter} from '/tests/e2e/fixtures/forge-commercial-compass-015/cartera-base-stub.js?relationship-evidence';",
    ]],
  });
  await page.goto(fixture);
  await page.evaluate(async () => {
    for (const href of [
      '/docs/static-preview/forge-aura/cartera/cartera.css?v=015r',
      '/docs/static-preview/forge-aura/cartera/cartera-relational-011b.css?v=015r',
    ]) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.append(link);
    }
    const root = document.querySelector('#root');
    const { createCarteraModule } = await import(`/docs/static-preview/forge-aura/cartera/cartera-module-v12-015.js?relationship015r=${Date.now()}`);
    const module = createCarteraModule({ root, client: {}, windowRef: window });
    await module.mount();
    window.__carteraRelationship015r = module;
  });
  await page.locator('[data-directory-kind="PERSON"]').click();
  await expect(page.locator('[data-person-section="relationship"]')).toBeVisible();
}

async function mountRealWorkspace(page) {
  await page.goto(fixture);
  await page.evaluate(async () => {
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = '/docs/static-preview/forge-aura/pipeline/pipeline-conversation-workspace.css?v=015r';
    document.head.append(stylesheet);
    const { createConversationWorkspaceController } = await import('/docs/static-preview/forge-aura/pipeline/pipeline-conversation-workspace.js?accept015r=1');
    const root = document.querySelector('#root');
    const adapter = {
      messageOptions: () => ({ goals: { follow_up: 'Seguimiento', reactivation: 'Retomar conversación' }, styles: { professional: 'Profesional' } }),
      prepareMessage: async (_card, input) => ({ status: 'READY', candidate: { rawText: `Hola, seguimiento ${input.goal}` }, sourceMode: 'DETERMINISTIC' }),
      approveExactDraft: async (card, _prepared, value) => ({ approved: true, whatsappUrl: `https://wa.me/5215555555555?text=${encodeURIComponent(value)}&prospect=${card.id}` }),
      analyzeCombat: async () => ({}), reviewCombat: value => value, registerObjection: async () => ({}),
    };
    const controller = createConversationWorkspaceController({ root, windowRef: window });
    const trigger = document.createElement('button');
    trigger.textContent = 'WhatsApp';
    root.append(trigger);
    window.__workspace015r = { controller, adapter, trigger };
    window.__open015r = id => controller.open({ card: { id, fullName: `Prospecto ${id}`, status: 'active' }, adapter, trigger });
    window.__open015r('A');
  });
  await page.waitForFunction(() => [...document.styleSheets].some(sheet => String(sheet.href || '').includes('pipeline-conversation-workspace.css')));
}

test('CC-01 browser: Commercial Compass makes META -> GAP -> OPORTUNIDAD -> ACCION legible', async ({ page }, testInfo) => {
  await mountHome(page, 'ready');
  const compass = page.locator('[data-commercial-compass-015]');
  await expect(compass).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Mi día' })).toBeVisible();
  expect(await page.evaluate(() => {
    const day = document.querySelector('[data-home-attention-contract]');
    const progress = document.querySelector('[data-commercial-compass-015]');
    return Boolean(day && progress && (day.compareDocumentPosition(progress) & Node.DOCUMENT_POSITION_FOLLOWING));
  })).toBe(true);
  const dayBox = await page.locator('[data-home-attention-contract]').boundingBox();
  const compassBox = await compass.boundingBox();
  expect(dayBox?.y ?? Infinity).toBeLessThan(compassBox?.y ?? -Infinity);
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
  const compass = page.locator('[data-commercial-compass-015]');
  await expect(compass).toHaveAttribute('data-compass-state', 'READY');
  await expect(compass).toContainText('$100,000 · 10 pólizas');
  await page.getByRole('button', { name: 'Año', exact: true }).click();
  await expect(compass).toContainText('$1,200,000 · 100 pólizas');
});

test('CC-11 browser: activity guidance consumes Advisor Forecast and degrades without historical evidence', async ({ page }) => {
  await mountHome(page, 'ready');
  await mountConsumer(page, 'ready');
  const guidance = page.locator('[data-commercial-activity-guidance-015]');
  await expect(guidance).toBeVisible();
  await expect(guidance).toHaveAttribute('data-activity-state', 'READY');
  await expect(guidance).toContainText('Contactos: 25');
  await expect(guidance).toContainText('Citas: 6');
  await expect(guidance).toContainText('Presentaciones: 3');
  expect(await page.evaluate(() => document.querySelectorAll('[data-commercial-activity-guidance-015]').length)).toBe(1);
  expect(await page.evaluate(() => globalThis.ForgeCommercialCompassConsumer015.diagnostics().mutationObservers)).toBe(0);

  await page.evaluate(() => {
    globalThis.ForgeAdvisorForecastRuntimeAcceptance = { getReadModel: () => ({ activityRequirement: { status: 'INSUFFICIENT_DATA', recommendedActions: [] } }) };
    globalThis.ForgeCommercialCompassConsumer015.reconcile();
  });
  await expect(guidance).toHaveAttribute('data-activity-state', 'INSUFFICIENT_DATA');
  await expect(guidance).toContainText('Necesito más historial para estimar cuánta actividad necesitas.');
  expect(await page.evaluate(() => document.querySelectorAll('[data-commercial-activity-guidance-015]').length)).toBe(1);
});

test('CC-13 browser: Alfred answers commercial progress from Compass without stealing Pipeline navigation', async ({ page }) => {
  await mountHome(page, 'ready');
  await page.evaluate(async () => {
    const sheet = document.createElement('section');
    sheet.dataset.forgeAlfredSheet = 'true';
    sheet.innerHTML = '<div class="sheet-panel"><div class="alfred-input"><input><button type="button">Enviar</button></div></div>';
    document.body.append(sheet);
    await import(`/docs/static-preview/forge-aura/home/commercial-compass-consumer-015.js?alfred015=${Date.now()}`);
  });
  const input = page.locator('[data-forge-alfred-sheet] .alfred-input input');
  const send = page.locator('[data-forge-alfred-sheet] .alfred-input button');
  await input.fill('¿Cómo voy?');
  await send.click();
  await expect(page.locator('[data-alfred-command-response]')).toContainText('Cómo vas este mes');
  await expect(page.locator('[data-alfred-command-response]')).toContainText('4 de 10 pólizas');

  await input.fill('¿Cuánto podría ganar con Pipeline?');
  await send.click();
  await expect(page.locator('[data-alfred-command-response]')).toContainText('Escenario con Pipeline');
  await expect(page.locator('[data-alfred-command-response]')).toContainText('$86,000');
  await expect(page.locator('[data-alfred-command-response]')).toContainText('potencial');

  const interception = await page.evaluate(() => ({
    pipelineOnly: globalThis.ForgeCommercialCompassConsumer015.classifyAlfredQuestion('Pipeline'),
    activity: globalThis.ForgeCommercialCompassConsumer015.answerAlfredQuestion('¿Qué debo hacer hoy?')?.answer || '',
  }));
  expect(interception.pipelineOnly).toBeNull();
  expect(interception.activity).toContain('Necesito más historial');
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
  await expect(layer.locator('[data-draft]')).toBeVisible();
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

test('WA-015R browser: open three times, optional section singleton, prospect switch, navigate away and return', async ({ page }) => {
  await mountPipeline(page);
  for (let index = 0; index < 3; index += 1) {
    await page.getByRole('button', { name: 'WhatsApp' }).click();
    const layer = page.locator('[data-aura-conversation-workspace]');
    await expect(layer).toBeVisible();
    await page.waitForTimeout(250);
    await expect(layer.locator('[data-conversation-flow-015]')).toHaveCount(1);
    await expect(layer.locator('[data-message-adjustments-015]')).toHaveCount(1);
    await page.evaluate(() => window.__pipeline015.unmount());
    await page.evaluate(() => window.__pipeline015.mount());
  }
  await page.getByRole('button', { name: 'WhatsApp' }).click();
  await expect(page.locator('[data-aura-conversation-workspace] [data-conversation-flow-015]')).toHaveCount(1);
});

test('WA-015R browser: preapproval, exact approval, edit and objective changes are governed', async ({ page }, testInfo) => {
  await mountPipeline(page, { productiveWorkspace: true });
  await page.getByRole('button', { name: 'WhatsApp' }).click();
  const layer = page.locator('[data-aura-conversation-workspace]');
  const open = layer.locator('[data-open-whatsapp]');
  await expect(layer.locator('[data-conversation-flow-015]')).toHaveCount(1);
  await expect(layer.locator('[data-message-adjustments-015]')).toHaveCount(1);
  await expect(layer.locator('[data-draft]')).toBeVisible();
  await expect(layer).toContainText('Prepara un borrador o escribe el mensaje. WhatsApp seguirá bloqueado hasta que apruebes el texto exacto.');
  await expect(open).toBeDisabled();
  if (testInfo.project.name === 'mobile') {
    await expect(layer.locator('[data-conversation-flow-015]')).toBeHidden();
    const overflow = await layer.evaluate(node => [...node.querySelectorAll('*')].map(item => {
      const rect = item.getBoundingClientRect();
      return { tag: item.tagName, className: String(item.className || ''), left: rect.left, right: rect.right, scrollWidth: item.scrollWidth, clientWidth: item.clientWidth };
    }).filter(item => item.right > innerWidth + 1 || item.left < -1 || item.scrollWidth > item.clientWidth + 1));
    expect(overflow, JSON.stringify(overflow)).toEqual([]);
  }
  await page.screenshot({ path: `artifacts/forge-whatsapp-preapproval-015r-${testInfo.project.name}.png` });
  await layer.locator('[data-generate-draft]').click();
  await layer.locator('[data-approve-draft]').click();
  await expect(open).toBeEnabled();
  await page.screenshot({ path: `artifacts/forge-whatsapp-approved-015r-${testInfo.project.name}.png` });
  await layer.locator('[data-draft]').fill('Texto editado después de aprobar');
  await expect(open).toBeDisabled();
  await page.screenshot({ path: `artifacts/forge-whatsapp-after-edit-015r-${testInfo.project.name}.png` });
  await layer.locator('[data-generate-draft]').click();
  await layer.locator('[data-approve-draft]').click();
  await layer.locator('[data-message-goal]').selectOption('reactivation');
  await expect(open).toBeDisabled();
  await page.evaluate(() => {
    window.__PIPELINE_CARDS_015.push({ id: 'p015-b', fullName: 'Prospecto B', status: 'contacted', stageLabel: 'Contactado' });
    const trigger = document.createElement('button');
    trigger.dataset.action = 'whatsapp';
    trigger.dataset.id = 'p015-b';
    trigger.textContent = 'WhatsApp B';
    document.querySelector('#root').append(trigger);
    trigger.click();
  });
  await expect(page.locator('[data-open-whatsapp]')).toBeDisabled();
  await expect(page.locator('[data-aura-conversation-workspace]')).toContainText('Prospecto B');
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

test('CARTERA-015R browser: Relation and History reuse confirmed Pipeline context without invention', async ({ page }, testInfo) => {
  await mountCarteraRelationshipEvidence(page);
  const root = page.locator('#root');
  const relation = root.locator('[data-person-section="relationship"]');
  await expect(relation).toContainText('Enviar comparativo acordado en la llamada.');
  await expect(relation).toContainText('Prefiere revisar alternativas por la tarde.');
  await expect(relation).not.toContainText(/canonical|read-model|memoria relacional|fuente conectada/i);
  await page.getByRole('tab', { name: 'Relación' }).click();
  await relation.scrollIntoViewIfNeeded();
  await page.screenshot({ path: `artifacts/forge-cartera-relation-015r-${testInfo.project.name}.png` });

  const history = root.locator('[data-person-section="history"]');
  await page.getByRole('tab', { name: 'Historial' }).click();
  await expect(history).toContainText('Conversación de seguimiento registrada.');
  await expect(history).toContainText('Se acordó enviar el comparativo.');
  await expect(history).toContainText('Revisión anual confirmada.');
  await expect(history.locator('.cartera-directory-row')).toHaveCount(3);
  await expect(history).not.toContainText(/canonical|read-model|memoria relacional|fuente conectada/i);
  await history.scrollIntoViewIfNeeded();
  await page.screenshot({ path: `artifacts/forge-cartera-history-015r-${testInfo.project.name}.png` });
});
