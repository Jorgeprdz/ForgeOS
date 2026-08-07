import { expect, test } from "@playwright/test";

const READY = Object.freeze({
  state: "READY",
  activity: {
    current: {
      report: {
        state: "READY",
        period: { from: "2026-08-03", to: "2026-08-07" },
        totals: { activityCount: 18 },
      },
      chartReady: {
        missingDataState: "READY",
        series: [
          { seriesId: "activity-series:CONTACT_ATTEMPTED", points: [
            { x: "2026-08-03", value: 4 },
            { x: "2026-08-04", value: 3 },
            { x: "2026-08-05", value: 2 },
          ] },
          { seriesId: "activity-series:INITIAL_APPOINTMENT_COMPLETED", points: [
            { x: "2026-08-04", value: 2 },
            { x: "2026-08-06", value: 3 },
          ] },
          { seriesId: "activity-series:FOLLOW_UP_COMPLETED", points: [
            { x: "2026-08-05", value: 1 },
            { x: "2026-08-07", value: 3 },
          ] },
        ],
      },
    },
    comparison: { delta: 5, deltaPercent: 38.5, zeroComparisonBlocked: false },
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

  await page.evaluate(async (fixture) => {
    const { createActivityModule } = await import(
      `/docs/static-preview/forge-aura/activity/activity-module.js?acceptance=${Date.now()}`
    );
    const reportingFactory = () => ({
      load: async () => structuredClone(fixture),
      scrub: async () => ({ state: "SCRUBBED" }),
    });
    const module = createActivityModule({
      root: document.querySelector("#activity-root"),
      globalState: () => {},
      reportingFactory,
    });
    await module.mount();
    window.__activityModule = module;
  }, READY);
}

async function assertNoOverflow(page) {
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
}

test("desktop Activity hierarchy and capture surface", async ({ page }, testInfo) => {
  await mount(page, { width: 1440, height: 900 });
  await expect(page.getByRole("heading", { name: "Tu operación comercial, en contexto" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Registrar actividad" }).first()).toBeVisible();
  await expect(page.getByRole("tab", { name: "Actividad" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByText("Actividad del periodo")).toBeVisible();
  await assertNoOverflow(page);
  await page.screenshot({ path: testInfo.outputPath("ACTIVITY-DESKTOP-1440x900.png"), fullPage: true });
});

test("desktop Reports exposes comparison, goal and accessible table", async ({ page }, testInfo) => {
  await mount(page, { width: 1440, height: 900 });
  await page.getByRole("tab", { name: "Reportes" }).click();
  await expect(page.getByText("Vs. periodo anterior")).toBeVisible();
  await expect(page.getByText("Meta mensual")).toBeVisible();
  await expect(page.getByText("Actividad confirmada")).toBeVisible();
  await page.getByText("Ver tabla accesible").click();
  await expect(page.getByRole("table")).toBeVisible();
  await assertNoOverflow(page);
  await page.screenshot({ path: testInfo.outputPath("REPORTS-DESKTOP-1440x900.png"), fullPage: true });
});

for (const viewport of [
  { name: "TABLET", width: 834, height: 1194 },
  { name: "MOBILE", width: 390, height: 844 },
]) {
  test(`${viewport.name} responsive Reports acceptance`, async ({ page }, testInfo) => {
    await mount(page, viewport);
    await page.getByRole("tab", { name: "Reportes" }).click();
    await expect(page.getByText("Pólizas confirmadas del mes")).toBeVisible();
    await expect(page.locator("[data-chart-card]")).toBeVisible();
    await assertNoOverflow(page);
    await page.screenshot({
      path: testInfo.outputPath(`REPORTS-${viewport.name}-${viewport.width}x${viewport.height}.png`),
      fullPage: true,
    });
  });
}

test("keyboard tabs, zoom 200 and reduced motion stay usable", async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await mount(page, { width: 834, height: 1194 });
  const activityTab = page.getByRole("tab", { name: "Actividad" });
  await activityTab.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Reportes" })).toBeFocused();
  await expect(page.getByRole("tab", { name: "Reportes" })).toHaveAttribute("aria-selected", "true");
  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
  await expect(page.getByText("Meta mensual")).toBeVisible();
  await assertNoOverflow(page);
  await page.screenshot({ path: testInfo.outputPath("REPORTS-ZOOM-200-REDUCED-MOTION.png"), fullPage: true });
});
