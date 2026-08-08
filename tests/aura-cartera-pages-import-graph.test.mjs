import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const SITE = path.resolve(process.env.FORGE_SITE_DIR || '_site');
const AURA_REL = 'static-preview/forge-aura';
const AURA = path.join(SITE, AURA_REL);
const INDEX = path.join(AURA, 'index.html');

function posix(value) {
  return value.split(path.sep).join('/');
}

function stripUrl(value) {
  return String(value || '').split('#', 1)[0].split('?', 1)[0];
}

function resolveSitePath(fromRelative, specifier) {
  const clean = stripUrl(specifier);
  if (!clean) return null;
  if (clean.startsWith('/')) return path.posix.normalize(clean.slice(1));
  if (clean.startsWith('.')) return path.posix.normalize(path.posix.join(path.posix.dirname(fromRelative), clean));
  return null;
}

function extractImportMap(html) {
  const match = html.match(/<script\s+type=["']importmap["'][^>]*>([\s\S]*?)<\/script>/i);
  assert.ok(match, 'Aura index must declare the governed import map');
  return JSON.parse(match[1]).imports || {};
}

function normalizeMap(imports) {
  const out = [];
  for (const [key, target] of Object.entries(imports)) {
    const keyResolved = resolveSitePath(`${AURA_REL}/index.html`, key);
    const targetResolved = resolveSitePath(`${AURA_REL}/index.html`, target);
    out.push({ key, target, keyResolved, targetResolved, prefix: key.endsWith('/') });
  }
  return out;
}

function applyMap(fromRelative, specifier, mappings) {
  const exactBare = mappings.find(item => !item.keyResolved && item.key === specifier);
  if (exactBare) return exactBare.targetResolved;

  let resolved = resolveSitePath(fromRelative, specifier);
  if (!resolved) return null;

  const exact = mappings.find(item => !item.prefix && item.keyResolved === resolved);
  if (exact?.targetResolved) return exact.targetResolved;

  const prefixes = mappings
    .filter(item => item.prefix && item.keyResolved && item.targetResolved && resolved.startsWith(item.keyResolved))
    .sort((a, b) => b.keyResolved.length - a.keyResolved.length);
  if (prefixes[0]) {
    return `${prefixes[0].targetResolved}${resolved.slice(prefixes[0].keyResolved.length)}`;
  }
  return resolved;
}

function jsImports(source) {
  const found = new Set();
  const patterns = [
    /\b(?:import|export)\s+(?:[^'"()]*?\s+from\s*)?["']([^"']+)["']/g,
    /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g,
  ];
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) found.add(match[1]);
  }
  return [...found];
}

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(absolute);
    return entry.isFile() ? [absolute] : [];
  });
}

test('canonical Pages artifact publishes every Aura Cartera dependency', () => {
  assert.ok(fs.existsSync(INDEX), 'canonical _site must contain Aura index');
  for (const required of [
    'cartera/cartera-module.js',
    'cartera/cartera-core.js',
    'cartera/cartera-adapter-pages-v1.js',
    'cartera/cartera-coverage-adapter.js',
    'cartera/cartera.css',
  ]) {
    assert.ok(fs.existsSync(path.join(AURA, required)), `missing Aura Cartera artifact: ${required}`);
  }
  assert.equal(
    fs.existsSync(path.join(SITE, 'static-preview/forge-alive-material3')),
    false,
    'Material 3 source namespace must not be published by canonical Pages artifact',
  );
});

test('Aura import map resolves source-only namespaces to published canonical paths', () => {
  const html = fs.readFileSync(INDEX, 'utf8');
  const imports = extractImportMap(html);
  assert.equal(imports['../forge-alive-material3/'], '../forge-alive/');
  const mappings = normalizeMap(imports);
  const adapterRel = `${AURA_REL}/cartera/cartera-adapter-pages-v1.js`;
  const resolved = applyMap(adapterRel, '../../forge-alive-material3/safe-xlsx-decoder.js', mappings);
  assert.equal(resolved, 'static-preview/forge-alive/safe-xlsx-decoder.js');
  assert.ok(fs.existsSync(path.join(SITE, resolved)), `mapped XLSX decoder missing: ${resolved}`);
});

test('all relative/static Aura JavaScript imports resolve inside canonical _site after import-map rewriting', () => {
  const html = fs.readFileSync(INDEX, 'utf8');
  const mappings = normalizeMap(extractImportMap(html));
  const failures = [];
  for (const file of walk(AURA).filter(file => /\.(?:m?js)$/.test(file))) {
    const relative = posix(path.relative(SITE, file));
    const source = fs.readFileSync(file, 'utf8');
    for (const specifier of jsImports(source)) {
      if (/^(?:https?:|data:|blob:)/.test(specifier)) continue;
      const resolved = applyMap(relative, specifier, mappings);
      if (!resolved) continue;
      const candidates = [resolved];
      if (!path.posix.extname(resolved)) {
        candidates.push(`${resolved}.js`, `${resolved}.mjs`, path.posix.join(resolved, 'index.js'));
      }
      if (!candidates.some(candidate => fs.existsSync(path.join(SITE, candidate)))) {
        failures.push(`${relative} -> ${specifier} => ${resolved}`);
      }
    }
  }
  assert.deepEqual(failures, [], `unresolved Aura imports:\n${failures.join('\n')}`);
  console.log('PAGES_IMPORT_GRAPH=PASS');
});

test('Aura HTML styles/scripts resolve in the canonical artifact', () => {
  const html = fs.readFileSync(INDEX, 'utf8');
  const mappings = normalizeMap(extractImportMap(html));
  const assets = [...html.matchAll(/<(?:script|link)\b[^>]+(?:src|href)=["']([^"']+)["']/gi)].map(match => match[1]);
  const missing = [];
  for (const specifier of assets) {
    if (/^(?:https?:|data:|#)/.test(specifier)) continue;
    const resolved = applyMap(`${AURA_REL}/index.html`, specifier, mappings) || resolveSitePath(`${AURA_REL}/index.html`, specifier);
    if (resolved && !fs.existsSync(path.join(SITE, resolved))) missing.push(`${specifier} => ${resolved}`);
  }
  assert.deepEqual(missing, [], `missing Aura HTML assets:\n${missing.join('\n')}`);
});
