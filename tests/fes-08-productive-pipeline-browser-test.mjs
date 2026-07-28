import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { chromium } from "@playwright/test";

const baseURL = process.env.FORGE_E2E_BASE_URL || "http://127.0.0.1:4173";
const source = await readFile("nash-combat-orchestrator.js");

test("FES 08B executes the pinned source in an isolated browser realm", async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on("console", message => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", error => errors.push(error.message));
  await page.route("**/ForgeOS/nash-combat-orchestrator.js", route => route.fulfill({
    status: 200,
    contentType: "text/javascript",
    body: source,
  }));
  await page.goto(`${baseURL}/tests/fixtures/fes-08-productive-pipeline-browser.html`, { waitUntil: "networkidle" });
  await page.locator("[data-fes08-status]").waitFor({ state: "visible" });
  await page.waitForFunction(() => document.querySelector("[data-fes08-status]")?.dataset.ready === "true");
  const acceptance = await page.evaluate(() => globalThis.__FORGE_FES08_BROWSER_ACCEPTANCE__);
  assert.equal(acceptance.result.candidate.objectionTypeCandidate, "STALL");
  assert.equal(acceptance.result.authority.humanReviewRequired, true);
  assert.equal("objection" in acceptance.result, false);
  assert.equal(acceptance.loaderCount, 0);
  assert.equal(acceptance.parentPolluted, false);
  assert.equal(await page.locator("[data-fes08-host]").count(), 1);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false);
  assert.deepEqual(errors, []);
  await browser.close();
});
