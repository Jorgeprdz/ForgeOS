import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const buildEntry = await readFile("scripts/build-advisor-presentation-pages-runtime.mjs", "utf8");
const versionerPath = resolve("scripts/forge-pages-transitive-cache-versioning.mjs");
const versioner = await readFile(versionerPath, "utf8");
const canonicalBundler = await readFile("scripts/prepare-cartera-canonical-pages-runtime.mjs", "utf8");
const policyEntryGate = await readFile(
  "docs/static-preview/forge-alive-material3/cartera-policy-entry-route-gate.js",
  "utf8",
);

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
assert.match(versioner, /cartera-policy-entry-route-gate\.js\?v=\$\{buildSha\}/);
assert.match(versioner, /cartera-runtime-\$\{buildSha\}/);
assert.match(versioner, /FORGE_PAGES_CARTERA_CANONICAL_RUNTIME/);
assert.match(versioner, /FORGE_PAGES_CARTERA_POLICY_ENTRY_ROUTE_GATE=PASS/);
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
assert.match(policyEntryGate, /\[data-forge-cartera-module\]/);
assert.match(policyEntryGate, /MutationObserver/);
assert.match(policyEntryGate, /observer\.observe\(document\.documentElement/);
assert.match(policyEntryGate, /import\(intakeUrl\)/);
assert.match(policyEntryGate, /cartera-document-intake\.js\?v=/);
assert.doesNotMatch(versioner, /localStorage\.clear|sessionStorage\.clear|indexedDB\.deleteDatabase|caches\.delete/);

const fixture = await mkdtemp(join(tmpdir(), "forge-pages-versioning-"));
try {
  const runtime = join(fixture, "docs/static-preview/forge-alive-material3");
  await mkdir(runtime, { recursive: true });
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
      'import "./cartera-document-intake.js?v=beta1-repair-001";',
      'const sourceLayout = import.meta.url.includes("/docs/static-preview/");',
      'const repositoryBase = new URL(sourceLayout ? "../../../" : "../../", import.meta.url);',
      '',
    ].join("\n")),
    writeFile(join(runtime, "cartera-policy-entry-route-gate.js"), [
      'const intakeUrl = new URL("./cartera-document-intake.js?v=test", import.meta.url).href;',
      'const observer = new MutationObserver(() => undefined);',
      'observer.observe(document.documentElement, { childList: true, subtree: true });',
      'void import(intakeUrl);',
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
  assert.match(output, /FORGE_PAGES_CARTERA_POLICY_ENTRY_ROUTE_GATE=PASS/);
  assert.match(output, new RegExp(`FORGE_PAGES_CARTERA_CANONICAL_RUNTIME=cartera-runtime-${buildSha}`));

  const [orchestrator, shell, cartera, generatedGate] = await Promise.all([
    readFile(join(runtime, "home-productive-orchestrator.js"), "utf8"),
    readFile(join(runtime, "forge-shell.js"), "utf8"),
    readFile(join(runtime, "cartera-module.js"), "utf8"),
    readFile(join(runtime, "cartera-policy-entry-route-gate.js"), "utf8"),
  ]);
  assert.match(orchestrator, new RegExp(`productive-smart-widget-orchestrator\\$\\{layout\\.extension\\}\\?v=${buildSha}`));
  assert.match(orchestrator, new RegExp(`advisor-monthly-policy-goal-repository\\$\\{layout\\.extension\\}\\?v=${buildSha}`));
  assert.doesNotMatch(orchestrator, /\?v=\$\{buildSha\}/);
  assert.match(shell, new RegExp(`cartera-module\\.js\\?v=${buildSha}`));
  assert.doesNotMatch(shell, /cartera-material3-productive-001/);
  assert.match(cartera, new RegExp(`cartera-policy-entry-route-gate\\.js\\?v=${buildSha}`));
  assert.doesNotMatch(cartera, /cartera-document-intake\.js\?v=beta1-repair-001/);
  assert.match(cartera, new RegExp(`\\./cartera-runtime-${buildSha}/`));
  assert.match(generatedGate, /MutationObserver/);
  assert.match(generatedGate, /import\(intakeUrl\)/);
  assert.match(generatedGate, /cartera-document-intake\.js\?v=test/);
  assert.doesNotMatch(cartera, /sourceLayout \? "\.\.\/\.\.\/\.\.\/" : "\.\.\/\.\.\/"/);
} finally {
  await rm(fixture, { recursive: true, force: true });
}

console.log("FORGE_PAGES_TRANSITIVE_ASSET_CACHE_INVALIDATION=PASS");
console.log("FORGE_PAGES_RUNTIME_PLACEHOLDER_LEAK=NONE");
console.log("FORGE_PAGES_CARTERA_TRANSITIVE_VERSIONING=PASS");
console.log("FORGE_PAGES_CARTERA_POLICY_ENTRY_ROUTE_GATE=PASS");
console.log("FORGE_PAGES_CARTERA_CANONICAL_RUNTIME=PASS");
console.log("SESSION_AND_LOCAL_DATA_PRESERVATION=PASS");
