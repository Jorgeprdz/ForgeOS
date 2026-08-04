import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {
  prepareForgeAlivePagesRuntimeClosure,
} from './prepare-forge-alive-pages-runtime-closure.mjs';

export const REQUIRED_PUBLIC_KEYS = ['DEMO_MODE', 'ENABLE_TEST_ADVISOR_LOGIN', 'SUPABASE_KEY', 'SUPABASE_URL'];
export const FORBIDDEN_KEY_PATTERN = /(ACCESS_TOKEN|SERVICE_ROLE|DATABASE_PASSWORD|ADVISOR_[AB]_(EMAIL|PASSWORD)|REFRESH_TOKEN|SESSION_TOKEN|PRIVATE_KEY)/i;

export function evaluatePublicEnv(source, filename = 'env.js') {
  const sandbox = Object.create(null);
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  sandbox.self = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox, { filename, timeout: 1000 });

  const publicEnv = sandbox.__ENV__ ?? sandbox.window?.__ENV__ ?? sandbox.globalThis?.__ENV__;
  assert.ok(publicEnv && typeof publicEnv === 'object', 'PUBLIC_ENV_OBJECT_REQUIRED');
  assert.deepEqual(Object.keys(publicEnv).sort(), REQUIRED_PUBLIC_KEYS, 'PUBLIC_ENV_KEYS_MISMATCH');
  assert.equal(Object.keys(publicEnv).some((key) => FORBIDDEN_KEY_PATTERN.test(key)), false, 'PRIVILEGED_PUBLIC_ENV_KEY_FORBIDDEN');
  assert.equal(typeof publicEnv.DEMO_MODE, 'string', 'DEMO_MODE_STRING_REQUIRED');
  assert.equal(typeof publicEnv.ENABLE_TEST_ADVISOR_LOGIN, 'string', 'ENABLE_TEST_ADVISOR_LOGIN_STRING_REQUIRED');
  assert.match(publicEnv.ENABLE_TEST_ADVISOR_LOGIN, /^(true|false)$/, 'ENABLE_TEST_ADVISOR_LOGIN_BOOLEAN_STRING_REQUIRED');
  assert.equal(typeof publicEnv.SUPABASE_URL, 'string', 'SUPABASE_URL_STRING_REQUIRED');
  assert.equal(typeof publicEnv.SUPABASE_KEY, 'string', 'SUPABASE_KEY_STRING_REQUIRED');
  return { publicEnv, sandbox };
}

function stripSpecifierSuffix(value) {
  return String(value || '').split(/[?#]/, 1)[0];
}

function extractHtmlModuleSpecifiers(source) {
  const specifiers = [];
  for (const match of source.matchAll(/<script\b([^>]*)><\/script>/gi)) {
    const attributes = match[1] || '';
    if (!/\btype=["']module["']/i.test(attributes)) continue;
    const sourceMatch = attributes.match(/\bsrc=["']([^"']+)["']/i);
    if (sourceMatch?.[1]) specifiers.push(sourceMatch[1]);
  }
  return specifiers;
}

function stripJavaScriptComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

function extractStaticModuleSpecifiers(source) {
  const specifiers = new Set();
  const clean = stripJavaScriptComments(source);
  const pattern = /\b(?:import|export)\s+(?:[^;"']*?\s+from\s+)?["']([^"']+)["']/gs;
  for (const match of clean.matchAll(pattern)) specifiers.add(match[1]);
  return [...specifiers];
}

function localSpecifier(specifier) {
  return specifier.startsWith('.') || specifier.startsWith('/');
}

function resolvePublishedModule(siteDir, importerPath, specifier) {
  const clean = stripSpecifierSuffix(specifier);
  const unresolved = clean.startsWith('/')
    ? path.resolve(siteDir, clean.replace(/^\/+/, ''))
    : path.resolve(path.dirname(importerPath), clean);
  const relative = path.relative(siteDir, unresolved);
  assert.ok(
    relative
      && relative !== '..'
      && !relative.startsWith(`..${path.sep}`)
      && !path.isAbsolute(relative),
    `PAGES_MODULE_IMPORT_OUTSIDE_SITE=${path.relative(siteDir, importerPath)}:${specifier}`,
  );
  const extension = path.extname(unresolved);
  const candidates = extension
    ? [unresolved]
    : [unresolved, `${unresolved}.js`, `${unresolved}.mjs`, path.join(unresolved, 'index.js')];
  const found = candidates.find((candidate) =>
    fs.existsSync(candidate) && fs.statSync(candidate).isFile());
  assert.ok(
    found,
    `PAGES_MODULE_IMPORT_MISSING=${path.relative(siteDir, importerPath)}:${specifier}`,
  );
  return found;
}

export function validateCanonicalPagesStaticModuleGraph({
  siteDir,
  entryHtml = 'static-preview/forge-alive/index.html',
} = {}) {
  const root = path.resolve(siteDir);
  const htmlPath = path.resolve(root, entryHtml);
  assert.ok(fs.existsSync(htmlPath), `PAGES_MODULE_ENTRY_MISSING=${entryHtml}`);
  const pending = extractHtmlModuleSpecifiers(fs.readFileSync(htmlPath, 'utf8'))
    .filter(localSpecifier)
    .map((specifier) => resolvePublishedModule(root, htmlPath, specifier));
  const visited = new Set();

  while (pending.length > 0) {
    const current = pending.pop();
    const currentRelative = path.relative(root, current).split(path.sep).join('/');
    if (visited.has(currentRelative)) continue;
    visited.add(currentRelative);
    const source = fs.readFileSync(current, 'utf8');
    for (const specifier of extractStaticModuleSpecifiers(source)) {
      if (!localSpecifier(specifier)) continue;
      const dependency = resolvePublishedModule(root, current, specifier);
      const dependencyRelative = path.relative(root, dependency).split(path.sep).join('/');
      if (!visited.has(dependencyRelative)) pending.push(dependency);
    }
  }

  assert.ok(visited.size > 0, 'PAGES_MODULE_GRAPH_EMPTY');
  return Object.freeze({
    entryHtml,
    files: Object.freeze([...visited].sort()),
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const configPath = process.argv[2];
  assert.ok(configPath, 'CONFIG_PATH_REQUIRED');

  const siteDir = path.dirname(path.resolve(configPath));
  if (
    path.basename(siteDir) === '_site'
    && process.env.FORGE_SKIP_PAGES_RUNTIME_PREPARATION !== 'true'
  ) {
    await prepareForgeAlivePagesRuntimeClosure({ siteDir });
  }

  const { publicEnv } = evaluatePublicEnv(fs.readFileSync(configPath, 'utf8'), configPath);
  const expectedDemoMode = process.env.EXPECTED_DEMO_MODE ?? 'false';
  assert.equal(publicEnv.DEMO_MODE, expectedDemoMode);
  if (expectedDemoMode !== 'true') {
    assert.equal(new URL(publicEnv.SUPABASE_URL).hostname, 'rmlxigxysujsuwzgoimv.supabase.co');
    assert.ok(publicEnv.SUPABASE_KEY);
  }
  const graph = validateCanonicalPagesStaticModuleGraph({ siteDir });
  console.log('067G17A1 PAGES PUBLIC CONFIG ARTIFACT: PASS');
  console.log(`PAGES_CANONICAL_STATIC_MODULE_GRAPH=PASS files=${graph.files.length}`);
}
