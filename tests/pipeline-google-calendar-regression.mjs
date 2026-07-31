import assert from "node:assert/strict";
import { chromium } from "@playwright/test";

const baseUrl = process.env.FORGE_PIPELINE_BASE_URL
  || "http://127.0.0.1:4173/docs/static-preview/forge-alive-material3/";
const calendarModuleUrl = new URL(
  `pipeline-google-calendar.js?v=calendar-regression-${Date.now()}`,
  baseUrl,
).href;

const cardMarkup = name => `
  <article class="pipeline-module__prospect pipeline-module__productive-card"
    data-productive-prospect-card="prospect-1"
    data-productive-stage="contacted">
    <header class="pipeline-module__productive-identity" data-productive-card-identity>
      <strong>${name}</strong>
      <span class="pipeline-module__productive-stage" data-productive-stage-label>Contactado</span>
    </header>
    <div class="pipeline-module__productive-meta">
      <span>Fuente</span>
      <p data-productive-source-label>Referido por Mariana</p>
    </div>
    <div class="pipeline-module__productive-status">
      <p data-timeline-activity><span>Última actividad</span><strong>Llamada realizada</strong></p>
    </div>
    <div class="pipeline-module__card-actions" data-productive-card-actions>
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
  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await page.setContent(`<!doctype html>
    <html>
      <head></head>
      <body><main data-forge-pipeline-module>${cardMarkup("Ana López")}</main></body>
    </html>`);
  await page.addScriptTag({ type: "module", url: calendarModuleUrl });
  await page.waitForFunction(() => (
    document.documentElement.dataset.pipelineGoogleCalendar === "ready"
    && document.querySelector("[data-pipeline-google-calendar-styles]")
  ));

  const action = page.locator(".pipeline-module__action--calendar");
  await assert.doesNotReject(() => action.click());
  assert.equal(await action.isDisabled(), false);
  assert.equal(await action.getAttribute("title"), "Agendar en Google Calendar");
  assert.match(
    await action.getAttribute("aria-label"),
    /Google Calendar para Ana López/,
  );
  assert.equal(await action.getAttribute("data-pipeline-calendar-state"), "draft-only");

  const layer = page.locator("[data-pipeline-calendar-layer]");
  await layer.waitFor({ state: "visible" });
  assert.equal(
    await page.locator("[data-pipeline-calendar-timezone]").inputValue(),
    "America/Mexico_City",
  );
  assert.match(
    await page.locator(".pipeline-calendar__boundary").textContent(),
    /no confirma que el evento fue guardado/i,
  );

  await page.locator("[data-pipeline-calendar-date]").fill("2026-08-04");
  await page.locator("[data-pipeline-calendar-time]").fill("10:30");
  await page.locator("[data-pipeline-calendar-duration]").selectOption("45");

  const openCalendar = page.locator("[data-open-pipeline-google-calendar]");
  await page.waitForFunction(() => (
    document.querySelector("[data-open-pipeline-google-calendar]")
      ?.getAttribute("aria-disabled") !== "true"
  ));
  const href = await openCalendar.getAttribute("href");
  const url = new URL(href);

  assert.equal(url.origin, "https://calendar.google.com");
  assert.equal(url.pathname, "/calendar/render");
  assert.equal(url.searchParams.get("action"), "TEMPLATE");
  assert.equal(url.searchParams.get("text"), "Cita con Ana López");
  assert.equal(
    url.searchParams.get("dates"),
    "20260804T103000/20260804T111500",
  );
  assert.equal(url.searchParams.get("ctz"), "America/Mexico_City");
  assert.match(url.searchParams.get("details"), /Prospecto: Ana López/);
  assert.match(url.searchParams.get("details"), /Etapa: Contactado/);
  assert.match(url.searchParams.get("details"), /Fuente: Referido por Mariana/);
  assert.match(url.searchParams.get("details"), /Última actividad: Llamada realizada/);
  assert.equal(await openCalendar.getAttribute("target"), "_blank");
  assert.match(await openCalendar.getAttribute("rel"), /noopener/);

  await page.locator(".pipeline-calendar__footer [data-close-pipeline-calendar]").click();
  await layer.waitFor({ state: "detached" });
  await page.waitForFunction(() => document.activeElement?.classList.contains("pipeline-module__action--calendar"));

  await page.locator("[data-forge-pipeline-module]").evaluate((root, markup) => {
    root.innerHTML = markup;
  }, cardMarkup("Jorge Palacios"));
  await page.waitForFunction(() => (
    document.querySelector(".pipeline-module__action--calendar")?.disabled === false
    && document.querySelector(".pipeline-module__action--calendar")
      ?.getAttribute("aria-label")
      ?.includes("Jorge Palacios")
  ));

  console.log("PIPELINE_GOOGLE_CALENDAR_BUTTON=PASS");
  console.log("PIPELINE_GOOGLE_CALENDAR_WORKSPACE=PASS");
  console.log("PIPELINE_GOOGLE_CALENDAR_URL=PASS");
  console.log("PIPELINE_GOOGLE_CALENDAR_TIMEZONE=PASS");
  console.log("PIPELINE_GOOGLE_CALENDAR_BOUNDARY=PASS");
  console.log("PIPELINE_GOOGLE_CALENDAR_RERENDER=PASS");
} finally {
  await context.close();
  await browser.close();
}
