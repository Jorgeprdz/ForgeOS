import assert from "node:assert/strict";
import { chromium } from "@playwright/test";

const baseUrl = process.env.FORGE_MANUAL_UI_BASE_URL
  || "http://127.0.0.1:4173/docs/static-preview/forge-alive-material3/";
const stabilityModuleUrl = new URL(
  "pipeline-ui-stability.js?v=manual-pipeline-stability-001",
  baseUrl,
).href;
const stageAuthorityUrl = new URL(
  "pipeline-stage-rpc-authority.js?v=pipeline-stage-rpc-authority-002",
  baseUrl,
).href;

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1200, height: 800 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();

try {
  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await page.setContent(`<!doctype html>
    <html>
      <head>
        <style>
          * { box-sizing: border-box; }
          html, body { margin: 0; min-height: 100%; }
          body { min-height: 2200px; background: #06101f; color: white; }
          #frame { width: 100%; min-height: 2200px; padding-top: 520px; }
          [data-forge-pipeline-module] { width: min(900px, calc(100% - 40px)); margin: 0 auto; }
          .pipeline-module__productive-card {
            --pipeline-stage-accent: rgb(104, 216, 209);
            width: 100%; min-height: 260px; border: 4px solid var(--pipeline-stage-accent);
            padding: 20px; background: #10223d;
          }
          .pipeline-module__productive-card[data-productive-stage="appointment_scheduled"] {
            --pipeline-stage-accent: rgb(241, 189, 104);
          }
          .pipeline-module__productive-card[data-productive-stage="client"] {
            --pipeline-stage-accent: rgb(126, 214, 155);
          }
          .pipeline-module__card-actions { margin-top: 24px; }
          .pipeline-module__card-actions button:hover { transform: translateY(-1px); }
          .referral-sheet-layer { position: fixed; inset: 0; z-index: 100; }
        </style>
      </head>
      <body>
        <button type="button" data-route-id="inicio">Inicio</button>
        <div id="frame">
          <main data-forge-pipeline-module data-module-active="true">
            <header class="pipeline-module__header"><p>PIPELINE</p><h1>Relaciones en movimiento</h1></header>
            <section data-productive-filter-bar>
              <select data-productive-filter-source><option value="">Todas</option></select>
              <select data-productive-filter-status><option value="">Todos</option></select>
              <p data-productive-filter-count>1 de 1 prospectos</p>
            </section>
            <div data-productive-pipeline-cards>
              <article class="pipeline-module__productive-card"
                data-productive-prospect-card="prospect-1"
                data-productive-source="Referido"
                data-productive-stage="referred_new">
                <span data-productive-stage-label>Nuevo</span>
                <select data-productive-stage-control="prospect-1" data-confirmed-stage="referred_new">
                  <option value="referred_new" selected>Nuevo</option>
                  <option value="appointment_scheduled">Cita agendada</option>
                  <option value="client">Cliente</option>
                </select>
                <div class="pipeline-module__card-actions">
                  <button type="button" data-open-combat="prospect-1">NASH Combat</button>
                </div>
              </article>
            </div>
          </main>
        </div>
        <script>
          globalThis.__FORGE_AUTH_REFRESH_COUNT__ = 0;
          globalThis.ForgeProductiveProspectBootstrap067G17B = {
            getClient: async () => ({
              rpc: async (name, args) => {
                if (name !== 'forge_pipeline_update_prospect_stage') {
                  return { data: null, error: new Error('UNEXPECTED_RPC') };
                }
                return {
                  data: {
                    id: args.p_prospect_id,
                    status: args.p_status,
                    full_name: 'Prospecto Uno',
                    updated_at: '2026-07-31T18:00:00.000Z'
                  },
                  error: null
                };
              }
            })
          };
          window.addEventListener('forge:auth-state-changed', () => {
            globalThis.__FORGE_AUTH_REFRESH_COUNT__ += 1;
          });
          document.addEventListener('click', event => {
            const trigger = event.target.closest('[data-open-combat]');
            if (!trigger) return;
            document.body.style.overflow = 'hidden';
            document.documentElement.setAttribute('data-forge-productive-workspace-open', 'combat');
            const layer = document.createElement('div');
            layer.className = 'referral-sheet-layer';
            layer.dataset.nashCombatWorkspace = 'true';
            layer.innerHTML = '<button type="button" data-close-workspace>Cerrar</button>';
            document.body.append(layer);
          });
          document.addEventListener('click', event => {
            if (!event.target.closest('[data-close-workspace]')) return;
            document.querySelector('[data-nash-combat-workspace]')?.remove();
            document.body.style.overflow = '';
            document.documentElement.removeAttribute('data-forge-productive-workspace-open');
          });
        </script>
      </body>
    </html>`);

  await page.addScriptTag({
    type: "module",
    url: `${stabilityModuleUrl}&fixture=${Date.now()}`,
  });
  await page.waitForFunction(() =>
    document.documentElement.dataset.forgePipelineUiStability === "ready"
  );
  await page.addScriptTag({
    type: "module",
    url: `${stageAuthorityUrl}&fixture=${Date.now()}`,
  });
  await page.waitForFunction(() =>
    document.documentElement.dataset.pipelineStageRpcAuthority === "ready"
  );

  assert.equal(
    await page.evaluate(() => document.documentElement.dataset.pipelineStageAuthority),
    "rpc",
  );
  assert.equal(
    await page.evaluate(() => document.documentElement.dataset.pipelineStageCommitMode),
    "in-place",
  );

  await page.locator('[data-productive-prospect-card="prospect-1"]').scrollIntoViewIfNeeded();
  const beforeStage = await page.locator('[data-productive-prospect-card="prospect-1"]').evaluate(card => {
    globalThis.__FORGE_CARD_BEFORE__ = card;
    return {
      stage: card.dataset.productiveStage,
      border: getComputedStyle(card).borderTopColor,
      top: card.getBoundingClientRect().top,
      scrollY: window.scrollY,
    };
  });

  await page.locator('[data-productive-stage-control="prospect-1"]').selectOption("appointment_scheduled");
  await page.waitForFunction(() => {
    const card = document.querySelector('[data-productive-prospect-card="prospect-1"]');
    return card?.dataset.productiveStage === "appointment_scheduled"
      && card.dataset.stagePersistence === "saved"
      && card.querySelector('[data-productive-stage-label]')?.textContent === "Cita agendada";
  });

  const committed = await page.locator('[data-productive-prospect-card="prospect-1"]').evaluate(card => ({
    sameNode: globalThis.__FORGE_CARD_BEFORE__ === card,
    stage: card.dataset.productiveStage,
    label: card.querySelector('[data-productive-stage-label]').textContent,
    persistence: card.dataset.stagePersistence,
    border: getComputedStyle(card).borderTopColor,
    top: card.getBoundingClientRect().top,
    scrollY: window.scrollY,
    authRefreshCount: globalThis.__FORGE_AUTH_REFRESH_COUNT__,
    authLoadingVisible: document.querySelector('[data-pipeline-auth-state="AUTH_LOADING"]') !== null,
    deferred: document.documentElement.dataset.pipelineStageDeferredReconcile,
  }));

  assert.equal(committed.sameNode, true);
  assert.equal(committed.stage, "appointment_scheduled");
  assert.equal(committed.label, "Cita agendada");
  assert.equal(committed.persistence, "saved");
  assert.notEqual(committed.border, beforeStage.border);
  assert.ok(Math.abs(committed.top - beforeStage.top) <= 1.5);
  assert.ok(Math.abs(committed.scrollY - beforeStage.scrollY) <= 1);
  assert.equal(committed.authRefreshCount, 0);
  assert.equal(committed.authLoadingVisible, false);
  assert.equal(committed.deferred, "pending");

  await page.waitForTimeout(250);
  const afterDelay = await page.evaluate(() => ({
    sameNode: globalThis.__FORGE_CARD_BEFORE__ === document.querySelector('[data-productive-prospect-card="prospect-1"]'),
    authRefreshCount: globalThis.__FORGE_AUTH_REFRESH_COUNT__,
  }));
  assert.equal(afterDelay.sameNode, true);
  assert.equal(afterDelay.authRefreshCount, 0);

  const beforeWorkspace = await page.locator("#frame").evaluate(node => ({
    width: node.getBoundingClientRect().width,
    scrollY: window.scrollY,
  }));
  await page.getByRole("button", { name: "NASH Combat" }).click();
  await page.waitForTimeout(40);
  const duringWorkspace = await page.locator("#frame").evaluate(node => ({
    width: node.getBoundingClientRect().width,
    scrollY: window.scrollY,
    open: document.documentElement.getAttribute("data-forge-productive-workspace-open"),
  }));
  assert.equal(duringWorkspace.open, "combat");
  assert.ok(Math.abs(duringWorkspace.width - beforeWorkspace.width) <= 1);
  assert.ok(Math.abs(duringWorkspace.scrollY - beforeWorkspace.scrollY) <= 1);

  await page.getByRole("button", { name: "Cerrar" }).click();
  await page.waitForTimeout(40);
  assert.equal(
    await page.evaluate(() => document.documentElement.hasAttribute("data-forge-productive-workspace-open")),
    false,
  );

  await page.getByRole("button", { name: "Inicio" }).click();
  await page.waitForFunction(() => globalThis.__FORGE_AUTH_REFRESH_COUNT__ === 1);
  assert.equal(
    await page.evaluate(() => document.documentElement.dataset.pipelineStageDeferredReconcile),
    undefined,
  );

  console.log("PIPELINE_STAGE_AUTHORITY=RPC");
  console.log("PIPELINE_STAGE_PERSISTENCE=PASS");
  console.log("PIPELINE_STAGE_NO_MODULE_REFRESH=PASS");
  console.log("PIPELINE_STAGE_DEFERRED_RECONCILIATION=PASS");
  console.log("PIPELINE_WORKSPACE_LAYOUT_SHIFT=ZERO");
} finally {
  await context.close();
  await browser.close();
}