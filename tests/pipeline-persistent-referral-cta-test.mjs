import assert from "node:assert/strict";
import { chromium } from "@playwright/test";

const baseUrl = process.env.FORGE_PIPELINE_TEST_BASE_URL
  || "http://127.0.0.1:4173/docs/static-preview/forge-alive-material3/";
const appCss = new URL("app.css?v=pipeline-persistent-referral", baseUrl).href;
const authorityUrl = new URL(
  "pipeline-interaction-authority.js?v=pipeline-persistent-referral",
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

try {
  await page.goto(new URL("manifest.json", baseUrl).href, {
    waitUntil: "domcontentloaded",
  });
  await page.setContent(`<!doctype html><html data-forge-theme="dark"><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="${appCss}"></head><body>
  <main class="app"><section class="pipeline-module" data-forge-pipeline-module></section></main>
  </body></html>`);
  await page.addScriptTag({ type: "module", url: authorityUrl });
  await page.waitForFunction(() => document.documentElement.dataset.pipelineInteractionAuthority === "ready");

  const populated = await page.evaluate(() => {
    const root = document.querySelector("[data-forge-pipeline-module]");
    root.innerHTML = `
      <header class="pipeline-module__header">
        <p>PIPELINE</p>
        <h1>Relaciones en movimiento</h1>
        <span>4 prospectos</span>
      </header>
      <section class="pipeline-module__filters"></section>
      <div data-productive-pipeline-cards></div>`;

    const action = root.querySelector("[data-pipeline-create-referral]");
    const errorNode = root.querySelector("[data-pipeline-create-error]");
    let opened = 0;
    action.addEventListener("click", () => { opened += 1; });
    action.click();

    return {
      actionInHeader: action.parentElement?.matches(".pipeline-module__header"),
      actionText: action.textContent.trim(),
      ariaLabel: action.getAttribute("aria-label"),
      errorParentIsRoot: errorNode.parentElement === root,
      errorHidden: errorNode.hidden,
      opened,
    };
  });

  assert.equal(populated.actionInHeader, true);
  assert.equal(populated.actionText, "＋Nuevo referido");
  assert.equal(populated.ariaLabel, "Nuevo referido");
  assert.equal(populated.errorParentIsRoot, true);
  assert.equal(populated.errorHidden, true);
  assert.equal(populated.opened, 1);

  const action = page.locator(
    "[data-forge-pipeline-module] .pipeline-module__header [data-pipeline-create-referral]",
  );
  const box = await action.boundingBox();
  assert.ok(box, "PERSISTENT_REFERRAL_ACTION_NOT_VISIBLE");
  assert.ok(box.height >= 48, "PERSISTENT_REFERRAL_ACTION_TOUCH_TARGET_TOO_SMALL");

  const empty = await page.evaluate(() => {
    const root = document.querySelector("[data-forge-pipeline-module]");
    root.innerHTML = `
      <header class="pipeline-module__header">
        <p>PIPELINE</p>
        <h1>Relaciones en movimiento</h1>
        <span>0 prospectos</span>
      </header>
      <section class="pipeline-module__empty">
        <div class="pipeline-module__empty-copy"><h2>Tu Pipeline está listo</h2></div>
        <button class="pipeline-module__create" type="button"
          data-pipeline-create-referral data-open-referral aria-label="Agregar prospecto">
          <span aria-hidden="true">＋</span><span>Agregar prospecto</span>
        </button>
        <p data-pipeline-create-error role="alert" hidden></p>
      </section>`;

    const action = root.querySelector("[data-pipeline-create-referral]");
    const errorNode = root.querySelector("[data-pipeline-create-error]");
    return {
      actionCount: root.querySelectorAll("[data-pipeline-create-referral]").length,
      actionInHeader: action.parentElement?.matches(".pipeline-module__header"),
      actionText: action.textContent.trim(),
      errorParentIsRoot: errorNode.parentElement === root,
    };
  });

  assert.equal(empty.actionCount, 1);
  assert.equal(empty.actionInHeader, true);
  assert.equal(empty.actionText, "＋Nuevo referido");
  assert.equal(empty.errorParentIsRoot, true);

  const filtered = await page.evaluate(() => {
    const root = document.querySelector("[data-forge-pipeline-module]");
    root.innerHTML = `
      <header class="pipeline-module__header">
        <p>PIPELINE</p><h1>Relaciones en movimiento</h1><span>4 prospectos</span>
      </header>
      <section class="pipeline-module__filter-empty">
        <p>No hay prospectos que coincidan con estos filtros.</p>
      </section>`;
    const action = root.querySelector("[data-pipeline-create-referral]");
    root.querySelector("[data-pipeline-create-error]");
    return action.parentElement?.matches(".pipeline-module__header");
  });
  assert.equal(filtered, true);

  const protectedState = await page.evaluate(() => {
    const root = document.querySelector("[data-forge-pipeline-module]");
    root.innerHTML = `
      <header class="pipeline-module__header">
        <p>PIPELINE</p><h1>Relaciones en movimiento</h1><span>Datos privados protegidos</span>
      </header>
      <section data-pipeline-auth-state="ANONYMOUS"></section>`;
    return root.querySelector("[data-pipeline-create-referral]");
  });
  assert.equal(protectedState, null);

  console.log("PIPELINE_NEW_REFERRAL_ACTION=ALWAYS_AVAILABLE_WHEN_AUTHENTICATED");
  console.log("PIPELINE_NEW_REFERRAL_ACTION_TOUCH_TARGET=PASS");
  console.log("PIPELINE_NEW_REFERRAL_AUTH_GUARD=PASS");
} finally {
  await context.close();
  await browser.close();
}
