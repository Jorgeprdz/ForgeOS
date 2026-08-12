import { test, expect } from "@playwright/test";

test("017C decisions persist, correct, remain non-executing and survive module return", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/tests/fixtures/aura-human-decision-017c-harness.html");
  await expect(page.locator("html")).toHaveAttribute("data-acceptance", "pass");
  const result = JSON.parse(await page.locator("#result").textContent());
  expect(result.pass).toBe(true);
  expect(result.decision).toBe("DISMISSED");
  expect(result.acted).toBe(false);
  expect(result.outcome).toBe(false);
  expect(result.actionFieldsAbsent).toBe(true);
  expect(result.moduleReturn).toBe("DISMISSED");
  expect(result.overflow).toBe(false);
});

test("017C FES failure never presents false success", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/tests/fixtures/aura-human-decision-017c-harness.html?failure=1");
  await expect(page.locator("html")).toHaveAttribute("data-acceptance", "pass");
  const result = JSON.parse(await page.locator("#result").textContent());
  expect(result.pass).toBe(true);
  expect(result.before).toBe(result.after);
  expect(result.message).toContain("No pudimos");
});
