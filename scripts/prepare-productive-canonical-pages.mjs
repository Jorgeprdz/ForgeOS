import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, cpSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const PRODUCTIVE_INDEX_COMMIT =
  process.env.PRODUCTIVE_INDEX_COMMIT ||
  "5e7974152aee9bbe7256a6396ece42cabe934df9";
const PRODUCTIVE_INDEX_PATH =
  "docs/static-preview/forge-alive/index.html";

const siteDir = process.argv[2] || "_site";
const buildSha = process.argv[3] || process.env.GITHUB_SHA || "local";
const sourceDir = path.join("docs", "static-preview", "forge-alive");
const targetDir = path.join(siteDir, "static-preview", "forge-alive");

if (!existsSync(siteDir)) {
  throw new Error(`PAGES_SITE_DIRECTORY_MISSING:${siteDir}`);
}
if (!existsSync(sourceDir)) {
  throw new Error(`PRODUCTIVE_SOURCE_DIRECTORY_MISSING:${sourceDir}`);
}

rmSync(targetDir, { recursive: true, force: true });
mkdirSync(path.dirname(targetDir), { recursive: true });
cpSync(sourceDir, targetDir, { recursive: true });

const approvedIndex = execFileSync(
  "git",
  ["show", `${PRODUCTIVE_INDEX_COMMIT}:${PRODUCTIVE_INDEX_PATH}`],
  { encoding: "utf8" },
);
writeFileSync(path.join(targetDir, "index.html"), approvedIndex, "utf8");

const replaceableExtensions = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".mjs",
  ".webmanifest",
]);

function visit(directory) {
  for (const entry of readdirSync(directory)) {
    const absolute = path.join(directory, entry);
    const stats = statSync(absolute);
    if (stats.isDirectory()) {
      visit(absolute);
      continue;
    }
    if (!replaceableExtensions.has(path.extname(entry).toLowerCase())) continue;
    const source = readFileSync(absolute, "utf8");
    const prepared = source.replaceAll("__FORGE_BUILD_SHA__", buildSha);
    if (prepared !== source) writeFileSync(absolute, prepared, "utf8");
  }
}
visit(targetDir);

const index = readFileSync(path.join(targetDir, "index.html"), "utf8");
const requiredMarkers = [
  "Forge Alive Vista Estática",
  "forge-alive-auth-entry-067g17b1.js",
  "phone-shell",
  "forge-alive-saas-router-r16c5l.js",
];
for (const marker of requiredMarkers) {
  if (!index.includes(marker)) {
    throw new Error(`PRODUCTIVE_CANONICAL_MARKER_MISSING:${marker}`);
  }
}
for (const forbidden of [
  "FORGE_CANONICAL_ENTRY_BRIDGE",
  "forge-alive-material3",
  "Inicio MD3 + Alfred",
]) {
  if (index.includes(forbidden)) {
    throw new Error(`MATERIAL3_CANONICAL_LEAK:${forbidden}`);
  }
}

writeFileSync(
  path.join(targetDir, "productive-authority.json"),
  `${JSON.stringify(
    {
      authority: "FORGE_ALIVE_PRODUCTIVE_CANONICAL",
      buildSha,
      productiveIndexCommit: PRODUCTIVE_INDEX_COMMIT,
      canonicalPath: "/ForgeOS/static-preview/forge-alive/",
      material3Canonical: false,
    },
    null,
    2,
  )}\n`,
  "utf8",
);

console.log(
  `PRODUCTIVE_CANONICAL_PREPARED=${targetDir} INDEX_COMMIT=${PRODUCTIVE_INDEX_COMMIT} BUILD_SHA=${buildSha}`,
);
