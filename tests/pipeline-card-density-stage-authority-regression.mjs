import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
import { readFile } from "node:fs/promises";

const runtimeEntryContract = Object.freeze({
  appEntry: "app.js?v=ui-m05x-quote-intake-ready-001&rep=16e-002",
  pipelineModule: "pipeline-module.js?v=ui-m06-pipeline-012",
  stageHotfix: "pipeline-public-acceptance-hotfix.js?v=pipeline-public-acceptance-003",
});
const [entryHtml, appSource] = await Promise.all([
  readFile("docs/static-preview/forge-alive-material3/index.html", "utf8"),
  readFile("docs/static-preview/forge-alive-material3/app.js", "utf8"),
]);
assert.match(entryHtml, new RegExp(runtimeEntryContract.appEntry.replace(/[.?+&]/g, "\\$&")));
assert.match(appSource, new RegExp(runtimeEntryContract.pipelineModule.replace(/[.?+&]/g, "\\$&")));
assert.match(appSource, new RegExp(runtimeEntryContract.stageHotfix.replace(/[.?+&]/g, "\\$&")));

const baseUrl = process.env.FORGE_PIPELINE_TEST_BASE_URL
  || "http://127.0.0.1:4173/docs/static-preview/forge-alive-material3/";
const hotfixUrl = new URL(
  "pipeline-public-acceptance-hotfix.js?v=pipeline-density-stage-regression",
  baseUrl,
).href;

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 412, height: 915 },
  deviceScaleFactor: 1,
  hasTouch: true,
});
const page = await context.newPage();

const markup = status => `
  <article class="pipeline-module__prospect pipeline-module__productive-card"
    data-productive-prospect-card="p1" data-productive-stage="${status}">
    <header class="pipeline-module__productive-identity" data-productive-card-identity>
      <div class="pipeline-module__productive-name">
        <strong>Eduardo</strong>
        <div class="pipeline-module__identity-actions">
          <button type="button" aria-label="Editar prospecto Eduardo">✎</button>
          <button type="button" aria-label="Eliminar prospecto Eduardo">⌫</button>
        </div>
      </div>
      <span class="pipeline-module__productive-stage" data-productive-stage-label>Nuevo</span>
      <label class="pipeline-module__stage-control">
        <span>Estado del prospecto</span>
        <select data-productive-stage-control="p1">
          <option value="referred_new" ${status === "referred_new" ? "selected" : ""}>Nuevo</option>
          <option value="contacted" ${status === "contacted" ? "selected" : ""}>Contactado</option>
        </select>
      </label>
    </header>
    <div class="pipeline-module__productive-meta"><span>Fuente</span><p>Mercado cálido</p></div>
    <div class="pipeline-module__productive-status"><p><span>Última actividad</span><strong>Prospecto creado</strong></p></div>
    <div class="pipeline-module__card-actions" data-productive-card-actions>
      <button>Bitácora</button><button>Preparar mensaje</button><button>NASH Combat</button>
      <button>Revisar NBA</button><a href="tel:+525500000000">Llamar</a><button disabled>Agendar</button>
    </div>
  </article>`;

try {
  await page.goto(new URL("manifest.json", baseUrl).href, { waitUntil: "domcontentloaded" });
  await page.setContent(`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
    <style>
      *{box-sizing:border-box} body{margin:0;padding:14px;background:#061224;color:#fff;font:16px system-ui}
      .pipeline-module{width:100%}.pipeline-module__productive-card{display:grid;gap:11px;padding:15px;border:1px solid #456;border-radius:24px}
      .pipeline-module__productive-name{display:flex;justify-content:space-between}.pipeline-module__identity-actions{display:flex;gap:6px}
      .pipeline-module__identity-actions button{width:44px;height:44px}.pipeline-module__stage-control{display:grid}
      .pipeline-module__card-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}
      .pipeline-module__card-actions>*{min-height:40px}
      .pipeline-module__productive-status p{padding:10px}.pipeline-module__productive-meta p,.pipeline-module__productive-status p{margin:0}
    </style></head><body><section class="pipeline-module" data-forge-pipeline-module>
      <div data-productive-pipeline-cards>${markup("referred_new")}</div></section></body></html>`);

  await page.evaluate(markupText => {
    const root = document.querySelector("[data-forge-pipeline-module]");
    const cards = root.querySelector("[data-productive-pipeline-cards]");
    globalThis.__densityStageCalls = [];
    globalThis.__authRefreshes = 0;
    globalThis.addEventListener("forge:auth-state-changed", () => { globalThis.__authRefreshes += 1; });
    globalThis.__FORGE_PIPELINE_ACCEPTANCE_SERVICE_FACTORY__ = async () => {
      throw new Error("SECOND_STAGE_AUTHORITY_USED");
    };
    root[Symbol.for("forge.material3.pipeline.state")] = {
      async updateProductiveStage(id, status) {
        globalThis.__densityStageCalls.push(`${id}:${status}`);
        cards.innerHTML = markupText.replaceAll("__STATUS__", status);
        return { id, status, stageLabel: status === "contacted" ? "Contactado" : "Nuevo" };
      },
    };
  }, markup("__STATUS__"));

  await page.addScriptTag({ type: "module", url: hotfixUrl });
  await page.waitForFunction(() => document.documentElement.dataset.pipelinePublicAcceptanceHotfix === "ready");

  const card = page.locator('[data-productive-prospect-card="p1"]');
  const actions = card.locator("[data-productive-card-actions]");
  const actionBoxes = await actions.locator(":scope > *").evaluateAll(elements => elements.map(element => {
    const box = element.getBoundingClientRect();
    return { x: Math.round(box.x), y: Math.round(box.y) };
  }));
  assert.equal(new Set(actionBoxes.map(box => box.x)).size, 3, "MOBILE_ACTIONS_NOT_THREE_COLUMNS");
  assert.equal(new Set(actionBoxes.map(box => box.y)).size, 2, "MOBILE_ACTIONS_NOT_TWO_ROWS");

  const stage = card.locator("[data-productive-stage-control]");
  const admin = card.locator(".pipeline-module__identity-actions");
  const [stageBox, adminBox, nameBox] = await Promise.all([
    stage.boundingBox(),
    admin.boundingBox(),
    card.locator("strong").first().boundingBox(),
  ]);
  assert.ok(stageBox && adminBox && nameBox);
  assert.ok(Math.abs(stageBox.y - adminBox.y) <= 6, "STAGE_AND_ADMIN_NOT_ON_COMPACT_ROW");
  assert.ok(nameBox.y < stageBox.y, "NAME_NOT_ABOVE_COMPACT_CONTROLS");

  await stage.selectOption("contacted");
  await page.waitForFunction(() => (
    document.querySelector('[data-productive-prospect-card="p1"]')?.dataset.stagePersistence === "saved"
  ));
  await page.evaluate(() => document.querySelector("[data-forge-pipeline-module]")
    [Symbol.for("forge.material3.pipeline.public-acceptance-hotfix")]?.synchronize());

  assert.equal(
    await page.locator('[data-productive-prospect-card="p1"] [data-productive-stage-control]').inputValue(),
    "contacted",
    "STAGE_REVERTED_AFTER_RENDER",
  );
  assert.deepEqual(await page.evaluate(() => globalThis.__densityStageCalls), ["p1:contacted"]);
  assert.equal(await page.evaluate(() => globalThis.__authRefreshes), 0, "AUTH_REFRESH_REINTRODUCED_STALE_STATE");

  console.log("PIPELINE_MOBILE_ACTIONS_3X2=PASS");
  console.log("PIPELINE_COMPACT_IDENTITY_ROW=PASS");
  console.log("PIPELINE_SINGLE_STAGE_AUTHORITY=PASS");
  console.log("PIPELINE_STAGE_NO_REVERT_AFTER_RENDER=PASS");
} finally {
  await context.close();
  await browser.close();
}
