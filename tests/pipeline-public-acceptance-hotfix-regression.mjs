import assert from "node:assert/strict";
import { chromium } from "@playwright/test";

const baseUrl = process.env.FORGE_PIPELINE_TEST_BASE_URL
  || "http://127.0.0.1:4173/docs/static-preview/forge-alive-material3/";
const hotfixUrl = new URL(
  "pipeline-public-acceptance-hotfix.js?v=pipeline-public-acceptance-regression",
  baseUrl,
).href;

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();

const stageOptions = status => [
  ["referred_new", "Nuevo"],
  ["contacted", "Contactado"],
  ["appointment_scheduled", "Cita agendada"],
  ["proposal", "Propuesta"],
  ["decision", "En decisión"],
  ["client", "Cliente"],
].map(([value, label]) => (
  `<option value="${value}" ${value === status ? "selected" : ""}>${label}</option>`
)).join("");

const cardMarkup = ({ id, name, status }) => `
  <article
    class="pipeline-module__prospect pipeline-module__productive-card"
    data-productive-prospect-card="${id}"
    data-productive-stage="${status}"
  >
    <header class="pipeline-module__productive-identity" data-productive-card-identity>
      <strong>${name}</strong>
      <span class="pipeline-module__productive-stage" data-productive-stage-label>Cita agendada</span>
    </header>
    <div class="pipeline-module__productive-meta">
      <span>Fuente</span>
      <p>Referido</p>
    </div>
    <label class="pipeline-module__stage-control">
      <span>Estado del prospecto</span>
      <select data-productive-stage-control="${id}" aria-label="Cambiar estado de ${name}">
        ${stageOptions(status)}
      </select>
    </label>
    <div class="pipeline-module__productive-status">
      <p><span>Última actividad</span><strong>Sin actividad verificada</strong></p>
    </div>
    <div class="pipeline-module__card-actions" data-productive-card-actions>
      <button type="button">Bitácora</button>
      <button type="button">Preparar mensaje</button>
      <button type="button">NASH Combat</button>
      <button type="button">Revisar NBA</button>
      <a href="tel:+525500000000">Llamar</a>
      <button type="button" disabled>Agendar</button>
    </div>
  </article>`;

try {
  await page.goto(new URL("manifest.json", baseUrl).href, {
    waitUntil: "domcontentloaded",
  });
  await page.setContent(`<!doctype html>
    <html data-forge-theme="dark">
      <head>
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <style>
          :root { --muted:#aab6cc; --ink:#f4f7ff; --aqua:#65e9e2; }
          * { box-sizing:border-box; }
          body { margin:0; padding:32px; color:#f4f7ff; background:#061224; font:16px system-ui; }
          .pipeline-module { width:1100px; }
          .pipeline-module__filters { display:grid; grid-template-columns:2fr 1fr 1fr auto auto; gap:10px; padding:14px; }
          .pipeline-module__filters label { display:grid; gap:5px; }
          .pipeline-module__filters label > span { font-size:10px; text-transform:uppercase; }
          .pipeline-module__filters select { width:100%; border-radius:12px; }
          .pipeline-module__stages { display:grid; grid-template-columns:repeat(2, 320px); gap:16px; }
          .pipeline-module__productive-card { display:grid; gap:12px; padding:18px; border:1px solid #345; border-radius:20px; }
          .pipeline-module__productive-identity { display:flex; justify-content:space-between; gap:10px; }
          .pipeline-module__stage-control { display:grid; gap:5px; }
          .pipeline-module__stage-control select { min-height:42px; }
          .pipeline-module__card-actions { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; }
          .pipeline-module__card-actions > * { min-height:38px; }
        </style>
      </head>
      <body>
        <section class="pipeline-module" data-forge-pipeline-module>
          <header class="pipeline-module__header">
            <p>PIPELINE</p><h1>Relaciones en movimiento</h1><span>2 prospectos</span>
          </header>
          <section class="pipeline-module__filters" data-productive-filter-bar>
            <label><span>Fuente</span><select data-productive-filter-source><option value="">Todas las fuentes</option></select></label>
            <label><span>Estado</span><select data-productive-filter-status><option value="">Todos los estados</option></select></label>
            <p data-productive-filter-count>2 de 2 prospectos</p>
            <button type="button" data-clear-productive-filters disabled>Limpiar filtros</button>
          </section>
          <div class="pipeline-module__stages" data-productive-pipeline-cards>
            ${cardMarkup({ id: "p1", name: "Jorge Ignacio Palacios Rodríguez", status: "appointment_scheduled" })}
            ${cardMarkup({ id: "p2", name: "María Fernanda López", status: "appointment_scheduled" })}
          </div>
        </section>
      </body>
    </html>`);

  await page.evaluate(() => {
    globalThis.__pipelineAcceptanceCalls = [];
    globalThis.__pipelineAcceptanceRecord = {
      id: "p1",
      status: "appointment_scheduled",
    };
    globalThis.__FORGE_PIPELINE_ACCEPTANCE_SERVICE_FACTORY__ = async () => ({
      async updateProspect(id, changes) {
        globalThis.__pipelineAcceptanceCalls.push(`update:${id}:${changes.status}`);
        globalThis.__pipelineAcceptanceRecord = {
          ...globalThis.__pipelineAcceptanceRecord,
          id,
          status: changes.status,
        };
        return { ...globalThis.__pipelineAcceptanceRecord };
      },
      async getProspect(id) {
        globalThis.__pipelineAcceptanceCalls.push(`get:${id}`);
        return { ...globalThis.__pipelineAcceptanceRecord };
      },
      async listProspects() {
        globalThis.__pipelineAcceptanceCalls.push("list");
        return [{ ...globalThis.__pipelineAcceptanceRecord }];
      },
    });
  });

  await page.addScriptTag({ type: "module", url: hotfixUrl });
  await page.waitForFunction(
    () => document.documentElement.dataset.pipelinePublicAcceptanceHotfix === "ready",
  );

  const search = page.locator("[data-productive-filter-name]");
  await search.waitFor();
  const searchBox = await search.boundingBox();
  const sourceBox = await page.locator("[data-productive-filter-source]").boundingBox();
  assert.ok(searchBox && sourceBox);
  assert.ok(Math.abs(searchBox.y - sourceBox.y) <= 1.5, "SEARCH_CONTROL_NOT_ALIGNED");
  assert.ok(Math.abs(searchBox.height - sourceBox.height) <= 1.5, "SEARCH_CONTROL_HEIGHT_MISMATCH");

  await search.fill("jor");
  assert.equal(
    await page.locator("[data-productive-prospect-card]:not([hidden])").count(),
    1,
    "NAME_SEARCH_DID_NOT_FILTER",
  );
  assert.equal(
    await page.locator("[data-productive-prospect-card]:not([hidden]) strong").first().textContent(),
    "Jorge Ignacio Palacios Rodríguez",
  );

  await search.fill("zzz");
  assert.equal(
    await page.locator("[data-productive-prospect-card]:not([hidden])").count(),
    0,
    "NAME_SEARCH_DID_NOT_HIDE_NON_MATCHES",
  );
  await page.waitForSelector("[data-productive-name-filter-empty]");

  await page.getByRole("button", { name: "Limpiar búsqueda por nombre" }).click();
  assert.equal(
    await page.locator("[data-productive-prospect-card]:not([hidden])").count(),
    2,
  );

  const firstCard = page.locator('[data-productive-prospect-card="p1"]');
  const stageControl = firstCard.locator("[data-productive-stage-control]");
  assert.equal(
    await stageControl.evaluate(element => element.closest("[data-productive-card-identity]") !== null),
    true,
    "STAGE_CONTROL_NOT_MOVED_TO_IDENTITY",
  );
  const stageBox = await stageControl.boundingBox();
  assert.ok(stageBox && stageBox.height <= 36 && stageBox.width <= 160, "STAGE_CONTROL_NOT_COMPACT");
  assert.equal(
    await firstCard.locator("[data-productive-stage-label]").evaluate(element => getComputedStyle(element).display),
    "none",
    "DUPLICATE_STAGE_BADGE_VISIBLE",
  );

  await stageControl.selectOption("contacted");
  await page.waitForFunction(() => (
    document.querySelector('[data-productive-prospect-card="p1"]')?.dataset.stagePersistence === "saved"
  ));
  assert.equal(await stageControl.inputValue(), "contacted");
  assert.equal(await firstCard.getAttribute("data-productive-stage"), "contacted");
  assert.deepEqual(
    await page.evaluate(() => globalThis.__pipelineAcceptanceCalls),
    ["update:p1:contacted", "get:p1", "list"],
    "STAGE_PERSISTENCE_SEQUENCE_INVALID",
  );

  const actions = firstCard.locator("[data-productive-card-actions]");
  const columns = await actions.evaluate(element => (
    getComputedStyle(element).gridTemplateColumns.split(" ").filter(Boolean).length
  ));
  assert.equal(columns, 3, "ACTIONS_NOT_THREE_COLUMNS");
  const boxes = await actions.locator(":scope > *").evaluateAll(elements => elements.map(element => {
    const box = element.getBoundingClientRect();
    return { x: Math.round(box.x), y: Math.round(box.y) };
  }));
  assert.equal(new Set(boxes.map(box => box.x)).size, 3, "ACTIONS_NOT_3X2_COLUMNS");
  assert.equal(new Set(boxes.map(box => box.y)).size, 2, "ACTIONS_NOT_3X2_ROWS");

  console.log("PIPELINE_PUBLIC_SEARCH_ALIGNMENT=PASS");
  console.log("PIPELINE_PUBLIC_NAME_FILTER=PASS");
  console.log("PIPELINE_PUBLIC_STAGE_COMPACT_POSITION=PASS");
  console.log("PIPELINE_PUBLIC_STAGE_READ_AFTER_WRITE=PASS");
  console.log("PIPELINE_PUBLIC_ACTIONS_3X2=PASS");
} finally {
  await context.close();
  await browser.close();
}
