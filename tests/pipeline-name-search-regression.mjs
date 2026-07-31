import assert from "node:assert/strict";
import { chromium } from "@playwright/test";

const baseUrl = process.env.FORGE_PIPELINE_TEST_BASE_URL
  || "http://127.0.0.1:4173/docs/static-preview/forge-alive-material3/";
const appCss = new URL("app.css?v=pipeline-name-search", baseUrl).href;
const authorityUrl = new URL(
  "pipeline-interaction-authority.js?v=pipeline-name-search",
  baseUrl,
).href;

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 412, height: 915 },
  deviceScaleFactor: 2.625,
  isMobile: true,
  hasTouch: true,
});
const page = await context.newPage();

const cardsMarkup = () => `
  <div class="pipeline-module__stages" data-productive-pipeline-cards>
    <article class="pipeline-module__productive-card" data-productive-prospect-card="1">
      <header class="pipeline-module__productive-identity" data-productive-card-identity>
        <strong>José Álvarez</strong>
      </header>
    </article>
    <article class="pipeline-module__productive-card" data-productive-prospect-card="2">
      <header class="pipeline-module__productive-identity" data-productive-card-identity>
        <strong>María Fernanda</strong>
      </header>
    </article>
    <article class="pipeline-module__productive-card" data-productive-prospect-card="3">
      <header class="pipeline-module__productive-identity" data-productive-card-identity>
        <strong>JORGE PALACIOS</strong>
      </header>
    </article>
    <article class="pipeline-module__productive-card" data-productive-prospect-card="4">
      <header class="pipeline-module__productive-identity" data-productive-card-identity>
        <strong>Ángel Robles</strong>
      </header>
    </article>
  </div>`;

const renderPipeline = () => `
  <header class="pipeline-module__header">
    <p>PIPELINE</p>
    <h1>Relaciones en movimiento</h1>
    <span>4 prospectos</span>
  </header>
  <section class="pipeline-module__filters" data-productive-filter-bar>
    <label><span>Fuente</span><select data-productive-filter-source><option>Todas</option></select></label>
    <label><span>Estado</span><select data-productive-filter-status><option>Todos</option></select></label>
    <p data-productive-filter-count aria-live="polite">4 de 4 prospectos</p>
    <button type="button" data-clear-productive-filters disabled>Limpiar filtros</button>
  </section>
  ${cardsMarkup()}`;

try {
  await page.goto(new URL("manifest.json", baseUrl).href, {
    waitUntil: "domcontentloaded",
  });
  await page.setContent(`<!doctype html>
    <html data-forge-theme="dark">
      <head>
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <link rel="stylesheet" href="${appCss}">
      </head>
      <body>
        <main class="app">
          <section class="pipeline-module" data-forge-pipeline-module></section>
        </main>
      </body>
    </html>`);
  await page.addScriptTag({ type: "module", url: authorityUrl });
  await page.waitForFunction(
    () => document.documentElement.dataset.pipelineInteractionAuthority === "ready",
  );

  await page.evaluate(markup => {
    document.querySelector("[data-forge-pipeline-module]").innerHTML = markup;
  }, renderPipeline());
  await page.waitForSelector("[data-productive-filter-name]");

  const search = page.locator("[data-productive-filter-name]");
  const visibleCards = () => page.locator(
    "[data-productive-prospect-card]:not([hidden])",
  ).count();

  assert.equal(await search.getAttribute("type"), "search");
  assert.equal(
    await search.getAttribute("placeholder"),
    "Escribe al menos 3 caracteres",
  );
  assert.equal(await visibleCards(), 4);

  await search.fill("jo");
  assert.equal(await visibleCards(), 4, "SEARCH_STARTED_BEFORE_THREE_CHARACTERS");

  await search.fill("jor");
  assert.equal(await visibleCards(), 1);
  assert.equal(
    await page.locator("[data-productive-prospect-card]:not([hidden]) strong").textContent(),
    "JORGE PALACIOS",
  );
  assert.equal(
    await page.locator("[data-productive-filter-count]").textContent(),
    "1 de 4 prospectos",
  );

  await search.fill("jose");
  assert.equal(await visibleCards(), 1, "ACCENT_INSENSITIVE_SEARCH_FAILED");
  assert.equal(
    await page.locator("[data-productive-prospect-card]:not([hidden]) strong").textContent(),
    "José Álvarez",
  );

  await search.fill("ANG");
  assert.equal(await visibleCards(), 1, "CASE_INSENSITIVE_SEARCH_FAILED");
  assert.equal(
    await page.locator("[data-productive-prospect-card]:not([hidden]) strong").textContent(),
    "Ángel Robles",
  );

  await search.fill("zzz");
  assert.equal(await visibleCards(), 0);
  await page.waitForSelector("[data-productive-name-filter-empty]");
  assert.equal(
    await page.locator("[data-productive-name-filter-empty]").textContent(),
    "No hay prospectos que coincidan con este nombre.",
  );

  await page.getByRole("button", { name: "Limpiar búsqueda por nombre" }).click();
  assert.equal(await search.inputValue(), "");
  assert.equal(await visibleCards(), 4);
  assert.equal(
    await page.locator("[data-productive-filter-count]").textContent(),
    "4 de 4 prospectos",
  );

  await search.fill("mar");
  assert.equal(await visibleCards(), 1);

  await page.evaluate(markup => {
    document.querySelector("[data-forge-pipeline-module]").innerHTML = markup;
  }, renderPipeline());
  await page.waitForSelector("[data-productive-filter-name]");
  assert.equal(
    await page.locator("[data-productive-filter-name]").inputValue(),
    "mar",
    "SEARCH_QUERY_DID_NOT_SURVIVE_PIPELINE_RERENDER",
  );
  assert.equal(await visibleCards(), 1);
  assert.equal(
    await page.locator("[data-productive-prospect-card]:not([hidden]) strong").textContent(),
    "María Fernanda",
  );

  await page.locator("[data-clear-productive-filters]").click();
  await page.waitForTimeout(0);
  assert.equal(
    await page.locator("[data-productive-filter-name]").inputValue(),
    "",
    "CLEAR_FILTERS_DID_NOT_CLEAR_NAME_SEARCH",
  );
  assert.equal(await visibleCards(), 4);

  const clearBox = await page.getByRole(
    "button",
    { name: "Limpiar búsqueda por nombre" },
  ).boundingBox();
  assert.ok(clearBox && clearBox.width >= 40 && clearBox.height >= 40);

  console.log("PIPELINE_NAME_SEARCH_MINIMUM_LENGTH=PASS");
  console.log("PIPELINE_NAME_SEARCH_REAL_TIME=PASS");
  console.log("PIPELINE_NAME_SEARCH_ACCENT_CASE_NORMALIZATION=PASS");
  console.log("PIPELINE_NAME_SEARCH_RERENDER_PERSISTENCE=PASS");
  console.log("PIPELINE_NAME_SEARCH_CLEAR_ACTIONS=PASS");
  console.log("PIPELINE_NAME_SEARCH_TOUCH_TARGET=PASS");
} finally {
  await context.close();
  await browser.close();
}
