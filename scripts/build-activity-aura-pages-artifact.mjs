import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = resolve(repositoryRoot, process.argv[2] || "_site");
const buildSha = process.env.BUILD_SHA || process.env.GITHUB_SHA || "LOCAL_UNCOMMITTED";

const sources = Object.freeze([
  "platform/event-evidence/canonical-activity-event-contract.js",
  "platform/event-evidence/activity-ledger-contract.js",
  "platform/event-evidence/activity-ledger-local-store.js",
  "platform/event-evidence/activity-ledger-sync-service.js",
  "platform/event-evidence/activity-ledger-supabase-gateway.js",
  "platform/event-evidence/activity-ledger-browser-runtime.js",
  "platform/operational-calendar/operational-calendar-contract.js",
  "platform/operational-calendar/eligible-date-evaluator.js",
  "platform/operational-calendar/operational-calendar-repository.js",
  "platform/productivity/activity-conversion-read-model.js",
  "platform/productivity/activity-points-authority-adapter.mjs",
  "platform/productivity/activity-coaching-policy.js",
  "platform/productivity/activity-coaching-intelligence.js",
  "platform/productivity/policies/FORGE_ACTIVITY_COACHING_POLICY_V1.json",
  "advisor-os/reporting/domain/activity-event-authority-mapping.mjs",
  "advisor-os/reporting/infrastructure/fes-activity-report-source-adapter.mjs",
  "advisor-os/reporting/runtime/activity-reporting-runtime.mjs",
  "advisor-os/reporting/application/activity-chart-ready-projection.mjs",
  "docs/static-preview/forge-alive-material3/activity-ledger-reporting-bridge.mjs",
  "docs/static-preview/forge-aura/activity/activity-runtime-adapter.js",
  "docs/static-preview/forge-aura/activity/activity-calendar-controller.js",
  "docs/static-preview/forge-aura/activity/activity-metrics-adapter.js",
  "daily-points-engine.js",
]);

const sha256 = (content) => createHash("sha256").update(content).digest("hex");

async function fileDigest(path) {
  const content = await readFile(resolve(repositoryRoot, path));
  return sha256(content);
}

async function copyRequired(source, destination) {
  const absoluteSource = resolve(repositoryRoot, source);
  const absoluteDestination = resolve(outputRoot, destination);
  await mkdir(dirname(absoluteDestination), { recursive: true });
  await cp(absoluteSource, absoluteDestination, { recursive: true, force: true });
}

async function listFiles(root) {
  const output = [];
  async function visit(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const selected = join(directory, entry.name);
      if (entry.isDirectory()) await visit(selected);
      else if (entry.isFile()) output.push(relative(root, selected).replaceAll("\\", "/"));
    }
  }
  await visit(root);
  return output.sort();
}

await rm(outputRoot, { recursive: true, force: true });
await copyRequired("docs", ".");
await copyRequired("platform", "platform");
await copyRequired("advisor-os/reporting", "advisor-os/reporting");
await copyRequired("daily-points-engine.js", "daily-points-engine.js");
await writeFile(join(outputRoot, ".nojekyll"), "");

const sourceDigests = Object.fromEntries(
  await Promise.all(sources.map(async (path) => [path, await fileDigest(path)])),
);
const publishedFiles = await listFiles(outputRoot);
const manifest = {
  schemaVersion: "forge.activity-aura-pages-authority-manifest.v1",
  artifact: "activity-aura-live-acceptance",
  buildSha,
  generatedAt: new Date().toISOString(),
  generationCommand: "node scripts/build-activity-aura-pages-artifact.mjs _site",
  sourceDigests,
  outputFileCount: publishedFiles.length,
  businessRulesManuallyCopied: false,
  authorities: {
    activityFacts: "FES-01.2",
    operationalCalendar: "forge.operational_calendar.v1",
    productivityConversions: "forge.productivity.activity_conversion.v1",
    points: "ACTIVITY_POINTS_AUTHORITY_ADAPTER_V1",
    reporting: "productive-activity-reporting-bridge.v1",
  },
};

await writeFile(
  join(outputRoot, "activity-authority-manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);
await writeFile(
  join(outputRoot, "activity-live-build-info.json"),
  `${JSON.stringify({
    commitSha: buildSha,
    artifact: manifest.artifact,
    calendarMigration: "20260805000100",
    manifestSha256: sha256(JSON.stringify(manifest)),
  }, null, 2)}\n`,
);

console.log(`ACTIVITY_AURA_PAGES_ARTIFACT=PASS`);
console.log(`ACTIVITY_AURA_PAGES_OUTPUT=${outputRoot}`);
console.log(`ACTIVITY_AURA_PAGES_FILE_COUNT=${publishedFiles.length}`);
