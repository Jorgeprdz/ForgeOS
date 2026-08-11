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
  assert.match(source, /accept=\"application\/pdf,\.pdf\"/);
  assert.match(source, /application\/pdf,\.pdf,\.csv,\.xlsx/);
  assert.match(source, /dragover/);
  assert.match(source, /cartera-pdf-intake/);
  assert.match(source, /Confirmar alta/);
  assert.doesNotMatch(source, /data-confirm-cartera-staging disabled/);
});

test("Cartera policy entry persists only after explicit human confirmation", async () => {
  const source = await read("docs/static-preview/forge-alive-material3/cartera-document-intake.js");
  assert.match(source, /verificationState:\s*draft\.officialDocumentVerified \? "CONFIRMED" : "REVIEWED"/);
  assert.match(source, /policyTruthState:\s*draft\.officialDocumentVerified \? "ADVISOR_CONFIRMED" : "PROVISIONAL_OR_INCOMPLETE"/);
  assert.match(source, /humanConfirmed:\s*true/);
  assert.match(source, /forge_cartera010b_confirm_identity_and_policy/);
  assert.match(source, /buildIdentityResolutionCommand/);
  assert.match(source, /buildConfirmedPolicyCommand/);
  assert.match(source, /La cuenta demo es de solo lectura/);
  assert.match(source, /location\.replace\(url\.href\)/);
});

test("Cartera owns policy-entry mounting while preserving the read-only directory boundary", async () => {
  const source = await read("docs/static-preview/forge-alive-material3/cartera-module.js");
  assert.match(source, /^import "\.\/cartera-document-intake\.js\?v=03bca89dba800f7bd5052d6e67caa29241271be0";/);
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

test("Legacy WhatsApp composer cannot bypass the governed Pipeline conversation authority", async () => {
  const [legacy, pipeline, adapter] = await Promise.all([
    read("docs/static-preview/forge-alive-material3/whatsapp-ai-composer.js"),
    read("docs/static-preview/forge-alive-material3/pipeline-module.js"),
    read("docs/static-preview/forge-alive-material3/pipeline-productive-intelligence-adapter.js"),
  ]);
  assert.match(legacy, /retired:\s*true/);
  assert.match(legacy, /installsClickInterceptor:\s*false/);
  assert.match(legacy, /rawPipelineForwardedToProvider:\s*false/);
  assert.match(legacy, /PRODUCTIVE_AUTHORITY = "MATERIAL3_PIPELINE_GOVERNED_NASH_WORKSPACE"/);
  assert.doesNotMatch(legacy, /whatsapp-draft|FUNCTION_URL|fetch\s*\(|stopImmediatePropagation\s*\(/);
  assert.match(pipeline, /openNashWorkspace/);
  assert.match(pipeline, /ForgeDraftSafetyBoundaryNFAST06/);
  assert.match(pipeline, /exactDraftHumanApprovalGate/);
  assert.match(pipeline, /Continuar manualmente a WhatsApp/);
  assert.match(adapter, /ForgePipelineNashDraftOrchestrator/);
  assert.match(adapter, /conversationBriefProduced/);
  assert.match(adapter, /humanApprovalRequired:\s*true/);
  assert.match(adapter, /automaticSendPerformed:\s*false/);
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

test("canonical runtime mounts Pipeline repairs while legacy composer remains compatibility-only", async () => {
  const [source, legacy] = await Promise.all([
    read("docs/static-preview/forge-alive-material3/pipeline-stage-filter-authority.js"),
    read("docs/static-preview/forge-alive-material3/whatsapp-ai-composer.js"),
  ]);
  assert.match(source, /pipeline-bulk-import-mount\.js/);
  assert.match(source, /whatsapp-ai-composer\.js/);
  assert.match(legacy, /installsClickInterceptor:\s*false/);
});
