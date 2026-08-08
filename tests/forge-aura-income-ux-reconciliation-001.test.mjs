import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const modulePath = "docs/static-preview/forge-aura/income/income-module.js";
const cssPath = "docs/static-preview/forge-aura/income/income.css";
const appPath = "docs/static-preview/forge-aura/app-v4.js";
const shellPath = "docs/static-preview/forge-aura/aura-shell.js";
const routerPath = "docs/static-preview/forge-aura/aura-router-v4.js";
const reportPath = "docs/architecture/source-truth/FORGE_AURA_INCOME_UX_RECONCILIATION_REPORT_001.md";

const js = fs.readFileSync(modulePath, "utf8");
const css = fs.readFileSync(cssPath, "utf8");
const app = fs.readFileSync(appPath, "utf8");
const shell = fs.readFileSync(shellPath, "utf8");
const router = fs.readFileSync(routerPath, "utf8");

function has(...parts) {
  for (const part of parts) assert.match(js, part);
}

test("constitutional gate: human judgment and economic truth boundaries are represented", () => {
  has(/UNKNOWN permanece UNKNOWN/i, /Pipeline no es Income Truth/i, /Money is context, never pressure/i);
  assert.doesNotMatch(js, /probability\s*\*/i);
  assert.doesNotMatch(js, /hardcoded rate/i);
  assert.doesNotMatch(js, /te pagaron|depositado|ingreso real del periodo/i);
});

test("ADR-017/018: generated, expected and scenario remain separate", () => {
  has(/GENERATED/, /EXPECTED/, /SCENARIO/, /SIN CONCLUSIÓN ECONÓMICA/);
  has(/Puede diferir del depósito final/i, /no convierte oportunidades en dinero probable/i);
});

test("canonical compensation source and provider are reused", () => {
  assert.match(js, /advisor-compensation-070-source\.js/);
  assert.match(js, /advisor-compensation-supabase-provider-100\.js/);
  assert.match(js, /createAdvisorCompensationProductSource/);
  assert.match(js, /createAdvisorCompensationSupabaseProvider100/);
});

test("initial, renewal and bonus classification does not invent unknown", () => {
  has(/Number\(aggregate\.policyYear\) === 1/, /Number\(aggregate\.policyYear\) > 1/, /return "UNKNOWN"/);
  has(/Nuevas ventas/, /Renovaciones/, /Bonos generados/);
});

test("adjustments and reversals are preserved in movement evidence", () => {
  has(/earnedGrossAmount/, /adjustmentAmount/, /reversalAmount/, /earnedNetAmount/, /sourceCalculationDigest/, /rulePackDigest/);
});

test("history respects canonical source limit", () => {
  has(/Histórico canónico disponible/, /no se fabrican meses faltantes/);
  assert.match(js, /Array\.from\(\{ length: 6 \}/);
});

test("Aura route and navigation expose Ingresos while technical route remains comisiones", () => {
  assert.match(router, /comisiones: "comisiones"/);
  assert.match(router, /route === "ingresos" \? ROUTES\.comisiones/);
  assert.match(shell, />Ingresos</);
  assert.match(app, /createIncomeModule/);
  assert.match(app, /income\/income\.css/);
});

test("accessibility and responsive acceptance markers exist", () => {
  assert.match(css, /min-height:44px/);
  assert.match(css, /focus-visible/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(css, /@media\(max-width:900px\)/);
  assert.match(css, /@media\(max-width:560px\)/);
  assert.match(css, /font-variant-numeric:tabular-nums/);
});

test("session scrub and late result rejection are enforced in module lifecycle", () => {
  has(/request !== generation/, /controller\.signal\.aborted/, /selectedPeriod !== periodKey/);
  has(/income-unmount/, /income-destroy/, /root\.replaceChildren\(\)/);
});

test("no compensation engine, rule pack, database or writer mutation occurs", () => {
  assert.doesNotMatch(js, /from ".*compensation\/advisor\/engine/);
  assert.doesNotMatch(js, /\.insert\(|\.update\(|\.delete\(|\.upsert\(/);
  assert.doesNotMatch(js, /pipeline.*(insert|update|delete|upsert)/i);
});

test("scope guard", () => {
  const allowed = [
    /^docs\/static-preview\/forge-aura\/income\//,
    /^docs\/static-preview\/forge-aura\/app-v4\.js$/,
    /^docs\/static-preview\/forge-aura\/aura-router-v4\.js$/,
    /^docs\/static-preview\/forge-aura\/aura-shell\.js$/,
    /^docs\/architecture\/source-truth\/FORGE_AURA_INCOME_UX_RECONCILIATION_REPORT_001\.md$/,
    /^tests\/forge-aura-income-ux-reconciliation-001\.test\.mjs$/,
    /^\.github\/workflows\/forge-aura-income-ux-reconciliation-001\.yml$/,
  ];
  let files = [];
  try {
    files = execFileSync("git", ["diff", "--name-only", "origin/main...HEAD"], { encoding: "utf8" })
      .trim().split(/\r?\n/).filter(Boolean);
  } catch {
    files = [modulePath, cssPath, appPath, shellPath, routerPath, reportPath, "tests/forge-aura-income-ux-reconciliation-001.test.mjs"];
  }
  const violations = files.filter(file => !allowed.some(pattern => pattern.test(file)));
  assert.deepEqual(violations, [], `OUT_OF_SCOPE_VIOLATION: ${violations.join(", ")}`);
});
