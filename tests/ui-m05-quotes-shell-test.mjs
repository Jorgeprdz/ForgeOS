import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

test("QuotesModule uses the functional source without domain duplication", () => {
  const module = read(
    "docs/static-preview/forge-alive-material3/quotes-module.js",
  );
  assert.match(module, /forge-alive\/nueva-cotizacion\/index\.html/);
  assert.match(
    module,
    /forge-alive-runtime\/nueva-cotizacion\/index\.html/,
  );
  assert.match(module, /import\.meta\.url/);
  assert.match(module, /dedicated-new-quote-static-route/);
  assert.match(module, /forge:quote-intake-state-change/);
  assert.match(module, /dataset\.intakeState/);
  assert.doesNotMatch(module, /iframe|calculateQuote|localStorage|supabase/i);
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

test("only scoped Material 3 quote presentation suppresses legacy global nav", () => {
  const css = read(
    "docs/static-preview/forge-alive-material3/quotes-module.css",
  );
  assert.match(css, /\.bottom-nav,[\s\S]*\.forge-mobile-nav-r16c5j/);
  assert.match(css, /\.fq-top-105dr/);
  assert.match(
    css,
    /\[data-forge-quotes-runtime-host\]\s*\[hidden\][^{]*\{[^}]*display:\s*none\s*!important/s,
  );
  assert.match(
    css,
    /\.fq-file-native-105dr\s*\{[^}]*inline-size:\s*1px\s*!important[^}]*opacity:\s*0\s*!important[^}]*clip-path:\s*inset\(50%\)\s*!important/s,
  );
  assert.match(
    css,
    /data-intake-state="empty"[\s\S]*\.fq-hero-105dr/,
  );
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
    "docs/evidence/ui-m05-protected-boundary-manifest.json",
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
