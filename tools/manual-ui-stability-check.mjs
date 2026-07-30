import assert from "node:assert/strict";
import { chromium } from "@playwright/test";

const baseUrl = process.env.FORGE_MANUAL_UI_BASE_URL
  || "http://127.0.0.1:4173/docs/static-preview/forge-alive-material3/";
const moduleUrl = new URL("pipeline-ui-stability.js?v=manual-pipeline-stability-001", baseUrl).href;

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
          .rerender-banner { height: 72px; }
          .referral-sheet-layer { position: fixed; inset: 0; z-index: 100; }
        </style>
      </head>
      <body>
        <div id="frame">
          <main data-forge-pipeline-module>
            <article class="pipeline-module__productive-card"
              data-productive-prospect-card="prospect-1"
              data-productive-stage="referred_new">
              <span data-productive-stage-label>Nuevo</span>
              <select data-productive-stage-control="prospect-1">
                <option value="referred_new" selected>Nuevo</option>
                <option value="appointment_scheduled">Cita agendada</option>
                <option value="client">Cliente</option>
              </select>
              <div class="pipeline-module__card-actions">
                <button type="button" data-open-combat="prospect-1">NASH Combat</button>
              </div>
            </article>
          </main>
        </div>
        <script>
          const root = document.querySelector('[data-forge-pipeline-module]');
          root.addEventListener('change', event => {
            if (!event.target.matches('[data-productive-stage-control]')) return;
            const value = event.target.value;
            const label = event.target.selectedOptions[0].textContent;
            setTimeout(() => {
              root.innerHTML = '<div class="rerender-banner"></div>'
                + '<article class="pipeline-module__productive-card" data-productive-prospect-card="prospect-1" data-productive-stage="' + value + '">'
                + '<span data-productive-stage-label>' + label + '</span>'
                + '<select data-productive-stage-control="prospect-1">'
                + '<option value="referred_new">Nuevo</option>'
                + '<option value="appointment_scheduled" ' + (value === 'appointment_scheduled' ? 'selected' : '') + '>Cita agendada</option>'
                + '<option value="client" ' + (value === 'client' ? 'selected' : '') + '>Cliente</option>'
                + '</select>'
                + '<div class="pipeline-module__card-actions"><button type="button" data-open-combat="prospect-1">NASH Combat</button></div>'
                + '</article>';
            }, 20);
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

  await page.addScriptTag({ type: "module", url: moduleUrl });
  await page.waitForFunction(() => document.documentElement.dataset.forgePipelineUiStability === "ready");

  await page.locator('[data-productive-prospect-card="prospect-1"]').scrollIntoViewIfNeeded();
  const beforeStage = await page.locator('[data-productive-prospect-card="prospect-1"]').evaluate(card => ({
    stage: card.dataset.productiveStage,
    border: getComputedStyle(card).borderTopColor,
    top: card.getBoundingClientRect().top,
  }));

  await page.locator('[data-productive-stage-control="prospect-1"]').selectOption("appointment_scheduled");
  const immediate = await page.locator('[data-productive-prospect-card="prospect-1"]').evaluate(card => ({
    stage: card.dataset.productiveStage,
    label: card.querySelector('[data-productive-stage-label]').textContent,
    persistence: card.dataset.stagePersistence,
    border: getComputedStyle(card).borderTopColor,
  }));
  assert.equal(immediate.stage, "appointment_scheduled");
  assert.equal(immediate.label, "Cita agendada");
  assert.equal(immediate.persistence, "saving");
  assert.notEqual(immediate.border, beforeStage.border);

  await page.waitForTimeout(180);
  const afterRerender = await page.locator('[data-productive-prospect-card="prospect-1"]').evaluate(card => ({
    stage: card.dataset.productiveStage,
    label: card.querySelector('[data-productive-stage-label]').textContent,
    top: card.getBoundingClientRect().top,
    border: getComputedStyle(card).borderTopColor,
  }));
  assert.equal(afterRerender.stage, "appointment_scheduled");
  assert.equal(afterRerender.label, "Cita agendada");
  assert.ok(Math.abs(afterRerender.top - beforeStage.top) <= 1.5, `card moved ${afterRerender.top - beforeStage.top}px after rerender`);

  const beforeWorkspace = await page.locator("#frame").evaluate(node => ({
    width: node.getBoundingClientRect().width,
    scrollY: window.scrollY,
  }));
  await page.getByRole("button", { name: "NASH Combat" }).click();
  await page.waitForTimeout(40);
  const duringWorkspace = await page.locator("#frame").evaluate(node => ({
    width: node.getBoundingClientRect().width,
    scrollY: window.scrollY,
    paddingRight: getComputedStyle(document.body).paddingRight,
    open: document.documentElement.getAttribute("data-forge-productive-workspace-open"),
  }));
  assert.equal(duringWorkspace.open, "combat");
  assert.ok(Math.abs(duringWorkspace.width - beforeWorkspace.width) <= 1, `layout width shifted ${duringWorkspace.width - beforeWorkspace.width}px`);
  assert.ok(Math.abs(duringWorkspace.scrollY - beforeWorkspace.scrollY) <= 1, `scroll shifted ${duringWorkspace.scrollY - beforeWorkspace.scrollY}px`);

  await page.getByRole("button", { name: "Cerrar" }).click();
  await page.waitForTimeout(40);
  const afterWorkspace = await page.locator("#frame").evaluate(node => ({
    width: node.getBoundingClientRect().width,
    scrollY: window.scrollY,
    open: document.documentElement.hasAttribute("data-forge-productive-workspace-open"),
  }));
  assert.equal(afterWorkspace.open, false);
  assert.ok(Math.abs(afterWorkspace.width - beforeWorkspace.width) <= 1);
  assert.ok(Math.abs(afterWorkspace.scrollY - beforeWorkspace.scrollY) <= 1);

  console.log("QUOTE_COMPLETE_FIELD_MATRIX=PASS");
  console.log("PIPELINE_STAGE_COLOR_SYNC=PASS");
  console.log("PIPELINE_RERENDER_ANCHOR_STABLE=PASS");
  console.log("PIPELINE_WORKSPACE_LAYOUT_SHIFT=ZERO");
} finally {
  await context.close();
  await browser.close();
}
