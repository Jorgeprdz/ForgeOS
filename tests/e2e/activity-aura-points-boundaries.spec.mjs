import { expect, test } from "@playwright/test";

const metric = (value, key) => ({
  value,
  completeness: "COMPLETE",
  evidenceState: "CONFIRMED",
  metricOwner: "PRODUCTIVITY",
  sourceRefs: [`acceptance:${key}`],
});

const ALL_KEYS = [
  "referidos",
  "llamadas",
  "citas_agendadas",
  "citas_iniciales",
  "citas_cierre",
  "solicitudes_firmadas",
  "polizas_pagadas",
  "referido_asesor",
];

function fixture(values = null) {
  const base = {
    state: "READY",
    generatedAt: "2026-08-07T18:00:00.000Z",
    timeZone: "America/Mexico_City",
    period: { current: { from: "2026-08-07", to: "2026-08-07" } },
    activity: {
      current: {
        report: { state: "EMPTY", period: { from: "2026-08-07", to: "2026-08-07" }, totals: { activityCount: 0 } },
        chartReady: { missingDataState: "NO_MATCHING_FACTS", series: [] },
      },
      pointFacts: { state: "READY", facts: [] },
      comparison: { delta: 0, deltaPercent: null, zeroComparisonBlocked: true },
    },
    production: { sold: 0, target: null },
    forecast: null,
    sources: [{ sourceId: "FES_REP_ACTIVITY", state: "READY" }],
  };
  if (values === null) {
    base.activityPointsInput = { counts: { llamadas: metric(2, "llamadas") }, period: base.period.current, timezone: base.timeZone };
  } else {
    base.activityPointsInput = {
      counts: Object.fromEntries(ALL_KEYS.map(key => [key, metric(values[key] || 0, key)])),
      period: base.period.current,
      timezone: base.timeZone,
    };
  }
  return base;
}

async function mount(page, data) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.setContent(`<!doctype html><html lang="es"><head>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <link rel="stylesheet" href="/docs/static-preview/forge-aura/aura-tokens.css">
    <link rel="stylesheet" href="/docs/static-preview/forge-aura/activity/activity.css">
  </head><body><main id="activity-root"></main></body></html>`);
  await page.evaluate(async input => {
    const { createActivityModule } = await import(`/docs/static-preview/forge-aura/activity/activity-module.js?boundaries=${Date.now()}`);
    const module = createActivityModule({
      root: document.querySelector("#activity-root"),
      globalState: () => {},
      reportingFactory: () => ({ load: async () => structuredClone(input), scrub: async () => ({ state: "SCRUBBED" }) }),
    });
    await module.mount();
  }, data);
}

test("unknown metrics do not become a false 0 / 25", async ({ page }, testInfo) => {
  await mount(page, fixture(null));
  await expect(page.locator("[data-today-points]")).toHaveText("Progreso pendiente");
  await expect(page.getByText("Lo desconocido no se convierte en cero.")).toBeVisible();
  await expect(page.getByText("0 / 25")).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath("ACTIVITY-POINTS-UNKNOWN.png"), fullPage: true });
});

test("exact 25 shows daily objective completed without ranking language", async ({ page }, testInfo) => {
  await mount(page, fixture({ llamadas: 5, solicitudes_firmadas: 2, polizas_pagadas: 1 }));
  await expect(page.locator("[data-today-points]")).toHaveText("25 / 25");
  await expect(page.getByText("Objetivo diario completado").first()).toBeVisible();
  await expect(page.getByText(/élite|legendario|ranking|mal asesor/i)).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath("ACTIVITY-POINTS-EXACT-25.png"), fullPage: true });
});

test("over-goal preserves 32 / 25 instead of truncating the observable total", async ({ page }, testInfo) => {
  await mount(page, fixture({
    referidos: 2,
    llamadas: 1,
    citas_agendadas: 1,
    citas_iniciales: 1,
    solicitudes_firmadas: 2,
    polizas_pagadas: 1,
  }));
  await expect(page.locator("[data-today-points]")).toHaveText("32 / 25");
  await expect(page.getByText("Llevas 7 puntos por encima del objetivo; el total real se conserva sin truncarlo.")).toBeVisible();
  await expect(page.getByText(/élite|legendario|ranking/i)).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath("ACTIVITY-POINTS-OVER-32.png"), fullPage: true });
});
