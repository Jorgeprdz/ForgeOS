import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const siteDir = "_site";
const buildSha = process.env.GITHUB_SHA || "local-preview";
const segubecaAuthorityAsset =
  "advisor-os/quotes/products/segubeca/segubeca-calculation-authority.js";
const segubecaSourceAuthorityImport =
  "../../../advisor-os/quotes/products/segubeca/segubeca-calculation-authority.js";
const segubecaPublicAuthorityImport =
  "../../advisor-os/quotes/products/segubeca/segubeca-calculation-authority.js";
const sourceAppUrl =
  "./app.js?v=ui-m05x-quote-intake-ready-001&rep=16e-002&segubeca=productive-ui-001";
const publicAppUrl =
  "./app.js?v=ui-m05x-quote-intake-ready-001&rep=16e-002&segubeca=productive-ui-001&layout=progressive-001&print=shared-presence-001";
const sourceSegubecaEntrypointUrl =
  "./segubeca-productive-ui-entrypoint.js?v=segubeca-productive-ui-001";
const publicSegubecaEntrypointUrl =
  "./segubeca-productive-ui-entrypoint.js?v=segubeca-progressive-layout-001";
const sourcePrintableModalImport =
  './quote-runtime-printable-modal-layer-m05w001.js?v=m05w-001';
const publicPrintableModalImport =
  './quote-runtime-printable-modal-layer-m05w001.js?v=m05w-002-shared-presence';

fs.rmSync(siteDir, { recursive: true, force: true });
fs.mkdirSync(siteDir, { recursive: true });

const trackedFiles = execFileSync("git", ["ls-files", "-z"], {
  encoding: "utf8",
})
  .split("\0")
  .filter(Boolean);

const publicExtensions = new Set([
  ".css",
  ".html",
  ".ico",
  ".jpeg",
  ".jpg",
  ".js",
  ".json",
  ".mjs",
  ".map",
  ".png",
  ".svg",
  ".txt",
  ".webmanifest",
  ".webp",
]);
const generatedRuntimeFiles = Object.freeze([
  "docs/static-preview/quote-runtime/gmm-quote-parser-authority.js",
]);

const publicRootFiles = new Set([".nojekyll", "_redirects", "manifest.json"]);
const publicConversationRuntimeFiles = new Set([
  segubecaAuthorityAsset,
  "nash-intent-engine.js",
  "nash-combat-orchestrator.js",
  "nash-next-best-action-engine.js",
  "nash-combat-intelligence-report-engine.js",
  "nash/context-intake/nash-prospect-context-intake-boundary-contract.js",
  "nash/context-intake/nash-prospect-context-intake.js",
  "nash/context-intake/nash-universal-prospect-context-consumer.js",
  "nash/conversation-brief/nash-deterministic-conversation-brief-boundary-contract.js",
  "nash/conversation-brief/nash-provider-request-contract.js",
  "nash/remote-draft-provider-client-boundary.js",
  "nash/pipeline-nash-draft-orchestrator.js",
  "nash/draft-intake/nfast06-draft-safety-boundary.js",
  "nash/draft-intake/nfast06-deterministic-draft-renderer.js",
  "manager-os/nba/nba-reason-why-boundary-contract.js",
  "manager-os/nba/nash-mick-nba-reconnection-engine.js",
]);

function isPublicFile(file) {
  if (file.startsWith(".github/")) return false;
  if (file.startsWith("docs/evidence/")) return false;
  if (file.startsWith("advisor-os/sales-pipeline/")) {
    return publicExtensions.has(path.extname(file).toLowerCase());
  }
  if (publicConversationRuntimeFiles.has(file)) return true;
  if (!file.startsWith("docs/")) return publicRootFiles.has(file);
  if (file.includes("/tests/")) return false;
  if (/(^|\/)([^/]*-)?(master-)?test(s)?\.(js|json)$/i.test(file)) return false;
  if (/\.(pdf|xlsx|zip)$/i.test(file)) return false;
  if (publicRootFiles.has(file)) return true;
  return publicExtensions.has(path.extname(file).toLowerCase());
}

function replaceRequired(source, search, replacement, label) {
  const output = source.replace(search, replacement);
  if (output === source) {
    throw new Error(`Required Pages rewrite missing: ${label}`);
  }
  return output;
}

const publicFiles = trackedFiles.filter(isPublicFile);
for (const file of publicFiles) {
  const publicPath = file.startsWith("docs/")
    ? file.slice("docs/".length)
    : file;
  const target = path.join(siteDir, publicPath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(file, target);
}
for (const file of generatedRuntimeFiles) {
  if (!fs.existsSync(file)) {
    throw new Error(`Generated Pages runtime is missing: ${file}`);
  }
  const target = path.join(siteDir, file.slice("docs/".length));
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(file, target);
}

const cleanForgeAliveSource = path.join(
  "docs",
  "static-preview",
  "forge-alive-material3",
);
const canonicalForgeAliveTarget = path.join(
  siteDir,
  "static-preview",
  "forge-alive",
);
if (!fs.existsSync(cleanForgeAliveSource)) {
  throw new Error("Material 3 Forge Alive source is missing");
}
fs.rmSync(canonicalForgeAliveTarget, { recursive: true, force: true });
fs.mkdirSync(canonicalForgeAliveTarget, { recursive: true });
fs.cpSync(cleanForgeAliveSource, canonicalForgeAliveTarget, {
  recursive: true,
});

const segubecaPublicBindingPath = path.join(
  canonicalForgeAliveTarget,
  "segubeca-productive-ui-binding.js",
);
const segubecaPublicBindingSource = fs.readFileSync(
  segubecaPublicBindingPath,
  "utf8",
);
const segubecaPublicBinding = segubecaPublicBindingSource.replace(
  segubecaSourceAuthorityImport,
  segubecaPublicAuthorityImport,
);
if (segubecaPublicBinding === segubecaPublicBindingSource) {
  throw new Error("SeguBeca public authority import was not rewritten");
}
fs.writeFileSync(segubecaPublicBindingPath, segubecaPublicBinding);

const canonicalIndexPath = path.join(canonicalForgeAliveTarget, "index.html");
let canonicalIndex = fs.readFileSync(canonicalIndexPath, "utf8");
canonicalIndex = replaceRequired(
  canonicalIndex,
  sourceAppUrl,
  publicAppUrl,
  "Material 3 app cache version",
);
canonicalIndex = replaceRequired(
  canonicalIndex,
  sourceSegubecaEntrypointUrl,
  publicSegubecaEntrypointUrl,
  "SeguBeca progressive entrypoint cache version",
);
fs.writeFileSync(canonicalIndexPath, canonicalIndex);

const canonicalAppPath = path.join(canonicalForgeAliveTarget, "app.js");
const canonicalAppSource = fs.readFileSync(canonicalAppPath, "utf8");
const canonicalApp = replaceRequired(
  canonicalAppSource,
  sourcePrintableModalImport,
  publicPrintableModalImport,
  "shared printable presence guard cache version",
);
fs.writeFileSync(canonicalAppPath, canonicalApp);

for (const file of trackedFiles.filter(
  (item) => item.startsWith("docs/") && item.endsWith(".html"),
)) {
  const target = path.join(siteDir, file.slice("docs/".length));
  if (!fs.existsSync(target)) continue;
  const html = fs
    .readFileSync(target, "utf8")
    .replaceAll("__FORGE_BUILD_SHA__", buildSha);
  fs.writeFileSync(target, html);
}

if (!fs.existsSync("env.js")) {
  throw new Error("Generated env.js is missing");
}
fs.copyFileSync("env.js", path.join(siteDir, "env.js"));
fs.writeFileSync(
  path.join(siteDir, "build-info.json"),
  `${JSON.stringify(
    {
      commitSha: buildSha,
      generatedAt: new Date().toISOString(),
      artifact: "forge-pages-quotes-preview",
    },
    null,
    2,
  )}\n`,
);

const required = [
  "static-preview/forge-alive/index.html",
  "static-preview/forge-alive/app.js",
  "static-preview/forge-alive/quotes-module.js",
  "static-preview/forge-alive/quote-runtime-pages-rate-fetch-bridge-m05e010.js",
  "static-preview/forge-alive/quote-runtime-vida-mujer-visual-m05e010.js",
  "static-preview/forge-alive/segubeca-progressive-layout.js",
  "static-preview/forge-alive/quote-runtime-printable-presence-guard-m05w002.js",
  "static-preview/quote-engine/nueva-cotizacion/index.html",
  "static-preview/quote-runtime/gmm-quote-parser-authority.js",
  segubecaAuthorityAsset,
  "env.js",
  "build-info.json",
];
for (const file of required) {
  if (!fs.existsSync(path.join(siteDir, file))) {
    throw new Error(`Missing Pages preview artifact: ${file}`);
  }
}

const builtSegubecaBinding = fs.readFileSync(segubecaPublicBindingPath, "utf8");
if (!builtSegubecaBinding.includes(segubecaPublicAuthorityImport)) {
  throw new Error("SeguBeca public authority import is not project-relative");
}
if (builtSegubecaBinding.includes(segubecaSourceAuthorityImport)) {
  throw new Error("SeguBeca source-layout authority import leaked into Pages");
}

const builtCanonicalIndex = fs.readFileSync(canonicalIndexPath, "utf8");
if (!builtCanonicalIndex.includes(publicAppUrl)) {
  throw new Error("Pages app cache version does not include layout and print gates");
}
if (!builtCanonicalIndex.includes(publicSegubecaEntrypointUrl)) {
  throw new Error("Pages SeguBeca entrypoint cache version is stale");
}
const builtCanonicalApp = fs.readFileSync(canonicalAppPath, "utf8");
if (!builtCanonicalApp.includes(publicPrintableModalImport)) {
  throw new Error("Pages printable presence guard cache version is stale");
}

const forbidden = [];
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(absolute);
      continue;
    }
    const relative = path.relative(siteDir, absolute);
    if (
      /\.(pdf|zip|xlsx)$/i.test(relative)
      || /(^|\/)(golden|goldens)(\/|$)/i.test(relative)
      || /ForgeGemini|Design-Lock/i.test(relative)
    ) {
      forbidden.push(relative);
    }
  }
}
walk(siteDir);
if (forbidden.length > 0) {
  throw new Error(`Private evidence published: ${forbidden.join(", ")}`);
}

console.log(`PAGES_PREVIEW_ARTIFACT=PASS files=${publicFiles.length + generatedRuntimeFiles.length + 2}`);
console.log(`PAGES_PREVIEW_SEGUBECA_AUTHORITY=PASS path=${segubecaAuthorityAsset}`);
console.log(`PAGES_PREVIEW_SEGUBECA_IMPORT=PASS import=${segubecaPublicAuthorityImport}`);
console.log("PAGES_PREVIEW_SEGUBECA_PROGRESSIVE_LAYOUT=PASS");
console.log("PAGES_PREVIEW_SHARED_PRINT_PRESENCE=PASS");
console.log(`PAGES_PREVIEW_SHA=${buildSha}`);
