import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const SITE = path.resolve(process.env.FORGE_SITE_DIR || "_site");
const AURA_REL = "static-preview/forge-aura";
const AURA = path.join(SITE, AURA_REL);
const INDEX = path.join(AURA, "index.html");

function posix(value) { return value.split(path.sep).join("/"); }
function stripUrl(value) { return String(value || "").split("#", 1)[0].split("?", 1)[0]; }
function resolveSitePath(fromRelative, specifier) {
  const clean = stripUrl(specifier);
  if (!clean) return null;
  if (clean.startsWith("/")) return path.posix.normalize(clean.slice(1));
  if (clean.startsWith(".")) return path.posix.normalize(path.posix.join(path.posix.dirname(fromRelative), clean));
  return null;
}
function extractImportMap(html) {
  const match = html.match(/<script\s+type=["']importmap["'][^>]*>([\s\S]*?)<\/script>/i);
  assert.ok(match, "Aura index must declare the governed import map");
  return JSON.parse(match[1]).imports || {};
}
function normalizeMap(imports) {
  return Object.entries(imports).map(([key, target]) => ({
    key,
    keyResolved: resolveSitePath(`${AURA_REL}/index.html`, key),
    targetResolved: resolveSitePath(`${AURA_REL}/index.html`, target),
    prefix: key.endsWith("/"),
  }));
}
function applyMap(fromRelative, specifier, mappings) {
  const bare = mappings.find(item => !item.keyResolved && item.key === specifier);
  if (bare) return bare.targetResolved;
  const resolved = resolveSitePath(fromRelative, specifier);
  if (!resolved) return null;
  const exact = mappings.find(item => !item.prefix && item.keyResolved === resolved);
  if (exact?.targetResolved) return exact.targetResolved;
  const prefix = mappings.filter(item => item.prefix && item.keyResolved && item.targetResolved && resolved.startsWith(item.keyResolved)).sort((a, b) => b.keyResolved.length - a.keyResolved.length)[0];
  return prefix ? `${prefix.targetResolved}${resolved.slice(prefix.keyResolved.length)}` : resolved;
}
function jsImports(source) {
  const found = new Set();
  const patterns = [
    /\b(?:import|export)\s+(?:[^'"()]*?\s+from\s*)?["']([^"']+)["']/g,
    /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g,
  ];
  for (const pattern of patterns) for (const match of source.matchAll(pattern)) found.add(match[1]);
  return [...found];
}
function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(absolute);
    return entry.isFile() ? [absolute] : [];
  });
}

test("PAGES_ARTIFACT_BUILD: canonical artifact contains Quotes and productive dependencies", () => {
  assert.ok(fs.existsSync(INDEX), "canonical _site must contain Aura index");
  for (const required of ["quotes/quotes-module.js", "quotes/quotes-adapter.js", "quotes/quotes.css"]) {
    assert.ok(fs.existsSync(path.join(AURA, required)), `missing Quotes artifact: ${required}`);
  }
  for (const required of ["static-preview/quote-runtime", "static-preview/quote-printable-runtime"]) {
    assert.ok(fs.existsSync(path.join(SITE, required)), `missing productive runtime directory: ${required}`);
  }
});

test("QUOTES_IMPORT_GRAPH: all published Aura JavaScript imports resolve", () => {
  const mappings = normalizeMap(extractImportMap(fs.readFileSync(INDEX, "utf8")));
  const failures = [];
  for (const file of walk(AURA).filter(file => /\.(?:m?js)$/.test(file))) {
    const relative = posix(path.relative(SITE, file));
    const source = fs.readFileSync(file, "utf8");
    for (const specifier of jsImports(source)) {
      if (/^(?:https?:|data:|blob:)/.test(specifier)) continue;
      const resolved = applyMap(relative, specifier, mappings);
      if (!resolved) continue;
      const candidates = [resolved];
      if (!path.posix.extname(resolved)) candidates.push(`${resolved}.js`, `${resolved}.mjs`, path.posix.join(resolved, "index.js"));
      if (!candidates.some(candidate => fs.existsSync(path.join(SITE, candidate)))) failures.push(`${relative} -> ${specifier} => ${resolved}`);
    }
  }
  assert.deepEqual(failures, [], `unresolved Aura imports:\n${failures.join("\n")}`);
  console.log("QUOTES_IMPORT_GRAPH=PASS");
  console.log("NO_BLANK_SCREEN_IMPORT_FAILURE=PASS");
});