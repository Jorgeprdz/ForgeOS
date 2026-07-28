import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

test("QuotesModule uses native Material 3 markup without legacy transplant", () => {
  const module = read(
    "docs/static-preview/forge-alive-material3/quotes-module.js",
  );
  const adapter = read(
    "docs/static-preview/forge-alive-material3/quote-runtime-adapter.js",
  );
  assert.match(module, /dedicated-new-quote-static-route/);
  assert.match(module, /quotesWorkspaceMarkup/);
  assert.match(adapter, /forge-accepted-quote-bridge\.js/);
  assert.doesNotMatch(
    module + adapter,
    /nueva-cotizacion\/index\.html|DOMParser|document\.importNode|iframe/i,
  );
});

test("canonical navigation registers the real quotes route", () => {
  const contract = read(
    "docs/static-preview/forge-alive-material3/forge-navigation-contract.js",
  );
  assert.match(contract, /id: "quotes"/);
  assert.match(contract, /routeId: "quotes"/);
  assert.match(contract, /target: "\?nav=cotizaciones"/);
  assert.match(contract, /accessibilityLabel: "Abrir Cotizaciones"/);
  assert.match(contract, /requested === "cotizaciones" \? "quotes"/);
});

test("scoped Material 3 quote presentation does not hide a mounted legacy UI", () => {
  const css = read(
    "docs/static-preview/forge-alive-material3/quotes-module.css",
  );
  assert.match(css, /\.quotes-workspace/);
  assert.match(css, /\.quotes-result-grid/);
  assert.doesNotMatch(css, /\.bottom-nav|\.forge-mobile-nav-r16c5j|\.fq-top-105dr/);
  assert.doesNotMatch(css, /\.nav-pill\s*\{[^}]*display:\s*none/s);
});

test("shell owns route module reconciliation", () => {
  const shell = read(
    "docs/static-preview/forge-alive-material3/forge-shell.js",
  );
  assert.match(shell, /registerRouteModule/);
  assert.match(shell, /routeModules\.get\(routeId\)/);
});

test("UI-M05 preserves authoritative quote and product boundaries", () => {
  const manifest = JSON.parse(read(
    "docs/evidence/ui-m05b-protected-boundary-manifest.json",
  ));
  assert.equal(manifest.policy, "NO_AUTHORITATIVE_DOMAIN_MUTATION");
  const changed = execFileSync(
    "git",
    [
      "-c",
      `safe.directory=${process.cwd()}`,
      "diff",
      "--name-only",
      manifest.sourceCommit,
      "--",
    ],
    { encoding: "utf8" },
  ).trim().split("\n").filter(Boolean);
  for (const path of changed) {
    assert.equal(
      manifest.protectedPaths.some((protectedPath) =>
        path.startsWith(protectedPath)
        || path.toLowerCase().includes(protectedPath.toLowerCase())
      ),
      false,
      `protected file changed: ${path}`,
    );
  }
});
