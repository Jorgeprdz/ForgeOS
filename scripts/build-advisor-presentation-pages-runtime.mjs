import { execFileSync } from "node:child_process";
import {
  access,
  copyFile,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
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

const carteraPagesEntrypoints = Object.freeze([
  "supabase-runtime.js",
  "memory-manager.js",
  "state-manager.js",
  "cartera.js",
  "advisor-os/cartera/cartera-030d-policy-payment-calendar-enhancement.js",
  "advisor-os/cartera/cartera-040d-relationship-memory-enhancement.js",
  "advisor-os/cartera/cartera-050d-future-radar-enhancement.js",
  "advisor-os/cartera/cartera-060d-relationship-growth-enhancement.js",
  "advisor-os/cartera/cartera-070d-relational-activation-enhancement.js",
  "advisor-os/cartera/cartera-080d-economic-connection-enhancement.js",
  "advisor-os/cartera/cartera-090d-relationship-capital-enhancement.js",
  "advisor-os/cartera/cartera-100d-productivity-proof-enhancement.js",
]);

const pagesRuntimeMode =
  process.env.FORGE_PAGES_RUNTIME_MODE === "pages"
  || process.env.GITHUB_WORKFLOW === "Deploy ForgeOS to GitHub Pages";

const carteraPagesRuntimeMode =
  process.env.FORGE_CARTERA_PAGES_RUNTIME_MODE === "pages"
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

function publicReportingPath(file) {
  if (!file.endsWith(".mjs")) {
    throw new Error(`REP_16F_REPORTING_EXTENSION_INVALID=${file}`);
  }
  return `${file.slice(0, -4)}.js`;
}

function transformReportingModule(source) {
  return source.replace(/\.mjs(?=["'])/g, ".js");
}

async function writeReportingModule(sourcePath, targetPath) {
  const source = await readFile(sourcePath, "utf8");
  const transformed = transformReportingModule(source);
  if (
    /(?:from\s+|import\(\s*)["'][^"']+\.mjs["']/.test(transformed)
  ) {
    throw new Error(
      `REP_16F_REPORTING_IMPORT_NOT_TRANSFORMED=${relative(root, sourcePath)}`,
    );
  }
  await mkdir(dirname(targetPath), { recursive: true });
  await writeFile(targetPath, transformed);
  const generated = await readFile(targetPath, "utf8");
  if (generated !== transformed) {
    throw new Error(
      `REP_16F_REPORTING_TRANSFORM_MISMATCH=${relative(root, targetPath)}`,
    );
  }
}

function toPosixPath(value) {
  return value.split(sep).join("/");
}

function extractLocalModuleSpecifiers(source) {
  const specifiers = new Set();
  const patterns = [
    /\b(?:import|export)\s+(?:[^;"']*?\s+from\s+)?["']([^"']+)["']/gs,
    /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g,
  ];

  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      if (match[1]?.startsWith(".")) specifiers.add(match[1]);
    }
  }
  return [...specifiers];
}

async function resolveLocalModule(importer, specifier) {
  const importerDirectory = dirname(join(root, importer));
  const unresolved = resolve(importerDirectory, specifier);
  const candidates = specifier.endsWith(".js")
    ? [unresolved]
    : [unresolved, `${unresolved}.js`, join(unresolved, "index.js")];

  for (const candidate of candidates) {
    try {
      await access(candidate);
      const repositoryPath = toPosixPath(relative(root, candidate));
      if (
        repositoryPath === ".."
        || repositoryPath.startsWith("../")
        || repositoryPath.startsWith("docs/")
      ) {
        throw new Error(
          `CARTERA_PAGES_RUNTIME_IMPORT_OUTSIDE_SOURCE=${importer}:${specifier}`,
        );
      }
      if (!repositoryPath.endsWith(".js")) {
        throw new Error(
          `CARTERA_PAGES_RUNTIME_NON_JS_IMPORT=${importer}:${specifier}`,
        );
      }
      return repositoryPath;
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  }

  throw new Error(
    `CARTERA_PAGES_RUNTIME_IMPORT_MISSING=${importer}:${specifier}`,
  );
}

async function collectCarteraPagesRuntime() {
  const pending = [...carteraPagesEntrypoints];
  const collected = new Set();

  while (pending.length > 0) {
    const current = pending.pop();
    if (collected.has(current)) continue;
    const sourcePath = join(root, current);
    const source = await readFile(sourcePath, "utf8");
    collected.add(current);

    for (const specifier of extractLocalModuleSpecifiers(source)) {
      const dependency = await resolveLocalModule(current, specifier);
      if (!collected.has(dependency)) pending.push(dependency);
    }
  }

  return [...collected].sort();
}

async function generateCarteraPagesRuntime() {
  const runtimeFiles = await collectCarteraPagesRuntime();
  const generatedPaths = [];

  for (const file of runtimeFiles) {
    const target = join(root, "docs", file);
    await copyExact(join(root, file), target);
    generatedPaths.push(relative(root, target));
  }

  const manifestPath = join(root, "docs/cartera-pages-runtime-manifest.json");
  await writeFile(
    manifestPath,
    `${JSON.stringify({
      contractId: "CARTERA_PAGES_RUNTIME_ASSET_CLOSURE_V1",
      entrypoints: carteraPagesEntrypoints,
      files: runtimeFiles,
    }, null, 2)}\n`,
  );
  generatedPaths.push(relative(root, manifestPath));

  execFileSync(
    "git",
    ["add", "-f", "--", ...generatedPaths],
    { cwd: root, stdio: "inherit" },
  );

  for (const file of carteraPagesEntrypoints) {
    const generated = join(root, "docs", file);
    await access(generated);
  }

  console.log(
    `Generated ${runtimeFiles.length} Cartera dependency-closed Pages runtime modules.`,
  );
  return runtimeFiles;
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
  const smartWidgetSource = join(
    root,
    "advisor-os/forge-alive/smart-widgets",
  );
  const smartWidgetTarget = join(
    root,
    "docs/advisor-os/forge-alive/smart-widgets",
  );
  const eventEvidenceSource = join(root, "platform/event-evidence");
  const eventEvidenceTarget = join(root, "docs/platform/event-evidence");
  const bridgePath = join(
    root,
    "docs/static-preview/forge-alive-material3/activity-ledger-reporting-bridge.mjs",
  );

  await Promise.all([
    rm(reportingTarget, { recursive: true, force: true }),
    rm(smartWidgetTarget, { recursive: true, force: true }),
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
    await writeReportingModule(
      join(reportingSource, file),
      join(reportingTarget, publicReportingPath(file)),
    );
  }

  const smartWidgetFiles = await listFiles(
    smartWidgetSource,
    (file) => file.endsWith(".mjs"),
  );
  if (smartWidgetFiles.length < 5) {
    throw new Error(
      `SMART_WIDGET_PAGES_RUNTIME_INCOMPLETE=${smartWidgetFiles.length}`,
    );
  }
  for (const file of smartWidgetFiles) {
    await writeReportingModule(
      join(smartWidgetSource, file),
      join(smartWidgetTarget, publicReportingPath(file)),
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
  const sourceReportingSpecifierCount = (
    bridgeSource.match(
      /\.\.\/\.\.\/\.\.\/advisor-os\/reporting\/[^"']+\.mjs/g,
    ) || []
  ).length;
  if (sourcePrefixCount !== 2 || sourceReportingSpecifierCount !== 2) {
    throw new Error(
      `REP_16F_ACTIVITY_BRIDGE_SOURCE_SPECIFIERS=${sourcePrefixCount}:${sourceReportingSpecifierCount}`,
    );
  }
  const deployedBridge = bridgeSource
    .replaceAll(sourcePrefix, deployedPrefix)
    .replace(
      /(\.\.\/\.\.\/advisor-os\/reporting\/[^"']+)\.mjs/g,
      "$1.js",
    );
  if (
    deployedBridge.includes(sourcePrefix)
    || /advisor-os\/reporting\/[^"']+\.mjs/.test(deployedBridge)
  ) {
    throw new Error("REP_16F_ACTIVITY_BRIDGE_DEPLOYED_SPECIFIER_INVALID");
  }
  await writeFile(bridgePath, deployedBridge);

  execFileSync(
    "git",
    [
      "add",
      "-f",
      "--",
      relative(root, reportingTarget),
      relative(root, smartWidgetTarget),
      relative(root, eventEvidenceTarget),
      relative(root, bridgePath),
    ],
    { cwd: root, stdio: "inherit" },
  );

  await import(
    `${pathToFileURL(bridgePath).href}?rep16f-pages-build=${Date.now()}`
  );
  await import(
    `${pathToFileURL(join(
      smartWidgetTarget,
      "productive-smart-widget-orchestrator.js",
    )).href}?smart-widget-pages-build=${Date.now()}`
  );

  const carteraRuntimeFiles = carteraPagesRuntimeMode
    ? await generateCarteraPagesRuntime()
    : [];

  console.log(
    `Generated ${reportingFiles.length} reporting .js modules, ${smartWidgetFiles.length} Smart Widget .js modules, ${activityLedgerRuntimeFiles.length} FES ledger modules and ${carteraRuntimeFiles.length} Cartera modules for Pages.`,
  );
}

console.log(`Generated ${files.length} Advisor OS Pages runtime modules.`);
