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
  await expect(calls.locator("input")).toHaveValue("0");
  await expect(calls).toContainText("Sin sugerencia · confirma manualmente");

  const scheduled = page.locator('[data-metric="citas_agendadas"]');
  await expect(scheduled.locator("input")).toHaveValue("2");
  await expect(scheduled).toContainText("Sugerido por Forge: 2");
  await scheduled.getByRole("button", { name: /Sumar uno/ }).click();
  await expect(scheduled.locator("input")).toHaveValue("3");
  await expect(scheduled).toContainText("Modificado");

  const referrals = page.locator('[data-metric="referidos"]');
  await expect(referrals.locator("input")).toHaveValue("0");
  await expect(referrals).toContainText("Sin sugerencia · confirma manualmente");
  await expect(page.getByText("Un cero no cuenta como confirmado hasta que guardes.")).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("ACTIVITY-DAILY-CONFIRMATION-MOBILE.png"), fullPage: true });
});

test("manual-only mode reaches official 25 points without Gmail or Outlook", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.setContent(`<!doctype html><html lang="es"><head>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <link rel="stylesheet" href="/docs/static-preview/forge-aura/aura-tokens.css">
  </head><body><main id="manual-only-root"></main></body></html>`);

  await page.evaluate(async () => {
    const confirmations = [];
    const emptyResult = { data: [], error: null };

    function queryFor(table) {
      const chain = {
        select() { return chain; },
        eq() { return chain; },
        gte() { return chain; },
        lte() { return chain; },
        order() { return chain; },
        then(resolve) {
          if (table === "activity_metric_confirmations") {
            return Promise.resolve({ data: confirmations.map(row => ({ ...row })), error: null }).then(resolve);
          }
          return Promise.resolve(emptyResult).then(resolve);
        },
      };
      return chain;
    }

    const client = {
      from(table) { return queryFor(table); },
      async rpc(name, { p_payload: payload }) {
        if (name !== "forge_activity_confirm_daily_metrics") return { data: null, error: new Error("UNEXPECTED_RPC") };
        confirmations.length = 0;
        for (const [index, metric] of payload.metrics.entries()) {
          confirmations.push({
            id: `00000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
            metric_key: metric.metricKey,
            suggested_value: metric.suggestedValue,
            confirmed_value: metric.confirmedValue,
            suggestion_sources: [...(metric.suggestionSources || [])],
            confirmation_kind: "CONFIRMED",
            confirmed_at: `2026-08-07T16:0${index}:00Z`,
            correction_of: null,
          });
        }
        window.__manualOnlyPayload = structuredClone(payload);
        return { data: { state: "RECORDED", metricCount: 8 }, error: null };
      },
    };

    const bootstrap = { async getClient() { return client; } };
    const { createActivityDailyConfirmation } = await import(`/docs/static-preview/forge-aura/activity/activity-daily-confirmation.js?manualOnly=${Date.now()}`);
    const component = createActivityDailyConfirmation({
      root: document.querySelector("#manual-only-root"),
      bootstrap,
      onConfirmed: input => { window.__manualOnlyPointInput = input; },
    });
    await component.mount();
    await component.load({
      result: {
        generatedAt: "2026-08-07T16:00:00Z",
        timeZone: "America/Mexico_City",
        activity: { current: { chartReady: { series: [] } } },
      },
    });
    window.__manualOnlyComponent = component;
  });

  await expect(page.locator("[data-metric]")).toHaveCount(8);
  await expect(page.locator('[data-metric="referidos"]')).toContainText("Sin sugerencia · confirma manualmente");
  await expect(page.locator('[data-metric="llamadas"]')).toContainText("Sin sugerencia · confirma manualmente");
  await expect(page.locator('[data-metric="polizas_pagadas"]')).toContainText("Sin sugerencia · confirma manualmente");
  await expect(page.locator('[data-metric="referido_asesor"]')).toContainText("Sin sugerencia · confirma manualmente");

  const values = {
    referidos: 0,
    llamadas: 5,
    citas_agendadas: 0,
    citas_iniciales: 0,
    citas_cierre: 0,
    solicitudes_firmadas: 2,
    polizas_pagadas: 1,
    referido_asesor: 0,
  };
  for (const [metric, value] of Object.entries(values)) {
    await page.locator(`[data-metric="${metric}"] input`).fill(String(value));
  }

  await page.getByRole("button", { name: "Confirmar actividad de hoy" }).click();
  await expect(page.getByText("Actividad confirmada. Los puntos usan estos valores, no la sugerencia.")).toBeVisible();
  await expect(page.locator("[data-day-state]")).toHaveText("Confirmado");

  const acceptance = await page.evaluate(async () => {
    const payload = window.__manualOnlyPayload;
    const pointInput = window.__manualOnlyPointInput;
    const { projectOfficialActivityPoints } = await import(`/docs/static-preview/forge-aura/activity/activity-points-projection.js?manualOnly=${Date.now()}`);
    return {
      payloadMetricCount: payload?.metrics?.length || 0,
      allConfirmed: Object.keys(pointInput?.counts || {}).length,
      scheduledRefs: pointInput?.counts?.citas_agendadas?.sourceRefs || [],
      points: projectOfficialActivityPoints({ activityPointsInput: pointInput }),
    };
  });

  expect(acceptance.payloadMetricCount).toBe(8);
  expect(acceptance.allConfirmed).toBe(8);
  expect(acceptance.scheduledRefs.some(ref => ref.startsWith("activity-confirmation:"))).toBe(true);
  expect(acceptance.scheduledRefs).toContain("rep:2026-08-07:APPOINTMENT_SCHEDULED");
  expect(acceptance.points.state).toBe("READY");
  expect(acceptance.points.total).toBe(25);
  expect(acceptance.points.objective).toBe(25);
  expect(acceptance.points.remaining).toBe(0);
});

test("connected Gmail can be disconnected from Activity without affecting manual capture", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.setContent(`<!doctype html><html lang="es"><head>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <link rel="stylesheet" href="/docs/static-preview/forge-aura/aura-tokens.css">
  </head><body><main id="mail-root"></main><section id="manual-fallback">La captura manual sigue disponible</section></body></html>`);

  await page.evaluate(async () => {
    const calls = [];
    let connected = true;
    const client = {
      functions: {
        async invoke(name, { body }) {
          calls.push({ name, body: structuredClone(body) });
          if (body.action === "STATUS") {
            return { data: { ok: true, connections: connected ? [{ provider: "GMAIL" }] : [] }, error: null };
          }
          if (body.action === "DISCONNECT" && body.provider === "GMAIL") {
            connected = false;
            return { data: { ok: true, provider: "GMAIL", disconnected: true }, error: null };
          }
          return { data: { ok: false, code: "UNEXPECTED_ACTION" }, error: null };
        },
      },
    };
    const bootstrap = { async getClient() { return client; } };
    const { createActivityMailConnection } = await import(`/docs/static-preview/forge-aura/activity/activity-mail-connection.js?disconnect=${Date.now()}`);
    const component = createActivityMailConnection({ root: document.querySelector("#mail-root"), bootstrap });
    await component.mount();
    window.__mailCalls = calls;
  });

  const gmail = page.getByRole("button", { name: "Desconectar Gmail" });
  await expect(gmail).toBeVisible();
  await expect(gmail).toHaveAttribute("aria-pressed", "true");
  await gmail.click();
  await expect(page.getByRole("button", { name: "Conectar Gmail" })).toBeVisible();
  await expect(page.getByText(/Gmail desconectado/)).toBeVisible();
  await expect(page.getByText("La captura manual sigue disponible")).toBeVisible();

  const calls = await page.evaluate(() => window.__mailCalls);
  expect(calls.some(call => call.body?.action === "DISCONNECT" && call.body?.provider === "GMAIL")).toBe(true);
});
