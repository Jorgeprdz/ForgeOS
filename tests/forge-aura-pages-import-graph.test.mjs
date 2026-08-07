import test from "node:test";
import assert from "node:assert/strict";
import { lstatSync, readFileSync, readlinkSync } from "node:fs";

const INDEX = "docs/static-preview/forge-aura/index.html";
const PROJECTION = "docs/static-preview/forge-aura/activity/activity-points-projection.js";
const REPORTING_CRYPTO_SHIM = "docs/static-preview/forge-alive-material3/node-crypto-shim.mjs";
const PUBLIC_ENGINE_LINK = "docs/daily-points-engine.js";
const PUBLIC_ADAPTER_LINK = "docs/platform/productivity/activity-points-authority-adapter.js";

test("Aura Pages maps Activity to the canonical published runtime", () => {
  const html = readFileSync(INDEX, "utf8");
  assert.match(html, /"\.\.\/forge-alive-material3\/"\s*:\s*"\.\.\/forge-alive\/"/);

  const page = new URL("https://example.test/ForgeOS/static-preview/forge-aura/");
  const sourcePrefix = new URL("../forge-alive-material3/", page);
  const publicPrefix = new URL("../forge-alive/", page);
  const activityModule = new URL("activity/activity-module.js", page);
  const requested = new URL("../../forge-alive-material3/activity-manual-entry.js", activityModule);

  assert.equal(requested.href, `${sourcePrefix.href}activity-manual-entry.js`);
  assert.equal(`${publicPrefix.href}${requested.href.slice(sourcePrefix.href.length)}`,
    "https://example.test/ForgeOS/static-preview/forge-alive/activity-manual-entry.js");
});

test("Aura reuses the approved REP browser crypto shim", () => {
  const html = readFileSync(INDEX, "utf8");
  assert.match(html, /"node:crypto"\s*:\s*"\.\.\/forge-alive\/node-crypto-shim\.mjs\?v=rep-16e-001"/);
  const shim = readFileSync(REPORTING_CRYPTO_SHIM, "utf8");
  assert.match(shim, /export function createHash|export \{[^}]*createHash/s);
  assert.match(shim, /SHA256_CONSTANTS/);
});

test("Pages publishes official points authority by symlink instead of copying rules", () => {
  assert.equal(lstatSync(PUBLIC_ENGINE_LINK).isSymbolicLink(), true);
  assert.equal(readlinkSync(PUBLIC_ENGINE_LINK), "../daily-points-engine.js");
  assert.equal(readFileSync(PUBLIC_ENGINE_LINK, "utf8"), readFileSync("daily-points-engine.js", "utf8"));

  assert.equal(lstatSync(PUBLIC_ADAPTER_LINK).isSymbolicLink(), true);
  assert.equal(readlinkSync(PUBLIC_ADAPTER_LINK), "../../../platform/productivity/activity-points-authority-adapter.mjs");
  assert.equal(
    readFileSync(PUBLIC_ADAPTER_LINK, "utf8"),
    readFileSync("platform/productivity/activity-points-authority-adapter.mjs", "utf8"),
  );
});

test("Aura projection resolves the public official adapter at the Pages root", () => {
  const source = readFileSync(PROJECTION, "utf8");
  assert.match(source, /from "\.\.\/\.\.\/\.\.\/platform\/productivity\/activity-points-authority-adapter\.js"/);
  assert.doesNotMatch(source, /activity-points-authority-adapter\.mjs/);

  const projection = new URL("https://example.test/ForgeOS/static-preview/forge-aura/activity/activity-points-projection.js");
  const resolved = new URL("../../../platform/productivity/activity-points-authority-adapter.js", projection);
  assert.equal(resolved.href, "https://example.test/ForgeOS/platform/productivity/activity-points-authority-adapter.js");
});
