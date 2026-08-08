import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";

const allowed = [
  /^docs\/static-preview\/forge-aura\/income\//,
  /^docs\/static-preview\/forge-aura\/app-v4\.js$/,
  /^docs\/static-preview\/forge-aura\/aura-bootstrap-v4\.js$/,
  /^docs\/static-preview\/forge-aura\/aura-router-v4\.js$/,
  /^docs\/static-preview\/forge-aura\/aura-shell\.js$/,
  /^docs\/static-preview\/forge-aura\/aura-shell\.css$/,
  /^docs\/static-preview\/forge-aura\/index\.html$/,
  /^tests\/income-/,
  /^tests\/e2e\/income-/,
  /^tests\/fixtures\/aura-income-/,
  /^\.github\/workflows\/income-aura-ux-reconciliation-001\.yml$/,
  /^docs\/architecture\/source-truth\/FORGE_AURA_INCOME_UX_RECONCILIATION_REPORT_001\.md$/,
  /^docs\/evidence\/FORGE_AURA_INCOME_UX_RECONCILIATION_ACCEPTANCE_001\.md$/,
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
  const base = process.env.BASE_SHA || process.env.GITHUB_BASE_SHA;
  if (!base) return [];
  const output = execFileSync("git", ["diff", "--name-only", base, "HEAD"], { encoding: "utf8" });
  return output.split(/\r?\n/).map(value => value.trim()).filter(Boolean);
}

test("FORGE_AURA_INCOME_UX_RECONCILIATION_001 changes only authorized files", () => {
  const changed = changedFiles();
  if (!changed.length && !process.env.CI) return;
  assert.ok(changed.length > 0, "CI scope guard requires a non-empty diff");

  const forbiddenHits = changed.filter(file => forbidden.some(pattern => pattern.test(file)));
  assert.deepEqual(forbiddenHits, [], `Forbidden mutation detected: ${forbiddenHits.join(", ")}`);

  const outOfScope = changed.filter(file => !allowed.some(pattern => pattern.test(file)));
  assert.deepEqual(outOfScope, [], `OUT_OF_SCOPE_VIOLATION: ${outOfScope.join(", ")}`);
});

test("scope guard explicitly blocks engine, rule pack, database and deployment mutations", () => {
  const samples = [
    "compensation/advisor/engine/new-engine.js",
    "compensation/new-professional/rule-data/new.rule-pack.json",
    "supabase/migrations/20260808_income.sql",
    ".github/workflows/pages.yml",
  ];
  for (const sample of samples) {
    assert.equal(forbidden.some(pattern => pattern.test(sample)), true, sample);
  }
});
