import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";

const sharedAuraRuntime = [
  /^docs\/static-preview\/forge-aura\/app-v4\.js$/,
  /^docs\/static-preview\/forge-aura\/aura-bootstrap-v4\.js$/,
  /^docs\/static-preview\/forge-aura\/aura-router-v4\.js$/,
  /^docs\/static-preview\/forge-aura\/aura-shell\.js$/,
  /^docs\/static-preview\/forge-aura\/aura-shell\.css$/,
  /^docs\/static-preview\/forge-aura\/index\.html$/,
];

const incomeAllowed = [
  /^docs\/static-preview\/forge-aura\/income\//,
  ...sharedAuraRuntime,
  /^tests\/income-/,
  /^tests\/e2e\/income-/,
  /^tests\/fixtures\/aura-income-/,
  /^\.github\/workflows\/income-aura-ux-reconciliation-001\.yml$/,
  /^docs\/architecture\/source-truth\/FORGE_AURA_INCOME_UX_RECONCILIATION_REPORT_001\.md$/,
  /^docs\/evidence\/FORGE_AURA_INCOME_UX_RECONCILIATION_ACCEPTANCE_001\.md$/,
];

const carteraSemanticEdge = /^supabase\/functions\/cartera-pdf-intake\/index\.ts$/;
const carteraCompatibilityAllowed = [
  /^docs\/static-preview\/forge-aura\/cartera\//,
  /^docs\/static-preview\/forge-aura\/app-v4\.js$/,
  /^docs\/static-preview\/forge-aura\/aura-bootstrap-v4\.js$/,
  /^docs\/static-preview\/forge-aura\/index\.html$/,
  carteraSemanticEdge,
  /^tests\/aura-cartera-/,
  /^tests\/cartera-/,
  /^tests\/e2e\/aura-cartera-pdf-spanish-date-regression\.spec\.mjs$/,
  /^tests\/fixtures\/aura-cartera-pdf-spanish-date-regression\.html$/,
  /^\.github\/workflows\/aura-cartera-pdf-real-regression\.yml$/,
  /^\.github\/workflows\/aura-cartera-productive-reconciliation-001\.yml$/,
  /^\.github\/workflows\/income-aura-ux-reconciliation-001\.yml$/,
  /^adr\/ADR-025 .*Cartera PDF Semantic Review Boundary\.txt$/,
  /^tests\/income-(?:pages-import-graph|cartera-cross-module|scope-guard)\.test\.mjs$/,
];

const homeCompatibilityAllowed = [
  /^docs\/static-preview\/forge-aura\/home\//,
  ...sharedAuraRuntime,
  /^scripts\/prepare-aura-home-pages-authorities\.mjs$/,
  /^scripts\/build-advisor-presentation-pages-runtime\.mjs$/,
  /^tests\/aura-home-command-center-mobile-nav-001\.test\.mjs$/,
  /^tests\/e2e\/aura-home-command-center-mobile-nav-001\.spec\.mjs$/,
  /^tests\/forge-aura-direct-route\.test\.mjs$/,
  /^tests\/income-(?:pages-import-graph|scope-guard)\.test\.mjs$/,
  /^playwright\.aura-home\.config\.mjs$/,
  /^\.github\/workflows\/aura-home-command-center-mobile-nav-001\.yml$/,
  /^docs\/architecture\/source-truth\/FORGE_AURA_HOME_COMMAND_CENTER_AND_MOBILE_NAV_RECONCILIATION_REPORT_001\.md$/,
  /^docs\/evidence\/FORGE_AURA_HOME_COMMAND_CENTER_AND_MOBILE_NAV_ACCEPTANCE_001\.md$/,
];

const quotesCompatibilityAllowed = [
  /^docs\/static-preview\/forge-aura\/quotes\//,
  ...sharedAuraRuntime,
  /^tests\/forge-aura-quotes-reconciliation-test\.mjs$/,
  /^tests\/income-scope-guard\.test\.mjs$/,
  /^\.github\/workflows\/aura-quotes-reconciliation\.yml$/,
];

const forbidden = [
  /^compensation\/advisor\/engine\//,
  /^compensation\/advisor-development\/.*engine/,
  /^compensation\/new-professional\/.*rule-data/,
  /^compensation\/advisor\/rules\/rule-data/,
  /^supabase\/migrations\//,
  /^supabase\/functions\//,
  /^platform\/policy-intelligence\//,
  /^\.github\/workflows\/pages\.yml$/,
  /^docs\/static-preview\/forge-alive-material3\//,
];

function changedFiles() {
  const requestedBase = process.env.BASE_SHA || process.env.GITHUB_BASE_SHA;
  let base = requestedBase;
  try {
    const mergeBase = execFileSync("git", ["merge-base", "origin/main", "HEAD"], { encoding: "utf8" }).trim();
    if (mergeBase) base = mergeBase;
  } catch {}
  if (!base) return [];
  const output = execFileSync("git", ["-c", "core.quotepath=false", "diff", "--name-only", "-z", base, "HEAD"], { encoding: "utf8" });
  return output.split("\0").map(value => value.trim()).filter(Boolean);
}

function matchesAny(file, patterns) {
  return patterns.some(pattern => pattern.test(file));
}

test("FORGE_AURA_INCOME_UX_RECONCILIATION_001 preserves strict scope while allowing governed shared-runtime compatibility", () => {
  const changed = changedFiles();
  if (!changed.length && !process.env.CI) return;
  assert.ok(changed.length > 0, "CI scope guard requires a non-empty diff");

  const forbiddenHits = changed.filter(file => matchesAny(file, forbidden) && !carteraSemanticEdge.test(file));
  assert.deepEqual(forbiddenHits, [], `Forbidden mutation detected: ${forbiddenHits.join(", ")}`);

  const incomeProductMutation = changed.some(file => /^docs\/static-preview\/forge-aura\/income\//.test(file));
  const quotePhaseMutation = changed.some(file =>
    /^docs\/static-preview\/forge-aura\/quotes\//.test(file)
      || /^\.github\/workflows\/aura-quotes-reconciliation\.yml$/.test(file)
      || /^tests\/forge-aura-quotes-reconciliation-test\.mjs$/.test(file),
  );
  const homePhaseMutation = changed.some(file =>
    /^docs\/static-preview\/forge-aura\/home\//.test(file)
      || /^\.github\/workflows\/aura-home-command-center-mobile-nav-001\.yml$/.test(file)
      || /^docs\/architecture\/source-truth\/FORGE_AURA_HOME_COMMAND_CENTER_AND_MOBILE_NAV_RECONCILIATION_REPORT_001\.md$/.test(file),
  );

  const activeAllowlist = incomeProductMutation
    ? incomeAllowed
    : quotePhaseMutation
      ? quotesCompatibilityAllowed
      : homePhaseMutation
        ? homeCompatibilityAllowed
        : carteraCompatibilityAllowed;
  const scopeName = incomeProductMutation
    ? "OUT_OF_SCOPE_VIOLATION"
    : quotePhaseMutation
      ? "QUOTES_COMPATIBILITY_SCOPE_VIOLATION"
      : homePhaseMutation
        ? "HOME_COMPATIBILITY_SCOPE_VIOLATION"
        : "CARTERA_COMPATIBILITY_SCOPE_VIOLATION";
  const outOfScope = changed.filter(file => !matchesAny(file, activeAllowlist));
  assert.deepEqual(outOfScope, [], `${scopeName}: ${outOfScope.join(", ")}`);
});

test("scope guard explicitly blocks engine, rule pack, database, unrelated Edge and deployment mutations", () => {
  const samples = [
    "compensation/advisor/engine/new-engine.js",
    "compensation/new-professional/rule-data/new.rule-pack.json",
    "supabase/migrations/20260808_income.sql",
    "supabase/functions/unrelated-edge/index.ts",
    ".github/workflows/pages.yml",
  ];
  for (const sample of samples) {
    assert.equal(forbidden.some(pattern => pattern.test(sample)), true, sample);
  }
  assert.equal(carteraSemanticEdge.test('supabase/functions/cartera-pdf-intake/index.ts'), true);
  assert.equal(carteraSemanticEdge.test('supabase/functions/unrelated-edge/index.ts'), false);
});
