import { expect, test } from "@playwright/test";

const fixture = "/tests/e2e/fixtures/advisor-compensation-080/index.html";

async function expectContractMarker(page, selector) {
  await expect(page.locator(selector)).toHaveCount(1);
}

test("paid truth is preferred and links to Commissions", async ({ page }) => {
  await page.goto(`${fixture}?mode=paid`, { waitUntil: "networkidle" });
  await expectContractMarker(page, "[data-income-state=\"READY\"]");
  await expectContractMarker(page, "[data-income-value=\"9000\"]");
  await expectContractMarker(page, "[data-income-basis=\"PAID\"]");
  await expectContractMarker(page, "[data-income-deep-link=\"?nav=comisiones\"]");
});

test("earned truth is used when paid truth is unavailable", async ({ page }) => {
  await page.goto(`${fixture}?mode=earned`, { waitUntil: "networkidle" });
  await expectContractMarker(page, "[data-income-state=\"READY\"]");
  await expectContractMarker(page, "[data-income-value=\"11000\"]");
  await expectContractMarker(page, "[data-income-basis=\"EARNED\"]");
});

test("disconnected compensation never becomes zero", async ({ page }) => {
  await page.goto(`${fixture}?mode=disconnected`, { waitUntil: "networkidle" });
  await expectContractMarker(page, "[data-income-state=\"NOT_CONNECTED\"]");
  await expectContractMarker(page, "[data-income-value=\"NULL\"]");
  await expectContractMarker(page, "[data-income-basis=\"UNAVAILABLE\"]");
});

test("confirmed at-risk evidence elevates income priority", async ({ page }) => {
  await page.goto(`${fixture}?mode=at-risk`, { waitUntil: "networkidle" });
  await expectContractMarker(page, "[data-income-priority=\"CONFIRMED_INCOME_AT_RISK\"]");
  const primary = await page.evaluate(() => globalThis.__COMP_080__.stack.primary);
  expect(primary.widgetFamily).toBe("INCOME_PROGRESS_WIDGET");
  expect(primary.deepLink).toBe("?nav=comisiones");
});

test("anonymous Home never invokes compensation provider", async ({ page }) => {
  await page.goto(`${fixture}?mode=anonymous`, { waitUntil: "networkidle" });
  await expectContractMarker(page, "[data-stack-status=\"SESSION_REQUIRED\"]");
  await expectContractMarker(page, "[data-provider-calls=\"0\"]");
  const inventory = await page.evaluate(() => globalThis.__COMP_080__.stack.inventory);
  expect(inventory).toEqual([]);
});
