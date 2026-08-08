import { expect, test } from "@playwright/test";

const metric = (value, sourceRef) => ({
  value,
  completeness: "COMPLETE",
  evidenceState: "CONFIRMED",
  metricOwner: "PRODUCTIVITY",
  sourceRefs: [sourceRef],
});

const READY = Object.freeze({
  state: "READY",
  generatedAt: "2026-08-07T18:00:00.000Z",
  timeZone: "America/Mexico_City",
  period: { current: { from: "2026-08-07", to: "2026-08-07" } },
  activity: {
    current: {
      report: { state: "READY", period: { from: "2026-08-07", to: "2026-08-07" }, totals: { activityCount: 8 } },
      chartReady: { missingDataState: "READY", series: [
        { seriesId: "activity-series:INITIAL_APPOINTMENT_SCHEDULED", points: [{ x: "2026-08-07", value: 1 }] },
        { seriesId: "activity-series:INITIAL_APPOINTMENT_COMPLETED", points: [{ x: "2026-08-07", value: 1 }] },
      ] },
    },
    pointFacts: { state: "READY", facts: [
      { eventType: "REFERRAL_RECEIVED", eventReference: "evt-ref", occurredAt: "2026-08-07T18:15:00.000Z", sourceReference: "source-ref" },
      { eventType: "CALL_COMPLETED", eventReference: "evt-call", occurredAt: "2026-08-07T19:20:00.000Z", sourceReference: "source-call" },
    ] },
    comparison: { delta: 3, deltaPercent: 60, zeroComparisonBlocked: false },
  },
  activityPointsInput: {
    counts: {
      referidos: metric(1, "evidence:referidos"),
      llamadas: metric(2, "evidence:llamadas"),
      citas_agendadas: metric(1, "evidence:citas-agendadas"),
      citas_iniciales: metric(1, "evidence:citas-iniciales"),
      citas_cierre: metric(0, "evidence:citas-cierre"),
      solicitudes_firmadas: metric(2, "evidence:solicitudes"),
      polizas_pagadas: metric(0, "evidence:polizas"),
      referido_asesor: metric(0, "evidence:referido-asesor"),
    },
    period: { from: "2026-08-07", to: "2026-08-07" },
    timezone: "America/Mexico_City",
  },
  production: { sold: 3, target: 5 },
  forecast: null,
  sources: [
    { sourceId: "FES_REP_ACTIVITY", state: "READY" },
    { sourceId: "MONTHLY_GOAL_AND_CONFIRMED_POLICIES", state: "READY" },
    { sourceId: "ADVISOR_FORECAST_ISSUED_SNAPSHOT", state: "READY" },
  ],
});

async function mount(page, viewport) {
  await page.setViewportSize(viewport);
  await page.goto("/");
  await page.setContent(`<!doctype html><html lang="es"><head>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <link rel="stylesheet" href="/docs/static-preview/forge-aura/aura-tokens.css">
    <link rel="stylesheet" href="/docs/static-preview/forge-aura/activity/activity.css">
  </head><body><main id="activity-root"></main></body></html>`);
  await page.evaluate(async fixture => {
    const { createActivityModule } = await import(`/docs/static-preview/forge-aura/activity/activity-module.js?acceptance=${Date.now()}`);
    const module = createActivityModule({
      root: document.querySelector("#activity-root"),
      globalState: () => {},
      reportingFactory: () => ({ load: async () => structuredClone(fixture), scrub: async () => ({ state: "SCRUBBED" }) }),
    });
    await module.mount();
    window.__activityModule = module;
  }, READY);
}

async function assertNoOverflow(page) {
  const dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
}

test("desktop Activity opens as a daily productivity cockpit", async ({ page }, testInfo) => {
  await mount(page, { width: 1440, height: 900 });
  await expect(page.getByRole("heading", { name: "Tu día comercial, en una sola vista" })).toBeVisible();
  await expect(page.getByRole("button", { name: "+ Registrar actividad" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Puntos de actividad" })).toBeVisible();
  await expect(page.locator("[data-today-points]")).toHaveText("20 / 25");
  await expect(page.getByText("Te faltan 5 puntos")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Lo que ya hiciste" })).toBeVisible();
  await expect(page.getByText("Referido recibido")).toBeVisible();
  await expect(page.getByText("Llamada completada")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Opciones para avanzar" })).toBeVisible();
  await assertNoOverflow(page);
  await page.screenshot({ path: testInfo.outputPath("ACTIVITY-25PT-DESKTOP-1440x900.png"), fullPage: true });
});

test("Reports stays secondary and preserves analytics plus official rule disclosure", async ({ page }, testInfo) => {
  await mount(page, { width: 1440, height: 900 });
  await page.getByRole("tab", { name: "Reportes" }).click();
  await expect(page.getByText("Vs. periodo anterior")).toBeVisible();
  await expect(page.getByText("Meta mensual")).toBeVisible();
  await page.getByText("Ver baremo oficial").click();
  await expect(page.locator("[data-points-rules] b")).toHaveCount(8);
  await expect(page.getByRole("heading", { name: "Actividad confirmada" })).toBeVisible();
  await assertNoOverflow(page);
  await page.screenshot({ path: testInfo.outputPath("ACTIVITY-REPORTS-DESKTOP-1440x900.png"), fullPage: true });
});

for (const viewport of [
  { name: "MOBILE", width: 390, height: 844 },
  { name: "TABLET", width: 1280, height: 800 },
  { name: "DEX", width: 1920, height: 1080 },
]) {
  test(`${viewport.name} keeps cockpit hierarchy and no horizontal overflow`, async ({ page }, testInfo) => {
    await mount(page, viewport);
    await expect(page.getByRole("heading", { name: "Puntos de actividad" })).toBeVisible();
    await expect(page.getByRole("button", { name: "+ Registrar actividad" })).toBeVisible();
    await expect(page.getByText("Revisar métricas pendientes")).toBeVisible();
    await assertNoOverflow(page);
    await page.screenshot({ path: testInfo.outputPath(`ACTIVITY-25PT-${viewport.name}-${viewport.width}x${viewport.height}.png`), fullPage: true });
  });
}

test("keyboard tabs, 200% zoom and reduced motion remain usable", async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await mount(page, { width: 834, height: 1194 });
  const activityTab = page.getByRole("tab", { name: "Actividad" });
  await activityTab.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Reportes" })).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(activityTab).toBeFocused();
  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
  await expect(page.getByRole("heading", { name: "Puntos de actividad" })).toBeVisible();
  await expect(page.getByRole("button", { name: "+ Registrar actividad" })).toBeVisible();
  await assertNoOverflow(page);
  await page.screenshot({ path: testInfo.outputPath("ACTIVITY-25PT-ZOOM-200-REDUCED-MOTION.png"), fullPage: true });
});
