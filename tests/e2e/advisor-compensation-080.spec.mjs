import { expect, test } from "@playwright/test";

const fixture = "/tests/e2e/fixtures/advisor-compensation-080/index.html";

test("paid truth is preferred and links to Commissions", async ({ page }) => {
  await page.goto(`${fixture}?mode=paid`, { waitUntil: "networkidle" });
  await expect(page.locator("[data-income-state=\"READY\"]")).toBeVisible();
  await expect(page.locator("[data-income-value=\"9000\"]")).toBeVisible();
  await expect(page.locator("[data-income-basis=\"PAID\"]")).toBeVisible();
  await expect(page.locator("[data-income-deep-link=\"?nav=comisiones\"]")).toBeVisible();
});

test("earned truth is used when paid truth is unavailable", async ({ page }) => {
  await page.goto(`${fixture}?mode=earned`, { waitUntil: "networkidle" });
  await expect(page.locator("[data-income-state=\"READY\"]")).toBeVisible();
  await expect(page.locator("[data-income-value=\"11000\"]")).toBeVisible();
  await expect(page.locator("[data-income-basis=\"EARNED\"]")).toBeVisible();
});

test("disconnected compensation never becomes zero", async ({ page }) => {
  await page.goto(`${fixture}?mode=disconnected`, { waitUntil: "networkidle" });
  await expect(page.locator("[data-income-state=\"NOT_CONNECTED\"]")).toBeVisible();
  await expect(page.locator("[data-income-value=\"NULL\"]")).toBeVisible();
  await expect(page.locator("[data-income-basis=\"UNAVAILABLE\"]")).toBeVisible();
});

test("confirmed at-risk evidence elevates income priority", async ({ page }) => {
  await page.goto(`${fixture}?mode=at-risk`, { waitUntil: "networkidle" });
  await expect(page.locator("[data-income-priority=\"CONFIRMED_INCOME_AT_RISK\"]")).toBeVisible();
  const primary = await page.evaluate(() => globalThis.__COMP_080__.stack.primary);
  expect(primary.widgetFamily).toBe("INCOME_PROGRESS_WIDGET");
  expect(primary.deepLink).toBe("?nav=comisiones");
});

test("anonymous Home never invokes compensation provider", async ({ page }) => {
  await page.goto(`${fixture}?mode=anonymous`, { waitUntil: "networkidle" });
  await expect(page.locator("[data-stack-status=\"SESSION_REQUIRED\"]")).toBeVisible();
  await expect(page.locator("[data-provider-calls=\"0\"]")).toBeVisible();
  const inventory = await page.evaluate(() => globalThis.__COMP_080__.stack.inventory);
  expect(inventory).toEqual([]);
});
