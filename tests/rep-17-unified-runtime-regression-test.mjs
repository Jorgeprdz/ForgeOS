import "./recommendation-presentation-evidence-017e-test.mjs";
import "./recommendation-decision-action-lineage-017e-test.mjs";
import "./commercial-pilot-evidence-summary-017e-test.mjs";
import "./recommendation-human-decision-evidence-017c-test.mjs";
import "./activity-foundational-fes-taxonomy-test.mjs";
import "./activity-manual-countable-capture.test.mjs";
import "./activity-fes-01-2-reporting-compatibility.test.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = path => readFile(resolve(root, path), "utf8");

test("REP-17B publishes controlled quote-printable entrypoints", async () => {
  for (const path of [
    "docs/quote-printable/index.html",
    "docs/static-preview/quote-printable/index.html",
  ]) {
    const html = await source(path);
    assert.match(html, /data-quote-printable-fallback/);
    assert.match(html, /location\.replace\(target\.href\)/);
    assert.match(html, /target\.searchParams\.set\("nav", "cotizaciones"\)/);
    assert.match(html, /target\.hash = current\.hash/);
  }
});

test("REP-17B quote-printable public import graph is complete", async () => {
  const visited = new Set();

  async function visit(path) {
    if (visited.has(path)) return;
    visited.add(path);
    const content = await source(path);
    const imports = [
      ...content.matchAll(/(?:from\s+|import\(\s*)["'](\.\.?\/[^"']+)["']/g),
    ].map(match => match[1]);

    for (const specifier of imports) {
      const clean = specifier.split("?")[0];
      const candidate = resolve(dirname(resolve(root, path)), clean);
      const withExtension = extname(candidate) ? candidate : `${candidate}.js`;
      await access(withExtension);
      const relative = withExtension.slice(root.length + 1);
      assert.equal(relative.includes(".."), false);
      if (relative.endsWith(".js")) await visit(relative);
    }
  }

  await visit(
    "docs/static-preview/forge-alive-material3/quote-runtime-printable-closure-m05e006.js",
  );
  assert.ok(visited.size >= 8, `unexpectedly small graph: ${visited.size}`);
});

test("REP-17C Banxico preserves cancellation and cannot fall through to Pages 404", async () => {
  const bridge = await source(
    "docs/static-preview/forge-alive-material3/quote-runtime-pages-rate-fetch-bridge-m05e010.js",
  );
  assert.match(bridge, /signal: init\?\.signal/);
  assert.match(bridge, /if \(isExpectedAbort\(error, init\?\.signal\)\) throw error/);
  assert.match(bridge, /BANXICO_EDGE_UNAVAILABLE/);
  assert.match(bridge, /BANXICO_EDGE_NOT_CONFIGURED/);
  assert.match(bridge, /BANXICO_EDGE_PAYLOAD_INVALID/);
  assert.doesNotMatch(
    bridge,
    /if \(!url\) return originalFetch\(input, init\)/,
  );
  assert.doesNotMatch(
    bridge,
    /catch \{\s*return originalFetch\(input, init\)/,
  );
});

test("REP-17C installs the session guard before Pipeline and Auth boot", async () => {
  const app = await source(
    "docs/static-preview/forge-alive-material3/app.js",
  );
  const guardImport = app.indexOf("./rep-17-session-transition-guard.js");
  const pipelineImport = app.indexOf("./pipeline-module.js");
  assert.ok(guardImport >= 0);
  assert.ok(pipelineImport >= 0);
  assert.ok(guardImport < pipelineImport);
});

test("REP-17C rejects stale provider transitions and scrubs private Pipeline state", async () => {
  const guard = await source(
    "docs/static-preview/forge-alive-material3/rep-17-session-transition-guard.js",
  );
  assert.match(guard, /signedOutBarrier: false/);
  assert.match(guard, /state\.signedOutBarrier &&/);
  assert.match(guard, /\["INITIAL_SESSION", "TOKEN_REFRESHED", "USER_UPDATED"\]/);
  assert.match(guard, /revision !== state\.revision/);
  assert.match(guard, /return anonymousSessionResult\(result\)/);
  assert.match(guard, /event\.stopImmediatePropagation\(\)/);
  assert.match(guard, /data-rep17-session-guard="true"/);
  assert.match(guard, /MutationObserver/);
});

test("REP-17A keeps Activity out of the repair boundary", async () => {
  const app = await source(
    "docs/static-preview/forge-alive-material3/app.js",
  );
  assert.match(app, /activity-module\.js\?v=rep-(?:16e-002|18-001)/);
  assert.match(app, /activityReportingRuntime = "REP-(?:16E|18)"/);
  const guard = await source(
    "docs/static-preview/forge-alive-material3/rep-17-session-transition-guard.js",
  );
  assert.doesNotMatch(guard, /forge-activity-module/);
});