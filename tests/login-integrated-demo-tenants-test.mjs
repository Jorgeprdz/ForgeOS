import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const files = {
  app: "docs/static-preview/forge-alive-material3/app.js",
  frontend: "docs/static-preview/forge-alive-material3/login-integrated-demo.js",
  loginFunction: "supabase/functions/forge-demo-login/index.ts",
  adminFunction: "supabase/functions/forge-demo-admin/index.ts",
  migration: "supabase/migrations/20260801000500_login_integrated_demo_tenants.sql",
  deploy: "scripts/deploy-login-integrated-demo-migration.mjs",
  seed: "scripts/seed-login-integrated-demo-tenants.mjs",
  verify: "scripts/verify-login-integrated-demo-remote.mjs",
};
for (const path of Object.values(files)) {
  assert.ok(existsSync(path), `missing ${path}`);
}
const source = Object.fromEntries(
  Object.entries(files).map(([key, path]) => [key, readFileSync(path, "utf8")]),
);

function requireMarkers(text, markers) {
  for (const marker of markers) {
    assert.ok(text.includes(marker), `missing marker: ${marker}`);
  }
}

test("Material 3 loads the auth guard before one login-integrated demo adapter", () => {
  const localDemoImport = 'import "./forge-demo-mode.js?v=forge-demo-mode-001";';
  const guardImport = 'import "./authenticated-route-guard.js?v=auth-route-guard-001";';
  const demoImport = 'import "./login-integrated-demo.js?v=forge-demo-login-001";';
  assert.ok(source.app.startsWith(`${localDemoImport}\n${guardImport}\n${demoImport}\n`));
  assert.equal(source.app.split(demoImport).length - 1, 1);
  requireMarkers(source.frontend, [
    "Explorar ForgeOS con datos demo",
    "forge_demo_current_session",
    "Modo demostración · Datos ficticios · Solo lectura",
    "/functions/v1/forge-demo-login",
    "Esta acción externa está bloqueada",
  ]);
  assert.match(
    source.frontend,
    /dataClass:\s*state\.active\s*\?\s*"SYNTHETIC"\s*:\s*null/,
  );
  assert.doesNotMatch(source.frontend, /[?&]mode=demo/i);
  assert.doesNotMatch(source.frontend, /ADVISOR_[AB]_(EMAIL|PASSWORD)/);
});

test("public demo login keeps credentials and admin authority server-side", () => {
  requireMarkers(source.loginFunction, [
    "admin.generateLink",
    "type: \"magiclink\"",
    "FORGE_DEMO_ADVISOR_A_EMAIL",
    "forge_demo_advisors",
    "read_only: true",
    "ORIGIN_DENIED",
    "RATE_LIMITED",
    "DEMO_ACTION_LINK_INVALID",
  ]);
  assert.doesNotMatch(source.loginFunction, /signInWithPassword/);
  assert.doesNotMatch(source.loginFunction, /ADVISOR_A_PASSWORD/);
  assert.doesNotMatch(source.loginFunction, /console\.(?:log|error)\([^\n]*(?:email|actionLink)/i);
  requireMarkers(source.adminFunction, [
    "FORGE_DEMO_ADMIN_TOKEN",
    "PREPARE",
    "SEAL",
    "CONTROL_B",
    "PUBLIC_A",
  ]);
});

test("demo tenants reuse productive authorities and are sealed read-only", () => {
  requireMarkers(source.migration, [
    "create table if not exists public.forge_demo_advisors",
    "create or replace function public.forge_demo_current_session()",
    "create or replace function public.forge_demo_read_only_guard()",
    "FORGE_DEMO_ACCOUNT_READ_ONLY",
    "prospects",
    "prospect_journal_entries",
    "quote_lifecycle_quotes",
    "canonical_policies",
    "advisor_monthly_policy_goals",
    "activity_event_ledger",
  ]);
  assert.doesNotMatch(source.migration, /create table[^;]+demo_(?:prospects|policies|quotes)/i);
  assert.doesNotMatch(source.migration, /\b(?:drop\s+table|truncate)\b/i);
  assert.match(source.migration, /revoke all on table public\.forge_demo_advisors/);
});

test("seed tells one coherent Pipeline-to-Cartera family story", () => {
  requireMarkers(source.seed, [
    "FORGE_DEMO_SEED_V1",
    "Alejandro Torres · Demo",
    "Mariana López · Demo",
    "Mateo Torres · Demo",
    "product:imagina-ser",
    "product:segubeca",
    "forge_cartera001b_confirm_reviewed_quote",
    "forge_cartera010b_confirm_policy_with_parties",
    "forge_cartera030b_generate_expected_obligations",
    "prospect_journal_entries",
    "createCanonicalActivityEvent",
    "FAMILY_TORRES_LOPEZ",
    "POLICY_OWNER",
    "PAYOR",
    "INSURED",
    "DEMO_RLS_ISOLATION=PASS",
  ]);
  assert.doesNotMatch(source.seed, /REAL_CLIENT_DATA/i);
  assert.doesNotMatch(source.seed, /service_role/i);
  assert.doesNotMatch(source.seed, /console\.log\([^\n]*(?:EMAIL|PASSWORD)/);
});

test("remote verification requires classification, inventory, RLS and read-only sealing", () => {
  requireMarkers(source.verify, [
    "PUBLIC_A",
    "CONTROL_B",
    "SYNTHETIC",
    "PUBLIC_A_PIPELINE_INCOMPLETE",
    "PUBLIC_A_FAMILY_PEOPLE_INCOMPLETE",
    "PUBLIC_A_POLICIES_INCOMPLETE",
    "CONTROL_B_READ_PUBLIC_A",
    "FORGE_DEMO_ACCOUNT_READ_ONLY",
    "LOGIN_INTEGRATED_DEMO_REMOTE_ACCEPTANCE=PASS",
  ]);
});

test("migration deployment is additive and never repairs remote history", () => {
  requireMarkers(source.deploy, [
    "PARTIAL_DEMO_AUTHORITY_REQUIRES_MANUAL_RECONCILIATION",
    "DESTRUCTIVE_SQL_REJECTED",
    "on conflict (version) do nothing",
    "historyReset: false",
    "historyRepair: false",
  ]);
  assert.doesNotMatch(source.deploy, /delete\s+from\s+supabase_migrations/i);
  assert.doesNotMatch(source.deploy, /update\s+supabase_migrations/i);
});
