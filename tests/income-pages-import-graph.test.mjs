import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const siteRoot = path.resolve(process.env.SITE_ROOT || "_site");
const read = relative => fs.readFileSync(path.join(siteRoot, relative), "utf8");
const exists = relative => fs.existsSync(path.join(siteRoot, relative));

test("canonical Pages artifact publishes every Aura Income transitive asset", () => {
  for (const relative of [
    "static-preview/forge-aura/income/income-core.js",
    "static-preview/forge-aura/income/income-adapter-pages-v1.js",
    "static-preview/forge-aura/income/income-module.js",
    "static-preview/forge-aura/income/income.css",
  ]) assert.equal(exists(relative), true, `Missing canonical Pages asset: ${relative}`);
});

test("canonical Aura runtime mounts route=comisiones as visible Ingresos", () => {
  const app = read("static-preview/forge-aura/app-v4.js");
  const router = read("static-preview/forge-aura/aura-router-v4.js");
  const shell = read("static-preview/forge-aura/aura-shell.js");
  const bootstrap = read("static-preview/forge-aura/aura-bootstrap-v4.js");
  const index = read("static-preview/forge-aura/index.html");
  assert.match(app, /createIncomeModule/);
  assert.match(app, /route === "comisiones"/);
  assert.match(app, /income\/income\.css/);
  assert.match(router, /comisiones/);
  assert.match(shell, />Ingresos</);
  assert.match(bootstrap, /income-aura-ux-reconciliation-001/);
  assert.match(index, /income-core\.mjs[^\n]+income-core\.js/);
  assert.match(index, /income-adapter-pages-v1\.mjs[^\n]+income-adapter-pages-v1\.js/);
});

test("canonical Pages artifact preserves inherited Cartera chain behind current v10/v5 durable boundary", () => {
  for (const relative of [
    "static-preview/forge-aura/cartera/cartera-module-v4.js",
    "static-preview/forge-aura/cartera/cartera-module-v5.js",
    "static-preview/forge-aura/cartera/cartera-semantic-v1.js",
    "static-preview/forge-aura/cartera/cartera-semantic-012.css",
    "static-preview/forge-aura/cartera/cartera-date-v1.js",
    "static-preview/forge-aura/cartera/cartera-adapter-pages-v2.js",
    "static-preview/forge-aura/cartera/cartera-adapter-pages-v3.js",
    "static-preview/forge-aura/cartera/cartera-adapter-pages-v4.js",
    "static-preview/forge-aura/cartera/cartera-adapter-pages-v5.js",
    "static-preview/forge-aura/cartera/cartera-adapter-pages-v6.js",
    "static-preview/forge-aura/cartera/cartera-adapter-pages-v7.js",
    "static-preview/forge-aura/cartera/cartera-adapter-pages-v8.js",
    "static-preview/forge-aura/cartera/cartera-adapter-pages-v9.js",
    "static-preview/forge-aura/cartera/cartera-adapter-pages-v10.js",
  ]) assert.equal(exists(relative), true, `Missing current Cartera asset: ${relative}`);

  const app = read("static-preview/forge-aura/app-v4-r1.js");
  const index = read("static-preview/forge-aura/index.html");
  const bootstrap = read("static-preview/forge-aura/aura-bootstrap-v4-r1.js");
  const moduleV5 = read("static-preview/forge-aura/cartera/cartera-module-v5.js");
  const semantic = read("static-preview/forge-aura/cartera/cartera-semantic-v1.js");
  const dateV1 = read("static-preview/forge-aura/cartera/cartera-date-v1.js");
  const v2 = read("static-preview/forge-aura/cartera/cartera-adapter-pages-v2.js");
  const v3 = read("static-preview/forge-aura/cartera/cartera-adapter-pages-v3.js");
  const v4 = read("static-preview/forge-aura/cartera/cartera-adapter-pages-v4.js");
  const v5 = read("static-preview/forge-aura/cartera/cartera-adapter-pages-v5.js");
  const v6 = read("static-preview/forge-aura/cartera/cartera-adapter-pages-v6.js");
  const v7 = read("static-preview/forge-aura/cartera/cartera-adapter-pages-v7.js");
  const v8 = read("static-preview/forge-aura/cartera/cartera-adapter-pages-v8.js");
  const v9 = read("static-preview/forge-aura/cartera/cartera-adapter-pages-v9.js");
  const v10 = read("static-preview/forge-aura/cartera/cartera-adapter-pages-v10.js");

  assert.match(app, /cartera-module-v4\.js\?v=cartera-pdf-semantic-reconciliation-012/);
  assert.match(index, /"\.\/cartera\/cartera-adapter-pages-v9\.js\?v=cartera-pdf-ingress-legacy-refresh": "\.\/cartera\/cartera-adapter-pages-v10\.js\?v=cartera-020c-policy-attach-pipeline-person-015"/);
  assert.match(index, /"\.\/cartera\/cartera-module-v4\.js\?v=cartera-pdf-semantic-reconciliation-012": "\.\/cartera\/cartera-module-v5\.js\?v=cartera-020c-policy-attach-pipeline-person-015"/);
  assert.match(index, /aura-bootstrap-v4-r1\.js\?v=cartera-020c-policy-attach-pipeline-person-015-auth-premium-entry-001/);
  assert.match(bootstrap, /app-v4-r1\.js\?v=aura-boot-cache-isolation-013/);
  assert.match(moduleV5, /createSemanticCarteraAdapter/);
  assert.match(moduleV5, /cartera-adapter-pages-v9/);
  assert.match(moduleV5, /addEventListener\('drop', onDropCapture, true\)/);
  assert.match(v10, /cartera-adapter-pages-v9/);
  assert.match(v10, /forge_cartera020c_attach_policy_confirmation_durable/);
  assert.match(v9, /cartera-adapter-pages-v8/);
  assert.match(v9, /forge_cartera020b_refresh_pending_packet_semantics/);
  assert.match(v9, /pdfLegacyPendingSemanticRefresh:\s*true/);
  assert.match(v8, /cartera-adapter-pages-v7\.js\?base=cartera-pdf-semantic-completion-014/);
  assert.match(v8, /forge_cartera020b_record_processing_result/);
  assert.match(v8, /pdfSemanticCompletion014:\s*true/);
  assert.match(v7, /cartera-adapter-pages-v6\.js\?base=cartera-pdf-already-admitted-reopen-011/);
  assert.match(v7, /cartera020b_policy_evidence_packets/);
  assert.match(v7, /PENDING_CONFIRMATION/);
  assert.match(v7, /resumedExistingReview:\s*true/);
  assert.match(semantic, /normalizeCivilDate/);
  assert.match(semantic, /coverageSectionDetected/);
  assert.match(semantic, /reviewCompleteness/);
  assert.match(dateV1, /AGO:\s*8/);
  assert.match(dateV1, /normalizePolicyDate/);
  assert.match(v6, /data:\s*sanitizePdfPayload\(result\.data\)/);
  assert.match(v6, /sanitizePdfPayloadDates/);
  assert.match(v6, /cartera-adapter-pages-v5\.js\?base=aura-cartera-invalid-time-value-root-009/);
  assert.match(v5, /cartera-adapter-pages-v4\.js\?base=aura-cartera-invalid-date-review-007/);
  assert.match(v4, /cartera-adapter-pages-v3\.js\?base=aura-cartera-result-state-machine-006/);
  assert.match(v3, /cartera-adapter-pages-v2\.js\?base=aura-cartera-pdf-idempotency-004/);
  assert.match(v2, /client\.functions\.invoke\(PDF_FUNCTION_NAME, \{ body \}\)/);
  assert.doesNotMatch(v2, /Authorization:\s*`Bearer/);
});

test("Income Pages mirrors are byte-identical to governed source modules", () => {
  const pairs = [
    ["docs/static-preview/forge-aura/income/income-core.mjs", "static-preview/forge-aura/income/income-core.js"],
    ["docs/static-preview/forge-aura/income/income-adapter-pages-v1.mjs", "static-preview/forge-aura/income/income-adapter-pages-v1.js"],
    ["docs/static-preview/forge-aura/income/income-module.mjs", "static-preview/forge-aura/income/income-module.js"],
  ];
  for (const [source, mirror] of pairs) assert.equal(fs.readFileSync(path.resolve(source), "utf8"), read(mirror), `Pages mirror drift: ${mirror}`);
});

test("Income artifact has no Material3 visual dependency, direct productive writer or invented money formula", () => {
  const files = [
    read("static-preview/forge-aura/income/income-core.js"),
    read("static-preview/forge-aura/income/income-adapter-pages-v1.js"),
    read("static-preview/forge-aura/income/income-module.js"),
    read("static-preview/forge-aura/income/income.css"),
  ].join("\n");
  assert.doesNotMatch(files, /forge-alive-material3|material3|md3/i);
  assert.doesNotMatch(files, /\.insert\(|\.update\(|\.upsert\(|\.delete\(/);
  assert.doesNotMatch(files, /hardcodedRate|probability\s*\*|commissionRate\s*=|commission_rate\s*=|premium\s*\*\s*(?:rate|commission)/i);
  assert.match(files, /frontendCommissionRateCalculation:\s*false/);
  assert.match(files, /pipelineProbabilityWeighting:\s*false/);
});