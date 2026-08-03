import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const buildEntry = await readFile("scripts/build-advisor-presentation-pages-runtime.mjs", "utf8");
const versionerPath = resolve("scripts/forge-pages-transitive-cache-versioning.mjs");
const versioner = await readFile(versionerPath, "utf8");

assert.match(buildEntry, /build-advisor-presentation-pages-runtime-base\.mjs/);
assert.match(buildEntry, /forge-pages-transitive-cache-versioning\.mjs/);
assert.match(versioner, /GITHUB_SHA/);
assert.match(versioner, /home-module\.js\?v=\$\{buildSha\}/);
assert.match(versioner, /home-productive-orchestrator\.js\?v=\$\{buildSha\}/);
assert.match(versioner, /activity-ledger-reporting-bridge\.js\?v=\$\{buildSha\}/);
assert.match(versioner, /smart-widget-productive-home-adapter\.js\?v=\$\{buildSha\}/);
assert.match(versioner, /smart-widget-productive-home-adapter\.css\?v=\$\{buildSha\}/);
assert.match(versioner, /dynamicModuleUrl/);
assert.match(versioner, /FORGE_PAGES_RUNTIME_PLACEHOLDER_LEAK/);
assert.match(versioner, /FORGE_PAGES_TRANSITIVE_CACHE_VERSIONING=PASS/);
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
  ]);

  const buildSha = "0123456789abcdef0123456789abcdef01234567";
  const output = execFileSync(process.execPath, [versionerPath], {
    cwd: fixture,
    env: { ...process.env, FORGE_BUILD_SHA: buildSha, GITHUB_SHA: "" },
    encoding: "utf8",
  });
  assert.match(output, /FORGE_PAGES_RUNTIME_PLACEHOLDER_LEAK=NONE/);

  const generated = await readFile(join(runtime, "home-productive-orchestrator.js"), "utf8");
  assert.match(generated, new RegExp(`productive-smart-widget-orchestrator\\$\\{layout\\.extension\\}\\?v=${buildSha}`));
  assert.match(generated, new RegExp(`advisor-monthly-policy-goal-repository\\$\\{layout\\.extension\\}\\?v=${buildSha}`));
  assert.doesNotMatch(generated, /\?v=\$\{buildSha\}/);
} finally {
  await rm(fixture, { recursive: true, force: true });
}

console.log("FORGE_PAGES_TRANSITIVE_ASSET_CACHE_INVALIDATION=PASS");
console.log("FORGE_PAGES_RUNTIME_PLACEHOLDER_LEAK=NONE");
console.log("SESSION_AND_LOCAL_DATA_PRESERVATION=PASS");
