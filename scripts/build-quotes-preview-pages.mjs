import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const siteDir = "_site";
const buildSha = process.env.GITHUB_SHA || "local-preview";

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
  ".map",
  ".png",
  ".svg",
  ".txt",
  ".webmanifest",
  ".webp",
]);

const publicRootFiles = new Set([".nojekyll", "_redirects", "manifest.json"]);
const publicConversationRuntimeFiles = new Set([
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

const publicFiles = trackedFiles.filter(isPublicFile);
for (const file of publicFiles) {
  const publicPath = file.startsWith("docs/")
    ? file.slice("docs/".length)
    : file;
  const target = path.join(siteDir, publicPath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(file, target);
}

const legacyForgeAlivePublished = path.join(
  siteDir,
  "static-preview",
  "forge-alive",
);
const legacyForgeAliveRuntimeTarget = path.join(
  siteDir,
  "static-preview",
  "forge-alive-runtime",
);
if (!fs.existsSync(legacyForgeAlivePublished)) {
  throw new Error("legacy Forge Alive public runtime was not prepared");
}
fs.rmSync(legacyForgeAliveRuntimeTarget, { recursive: true, force: true });
fs.cpSync(legacyForgeAlivePublished, legacyForgeAliveRuntimeTarget, {
  recursive: true,
});

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
  "static-preview/forge-alive/index-quote-calculator-parity.html",
  "static-preview/forge-alive/quote-runtime-pages-rate-fetch-bridge-m05e010.js",
  "static-preview/forge-alive/quote-runtime-vida-mujer-visual-m05e010.js",
  "static-preview/forge-alive-runtime/nueva-cotizacion/index.html",
  "env.js",
  "build-info.json",
];
for (const file of required) {
  if (!fs.existsSync(path.join(siteDir, file))) {
    throw new Error(`Missing Pages preview artifact: ${file}`);
  }
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

console.log(`PAGES_PREVIEW_ARTIFACT=PASS files=${publicFiles.length + 2}`);
console.log(`PAGES_PREVIEW_SHA=${buildSha}`);
