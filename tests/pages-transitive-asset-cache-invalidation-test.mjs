import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const buildEntry = await readFile("scripts/build-advisor-presentation-pages-runtime.mjs", "utf8");
const versionerPath = resolve("scripts/forge-pages-transitive-cache-versioning.mjs");
const versioner = await readFile(versionerPath, "utf8");
const canonicalBundler = await readFile("scripts/prepare-cartera-canonical-pages-runtime.mjs", "utf8");

assert.match(buildEntry, /build-advisor-presentation-pages-runtime-base\.mjs/);
assert.match(buildEntry, /prepare-cartera-canonical-pages-runtime\.mjs/);
assert.match(buildEntry, /forge-pages-transitive-cache-versioning\.mjs/);
assert.match(versioner, /GITHUB_SHA/);
assert.match(versioner, /home-module\.js\?v=\$\{buildSha\}/);
assert.match(versioner, /home-productive-orchestrator\.js\?v=\$\{buildSha\}/);
assert.match(versioner, /activity-ledger-reporting-bridge\.js\?v=\$\{buildSha\}/);
assert.match(versioner, /smart-widget-productive-home-adapter\.js\?v=\$\{buildSha\}/);
assert.match(versioner, /smart-widget-productive-home-adapter\.css\?v=\$\{buildSha\}/);
assert.match(versioner, /cartera-module\.js\?v=\$\{buildSha\}/);
assert.match(versioner, /cartera-document-intake\.js\?v=\$\{buildSha\}/);
assert.match(versioner, /cartera-runtime-\$\{buildSha\}/);
assert.match(versioner, /auraCarteraMappingPattern/);
assert.match(versioner, /auraCarteraEntrypoint/);
assert.match(versioner, /aura-bootstrap-v4-r1\\\.js/);
assert.match(versioner, /FORGE_PAGES_AURA_CARTERA_CACHE_CUTOVER=PASS/);
assert.match(versioner, /FORGE_PAGES_CARTERA_CANONICAL_RUNTIME/);
assert.match(versioner, /FORGE_PAGES_CARTERA_ROOT_RUNTIME_BINDING_LEAK/);
assert.match(versioner, /FORGE_PAGES_CARTERA_TRANSITIVE_VERSIONING=PASS/);
assert.match(versioner, /dynamicModuleUrl/);
assert.match(versioner, /FORGE_PAGES_RUNTIME_PLACEHOLDER_LEAK/);
assert.match(versioner, /FORGE_PAGES_TRANSITIVE_CACHE_VERSIONING=PASS/);
assert.match(canonicalBundler, /CARTERA_CANONICAL_PAGES_RUNTIME_V1/);
assert.match(canonicalBundler, /cartera-runtime-\$\{buildSha\}/);
assert.match(canonicalBundler, /manifest\.files\.length < 40/);
assert.match(canonicalBundler, /supabase-runtime\.js/);
assert.match(canonicalBundler, /advisor-os\/cartera\/cartera-100d-productivity-proof-enhancement\.js/);
assert.doesNotMatch(versioner, /localStorage\.clear|sessionStorage\.clear|indexedDB\.deleteDatabase|caches\.delete/);

const fixture = await mkdtemp(join(tmpdir(), "forge-pages-versioning-"));
try {
  const runtime = join(fixture, "docs/static-preview/forge-alive-material3");
  const aura = join(fixture, "docs/static-preview/forge-aura");
  await mkdir(runtime, { recursive: true });
  await mkdir(aura, { recursive: true });
  await Promise.all([
    writeFile(join(runtime, "app.js"), 'import { home } from "./home-module.js";\n'),
    writeFile(join(runtime, "home-module.js"), 'import { orchestrate } from "./home-productive-orchestrator.js";\n'),
    writeFile(join(runtime, "home-productive-orchestrator.js"), [
      'import { activity } from "./activity-ledger-reporting-bridge.js";',
      'import { adapter } from "./smart-widget-productive-home-adapter.js";',
      'const a = `productive-smart-widget-orchestrator${layout.extension}`;',
      'const b = `advisor-monthly-policy-goal-repository${layout.extension}`;',
      'const css = "./smart-widget-productive-home-adapter.css?v=home-productive-mount-001";',
      '',
    ].join("\n")),
    writeFile(join(runtime, "smart-widget-productive-home-adapter.js"), 'const source = "advisor-forecast-runtime-acceptance.js?v=af-runtime-acceptance-001";\n'),
    writeFile(join(runtime, "forge-shell.js"), 'import { createCarteraModule } from "./cartera-module.js?v=cartera-material3-productive-001";\n'),
    writeFile(join(runtime, "cartera-module.js"), [
      'import "./cartera-document-intake.js?v=03bca89dba800f7bd5052d6e67caa29241271be0";',
      'const sourceLayout = import.meta.url.includes("/docs/static-preview/");',
      'const repositoryBase = new URL(sourceLayout ? "../../../" : "./cartera-runtime-03bca89dba800f7bd5052d6e67caa29241271be0/", import.meta.url);',
      '',
    ].join("\n")),
    writeFile(join(aura, "index.html"), [
      '<script type="importmap">',
      '{"imports":{',
      '"./cartera/cartera-module.js?v=a":"./cartera/cartera-module-v77-future.js?v=old-cache-key",',
      '"./cartera/cartera-module-v4.js?v=b":"./cartera/cartera-module-v77-future.js?v=old-cache-key"',
      '}}',
      '</script>',
      '<script type="module" src="./aura-bootstrap-v4-r1.js?v=old-bootstrap-key"></script>',
      '',
    ].join("\n")),
  ]);

  const buildSha = "0123456789abcdef0123456789abcdef01234567";
  const output = execFileSync(process.execPath, [versionerPath], {
    cwd: fixture,
    env: { ...process.env, FORGE_BUILD_SHA: buildSha, GITHUB_SHA: "" },
    encoding: "utf8",
  });
  assert.match(output, /FORGE_PAGES_RUNTIME_PLACEHOLDER_LEAK=NONE/);
  assert.match(output, /FORGE_PAGES_CARTERA_TRANSITIVE_VERSIONING=PASS/);
  assert.match(output, /FORGE_PAGES_AURA_CARTERA_CACHE_CUTOVER=PASS/);
  assert.match(output, new RegExp(`FORGE_PAGES_CARTERA_CANONICAL_RUNTIME=cartera-runtime-${buildSha}`));

  const [orchestrator, shell, cartera, auraIndex] = await Promise.all([
    readFile(join(runtime, "home-productive-orchestrator.js"), "utf8"),
    readFile(join(runtime, "forge-shell.js"), "utf8"),
    readFile(join(runtime, "cartera-module.js"), "utf8"),
    readFile(join(aura, "index.html"), "utf8"),
  ]);
  assert.match(orchestrator, new RegExp(`productive-smart-widget-orchestrator\\$\\{layout\\.extension\\}\\?v=${buildSha}`));
  assert.match(orchestrator, new RegExp(`advisor-monthly-policy-goal-repository\\$\\{layout\\.extension\\}\\?v=${buildSha}`));
  assert.doesNotMatch(orchestrator, /\?v=\$\{buildSha\}/);
  assert.match(shell, new RegExp(`cartera-module\\.js\\?v=${buildSha}`));
  assert.doesNotMatch(shell, /cartera-material3-productive-001/);
  assert.match(cartera, new RegExp(`cartera-document-intake\\.js\\?v=${buildSha}`));
  assert.match(cartera, new RegExp(`\\./cartera-runtime-${buildSha}/`));
  assert.doesNotMatch(cartera, /03bca89dba800f7bd5052d6e67caa29241271be0/);
  assert.doesNotMatch(cartera, /cartera-runtime-03bca89dba800f7bd5052d6e67caa29241271be0/);
  assert.match(auraIndex, new RegExp(`cartera-module-v77-future\\.js\\?v=${buildSha}`));
  assert.match(auraIndex, new RegExp(`aura-bootstrap-v4-r1\\.js\\?v=${buildSha}`));
  assert.doesNotMatch(auraIndex, /cartera-module-v77-future\.js\?v=old-cache-key/);
} finally {
  await rm(fixture, { recursive: true, force: true });
}

console.log("FORGE_PAGES_TRANSITIVE_ASSET_CACHE_INVALIDATION=PASS");
console.log("FORGE_PAGES_RUNTIME_PLACEHOLDER_LEAK=NONE");
console.log("FORGE_PAGES_CARTERA_TRANSITIVE_VERSIONING=PASS");
console.log("FORGE_PAGES_CARTERA_CANONICAL_RUNTIME=PASS");
console.log("FORGE_PAGES_AURA_CARTERA_CACHE_CUTOVER=PASS");
console.log("SESSION_AND_LOCAL_DATA_PRESERVATION=PASS");
