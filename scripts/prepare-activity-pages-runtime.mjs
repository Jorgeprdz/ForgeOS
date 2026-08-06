import {
  copyFile,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { dirname, join, relative } from "node:path";

const root = process.cwd();
const revision = "activity-pages-runtime-fix-004";

const exactFiles = Object.freeze([
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
  "platform/productivity/activity-coaching-policy.js",
  "platform/productivity/activity-coaching-intelligence.js",
  "platform/productivity/activity-points-authority-adapter.mjs",
  "platform/productivity/policies/FORGE_ACTIVITY_COACHING_POLICY_V1.json",
]);

async function listFiles(directory, predicate, prefix = "") {
  const entries = await readdir(directory, { withFileTypes: true });
  const selected = [];
  for (const entry of entries) {
    const path = prefix ? join(prefix, entry.name) : entry.name;
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) {
      selected.push(...await listFiles(absolute, predicate, path));
    } else if (predicate(path)) {
      selected.push(path);
    }
  }
  return selected.sort();
}

async function copyExact(sourceName) {
  const source = join(root, sourceName);
  const target = join(root, "docs", sourceName);
  await mkdir(dirname(target), { recursive: true });
  await copyFile(source, target);
}

function publicReportingPath(file) {
  return file.replace(/\.mjs$/u, ".js");
}

function transformReportingModule(source) {
  return source.replace(/\.mjs(?=["'])/gu, ".js");
}

async function patchFile(fileName, transform) {
  const path = join(root, fileName);
  const source = await readFile(path, "utf8");
  const target = transform(source);
  if (target === source) {
    console.log(`UNCHANGED=${fileName}`);
    return;
  }
  await writeFile(path, target);
  console.log(`PATCHED=${fileName}`);
}

for (const file of exactFiles) {
  await copyExact(file);
}
await copyFile(
  join(root, "daily-points-engine.js"),
  join(root, "docs/daily-points-engine.js"),
);

const reportingSource = join(root, "advisor-os/reporting");
const reportingTarget = join(root, "docs/advisor-os/reporting");
await rm(reportingTarget, { recursive: true, force: true });
const reportingFiles = await listFiles(reportingSource, (file) => file.endsWith(".mjs"));
if (reportingFiles.length < 19) {
  throw new Error(`ACTIVITY_PAGES_REPORTING_RUNTIME_INCOMPLETE=${reportingFiles.length}`);
}
for (const file of reportingFiles) {
  const sourcePath = join(reportingSource, file);
  const targetPath = join(reportingTarget, publicReportingPath(file));
  const source = await readFile(sourcePath, "utf8");
  const transformed = transformReportingModule(source);
  if (/(?:from\s+|import\(\s*)["'][^"']+\.mjs["']/u.test(transformed)) {
    throw new Error(`ACTIVITY_PAGES_REPORTING_IMPORT_NOT_TRANSFORMED=${file}`);
  }
  await mkdir(dirname(targetPath), { recursive: true });
  await writeFile(targetPath, transformed);
}

await patchFile("docs/static-preview/forge-aura/auth-v4.html", (source) => source
  .replaceAll("../../../platform/", "../../platform/")
  .replace(
    /<script type="importmap">[^<]+<\/script>/u,
    '<script type="importmap" data-activity-reporting-crypto-import-map>{"imports":{"node:crypto":"../forge-alive-material3/node-crypto-shim.mjs?v=rep-16e-001","./pipeline/pipeline-adapter.js":"./pipeline/pipeline-adapter-pages-v1.js"}}</script>',
  )
  .replace(/\.\/aura-bootstrap-v4\.js\?v=[^"']+/u, `./aura-bootstrap-v4.js?v=${revision}`));

await patchFile("docs/static-preview/forge-aura/app-v4.js", (source) => source
  .replace(/\.\/activity\/activity-module\.js\?v=[^"']+/u, `./activity/activity-module.js?v=${revision}`));

await patchFile("docs/static-preview/forge-aura/activity/activity-module.js", (source) => source
  .replaceAll("../../../../platform/", "../../../platform/")
  .replace(/\.\/activity-runtime-adapter\.js(?:\?v=[^"']+)?/u, `./activity-runtime-adapter.js?v=${revision}`));

await patchFile("docs/static-preview/forge-aura/activity/activity-runtime-adapter.js", (source) => source
  .replaceAll("../../../../platform/", "../../../platform/")
  .replace(
    /\.\.\/\.\.\/forge-alive-material3\/activity-ledger-reporting-bridge\.mjs/u,
    "../../forge-alive-material3/activity-ledger-reporting-bridge.js",
  ));

const bridgeSourcePath = join(
  root,
  "docs/static-preview/forge-alive-material3/activity-ledger-reporting-bridge.mjs",
);
const bridgeTargetPath = join(
  root,
  "docs/static-preview/forge-alive-material3/activity-ledger-reporting-bridge.js",
);
const bridgeSource = await readFile(bridgeSourcePath, "utf8");
const bridgeTarget = bridgeSource
  .replaceAll("../../../advisor-os/reporting/", "../../advisor-os/reporting/")
  .replace(/(\.\.\/\.\.\/advisor-os\/reporting\/[^"']+)\.mjs/gu, "$1.js");
if (/advisor-os\/reporting\/[^"']+\.mjs/u.test(bridgeTarget)) {
  throw new Error("ACTIVITY_PAGES_BRIDGE_REPORTING_SPECIFIER_INVALID");
}
await writeFile(bridgeTargetPath, bridgeTarget);

await writeFile(
  join(root, "docs/static-preview/forge-aura/aura-bootstrap-v4.js"),
  `function hasProductiveConfig() {
  const env = globalThis.__ENV__;
  return Boolean(env?.SUPABASE_URL && (env?.SUPABASE_KEY || env?.SUPABASE_ANON_KEY));
}
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}
function renderFatalBoot(error) {
  const root = document.querySelector("[data-aura-app]");
  const diagnostic = [error?.name, error?.message].filter(Boolean).join(" · ") || "Error desconocido";
  document.documentElement.dataset.auraBootState = "BOOT_FAILED_VISIBLE";
  if (!root) return;
  root.setAttribute("aria-busy", "false");
  root.innerHTML = \`<main style="min-height:100vh;display:grid;place-items:center;padding:24px;background:#f4f5fb;font-family:system-ui,sans-serif"><section style="max-width:680px;padding:28px;border:1px solid #d9dce8;border-radius:24px;background:#fff"><p style="font-weight:800;color:#6d7285">Forge · diagnóstico de arranque</p><h1>No se pudo iniciar Aura</h1><p>La publicación cargó, pero una dependencia falló. El error ya no queda oculto en una pantalla blanca.</p><code>\${escapeHtml(diagnostic)}</code></section></main>\`;
}
document.documentElement.dataset.auraEnvState = hasProductiveConfig() ? "PRODUCTIVE_CONFIG_READY" : "PRODUCTIVE_CONFIG_BLOCKED";
try {
  await import("./app-v4.js?v=${revision}");
  document.documentElement.dataset.auraBootState = "BOOT_READY";
} catch (error) {
  console.error("FORGE_AURA_BOOT_FAILED", error);
  renderFatalBoot(error);
}
`,
);

const required = [
  "docs/platform/event-evidence/activity-ledger-browser-runtime.js",
  "docs/platform/operational-calendar/operational-calendar-contract.js",
  "docs/platform/productivity/activity-points-authority-adapter.mjs",
  "docs/advisor-os/reporting/infrastructure/fes-activity-report-source-adapter.js",
  "docs/advisor-os/reporting/runtime/activity-reporting-runtime.js",
  "docs/static-preview/forge-alive-material3/activity-ledger-reporting-bridge.js",
  "docs/static-preview/forge-alive-material3/node-crypto-shim.mjs",
];
for (const file of required) {
  const content = await readFile(join(root, file));
  if (!content.length) throw new Error(`ACTIVITY_PAGES_REQUIRED_FILE_EMPTY=${file}`);
}

const authEntry = await readFile(
  join(root, "docs/static-preview/forge-aura/auth-v4.html"),
  "utf8",
);
if (!authEntry.includes('"node:crypto":"../forge-alive-material3/node-crypto-shim.mjs?v=rep-16e-001"')) {
  throw new Error("ACTIVITY_PAGES_CRYPTO_IMPORT_MAP_MISSING");
}

console.log(`ACTIVITY_PAGES_RUNTIME_PREPARED=${revision}`);
console.log(`ACTIVITY_PAGES_REPORTING_MODULES=${reportingFiles.length}`);
console.log("ACTIVITY_PAGES_BROWSER_CRYPTO_AUTHORITY=PASS");
console.log(`ACTIVITY_PAGES_OUTPUT=${relative(root, join(root, "docs"))}`);
