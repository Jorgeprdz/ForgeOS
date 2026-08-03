import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = path => readFile(new URL(path, root), "utf8");

test("Pipeline supports CSV, XLSX and productive persistence", async () => {
  const source = await read("docs/static-preview/forge-alive-material3/pipeline-bulk-import-mount.js");
  assert.match(source, /xlsx@0\.18\.5/);
  assert.match(source, /createProductiveIntelligenceAdapter/);
  assert.match(source, /service\.createProspect/);
  assert.match(source, /Proyecto 200/);
  assert.match(source, /DUPLICATE_PROSPECT/);
});

test("Cartera exposes PDF picker, desktop dropzone and staging-only review", async () => {
  const source = await read("docs/static-preview/forge-alive-material3/cartera-document-intake.js");
  assert.match(source, /accept=\"application\/pdf,\.pdf\"/);
  assert.match(source, /dragover/);
  assert.match(source, /cartera-pdf-intake/);
  assert.match(source, /Nada se guardó automáticamente/);
  assert.match(source, /data-confirm-cartera-staging disabled/);
});

test("WhatsApp composer calls authenticated backend and remains human-controlled", async () => {
  const source = await read("docs/static-preview/forge-alive-material3/whatsapp-ai-composer.js");
  assert.match(source, /whatsapp-draft/);
  assert.match(source, /Authorization: `Bearer/);
  assert.match(source, /Borrador editable/);
  assert.match(source, /sent: false/);
  assert.match(source, /También puedes escribirlo manualmente/);
});

test("Edge functions require authentication and keep secrets server-side", async () => {
  const draft = await read("supabase/functions/whatsapp-draft/index.ts");
  const intake = await read("supabase/functions/cartera-pdf-intake/index.ts");
  for (const source of [draft, intake]) {
    assert.match(source, /client\.auth\.getUser/);
    assert.match(source, /Deno\.env\.get\("GEMINI_API_KEY"\)/);
    assert.doesNotMatch(source, /AIza[0-9A-Za-z_-]{20,}/);
  }
  assert.match(draft, /mutatesProductState: false/);
  assert.match(intake, /persisted: false/);
  assert.match(intake, /automaticPolicyCreation: false/);
});

test("canonical runtime mounts all three Beta 1 repairs", async () => {
  const source = await read("docs/static-preview/forge-alive-material3/pipeline-stage-filter-authority.js");
  assert.match(source, /pipeline-bulk-import-mount\.js/);
  assert.match(source, /whatsapp-ai-composer\.js/);
  assert.match(source, /cartera-document-intake\.js/);
});
