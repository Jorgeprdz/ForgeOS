import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = path => readFile(new URL(path, root), "utf8");

test("canonical Pipeline runtime loads the bulk import mount", async () => {
  const authority = await read("docs/static-preview/forge-alive-material3/pipeline-stage-filter-authority.js");
  assert.match(authority, /pipeline-bulk-import-mount\.js\?v=beta1-repair-001/);
});

test("bulk import mount reuses Sprint 06 domain contracts and productive authorities", async () => {
  const runtime = await read("docs/static-preview/forge-alive-material3/pipeline-bulk-import-mount.js");
  assert.match(runtime, /parseCsv/);
  assert.match(runtime, /mapRows/);
  assert.match(runtime, /detectPlan200/);
  assert.match(runtime, /reconcileDuplicates/);
  assert.match(runtime, /ForgeBulkImportProductiveAuthority/);
  assert.match(runtime, /xlsx@0\.18\.5/);
  assert.match(runtime, /service\.createProspect/);
  assert.match(runtime, /persisted: true/);
  assert.doesNotMatch(runtime, /No se guardó ningún contacto/);
});

test("bulk engine is lazy and project-relative in the published runtime", async () => {
  const runtime = await read("docs/static-preview/forge-alive-material3/pipeline-bulk-import-mount.js");
  const builder = await read("scripts/prepare-material3-auth-entry.mjs");
  assert.match(runtime, /async function getBulkEngine/);
  assert.match(runtime, /sourceLayout/);
  assert.match(runtime, /\.\/bulk-import-engine-pages\.js/);
  assert.match(runtime, /\.\.\/\.\.\/\.\.\/advisor-os\/contact-books\/bulk-import-engine\.js/);
  assert.match(runtime, /await getBulkEngine\(\)/);
  assert.doesNotMatch(
    runtime,
    /^import[\s\S]{0,160}from ["']\.\.\/\.\.\/\.\.\/advisor-os\/contact-books\/bulk-import-engine\.js["'];/m,
  );
  assert.match(builder, /bulk-import-engine-pages\.js/);
  assert.match(builder, /advisor-os\/contact-books\/bulk-import-engine\.js/);
});

test("visible entry and file picker remain mounted through Pipeline rerenders", async () => {
  const runtime = await read("docs/static-preview/forge-alive-material3/pipeline-bulk-import-mount.js");
  assert.match(runtime, /data-pipeline-bulk-import/);
  assert.match(runtime, /MutationObserver/);
  assert.match(runtime, /accept=\"\.csv,\.xlsx/);
  assert.match(runtime, /Confirmar importación/);
});

test("responsive surface preserves mobile safe area", async () => {
  const css = await read("docs/static-preview/forge-alive-material3/pipeline-bulk-import-mount.css");
  assert.match(css, /env\(safe-area-inset-bottom\)/);
  assert.match(css, /@media \(max-width: 640px\)/);
  assert.match(css, /pipeline-module__bulk-import/);
});
