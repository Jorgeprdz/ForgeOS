import { access, copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, extname, join, relative, resolve, sep } from "node:path";

const root = process.cwd();
const ENTRYPOINTS = Object.freeze([
  "advisor-os/next-action/agenda-read-model.js",
  "advisor-os/forge-alive/smart-widgets/productive-smart-widget-orchestrator.mjs",
  "platform/attention/forge-home-attention-source-adapters.js",
  "platform/attention/forge-home-attention-composition.js",
]);
const TARGETS = Object.freeze([
  "docs/static-preview/forge-alive-material3/home-authorities/repo",
  "docs/static-preview/forge-alive/home-authorities/repo",
]);

function toPosix(value) { return value.split(sep).join("/"); }
function cleanSpecifier(value) { return String(value || "").split(/[?#]/, 1)[0]; }

function localSpecifiers(source) {
  const found = new Set();
  const patterns = [
    /\b(?:import|export)\s+(?:[^;"']*?\s+from\s+)?["']([^"']+)["']/gs,
    /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g,
  ];
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      if (match[1]?.startsWith(".")) found.add(match[1]);
    }
  }
  return [...found];
}

async function resolveModule(importer, specifier) {
  const unresolved = resolve(dirname(join(root, importer)), cleanSpecifier(specifier));
  const extension = extname(unresolved);
  const candidates = extension ? [unresolved] : [unresolved, `${unresolved}.js`, `${unresolved}.mjs`, join(unresolved, "index.js")];
  for (const candidate of candidates) {
    try {
      await access(candidate);
      const repositoryPath = toPosix(relative(root, candidate));
      if (repositoryPath === ".." || repositoryPath.startsWith("../")) throw new Error(`AURA_HOME_AUTHORITY_OUTSIDE_REPO=${importer}:${specifier}`);
      if (!/[.]m?js$/i.test(repositoryPath)) throw new Error(`AURA_HOME_AUTHORITY_NON_BROWSER_IMPORT=${importer}:${specifier}`);
      return repositoryPath;
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  }
  throw new Error(`AURA_HOME_AUTHORITY_IMPORT_MISSING=${importer}:${specifier}`);
}

async function closure() {
  const pending = [...ENTRYPOINTS];
  const files = new Set();
  while (pending.length) {
    const current = pending.pop();
    if (files.has(current)) continue;
    const source = await readFile(join(root, current), "utf8");
    files.add(current);
    for (const specifier of localSpecifiers(source)) {
      const dependency = await resolveModule(current, specifier);
      if (!files.has(dependency)) pending.push(dependency);
    }
  }
  return [...files].sort();
}

async function copyClosure(targetRoot, files) {
  await rm(join(root, targetRoot), { recursive: true, force: true });
  for (const file of files) {
    const target = join(root, targetRoot, file);
    await mkdir(dirname(target), { recursive: true });
    await copyFile(join(root, file), target);
  }
  const manifest = {
    contractId: "FORGE_AURA_HOME_PAGES_AUTHORITY_CLOSURE_001",
    generatedAt: new Date().toISOString(),
    entrypoints: ENTRYPOINTS,
    files,
    sourceOfTruth: "CANONICAL_REPOSITORY_MODULES_COPIED_WITHOUT_REWRITE",
    visualAssets: 0,
  };
  await writeFile(join(root, targetRoot, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
}

const files = await closure();
for (const target of TARGETS) await copyClosure(target, files);
console.log(`AURA_HOME_PAGES_AUTHORITY_CLOSURE=PASS files=${files.length}`);
console.log("AURA_HOME_PAGES_AUTHORITY_VISUAL_ASSETS=0");
