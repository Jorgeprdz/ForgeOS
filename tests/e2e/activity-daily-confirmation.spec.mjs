import { expect, test } from "@playwright/test";

const READY = Object.freeze({
  state: "READY",
  generatedAt: "2026-08-07T16:00:00Z",
  timeZone: "America/Mexico_City",
  activity: {
    current: {
      report: { state: "READY", period: { from: "2026-08-07", to: "2026-08-07" }, totals: { activityCount: 4 } },
      chartReady: { missingDataState: "READY", series: [
        { seriesId: "activity-series:INITIAL_APPOINTMENT_SCHEDULED", points: [{ x: "2026-08-07", value: 2 }] },
        { seriesId: "activity-series:INITIAL_APPOINTMENT_COMPLETED", points: [{ x: "2026-08-07", value: 1 }] },
      ] },
    },
    pointFacts: { state: "READY", facts: [] },
  },
});

async function mount(page) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.setContent(`<!doctype html><html lang="es"><head>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <link rel="stylesheet" href="/docs/static-preview/forge-aura/aura-tokens.css">
    <link rel="stylesheet" href="/docs/static-preview/forge-aura/activity/activity.css">
  </head><body><main id="daily-root"></main></body></html>`);
  await page.evaluate(async fixture => {
    const { createActivityDailyConfirmation } = await import(`/docs/static-preview/forge-aura/activity/activity-daily-confirmation.js?daily=${Date.now()}`);
    const component = createActivityDailyConfirmation({ root: document.querySelector("#daily-root"), bootstrap: { async getClient() { return null; } } });
    await component.mount();
    await component.load({ result: fixture });
  }, READY);
}

test("review is secondary, observed activity is reused and unknown is not rendered as zero", async ({ page }, testInfo) => {
  await mount(page);
  await expect(page.getByText("Revisar métricas pendientes")).toBeVisible();
  await page.getByText("Revisar métricas pendientes").click();
  await expect(page.locator("[data-metric]")).toHaveCount(8);

  const scheduled = page.locator('[data-metric="citas_agendadas"]');
  await expect(scheduled).toContainText("Registrado");
  await expect(scheduled).toContainText("2 registrados");

  const policies = page.locator('[data-metric="polizas_pagadas"]');
  await expect(policies).toContainText("Sin confirmar");
  await expect(policies).toContainText("No hay evidencia suficiente para asumir cero");
  await policies.getByRole("button", { name: "Confirmar" }).click();
  await expect(policies.locator("input")).toHaveValue("");

  await page.screenshot({ path: testInfo.outputPath("ACTIVITY-REVIEW-UNKNOWN-NOT-ZERO.png"), fullPage: true });
});

test("manual reconciliation writes only the metric the advisor reviewed", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.setContent(`<!doctype html><html lang="es"><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/docs/static-preview/forge-aura/aura-tokens.css"><link rel="stylesheet" href="/docs/static-preview/forge-aura/activity/activity.css"></head><body><main id="manual-root"></main></body></html>`);

  await page.evaluate(async () => {
    const confirmations = [];
    const payloads = [];
    function queryFor(table) {
      const chain = {
        select() { return chain; }, eq() { return chain; }, gte() { return chain; }, lte() { return chain; }, order() { return chain; },
        then(resolve) {
          if (table === "activity_metric_confirmations") return Promise.resolve({ data: confirmations.map(row => ({ ...row })), error: null }).then(resolve);
          return Promise.resolve({ data: [], error: null }).then(resolve);
        },
      };
      return chain;
    }
    const client = {
      from(table) { return queryFor(table); },
      async rpc(name, { p_payload: payload }) {
        if (name !== "forge_activity_confirm_daily_metrics") return { data: null, error: new Error("UNEXPECTED_RPC") };
        payloads.push(structuredClone(payload));
        const metric = payload.metrics[0];
        confirmations.push({
          id: `confirmation-${confirmations.length + 1}`,
          metric_key: metric.metricKey,
          suggested_value: metric.suggestedValue,
          confirmed_value: metric.confirmedValue,
          suggestion_sources: [...(metric.suggestionSources || [])],
          confirmation_kind: "CONFIRMED",
          confirmed_at: `2026-08-07T16:${String(confirmations.length).padStart(2, "0")}:00Z`,
          correction_of: metric.correctionOf,
        });
        return { data: { state: "RECORDED", metricCount: 1 }, error: null };
      },
    };
    const { createActivityDailyConfirmation } = await import(`/docs/static-preview/forge-aura/activity/activity-daily-confirmation.js?manual=${Date.now()}`);
    const component = createActivityDailyConfirmation({ root: document.querySelector("#manual-root"), bootstrap: { async getClient() { return client; } } });
    await component.mount();
    await component.load({ result: { generatedAt: "2026-08-07T16:00:00Z", timeZone: "America/Mexico_City", activity: { current: { chartReady: { series: [] } } } } });
    window.__payloads = payloads;
  });

  await page.getByText("Revisar métricas pendientes").click();
  const calls = page.locator('[data-metric="llamadas"]');
  await calls.getByRole("button", { name: "Confirmar" }).click();
  await calls.locator("input").fill("3");
  await calls.getByRole("button", { name: "Guardar" }).click();
  await expect(calls).toContainText("3 confirmados");

  const payloads = await page.evaluate(() => window.__payloads);
  expect(payloads).toHaveLength(1);
  expect(payloads[0].metrics).toHaveLength(1);
  expect(payloads[0].metrics[0].metricKey).toBe("llamadas");
  expect(payloads[0].metrics[0].confirmedValue).toBe(3);
  expect(payloads[0].metrics.some(metric => metric.metricKey === "polizas_pagadas")).toBe(false);
});
