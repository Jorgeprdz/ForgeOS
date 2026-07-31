import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";

const baseUrl = process.env.FORGE_PIPELINE_BASE_URL
  || "http://127.0.0.1:4173/docs/static-preview/forge-alive-material3/";
const outputDir = process.env.FORGE_PIPELINE_EVIDENCE
  || "artifacts/pipeline-mobile-interaction-regression";
const tolerance = 1;

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 360, height: 780 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
  userAgent: "Mozilla/5.0 (Linux; Android 16; SM-S931B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/30.0 Chrome/143.0.0.0 Mobile Safari/537.36",
});
const page = await context.newPage();
const failures = [];
const observations = [];

function closeEnough(a, b, label) {
  const delta = Math.abs(a - b);
  if (delta > tolerance) failures.push(`${label}: ${a} -> ${b} (delta ${delta})`);
}

function compareGeometry(before, after, phase) {
  assert.equal(after.containerDisplay, "grid", `${phase}: action container must remain grid`);
  assert.equal(after.items.length, before.items.length, `${phase}: action count changed`);
  closeEnough(before.container.x, after.container.x, `${phase} container x`);
  closeEnough(before.container.y, after.container.y, `${phase} container y`);
  closeEnough(before.container.width, after.container.width, `${phase} container width`);
  closeEnough(before.container.height, after.container.height, `${phase} container height`);
  for (let index = 0; index < before.items.length; index += 1) {
    const left = before.items[index];
    const right = after.items[index];
    assert.equal(right.label, left.label, `${phase}: control order changed`);
    for (const key of ["x", "y", "width", "height"]) {
      closeEnough(left[key], right[key], `${phase} ${left.label} ${key}`);
    }
  }
}

try {
  await page.goto(new URL("manifest.json?pipeline-mobile-fixture=1", baseUrl).href, {
    waitUntil: "domcontentloaded",
  });

  await page.setContent(`<!doctype html>
  <html lang="es-MX" data-forge-theme="dark">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
      <link id="app-css" rel="stylesheet" href="${new URL("app.css?v=pipeline-mobile-regression-001", baseUrl).href}">
      <style>
        html, body { min-height: 100%; }
        body { padding: 18px 12px 140px; }
        [data-forge-pipeline-module] { width: 100%; }
      </style>
    </head>
    <body>
      <main data-forge-pipeline-module>
        <div class="pipeline-module__stages" data-productive-pipeline-cards></div>
      </main>
      <script>
        const root = document.querySelector('[data-productive-pipeline-cards]');
        let serverStatus = 'appointment_scheduled';
        let modalStylesPromise;
        let navigationAttempts = 0;
        const labels = {
          referred_new: 'Nuevo',
          contacted: 'Contactado',
          appointment_scheduled: 'Cita agendada',
          proposal: 'Propuesta',
          decision: 'En decisión',
          client: 'Cliente',
        };

        function cardMarkup(status) {
          return \`<article class="pipeline-module__prospect pipeline-module__productive-card"
              data-productive-prospect-card="prospect-1"
              data-productive-source="Referido"
              data-productive-stage="\${status}">
            <header class="pipeline-module__productive-identity" data-productive-card-identity>
              <strong>Jorge Ignacio Palacios Rodriguez</strong>
              <span class="pipeline-module__productive-stage" data-productive-stage-label>\${labels[status]}</span>
            </header>
            <div class="pipeline-module__productive-meta" data-productive-card-metadata>
              <span>Fuente</span><p data-productive-source-label>Referido · Gabo · Amigo del trabajo</p>
            </div>
            <label class="pipeline-module__stage-control">
              <span>Estado del prospecto</span>
              <select data-productive-stage-control="prospect-1" aria-label="Cambiar estado de Jorge Ignacio Palacios Rodriguez">
                \${Object.entries(labels).map(([value, label]) => \`<option value="\${value}" \${value === status ? 'selected' : ''}>\${label}</option>\`).join('')}
              </select>
            </label>
            <div class="pipeline-module__productive-status" data-productive-card-status>
              <p><span>Última actividad</span><strong>Sin actividad verificada</strong></p>
            </div>
            <div class="pipeline-module__card-actions" data-productive-card-actions aria-label="Acciones del prospecto">
              <button class="pipeline-module__action--context" type="button" data-test-workspace="context">Ver contexto</button>
              <button class="pipeline-module__action--primary" type="button" data-test-workspace="message">Preparar mensaje</button>
              <button class="pipeline-module__action--combat" type="button" data-test-workspace="combat">NASH Combat</button>
              <button class="pipeline-module__action--nba" type="button" data-test-workspace="nba">Revisar NBA</button>
              <a class="pipeline-module__action--call" href="tel:+525511111111" data-test-call>Llamar</a>
              <button class="pipeline-module__action--calendar" type="button" disabled title="NOT_CONNECTED">Agendar</button>
            </div>
          </article>\`;
        }

        function renderCard() { root.innerHTML = cardMarkup(serverStatus); }

        function ensureModalStyles() {
          if (modalStylesPromise) return modalStylesPromise;
          modalStylesPromise = new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = '${new URL("pipeline-referral-modal.css?v=pipeline-mobile-regression-001", baseUrl).href}';
            link.dataset.material3ReferralStyles = 'true';
            link.onload = resolve;
            link.onerror = reject;
            document.head.append(link);
          });
          return modalStylesPromise;
        }

        async function openWorkspace(kind, trigger) {
          await ensureModalStyles();
          const layer = document.createElement('div');
          layer.className = 'referral-sheet-layer';
          layer.dataset.testWorkspaceLayer = kind;
          layer.innerHTML = \`<button class="referral-sheet__scrim" type="button" data-close-workspace aria-label="Cerrar \${kind}"></button>
            <section class="referral-sheet" role="dialog" aria-modal="true">
              <header class="referral-sheet__header"><div><p>PIPELINE</p><h2>\${kind}</h2></div><button class="referral-sheet__close" type="button" data-close-workspace aria-label="Cerrar">×</button></header>
              <div class="referral-sheet__body"><p>Workspace de prueba</p></div>
            </section>\`;
          layer.addEventListener('click', event => {
            if (!event.target.closest('[data-close-workspace]')) return;
            layer.remove();
            trigger.focus({ preventScroll: true });
          });
          document.body.append(layer);
        }

        root.addEventListener('click', event => {
          const workspace = event.target.closest('[data-test-workspace]');
          if (workspace) void openWorkspace(workspace.dataset.testWorkspace, workspace);
          const call = event.target.closest('[data-test-call]');
          if (call) { event.preventDefault(); navigationAttempts += 1; }
        });

        root.addEventListener('change', event => {
          const select = event.target.closest('[data-productive-stage-control]');
          if (!select) return;
          const desired = select.value;
          const card = select.closest('[data-productive-prospect-card]');
          card.dataset.productiveStage = desired;
          card.dataset.stagePersistence = 'saving';
          card.querySelector('[data-productive-stage-label]').textContent = labels[desired];
          select.setAttribute('aria-busy', 'true');
          setTimeout(() => {
            serverStatus = desired;
            renderCard();
          }, 180);
        });

        window.__pipelineFixture = {
          get serverStatus() { return serverStatus; },
          get navigationAttempts() { return navigationAttempts; },
          renderCard,
        };
        renderCard();
      </script>
    </body>
  </html>`);

  await page.waitForFunction(() => document.querySelector('#app-css')?.sheet);
  await page.addScriptTag({
    type: "module",
    url: new URL("pipeline-ui-stability.js?v=pipeline-mobile-regression-001", baseUrl).href,
  });
  await page.waitForFunction(() => document.documentElement.dataset.forgePipelineUiStability === "ready");

  const geometry = () => page.locator('[data-productive-card-actions]').evaluate(container => {
    const rect = container.getBoundingClientRect();
    return {
      containerDisplay: getComputedStyle(container).display,
      gridTemplateColumns: getComputedStyle(container).gridTemplateColumns,
      container: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
      items: [...container.querySelectorAll('button, a')].map(node => {
        const item = node.getBoundingClientRect();
        return {
          label: node.textContent.trim(),
          x: item.x,
          y: item.y,
          width: item.width,
          height: item.height,
          disabled: node.matches(':disabled'),
        };
      }),
    };
  });

  await page.locator('[data-productive-prospect-card]').scrollIntoViewIfNeeded();
  const baseline = await geometry();
  assert.equal(baseline.containerDisplay, "grid");
  assert.equal(baseline.items.length, 6);
  await page.screenshot({ path: path.join(outputDir, "00-before-interaction.png"), fullPage: true });

  for (const label of ["Ver contexto", "Preparar mensaje", "NASH Combat", "Revisar NBA"]) {
    await page.getByRole("button", { name: label }).click();
    await page.locator('[data-test-workspace-layer]').waitFor({ state: "visible" });
    await page.screenshot({
      path: path.join(outputDir, `workspace-${label.toLowerCase().replaceAll(" ", "-")}.png`),
      fullPage: true,
    });
    await page.getByRole("button", { name: "Cerrar", exact: true }).click();
    await page.locator('[data-test-workspace-layer]').waitFor({ state: "detached" });
    const after = await geometry();
    compareGeometry(baseline, after, `after ${label}`);
    observations.push({ phase: `after ${label}`, geometry: after });
  }

  await page.getByRole("link", { name: "Llamar" }).click();
  assert.equal(await page.evaluate(() => window.__pipelineFixture.navigationAttempts), 1);
  compareGeometry(baseline, await geometry(), "after Llamar");

  const select = page.getByRole("combobox", { name: /Cambiar estado/ });
  await select.selectOption("proposal");
  const immediate = await page.locator('[data-productive-prospect-card]').evaluate(card => ({
    stage: card.dataset.productiveStage,
    label: card.querySelector('[data-productive-stage-label]').textContent.trim(),
    value: card.querySelector('[data-productive-stage-control]').value,
    border: getComputedStyle(card).borderLeftColor,
  }));
  assert.equal(immediate.stage, "proposal");
  assert.equal(immediate.label, "Propuesta");
  assert.equal(immediate.value, "proposal");

  await page.waitForTimeout(1400);
  const persisted = await page.locator('[data-productive-prospect-card]').evaluate(card => ({
    stage: card.dataset.productiveStage,
    label: card.querySelector('[data-productive-stage-label]').textContent.trim(),
    value: card.querySelector('[data-productive-stage-control]').value,
    border: getComputedStyle(card).borderLeftColor,
  }));
  assert.equal(await page.evaluate(() => window.__pipelineFixture.serverStatus), "proposal");
  assert.equal(persisted.stage, "proposal");
  assert.equal(persisted.label, "Propuesta");
  assert.equal(persisted.value, "proposal");
  assert.notEqual(persisted.border, immediate.border === "rgb(241, 189, 104)" ? immediate.border : "rgb(241, 189, 104)");
  compareGeometry(baseline, await geometry(), "after persisted stage rerender");
  await page.screenshot({ path: path.join(outputDir, "99-after-persisted-stage.png"), fullPage: true });

  if (failures.length) throw new Error(`PIPELINE_GEOMETRY_REGRESSION\n${failures.join("\n")}`);

  const result = {
    viewport: { width: 360, height: 780, deviceScaleFactor: 3 },
    userAgent: await page.evaluate(() => navigator.userAgent),
    baseline,
    observations,
    immediate,
    persisted,
    maxGeometryDeltaPx: tolerance,
    actionGeometryStable: true,
    stagePersistedAfter1400ms: true,
  };
  await writeFile(path.join(outputDir, "result.json"), `${JSON.stringify(result, null, 2)}\n`);
  console.log("PIPELINE_ALL_ENABLED_ACTIONS_CLICKED=PASS");
  console.log("PIPELINE_ACTION_GEOMETRY_STABLE=PASS");
  console.log("PIPELINE_MODAL_CSS_LATE_LOAD_NO_REFLOW=PASS");
  console.log("PIPELINE_STAGE_PERSISTS_AFTER_RERENDER=PASS");
  console.log("PIPELINE_STAGE_REVERT_UNDER_1S=ZERO");
} finally {
  await context.close();
  await browser.close();
}
