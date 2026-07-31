import { expect, test } from "@playwright/test";

test("M05E-006 remains responsive when human review emits its own update event", async ({ page, baseURL }) => {
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto(`${baseURL}/tests/e2e/fixtures/m05e006/index.html`, {
    waitUntil: "domcontentloaded",
  });
  await expect(page.locator("html")).toHaveAttribute(
    "data-m05e006-harness-ready",
    "true",
  );

  await page.waitForTimeout(900);
  const state = await page.evaluate(() => globalThis.__m05e006Harness.state());

  expect(state.runtime).toBe("M05E-006");
  expect(state.humanReviewWrites).toBe(1);
  expect(state.review.clientName).toBe("Sin dato confirmado");
  expect(state.heartbeats).toBeGreaterThan(12);
  expect(state.errors).toEqual([]);

  const actionablePageErrors = pageErrors.filter(
    (message) => !message.includes(
      "Service worker is disabled because the context is sandboxed",
    ),
  );
  expect(actionablePageErrors).toEqual([]);

  await expect(page.locator("[data-m05e005-printable-card]")).toBeVisible();
  await expect(page.getByRole("button", { name: "Ver e imprimir la cotización" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Descargar cotización en PDF" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Abrir historial de versiones" })).toBeVisible();
});
