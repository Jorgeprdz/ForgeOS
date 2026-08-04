import assert from "node:assert/strict";
import { chromium } from "@playwright/test";

const baseUrl = process.env.FORGE_CANONICAL_ENTRY_BASE_URL
  || "http://127.0.0.1:4173/docs/static-preview/forge-alive/";
const browser = process.env.FORGE_CDP_ENDPOINT
  ? await chromium.connectOverCDP(process.env.FORGE_CDP_ENDPOINT)
  : await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const page = await context.newPage();
const errors = [];
page.on("pageerror", error => errors.push(error.message));

try {
  await page.goto(`${baseUrl}?nav=cartera&auth_return=1700000000000&v=beta1022#acceptance`, {
    waitUntil: "networkidle",
  });
  assert.match(page.url(), /forge-alive-material3/);
  assert.equal(new URL(page.url()).searchParams.get("nav"), "cartera");
  assert.equal(new URL(page.url()).hash, "#acceptance");
  assert.equal(await page.title(), "ForgeOS");
  const geometry = await page.evaluate(() => ({
    width: innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
  }));
  assert.ok(geometry.documentWidth <= geometry.width + 1, "CANONICAL_ENTRY_HORIZONTAL_OVERFLOW");
  assert.ok(geometry.bodyWidth <= geometry.width + 1, "CANONICAL_ENTRY_BODY_HORIZONTAL_OVERFLOW");
  assert.deepEqual(errors, []);
  console.log("CANONICAL_AUTH_ENTRY_BROWSER=PASS");
} finally {
  await context.close();
  await browser.close();
}
