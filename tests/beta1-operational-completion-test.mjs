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

test("Cartera exposes PDF/CSV/XLSX picker, manual entry and desktop drag and drop", async () => {
  const source = await read("docs/static-preview/forge-alive-material3/cartera-document-intake.js");
  assert.match(source, /data-select-policy-pdf/);
  assert.match(source, /data-add-policy-manual/);
  assert.match(source, /data-cartera-policy-dropzone/);
  assert.match(source, /application\/pdf,\.pdf,\.csv,\.xlsx/);
  assert.match(source, /dragover/);
  assert.match(source, /cartera-pdf-intake/);
  assert.match(source, /Confirmar alta/);
  assert.doesNotMatch(source, /data-confirm-cartera-staging disabled/);
});

test("Cartera policy entry persists only after explicit human confirmation", async () => {
  const source = await read("docs/static-preview/forge-alive-material3/cartera-document-intake.js");
  assert.match(source, /verificationState:\s*"CONFIRMED"/);
  assert.match(source, /humanConfirmed:\s*true/);
  assert.match(source, /forge_cartera010b_confirm_identity_resolution/);
  assert.match(source, /forge_cartera010b_confirm_policy_with_parties/);
  assert.match(source, /buildIdentityResolutionCommand/);
  assert.match(source, /buildConfirmedPolicyCommand/);
  assert.match(source, /La cuenta demo es de solo lectura/);
  assert.match(source, /location\.replace\(url\.href\)/);
});

test("Cartera owns policy-entry mounting while preserving the read-only directory boundary", async () => {
  const source = await read("docs/static-preview/forge-alive-material3/cartera-module.js");
  assert.match(source, /^import "\.\/cartera-document-intake\.js\?v=beta1-repair-001";/);
  assert.match(source, /governedPolicyEntry:\s*true/);
  assert.match(source, /productiveMutationAuthorized:\s*false/);
  assert.match(source, /refresh:\s*api\.refresh/);
});

test("Cartera policy entry mount cannot recurse through its own dialog mutations", async () => {
  const source = await read("docs/static-preview/forge-alive-material3/cartera-document-intake.js");
  assert.match(source, /observer\.observe\(root, \{ childList: true, attributes: true/);
  assert.doesNotMatch(source, /observer\.observe\(root, \{[^}]*subtree:\s*true/);
  assert.match(source, /panel\.nextElementSibling !== frame/);
});

test("Pages publishes the governed Cartera command validator", async () => {
  const [builder, publisher] = await Promise.all([
    read("scripts/build-advisor-presentation-pages-runtime.mjs"),
    read("scripts/prepare-cartera-policy-entry-pages-runtime.mjs"),
  ]);
  assert.match(builder, /prepare-cartera-policy-entry-pages-runtime\.mjs/);
  assert.match(publisher, /cartera-010b-contract-validator\.js/);
  assert.match(publisher, /CARTERA_POLICY_ENTRY_VALIDATOR_PAGES_RUNTIME=READY/);
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

test("canonical runtime mounts Pipeline repairs", async () => {
  const source = await read("docs/static-preview/forge-alive-material3/pipeline-stage-filter-authority.js");
  assert.match(source, /pipeline-bulk-import-mount\.js/);
  assert.match(source, /whatsapp-ai-composer\.js/);
});
