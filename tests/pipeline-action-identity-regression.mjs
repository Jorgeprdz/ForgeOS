import assert from "node:assert/strict";
import { chromium } from "@playwright/test";

const baseUrl = process.env.FORGE_PIPELINE_BASE_URL
  || "http://127.0.0.1:4173/docs/static-preview/forge-alive-material3/";
const appCssUrl = new URL("app.css", baseUrl).href;
const identityModuleUrl = new URL(
  `pipeline-action-identity.js?v=point6-${Date.now()}`,
  baseUrl,
).href;

const actionsMarkup = name => `
  <article class="pipeline-module__prospect pipeline-module__productive-card"
    data-productive-prospect-card="prospect-1"
    data-productive-stage="contacted">
    <header class="pipeline-module__productive-identity" data-productive-card-identity>
      <strong>${name}</strong>
      <span class="pipeline-module__productive-stage">Contactado</span>
    </header>
    <div class="pipeline-module__card-actions" data-productive-card-actions aria-label="Acciones del prospecto">
      <button class="pipeline-module__action--context" type="button">Ver contexto</button>
      <button class="pipeline-module__action--primary" type="button" data-prepare-productive-message="prospect-1">Preparar mensaje</button>
      <button class="pipeline-module__action--combat" type="button">NASH Combat</button>
      <button class="pipeline-module__action--nba" type="button">Revisar NBA</button>
      <a class="pipeline-module__action--call" href="tel:5512345678">Llamar</a>
      <button class="pipeline-module__action--calendar" type="button" disabled title="NOT_CONNECTED">Agendar</button>
    </div>
  </article>`;

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 412, height: 915 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();

try {
  await page.setContent(`<!doctype html>
    <html>
      <head><link rel="stylesheet" href="${appCssUrl}"></head>
      <body><main data-forge-pipeline-module>${actionsMarkup("Ana López")}</main></body>
    </html>`);
  await page.addScriptTag({ type: "module", url: identityModuleUrl });
  await page.waitForFunction(() => (
    document.documentElement.dataset.pipelineActionIdentity === "ready"
    && document.querySelector("[data-pipeline-action-identity-styles]")?.sheet
  ));

  const snapshot = await page.evaluate(() => {
    const get = brand => document.querySelector(`[data-pipeline-action-brand="${brand}"]`);
    const style = node => {
      const computed = getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      return {
        background: computed.backgroundImage || computed.backgroundColor,
        border: computed.borderTopColor,
        color: computed.color,
        width: rect.width,
        height: rect.height,
        iconWidth: node.querySelector("[data-pipeline-action-icon]")?.getBoundingClientRect().width || 0,
      };
    };
    return {
      whatsapp: {
        brand: get("whatsapp")?.dataset.pipelineActionBrand,
        icon: get("whatsapp")?.querySelector("[data-pipeline-action-icon]")?.dataset.pipelineActionIcon,
        iconCount: get("whatsapp")?.querySelectorAll("[data-pipeline-action-icon]").length,
        aria: get("whatsapp")?.getAttribute("aria-label"),
        title: get("whatsapp")?.title,
        style: style(get("whatsapp")),
      },
      phone: {
        brand: get("phone")?.dataset.pipelineActionBrand,
        icon: get("phone")?.querySelector("[data-pipeline-action-icon]")?.dataset.pipelineActionIcon,
        iconCount: get("phone")?.querySelectorAll("[data-pipeline-action-icon]").length,
        aria: get("phone")?.getAttribute("aria-label"),
        title: get("phone")?.title,
        href: get("phone")?.getAttribute("href"),
        style: style(get("phone")),
      },
      calendar: {
        brand: get("calendar")?.dataset.pipelineActionBrand,
        icon: get("calendar")?.querySelector("[data-pipeline-action-icon]")?.dataset.pipelineActionIcon,
        iconCount: get("calendar")?.querySelectorAll("[data-pipeline-action-icon]").length,
        aria: get("calendar")?.getAttribute("aria-label"),
        title: get("calendar")?.title,
        disabled: get("calendar")?.disabled,
        style: style(get("calendar")),
      },
      combatBrand: document.querySelector(".pipeline-module__action--combat")?.dataset.pipelineActionBrand || null,
      nbaBrand: document.querySelector(".pipeline-module__action--nba")?.dataset.pipelineActionBrand || null,
    };
  });

  assert.equal(snapshot.whatsapp.brand, "whatsapp");
  assert.equal(snapshot.phone.brand, "phone");
  assert.equal(snapshot.calendar.brand, "calendar");
  assert.equal(snapshot.whatsapp.icon, "whatsapp");
  assert.equal(snapshot.phone.icon, "phone");
  assert.equal(snapshot.calendar.icon, "calendar");
  assert.equal(snapshot.whatsapp.iconCount, 1);
  assert.equal(snapshot.phone.iconCount, 1);
  assert.equal(snapshot.calendar.iconCount, 1);
  assert.match(snapshot.whatsapp.aria, /WhatsApp para Ana López/);
  assert.match(snapshot.phone.aria, /Llamar a Ana López/);
  assert.match(snapshot.calendar.aria, /Calendar para Ana López; no conectado/);
  assert.equal(snapshot.whatsapp.title, "Preparar mensaje de WhatsApp");
  assert.equal(snapshot.phone.title, "Llamar");
  assert.equal(snapshot.calendar.title, "Calendar no conectado");
  assert.equal(snapshot.phone.href, "tel:5512345678");
  assert.equal(snapshot.calendar.disabled, true);
  assert.equal(snapshot.combatBrand, null);
  assert.equal(snapshot.nbaBrand, null);

  for (const action of [snapshot.whatsapp, snapshot.phone, snapshot.calendar]) {
    assert.ok(action.style.height >= 40, `${action.brand} touch height was ${action.style.height}`);
    assert.ok(action.style.iconWidth >= 16, `${action.brand} icon width was ${action.style.iconWidth}`);
  }

  assert.notEqual(snapshot.whatsapp.style.background, snapshot.phone.style.background);
  assert.notEqual(snapshot.whatsapp.style.background, snapshot.calendar.style.background);
  assert.notEqual(snapshot.phone.style.background, snapshot.calendar.style.background);
  assert.notEqual(snapshot.whatsapp.style.border, snapshot.phone.style.border);
  assert.notEqual(snapshot.phone.style.border, snapshot.calendar.style.border);

  await page.locator("[data-forge-pipeline-module]").evaluate((root, markup) => {
    root.innerHTML = markup;
  }, actionsMarkup("Jorge Palacios"));
  await page.waitForFunction(() => (
    document.querySelector('[data-pipeline-action-brand="whatsapp"]')
      ?.getAttribute("aria-label")
      ?.includes("Jorge Palacios")
    && document.querySelectorAll('[data-pipeline-action-brand="whatsapp"] [data-pipeline-action-icon]').length === 1
  ));

  assert.equal(
    await page.locator('[data-pipeline-action-brand="phone"]').getAttribute("href"),
    "tel:5512345678",
  );

  console.log("PIPELINE_ACTION_IDENTITY=PASS");
  console.log("PIPELINE_WHATSAPP_GREEN_IDENTITY=PASS");
  console.log("PIPELINE_PHONE_BLUE_IDENTITY=PASS");
  console.log("PIPELINE_CALENDAR_NEUTRAL_IDENTITY=PASS");
  console.log("PIPELINE_ACTION_ICONS=PASS");
  console.log("PIPELINE_ACTION_IDENTITY_RERENDER=PASS");
} finally {
  await context.close();
  await browser.close();
}
