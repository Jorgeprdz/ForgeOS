import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const fixture = "/tests/e2e/fixtures/forge-full-commercial-loop-009/index.html";
const expectedStages = [
  "PROSPECT",
  "CONTACT",
  "APPOINTMENT",
  "QUOTE",
  "POLICY",
  "PAYMENT",
  "COMMISSION",
  "RENEWAL",
];

async function assertNoHorizontalOverflow(page) {
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    bodyScrollWidth: document.body.scrollWidth,
  }));
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
  expect(metrics.bodyScrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
}

test("desktop — complete governed commercial loop is visible with provenance", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${fixture}?origin=HOME&entity=prospect%3A009&person=UNRESOLVED`);

  await expect(page.locator("html")).toHaveAttribute("data-fixture-ready", "true");
  await expect(page.locator("[data-loop-stage]")).toHaveCount(8);

  for (const stage of expectedStages) {
    await expect(page.locator(`[data-loop-stage="${stage}"]`)).toBeVisible();
    await expect(page.locator(`[data-loop-stage="${stage}"] [data-provenance]`)).not.toBeEmpty();
  }

  await expect(page.locator('[data-loop-stage="PROSPECT"]')).toContainText("UNRESOLVED");
  await expect(page.locator('[data-loop-stage="QUOTE"]')).toContainText("≠ Policy");
  await expect(page.locator('[data-loop-stage="POLICY"]')).toContainText("≠ payment");
  await expect(page.locator('[data-loop-stage="PAYMENT"]')).toContainText("≠ comisión pagada al asesor");
  await expect(page.locator('[data-loop-stage="COMMISSION"]')).toContainText("PAID queda UNKNOWN");
  await expect(page.locator("[data-renewal-state]")).toHaveText("EXPECTED");
  await expect(page.locator("[data-human-decision]")).toContainText("AUTONOMOUS_EXECUTION=0");
  await expect(page.locator("[data-paid-boundary]")).toContainText("PREMIUM_PAYMENT_IS_NOT_ADVISOR_PAYOUT");
  await expect(page.locator("form, input, textarea, select, button, [type=submit]")).toHaveCount(0);
  await assertNoHorizontalOverflow(page);

  await mkdir("artifacts/forge009", { recursive: true });
  await page.screenshot({ path: "artifacts/forge009/full-loop-desktop.png", fullPage: true });
});

test("mobile — all states remain reachable without horizontal overflow or hidden authority", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${fixture}?origin=PIPELINE&entity=prospect%3A009&person=UNRESOLVED`);

  await expect(page.locator("[data-loop-stage]")).toHaveCount(8);
  for (const stage of expectedStages) {
    await expect(page.locator(`[data-loop-stage="${stage}"]`)).toBeVisible();
  }
  await expect(page.locator("[data-context-origin]")).toHaveText("origin=PIPELINE");
  await expect(page.locator("[data-context-entity]")).toHaveText("entity=prospect:009");
  await expect(page.locator("[data-context-person]")).toHaveText("person=UNRESOLVED");
  await assertNoHorizontalOverflow(page);

  await mkdir("artifacts/forge009", { recursive: true });
  await page.screenshot({ path: "artifacts/forge009/full-loop-mobile.png", fullPage: true });
});

test("refresh — identity and projection semantics do not mutate into stronger truth", async ({ page }) => {
  await page.setViewportSize({ width: 834, height: 1112 });
  await page.goto(`${fixture}?origin=ALFRED&entity=policy%3A009&person=person%3A009`);

  await expect(page.locator("[data-context-origin]")).toHaveText("origin=ALFRED");
  await expect(page.locator("[data-context-entity]")).toHaveText("entity=policy:009");
  await expect(page.locator("[data-context-person]")).toHaveText("person=person:009");
  await expect(page.locator("[data-renewal-state]")).toHaveText("EXPECTED");
  await expect(page.locator('[data-loop-stage="COMMISSION"]')).toContainText("PAID queda UNKNOWN");

  await page.reload();

  await expect(page.locator("[data-context-origin]")).toHaveText("origin=ALFRED");
  await expect(page.locator("[data-context-entity]")).toHaveText("entity=policy:009");
  await expect(page.locator("[data-context-person]")).toHaveText("person=person:009");
  await expect(page.locator("[data-renewal-state]")).toHaveText("EXPECTED");
  await expect(page.locator('[data-loop-stage="COMMISSION"]')).toContainText("PAID queda UNKNOWN");
});

test("direct route — owner context degrades explicitly instead of inventing origin or identity", async ({ page }) => {
  await page.setViewportSize({ width: 430, height: 932 });
  await page.goto(fixture);

  await expect(page.locator("[data-context-origin]")).toHaveText("origin=DIRECT_ROUTE");
  await expect(page.locator("[data-context-entity]")).toHaveText("entity=prospect:009");
  await expect(page.locator("[data-context-person]")).toHaveText("person=UNRESOLVED");
  await expect(page.locator('[data-loop-stage="PROSPECT"]')).toContainText("Prospect ≠ CommercialPerson");
  await assertNoHorizontalOverflow(page);
});
