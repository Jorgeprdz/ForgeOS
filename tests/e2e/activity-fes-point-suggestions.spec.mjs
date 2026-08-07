import { expect, test } from "@playwright/test";

test("canonical FES referral/call/advisor facts render as editable Forge suggestions", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.setContent(`<!doctype html><html lang="es"><head>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <link rel="stylesheet" href="/docs/static-preview/forge-aura/aura-tokens.css">
  </head><body><main id="fes-suggestions-root"></main></body></html>`);

  await page.evaluate(async () => {
    const { createActivityDailyConfirmation } = await import(`/docs/static-preview/forge-aura/activity/activity-daily-confirmation.js?fes=${Date.now()}`);
    const component = createActivityDailyConfirmation({
      root: document.querySelector("#fes-suggestions-root"),
      bootstrap: { async getClient() { return null; } },
    });
    await component.mount();
    await component.load({
      result: {
        generatedAt: "2026-08-07T18:00:00.000Z",
        timeZone: "America/Mexico_City",
        activity: {
          current: { chartReady: { series: [] } },
          pointFacts: {
            state: "READY",
            facts: [
              { eventType: "REFERRAL_RECEIVED", eventReference: "evt_ref_1", occurredAt: "2026-08-07T14:00:00.000Z", sourceReference: null },
              { eventType: "CALL_COMPLETED", eventReference: "evt_call_1", occurredAt: "2026-08-07T15:00:00.000Z", sourceReference: null },
              { eventType: "CALL_COMPLETED", eventReference: "evt_call_2", occurredAt: "2026-08-07T16:00:00.000Z", sourceReference: null },
              { eventType: "ADVISOR_REFERRAL_RECEIVED", eventReference: "evt_advisor_1", occurredAt: "2026-08-07T17:00:00.000Z", sourceReference: null },
            ],
          },
        },
      },
    });
  });

  const referrals = page.locator('[data-metric="referidos"]');
  const calls = page.locator('[data-metric="llamadas"]');
  const advisorReferrals = page.locator('[data-metric="referido_asesor"]');

  await expect(referrals).toContainText("Sugerido por Forge: 1");
  await expect(referrals.locator("input")).toHaveValue("1");
  await expect(calls).toContainText("Sugerido por Forge: 2");
  await expect(calls.locator("input")).toHaveValue("2");
  await expect(advisorReferrals).toContainText("Sugerido por Forge: 1");
  await expect(advisorReferrals.locator("input")).toHaveValue("1");

  await calls.getByRole("button", { name: "Sumar uno a Llamadas" }).click();
  await expect(calls.locator("input")).toHaveValue("3");
  await expect(calls).toContainText("Modificado");
  await expect(calls).toContainText("Sugerido por Forge: 2");

  await page.screenshot({ path: testInfo.outputPath("ACTIVITY-FES-POINT-SUGGESTIONS-MOBILE.png"), fullPage: true });
});
