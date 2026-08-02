import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const artifactDir = join(root, "artifacts/advisor-compensation-stage-100");
mkdirSync(artifactDir, { recursive: true });

function text(path) {
  return readFileSync(join(root, path), "utf8");
}

function runNode(path, args = []) {
  const output = execFileSync(process.execPath, [path, ...args], {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  return output.trim();
}

const compensationTests = readdirSync(join(root, "compensation/advisor/tests"))
  .filter((file) => /master-test\.js$/.test(file))
  .sort()
  .map((file) => `compensation/advisor/tests/${file}`);
assert.ok(compensationTests.length >= 8, "ADVISOR_COMPENSATION_MASTER_TEST_INVENTORY_INCOMPLETE");

const productTests = [
  "tests/advisor-compensation-stage-070-master-test.mjs",
  "tests/advisor-compensation-stage-080-master-test.mjs",
  "tests/productive-smart-widget-source-adapters-test.mjs",
  "tests/productive-smart-widget-orchestrator-master-test.mjs",
];

const executed = [];
for (const path of [...compensationTests, ...productTests]) {
  const output = runNode(path);
  executed.push({ path, output: output.split("\n").slice(-8) });
}

const syntaxTargets = [
  "advisor-os/compensation/advisor-compensation-supabase-provider-100.js",
  "docs/static-preview/forge-alive-material3/compensation-module.js",
  "docs/static-preview/forge-alive-material3/compensation-module-distribution-100.js",
  "docs/static-preview/forge-alive-material3/compensation-route-bootstrap-100b.js",
  "docs/static-preview/forge-alive-material3/compensation-runtime-distribution-100.js",
  "scripts/deploy-advisor-compensation-stage-100.mjs",
];
for (const path of syntaxTargets) {
  execFileSync(process.execPath, ["--check", path], { cwd: root, stdio: "pipe" });
}

const navigation = text("docs/static-preview/forge-alive-material3/forge-navigation-contract.js");
const retirement = text("docs/static-preview/forge-alive-material3/legacy-ui-retirement.js");
const bootstrap = text("docs/static-preview/forge-alive-material3/compensation-route-bootstrap-100b.js");
const moduleSource = text("docs/static-preview/forge-alive-material3/compensation-module.js");
const distribution = text("docs/static-preview/forge-alive-material3/compensation-runtime-distribution-100.js");
const productSource = text("advisor-os/compensation/advisor-compensation-070-source.js");
const provider = text("advisor-os/compensation/advisor-compensation-supabase-provider-100.js");
const route = text("comisiones.js");
const migration = text("supabase/migrations/20260802090000_advisor_compensation_productive_authority.sql");
const deployment = text("scripts/deploy-advisor-compensation-stage-100.mjs");

const checks = [
  ["navigation_route", /routeId:\s*"comisiones"/.test(navigation)],
  ["navigation_target", /\?nav=comisiones/.test(navigation)],
  ["canonical_bootstrap_loaded", /compensation-route-bootstrap-100b/.test(retirement)],
  ["shell_registration", /registerRouteModule\("comisiones"/.test(bootstrap)],
  ["private_surface", /forgePrivateSurface\s*=\s*"advisor-compensation"/.test(bootstrap)],
  [
    "session_scrub",
    /forge:private-runtime-scrub/.test(bootstrap)
      && /module\.unmount\(\)/.test(bootstrap)
      && !/module\.scrub\("logout"\)/.test(bootstrap),
  ],
  ["canonical_source_contract", /ADVISOR_COMPENSATION_PRODUCT_READ_MODEL_001/.test(productSource)],
  ["canonical_source_no_indexeddb", !/DB\.obtenerTodos|IndexedDB|TASAS_VIDA|TASAS_GMM/.test(route)],
  ["provider_owner_scope", /PRODUCTIVE_OWNER_MISMATCH/.test(provider)],
  ["provider_inventory_probe", /forge_advisor_compensation_authority_inventory/.test(provider)],
  ["provider_read_rpc", /forge_advisor_compensation_read_product/.test(provider)],
  ["distribution_no_engine", !/advisor-commission-engine|calculateAdvisorCommission|rule-pack\.json/.test(distribution)],
  ["distribution_read_only", /calculationEngineIncluded:\s*false/.test(distribution)],
  ["distribution_unknown_not_zero", /unknownIsNotZero:\s*true/.test(distribution)],
  ["material3_late_result_guard", /late-result-rejected/.test(moduleSource)],
  ["migration_transaction", /^begin;[\s\S]*commit;\s*$/i.test(migration)],
  ["migration_rls", (migration.match(/force row level security/gi) || []).length === 5],
  ["migration_append_only", (migration.match(/append_only_guard/g) || []).length >= 6],
  ["migration_owner_scope", /advisor_id\s*=\s*auth\.uid\(\)/.test(migration)],
  ["migration_read_only_rpc", /security invoker/.test(migration) && !/security definer/i.test(migration)],
  ["migration_no_destructive_sql", !/\b(?:drop\s+table|truncate)\b/i.test(migration)],
  ["deployment_explicit_gate", /APPLY_ADVISOR_COMPENSATION_STAGE_100/.test(deployment)],
  ["deployment_rollback", /rollback;/.test(deployment)],
  ["deployment_zero_residuals", /ZERO_RESIDUALS=PASS/.test(deployment)],
];

for (const [name, passed] of checks) {
  assert.equal(passed, true, `STAGE_100_REPOSITORY_CHECK_FAILED:${name}`);
}

const remotePlan = runNode("scripts/deploy-advisor-compensation-stage-100.mjs", ["--validate-only"]);
assert.match(remotePlan, /REMOTE_DEPLOYMENT=PREPARED_NOT_APPLIED/);

const report = Object.freeze({
  contractVersion: "ADVISOR_COMPENSATION_STAGE_100_REPOSITORY_ACCEPTANCE_001",
  generatedAt: new Date().toISOString(),
  masterTestsExecuted: executed.length,
  compensationMasterTests: compensationTests.length,
  productTests: productTests.length,
  staticChecks: checks.length,
  syntaxTargets: syntaxTargets.length,
  remoteDeployment: "PREPARED_NOT_APPLIED",
  remoteMutationPerformed: false,
  repositoryAcceptance: "PASS",
  results: executed,
});
writeFileSync(
  join(artifactDir, "repository-acceptance.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);

console.log(`MASTER_TEST_FILES=${executed.length}`);
console.log(`STATIC_CHECKS=${checks.length}`);
console.log(`SYNTAX_TARGETS=${syntaxTargets.length}`);
console.log("REPOSITORY_ACCEPTANCE=PASS");
console.log("REMOTE_DEPLOYMENT=PREPARED_NOT_APPLIED");
