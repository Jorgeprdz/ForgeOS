import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const screenshotDir = path.resolve(
  "artifacts/ui-m03-clean/screenshots",
);

test.beforeAll(() => {
  fs.mkdirSync(screenshotDir, { recursive: true });
});

test("clean Home visual acceptance", async ({
  page,
}, testInfo) => {
  await page.goto(
    "/docs/static-preview/forge-alive-material3/",
    { waitUntil: "networkidle" },
  );

  await expect(
    page.locator("html"),
  ).toHaveAttribute(
    "data-forge-clean-home-ready",
    "true",
  );

  await expect(
    page.locator("[data-forge-clean-app]"),
  ).toHaveCount(1);

  await expect(
    page.locator(".topbar"),
  ).toHaveCount(1);

  await expect(
    page.locator(".phone-shell"),
  ).toHaveCount(0);

  await expect(
    page.locator(".forge-m3-app-shell"),
  ).toHaveCount(0);

  await expect(
    page.locator(".forge-desktop-workspace-056y"),
  ).toHaveCount(0);

  const overflow = await page.evaluate(() => ({
    body:
      document.body.scrollWidth
      - document.documentElement.clientWidth,
    document:
      document.documentElement.scrollWidth
      - document.documentElement.clientWidth,
  }));

  expect(overflow.body).toBeLessThanOrEqual(1);
  expect(overflow.document).toBeLessThanOrEqual(1);

  const project = testInfo.project.name;

  if (project.startsWith("mobile")) {
    await expect(page.locator(".sidebar")).toBeHidden();
    await expect(page.locator(".bottom-nav")).toBeVisible();
    await expect(page.locator(".alfred-fab")).toBeVisible();
  } else {
    await expect(page.locator(".sidebar")).toBeVisible();
    await expect(page.locator(".bottom-nav")).toBeHidden();
    await expect(page.locator(".alfred-fab")).toBeHidden();
  }

  await page.screenshot({
    path: path.join(
      screenshotDir,
      `${project}-home.png`,
    ),
    fullPage: true,
    animations: "disabled",
  });
});
