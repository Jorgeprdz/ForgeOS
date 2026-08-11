import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const script = await readFile(
  new URL("../scripts/forge-pages-transitive-cache-versioning.mjs", import.meta.url),
  "utf8",
);
const auraIndex = await readFile(
  new URL("../docs/static-preview/forge-aura/index.html", import.meta.url),
  "utf8",
);

test("Pages cache versioner follows the current Aura Cartera import-map authority", () => {
  assert.match(
    auraIndex,
    /"\.\/cartera\/cartera-module\.js\?v=[^"]+"\s*:\s*"\.\/cartera\/cartera-module-v10-013\.js\?v=[^"]+"/,
  );
  assert.match(script, /auraCarteraMappingPattern/);
  assert.match(script, /auraCarteraEntrypoint/);
  assert.doesNotMatch(script, /auraCarteraPattern = \/\\\.\\\/cartera\\\/cartera-module-v9/);
  assert.doesNotMatch(
    script,
    /versionedAuraIndex\.includes\(`\.\/cartera\/cartera-module-v9\.js\?v=\$\{buildSha\}`\)/,
  );
});

test("Pages cache versioner preserves fail-closed Cartera and bootstrap gates", () => {
  assert.match(script, /FORGE_PAGES_AURA_CARTERA_VERSION_SOURCE_MISSING/);
  assert.match(script, /FORGE_PAGES_AURA_CARTERA_BUILD_VERSION_MISSING/);
  assert.match(script, /FORGE_PAGES_AURA_STALE_CARTERA_CACHE_KEY/);
  assert.match(script, /FORGE_PAGES_AURA_BOOTSTRAP_VERSION_SOURCE_MISSING/);
  assert.match(script, /FORGE_PAGES_AURA_BOOTSTRAP_BUILD_VERSION_MISSING/);
});
