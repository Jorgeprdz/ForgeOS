import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const index = read("docs/static-preview/forge-alive-material3/index.html");
const app = read("docs/static-preview/forge-alive-material3/app.js");
const shell = read("docs/static-preview/forge-alive-material3/forge-shell.js");
const home = read("docs/static-preview/forge-alive-material3/home-module.js");
const navigation = read(
  "docs/static-preview/forge-alive-material3/forge-navigation-contract.js",
);
const manifest = JSON.parse(
  read("docs/static-preview/forge-alive-material3/manifest.json"),
);
const protectedManifest = JSON.parse(
  read("docs/evidence/ui-m04-protected-boundary-manifest.json"),
);

test("Inicio renders through the canonical ForgeShell module boundary", () => {
  assert.match(index, /data-forge-application/);
  assert.match(index, /data-forge-module-viewport/);
  assert.match(index, /data-forge-home-module/);
  assert.match(app, /createForgeShell/);
  assert.match(app, /createHomeModule/);
  assert.match(app, /shell\.mountModule\(home\)/);
  assert.equal(manifest.contracts.canonicalForgeShell, true);
  assert.equal(manifest.contracts.homeModuleSeparated, true);
});

test("Home content is outside shell source and remains Home-owned", () => {
  for (const homeCopy of [
    "Buenos días, Jorge",
    "Seguimiento prioritario",
    "Juan Martínez",
    "Oportunidades",
  ]) {
    assert.match(index, new RegExp(homeCopy, "i"));
    assert.doesNotMatch(shell, new RegExp(homeCopy, "i"));
  }
  assert.match(home, /createHomeModule/);
});

test("shell declares one Nav Pill, command orb, and Alfred sheet", () => {
  assert.equal((index.match(/data-forge-nav-pill/g) || []).length, 1);
  assert.equal((index.match(/data-forge-command-orb/g) || []).length, 1);
  assert.equal((index.match(/data-forge-alfred-sheet/g) || []).length, 1);
});

test("navigation contract is deterministic and route-aware", () => {
  for (const contract of [
    /id:\s*"home"/,
    /routeId:\s*"inicio"/,
    /target:\s*"\?nav=inicio"/,
    /accessibilityLabel:\s*"Ir a Inicio"/,
    /availability:\s*"available"/,
    /order:\s*10/,
    /routeId:\s*"cotizaciones"/,
    /availability:\s*"future"/,
  ]) {
    assert.match(navigation, contract);
  }
  assert.match(navigation, /resolveForgeRoute/);
  assert.match(shell, /resolveForgeRoute\(\)/);
  assert.match(shell, /aria-current="page"/);
  assert.doesNotMatch(
    navigation,
    /quote-intake|quote-engine|parser|calculation|supabase/i,
  );
});

test("shell lifecycle is idempotent and covers restoration events", () => {
  assert.match(shell, /if \(root\[shellStateKey\]\) return/);
  assert.match(shell, /if \(initialized\)/);
  assert.match(shell, /window\.addEventListener\("pageshow", reconcile/);
  assert.match(shell, /window\.addEventListener\("popstate", reconcile/);
  assert.match(shell, /window\.addEventListener\("resize", reconcile/);
  assert.match(shell, /window\.addEventListener\("orientationchange", reconcile/);
  assert.match(shell, /AbortController/);
  assert.doesNotMatch(shell, /MutationObserver/);
});

test("protected boundary manifest remains enforceable", () => {
  assert.equal(protectedManifest.policy, "NO_MUTATION");
  const changed = execFileSync(
    "git",
    [
      "-c",
      `safe.directory=${process.cwd()}`,
      "diff",
      "--name-only",
      protectedManifest.sourceCommit,
      "--",
    ],
    { encoding: "utf8" },
  ).trim().split("\n").filter(Boolean);
  for (const path of changed) {
    assert.equal(
      protectedManifest.protectedPaths.some((protectedPath) =>
        path.startsWith(protectedPath)
        || path.toLowerCase().includes(protectedPath.toLowerCase())
      ),
      false,
      `protected file changed: ${path}`,
    );
  }
});
