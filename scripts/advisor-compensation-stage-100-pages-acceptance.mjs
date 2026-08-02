import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const source = join(root, "docs/static-preview/forge-alive-material3");
const artifact = join(root, "artifacts/advisor-compensation-stage-100/pages/static-preview/forge-alive");
rmSync(join(root, "artifacts/advisor-compensation-stage-100/pages"), {
  recursive: true,
  force: true,
});
mkdirSync(artifact, { recursive: true });
cpSync(source, artifact, { recursive: true });

const required = [
  "index.html",
  "app.js",
  "forge-shell.js",
  "forge-navigation-contract.js",
  "legacy-ui-retirement.js",
  "compensation-route-bootstrap-100b.js",
  "compensation-module-distribution-100.js",
  "compensation-runtime-distribution-100.js",
];
for (const file of required) {
  assert.equal(existsSync(join(artifact, file)), true, `PAGES_COMPENSATION_ASSET_MISSING:${file}`);
}

const read = (file) => readFileSync(join(artifact, file), "utf8");
const retirement = read("legacy-ui-retirement.js");
const bootstrap = read("compensation-route-bootstrap-100b.js");
const module = read("compensation-module-distribution-100.js");
const runtime = read("compensation-runtime-distribution-100.js");
const navigation = read("forge-navigation-contract.js");

assert.match(retirement, /compensation-route-bootstrap-100b/);
assert.match(bootstrap, /compensation-module-distribution-100/);
assert.match(bootstrap, /compensation-runtime-distribution-100/);
assert.match(bootstrap, /registerRouteModule\("comisiones"/);
assert.match(navigation, /routeId:\s*"comisiones"/);
assert.match(navigation, /target:\s*"\?nav=comisiones"/);
assert.match(module, /late-result-rejected/);
assert.match(module, /root\.dataset\.compensationState/);
assert.match(runtime, /data-compensation-state/);
assert.match(runtime, /ADVISOR_COMPENSATION_PAGES_DISTRIBUTION_100/);
assert.match(runtime, /unknownIsNotZero:\s*true/);
assert.match(runtime, /calculationEngineIncluded:\s*false/);
assert.doesNotMatch(runtime, /calculateAdvisorCommission|advisor-commission-engine|rule-pack\.json/);
assert.doesNotMatch(runtime, /\.\.\/\.\.\/\.\.\/advisor-os\/compensation/);

for (const file of required.filter((item) => item.endsWith(".js"))) {
  execFileSync(process.execPath, ["--check", join(artifact, file)], {
    cwd: root,
    stdio: "pipe",
  });
}

const imported = await import(
  `${pathToFileURL(join(artifact, "compensation-runtime-distribution-100.js")).href}?acceptance=${Date.now()}`
);
assert.equal(imported.ADVISOR_COMPENSATION_DISTRIBUTION_CONTRACT.readOnly, true);
assert.equal(imported.ADVISOR_COMPENSATION_DISTRIBUTION_CONTRACT.calculationEngineIncluded, false);
assert.equal(imported.ADVISOR_COMPENSATION_DISTRIBUTION_CONTRACT.payoutMutationIncluded, false);

const report = {
  contractVersion: "ADVISOR_COMPENSATION_STAGE_100_PAGES_ACCEPTANCE_001",
  generatedAt: new Date().toISOString(),
  artifactPath: "artifacts/advisor-compensation-stage-100/pages/static-preview/forge-alive",
  requiredAssets: required,
  publicRoute: "?nav=comisiones",
  provider: "ADVISOR_COMPENSATION_SUPABASE_PROVIDER_100",
  readOnly: true,
  calculationEnginePublished: false,
  payoutMutationPublished: false,
  status: "PASS",
};
writeFileSync(
  join(root, "artifacts/advisor-compensation-stage-100/pages-acceptance.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);

console.log(`PAGES_REQUIRED_ASSETS=${required.length}`);
console.log("PAGES_ARTIFACT_ACCEPTANCE=PASS");
console.log("PUBLIC_ROUTE=?nav=comisiones");
console.log("REMOTE_DATA_AUTHORITY=READ_ONLY");
