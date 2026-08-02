import { expect, test } from "@playwright/test";

async function expectPrintableActions(page) {
  await expect(page.locator("[data-m05e005-printable-card]")).toBeVisible();
  await expect(page.getByRole("button", { name: "Ver e imprimir la cotización" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Descargar cotización en PDF" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Abrir historial de versiones" })).toBeVisible();
}

async function replaceProjectionForProduct(page, product) {
  await page.evaluate((productType) => {
    const projection = document.querySelector("[data-material3-quotes-projection]");
    if (!projection) throw new Error("M05W002_PROJECTION_REQUIRED");

    const dashboard = document.createElement("section");
    dashboard.dataset.productDashboard = productType;
    dashboard.textContent = `${productType} reconciled dashboard`;

    const actions = document.createElement("div");
    actions.dataset.quoteLastActions = "true";
    projection.replaceChildren(dashboard, actions);
  }, product);
}

test("M05E-006 remains responsive and restores shared print actions after product reconciliation", async ({ page, baseURL }) => {
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
  expect(state.presenceGuard).toBe("M05W-002");
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

  await expectPrintableActions(page);

  await replaceProjectionForProduct(page, "vida_mujer");
  await expectPrintableActions(page);
  await expect(page.locator("html")).toHaveAttribute(
    "data-printable-presence-status",
    /ready|restored/,
  );

  await replaceProjectionForProduct(page, "segubeca");
  await expectPrintableActions(page);
  await expect(page.locator("html")).toHaveAttribute(
    "data-printable-presence-guard",
    "M05W-002",
  );

  const recovery = await page.evaluate(() => ({
    cardCount: document.querySelectorAll("[data-m05e005-printable-card]").length,
    actionCount: document.querySelectorAll("[data-m05e005-action]").length,
    restoreCount: Number(
      document.documentElement.dataset.printablePresenceRestoreCount || 0,
    ),
    errors: globalThis.__m05e006Harness.state().errors,
  }));

  expect(recovery.cardCount).toBe(1);
  expect(recovery.actionCount).toBe(3);
  expect(recovery.restoreCount).toBeGreaterThanOrEqual(2);
  expect(recovery.errors).toEqual([]);
});
