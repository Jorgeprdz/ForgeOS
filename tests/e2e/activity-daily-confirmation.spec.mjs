import { expect, test } from "@playwright/test";

const READY = Object.freeze({
  state: "READY",
  generatedAt: "2026-08-07T16:00:00Z",
  timeZone: "America/Mexico_City",
  activity: {
    current: {
      report: { state: "READY", period: { from: "2026-08-07", to: "2026-08-07" }, totals: { activityCount: 8 } },
      chartReady: { missingDataState: "READY", series: [
        { seriesId: "activity-series:CONVERSATION_COMPLETED", points: [{ x: "2026-08-07", value: 4 }] },
        { seriesId: "activity-series:INITIAL_APPOINTMENT_SCHEDULED", points: [{ x: "2026-08-07", value: 2 }] },
        { seriesId: "activity-series:INITIAL_APPOINTMENT_COMPLETED", points: [{ x: "2026-08-07", value: 1 }] },
        { seriesId: "activity-series:CLOSING_APPOINTMENT_COMPLETED", points: [{ x: "2026-08-07", value: 1 }] },
      ] },
    },
    comparison: { delta: 0, deltaPercent: null, zeroComparisonBlocked: true },
  },
  production: { sold: 0, target: null },
  forecast: null,
  sources: [
    { sourceId: "FES_REP_ACTIVITY", state: "READY" },
    { sourceId: "MONTHLY_GOAL_AND_CONFIRMED_POLICIES", state: "READY" },
    { sourceId: "ADVISOR_FORECAST_ISSUED_SNAPSHOT", state: "READY" },
  ],
});

async function mount(page, viewport = { width: 390, height: 844 }) {
  await page.setViewportSize(viewport);
  await page.goto("/");
  await page.setContent(`<!doctype html><html lang="es"><head>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <link rel="stylesheet" href="/docs/static-preview/forge-aura/aura-tokens.css">
    <link rel="stylesheet" href="/docs/static-preview/forge-aura/activity/activity.css">
  </head><body><main id="activity-root"></main></body></html>`);
  await page.evaluate(async fixture => {
    const { createActivityModule } = await import(`/docs/static-preview/forge-aura/activity/activity-module.js?daily=${Date.now()}`);
    const module = createActivityModule({
      root: document.querySelector("#activity-root"),
      globalState: () => {},
      reportingFactory: () => ({ load: async () => structuredClone(fixture), scrub: async () => ({ state: "SCRUBBED" }) }),
    });
    await module.mount();
    window.__activityModule = module;
  }, READY);
}

test("daily confirmation uses precise minus-number-plus controls and keeps zero pending", async ({ page }, testInfo) => {
  await mount(page);
  await expect(page.getByRole("heading", { name: "¿Qué hiciste hoy?" })).toBeVisible();
  await expect(page.locator("[data-metric]")).toHaveCount(8);
  const calls = page.locator('[data-metric="llamadas"]');
  await expect(calls.locator("input")).toHaveValue("4");
  await expect(calls).toContainText("Sugerido por Forge: 4");
  await calls.getByRole("button", { name: /Sumar uno/ }).click();
  await expect(calls.locator("input")).toHaveValue("5");
  await expect(calls).toContainText("Modificado");
  const referrals = page.locator('[data-metric="referidos"]');
  await expect(referrals.locator("input")).toHaveValue("0");
  await expect(referrals).toContainText("Sin sugerencia · confirma manualmente");
  await expect(page.getByText("Un cero no cuenta como confirmado hasta que guardes.")).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("ACTIVITY-DAILY-CONFIRMATION-MOBILE.png"), fullPage: true });
});
