import assert from "node:assert/strict";
import { chromium } from "@playwright/test";

const baseUrl = process.env.FORGE_PIPELINE_TEST_BASE_URL
  || "http://127.0.0.1:4173/docs/static-preview/forge-alive-material3/";
const hotfixUrl = new URL(
  "pipeline-public-acceptance-hotfix.js?v=pipeline-filter-count-test",
  baseUrl,
).href;
const countAuthorityUrl = new URL(
  "pipeline-filter-count-authority.js?v=pipeline-filter-count-test",
  baseUrl,
).href;

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();

try {
  await page.goto(new URL("manifest.json", baseUrl).href, {
    waitUntil: "domcontentloaded",
  });
  await page.setContent(`<!doctype html>
    <html>
      <head><style>[hidden]{display:none!important}</style></head>
      <body>
        <section data-forge-pipeline-module>
          <header class="pipeline-module__header"><h1>Pipeline</h1><span>6 prospectos</span></header>
          <section data-productive-filter-bar>
            <label><span>Fuente</span><select data-productive-filter-source><option>Referido</option></select></label>
            <label><span>Estado</span><select data-productive-filter-status><option>Contactado</option></select></label>
            <p data-productive-filter-count>1 de 6 prospectos</p>
            <button data-clear-productive-filters>Limpiar filtros</button>
          </section>
          <div data-productive-pipeline-cards>
            <article data-productive-prospect-card="p1" data-productive-source="Referido" data-productive-stage="contacted">
              <header data-productive-card-identity><strong>Jorge Palacios</strong></header>
              <label class="pipeline-module__stage-control"><span>Estado</span><select data-productive-stage-control="p1"><option value="contacted">Contactado</option></select></label>
            </article>
          </div>
        </section>
      </body>
    </html>`);

  await page.evaluate(() => {
    globalThis.__FORGE_DISABLE_PIPELINE_PUBLIC_ACCEPTANCE_HOTFIX_AUTO_INSTALL__ = false;
    globalThis.__FORGE_DISABLE_PIPELINE_FILTER_COUNT_AUTHORITY_AUTO_INSTALL__ = false;
  });
  await page.addScriptTag({ type: "module", url: hotfixUrl });
  await page.addScriptTag({ type: "module", url: countAuthorityUrl });
  await page.waitForFunction(() => (
    document.documentElement.dataset.pipelineFilterCountAuthority === "ready"
  ));

  assert.equal(
    await page.locator("[data-productive-filter-count]").textContent(),
    "1 de 6 prospectos",
    "COMBINED_FILTER_TOTAL_OVERWRITTEN",
  );

  await page.locator("[data-productive-filter-name]").fill("jor");
  assert.equal(
    await page.locator("[data-productive-filter-count]").textContent(),
    "1 de 6 prospectos",
    "NAME_SEARCH_TOTAL_NOT_PRESERVED",
  );

  await page.locator("[data-productive-filter-name]").fill("");
  await page.evaluate(() => {
    document.querySelector("[data-productive-pipeline-cards]")?.remove();
    const count = document.querySelector("[data-productive-filter-count]");
    count.textContent = "0 de 6 prospectos";
    const empty = document.createElement("section");
    empty.dataset.productiveFilterEmpty = "";
    empty.textContent = "No hay prospectos";
    count.insertAdjacentElement("afterend", empty);
  });
  await page.waitForFunction(() => (
    document.querySelector("[data-productive-filter-count]")?.textContent === "0 de 6 prospectos"
  ));

  assert.equal(
    await page.locator("[data-productive-filter-count]").textContent(),
    "0 de 6 prospectos",
    "EMPTY_FILTER_TOTAL_OVERWRITTEN",
  );

  console.log("PIPELINE_COMBINED_FILTER_COUNT=PASS");
  console.log("PIPELINE_NAME_SEARCH_TOTAL=PASS");
  console.log("PIPELINE_EMPTY_FILTER_COUNT=PASS");
} finally {
  await context.close();
  await browser.close();
}
