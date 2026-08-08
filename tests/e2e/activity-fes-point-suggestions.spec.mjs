import { expect, test } from "@playwright/test";

test("confirmed Activity facts are reused as registered metrics instead of asking for a second confirmation", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.setContent(`<!doctype html><html lang="es"><head>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <link rel="stylesheet" href="/docs/static-preview/forge-aura/aura-tokens.css">
    <link rel="stylesheet" href="/docs/static-preview/forge-aura/activity/activity.css">
  </head><body><main id="reconciliation-root"></main></body></html>`);

  await page.evaluate(async () => {
    const { createActivityDailyConfirmation } = await import(`/docs/static-preview/forge-aura/activity/activity-daily-confirmation.js?fes=${Date.now()}`);
    const component = createActivityDailyConfirmation({
      root: document.querySelector("#reconciliation-root"),
      bootstrap: { async getClient() { return null; } },
    });
    await component.mount();
    await component.load({ result: {
      generatedAt: "2026-08-07T18:00:00.000Z",
      timeZone: "America/Mexico_City",
      activity: {
        current: { report: { state: "READY" }, chartReady: { series: [] } },
        pointFacts: { state: "READY", facts: [
          { eventType: "REFERRAL_RECEIVED", eventReference: "evt_ref_1", occurredAt: "2026-08-07T14:00:00.000Z" },
          { eventType: "CALL_COMPLETED", eventReference: "evt_call_1", occurredAt: "2026-08-07T15:00:00.000Z" },
          { eventType: "CALL_COMPLETED", eventReference: "evt_call_2", occurredAt: "2026-08-07T16:00:00.000Z" },
          { eventType: "ADVISOR_REFERRAL_RECEIVED", eventReference: "evt_advisor_1", occurredAt: "2026-08-07T17:00:00.000Z" },
        ] },
      },
    } });
    window.__pointInput = component.pointInput();
  });

  await page.getByText("Revisar métricas pendientes").click();
  const referrals = page.locator('[data-metric="referidos"]');
  const calls = page.locator('[data-metric="llamadas"]');
  const advisor = page.locator('[data-metric="referido_asesor"]');
  await expect(referrals).toContainText("Registrado");
  await expect(referrals).toContainText("1 registrado");
  await expect(calls).toContainText("2 registrados");
  await expect(advisor).toContainText("1 registrado");
  await expect(page.locator('[data-metric="polizas_pagadas"]')).toContainText("Sin confirmar");

  const pointInput = await page.evaluate(() => window.__pointInput);
  expect(pointInput.counts.referidos.evidenceState).toBe("OBSERVED");
  expect(pointInput.counts.llamadas.value).toBe(2);
  expect(pointInput.counts.polizas_pagadas).toBeUndefined();

  await calls.getByRole("button", { name: "Corregir" }).click();
  await expect(calls.locator("input")).toHaveValue("2");
  await page.screenshot({ path: testInfo.outputPath("ACTIVITY-REUSE-CONFIRMED-FACTS-MOBILE.png"), fullPage: true });
});
