import { execFileSync } from "node:child_process";
import {
  copyFile,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { basename, dirname, join, relative } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const sourceDir = join(root, "advisor-os/presentation/browser");
const targetDir = join(
  root,
  "docs/static-preview/advisor-presentation-runtime",
);
const files = [
  "forge-sales-presentation-browser-context-adapter.js",
  "forge-sales-presentation-editable-preview.js",
  "forge-sales-presentation-export-adapter.js",
  "forge-sales-presentation-human-approval-gate.js",
  "forge-sales-presentation-prompt-builder.js",
  "forge-sales-presentation-review-packet-builder.js",
  "forge-sales-presentation-review-state-store.js",
  "forge-sales-presentation-slide-plan-generator.js",
];

const activityLedgerRuntimeFiles = Object.freeze([
  "canonical-activity-event-contract.js",
  "activity-ledger-contract.js",
  "activity-ledger-local-store.js",
  "activity-ledger-sync-service.js",
  "activity-ledger-supabase-gateway.js",
  "activity-ledger-browser-runtime.js",
]);

const pagesRuntimeMode =
  process.env.FORGE_PAGES_RUNTIME_MODE === "pages"
  || process.env.GITHUB_WORKFLOW === "Deploy ForgeOS to GitHub Pages";

async function listFiles(directory, predicate, prefix = "") {
  const entries = await readdir(directory, { withFileTypes: true });
  const selected = [];
  for (const entry of entries) {
    const relativePath = prefix ? join(prefix, entry.name) : entry.name;
    const absolutePath = join(directory, entry.name);
    if (entry.isDirectory()) {
      selected.push(...await listFiles(absolutePath, predicate, relativePath));
    } else if (predicate(relativePath)) {
      selected.push(relativePath);
    }
  }
  return selected.sort();
}

async function copyExact(source, target) {
  await mkdir(dirname(target), { recursive: true });
  await copyFile(source, target);
  const [sourceContent, targetContent] = await Promise.all([
    readFile(source),
    readFile(target),
  ]);
  if (!sourceContent.equals(targetContent)) {
    throw new Error(`Generated runtime mismatch: ${relative(root, target)}`);
  }
}

await mkdir(targetDir, { recursive: true });
for (const file of files) {
  await copyExact(join(sourceDir, file), join(targetDir, basename(file)));
}

await writeFile(
  join(targetDir, "GENERATED_FROM_ADVISOR_OS.md"),
  [
    "# Generated Advisor OS Presentation Runtime",
    "",
    "Canonical source: `advisor-os/presentation/browser/`",
    "Generator: `scripts/build-advisor-presentation-pages-runtime.mjs`",
    "Distribution authority: read-only GitHub Pages browser artifact",
    "Writable presentation authority: Advisor OS only",
    "",
  ].join("\n"),
);

if (pagesRuntimeMode) {
  const reportingSource = join(root, "advisor-os/reporting");
  const reportingTarget = join(root, "docs/advisor-os/reporting");
  const eventEvidenceSource = join(root, "platform/event-evidence");
  const eventEvidenceTarget = join(root, "docs/platform/event-evidence");
  const bridgePath = join(
    root,
    "docs/static-preview/forge-alive-material3/activity-ledger-reporting-bridge.mjs",
  );

  await Promise.all([
    rm(reportingTarget, { recursive: true, force: true }),
    rm(eventEvidenceTarget, { recursive: true, force: true }),
  ]);

  const reportingFiles = await listFiles(
    reportingSource,
    (file) => file.endsWith(".mjs"),
  );
  if (reportingFiles.length < 19) {
    throw new Error(
      `REP_16F_REPORTING_RUNTIME_INCOMPLETE=${reportingFiles.length}`,
    );
  }
  for (const file of reportingFiles) {
    await copyExact(
      join(reportingSource, file),
      join(reportingTarget, file),
    );
  }

  for (const file of activityLedgerRuntimeFiles) {
    await copyExact(
      join(eventEvidenceSource, file),
      join(eventEvidenceTarget, file),
    );
  }

  const bridgeSource = await readFile(bridgePath, "utf8");
  const sourcePrefix = "../../../advisor-os/reporting/";
  const deployedPrefix = "../../advisor-os/reporting/";
  const sourcePrefixCount = bridgeSource.split(sourcePrefix).length - 1;
  if (sourcePrefixCount !== 2) {
    throw new Error(
      `REP_16F_ACTIVITY_BRIDGE_SOURCE_PREFIX_COUNT=${sourcePrefixCount}`,
    );
  }
  const deployedBridge = bridgeSource.replaceAll(
    sourcePrefix,
    deployedPrefix,
  );
  await writeFile(bridgePath, deployedBridge);

  execFileSync(
    "git",
    [
      "add",
      "-f",
      "--",
      relative(root, reportingTarget),
      relative(root, eventEvidenceTarget),
      relative(root, bridgePath),
    ],
    { cwd: root, stdio: "inherit" },
  );

  await import(
    `${pathToFileURL(bridgePath).href}?rep16f-pages-build=${Date.now()}`
  );

  console.log(
    `Generated ${reportingFiles.length} reporting modules and ${activityLedgerRuntimeFiles.length} FES ledger modules for Pages.`,
  );
}

console.log(`Generated ${files.length} Advisor OS Pages runtime modules.`);
