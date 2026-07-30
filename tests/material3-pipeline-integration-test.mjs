import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const navigation = await import(
  "../docs/static-preview/forge-alive-material3/forge-navigation-contract.js"
);
const { createPipelineModule } = await import(
  "../docs/static-preview/forge-alive-material3/pipeline-module.js"
);

test("Material 3 Pipeline uses the canonical route, viewport and lifecycle", async () => {
  const items = navigation.navigationItems();
  assert.deepEqual(items.map((item) => item.label), [
    "Inicio",
    "Pipeline",
    "Cotizaciones",
  ]);
  assert.equal(
    navigation.resolveForgeRoute({ href: "https://forge.test/?nav=pipeline" }),
    "pipeline",
  );
  assert.equal(
    navigation.resolveForgeRoute({ href: "https://forge.test/?nav=inicio" }),
    "inicio",
  );

  const root = { hidden: true, dataset: {}, innerHTML: "" };
  const shell = { syncVisualViewport() {} };
  const dataProvider = () => ({
    prospects: [{
      prospectId: "prospect-1",
      displayName: "Ana",
    }],
    opportunities: [{
      opportunityId: "opportunity-1",
      prospectId: "prospect-1",
      stageCode: "NEW",
      lastVerifiedActivity: { title: "Contacto verificado" },
    }],
  });
  const module = createPipelineModule({ root, shell, dataProvider });
  module.mount();
  module.unmount();
  module.mount();

  assert.equal(root.hidden, false);
  assert.equal(root.dataset.moduleActive, "true");
  assert.equal((root.innerHTML.match(/pipeline-module__header/g) || []).length, 1);
  assert.match(root.innerHTML, /Ana/);
  assert.match(root.innerHTML, /Contacto verificado/);

  const app = await readFile(
    "docs/static-preview/forge-alive-material3/app.js",
    "utf8",
  );
  const html = await readFile(
    "docs/static-preview/forge-alive-material3/index.html",
    "utf8",
  );
  const css = await readFile(
    "docs/static-preview/forge-alive-material3/app.css",
    "utf8",
  );
  assert.match(app, /registerRouteModule\("pipeline", pipeline\)/);
  assert.equal((html.match(/data-forge-pipeline-module/g) || []).length, 1);
  assert.match(html, /data-forge-module-viewport/);
  assert.match(css, /grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(
    css,
    /\.pipeline-module,\s*\.quotes-module\s*\{[^}]*grid-column:\s*1\s*\/\s*-1/s,
  );
  assert.match(css, /overflow-wrap:\s*anywhere/);
  assert.match(css, /body[\s\S]*overflow-x:\s*hidden/);
});

test("Material 3 Pipeline owns a light referral sheet independent from Alfred", async () => {
  const root = { hidden: true, dataset: {}, innerHTML: "" };
  const module = createPipelineModule({
    root,
    shell: {
      syncVisualViewport() {},
      setAlfred() {},
    },
    dataProvider: () => ({ opportunities: [], prospects: [] }),
  });
  module.mount();

  assert.match(root.innerHTML, /0 prospectos/);
  assert.match(root.innerHTML, /No hay prospectos conectados/);
  assert.match(root.innerHTML, /Agregar nuevo referido/);
  assert.match(root.innerHTML, /data-pipeline-create-referral/);
  assert.match(root.innerHTML, /data-open-referral/);
  assert.doesNotMatch(root.innerHTML, /data-open-alfred/);

  const source = await readFile(
    "docs/static-preview/forge-alive-material3/pipeline-module.js",
    "utf8",
  );
  const html = await readFile(
    "docs/static-preview/forge-alive-material3/index.html",
    "utf8",
  );
  const referralCss = await readFile(
    "docs/static-preview/forge-alive-material3/pipeline-referral-modal.css",
    "utf8",
  );
  const productiveAdapter = await readFile(
    "docs/static-preview/forge-alive-material3/pipeline-productive-intelligence-adapter.js",
    "utf8",
  );

  assert.doesNotMatch(source, /openProductiveProspectCreateModal/);
  assert.doesNotMatch(source, /productive-prospect-ui\.js/);
  assert.doesNotMatch(source, /forge-prospect-modal-backdrop/);
  assert.match(source, /data-referral-sheet/);
  assert.match(source, /data-close-referral="scrim"/);
  assert.match(source, /data-close-referral="button"/);
  assert.match(source, /event\.key === "Escape"/);
  assert.match(source, /event\.key !== "Tab"/);
  assert.match(source, /document\.body\.style\.overflow = "hidden"/);
  assert.match(source, /trigger\.focus\(\)/);
  assert.match(source, /role="dialog"/);
  assert.match(source, /aria-modal="true"/);

  for (const field of [
    "fullName",
    "phone",
    "referrerName",
    "referrerRelationship",
    "initialContext",
    "email",
    "dateOfBirth",
    "occupation",
  ]) {
    assert.match(source, new RegExp(`name="${field}"`));
  }
  assert.match(source, /Agregar más datos/);
  for (const removed of [
    "whatsapp",
    "age",
    "maritalStatus",
    "dependents",
    "estimatedIncome",
    "productsOfInterest",
    "nextActionType",
    "nextActionAt",
  ]) {
    assert.doesNotMatch(source, new RegExp(`name="${removed}"`));
  }
  assert.doesNotMatch(source, /name="source"/);
  assert.doesNotMatch(source, /name="status"/);

  assert.match(productiveAdapter, /ForgeProductiveProspectBootstrap067G17B/);
  assert.match(productiveAdapter, /ForgeProductiveProspectService067G17B/);
  assert.match(productiveAdapter, /serviceAuthority\.create\(client\)/);
  assert.match(source, /service\.createProspect\(referralPayload\(form\)\)/);
  assert.match(source, /source:\s*"Referido"/);
  assert.match(source, /status:\s*"referred_new"/);
  assert.doesNotMatch(source, /shell\.setAlfred/);
  assert.match(productiveAdapter, /service\.listProspects\(\)/);
  assert.match(
    productiveAdapter,
    /globalThis\.__FORGE_NASH_PROVIDER_ID__ \|\| "gemini"/,
  );
  assert.doesNotMatch(
    productiveAdapter,
    /globalThis\.__FORGE_NASH_PROVIDER_ID__ \|\| "deterministic"/,
  );
  assert.match(source, /referralStatus = "Referido guardado\."/);
  assert.doesNotMatch(source, /data-saved-referral-card|savedReferralProspect/);
  assert.match(source, /data-productive-prospect-card/);
  assert.match(source, /createProductiveIntelligenceAdapter/);
  assert.match(source, /productiveCards = await service\.reload\(\)/);
  assert.match(source, /data-timeline-activity/);
  assert.match(source, /data-prepare-productive-message/);
  assert.match(source, /dataset\.nashProspectWorkspace/);
  assert.match(source, /exactDraftHumanApprovalGate/);
  assert.match(source, /data-manual-whatsapp/);

  assert.match(referralCss, /justify-content:\s*flex-end/);
  assert.match(referralCss, /width:\s*min\(470px/);
  assert.match(referralCss, /height:\s*min\(760px/);
  assert.match(
    referralCss,
    /border-radius:\s*34px 46px 31px 42px\s*\/\s*38px 34px 45px 32px/,
  );
  assert.match(referralCss, /@media \(max-width:\s*900px\)/);
  assert.match(referralCss, /align-items:\s*flex-end/);
  assert.match(
    referralCss,
    /border-radius:\s*40px 55px 0 0\s*\/\s*36px 46px 0 0/,
  );
  assert.doesNotMatch(referralCss, /place-items:\s*center/);
  assert.match(
    html,
    /data-forge-command-orb[^>]*data-open-alfred/,
  );
});

test("visual diagnostic distinguishes referral, Alfred and legacy modal state", async () => {
  const diagnostic = await readFile(
    "tools/forge-ui-visual-diagnostic.mjs",
    "utf8",
  );
  assert.match(diagnostic, /referralSheetVisible/);
  assert.match(diagnostic, /legacyCenteredProspectModalVisible/);
  assert.match(diagnostic, /legacyCenteredReferralModalVisible/);
  assert.match(diagnostic, /globalAlfredLauncherVisible/);
  assert.match(diagnostic, /alfredIndependent/);
  assert.match(diagnostic, /productiveProspectCardVisible/);
  assert.match(diagnostic, /productiveProspectCardContainsName/);
  assert.match(diagnostic, /Mariana Torres/);
  assert.match(diagnostic, /5512345678/);
  assert.match(diagnostic, /Ana López/);
  assert.match(diagnostic, /Amiga/);
  assert.match(
    diagnostic,
    /Le interesa proteger a su hija y revisar opciones de ahorro\./,
  );
  assert.match(diagnostic, /data-save-referral/);
  assert.match(diagnostic, /pipelineSavedReferral/);
  assert.match(diagnostic, /data-saved-referral-card/);
  assert.match(diagnostic, /nashProviderAttempted/);
  assert.match(diagnostic, /deterministicFallbackUsed/);
  assert.match(diagnostic, /editedDraftInvalidatedApproval/);
  assert.match(diagnostic, /https:\/\/wa\.me\//);
  assert.match(diagnostic, /assertVisualAcceptance\(results\)/);
  assert.match(diagnostic, /FORGE_UI_VISUAL_ACCEPTANCE_FAILED/);
  for (const gate of [
    "FORGE_UI_VISUAL_ACCEPTANCE=PASS",
    "PIPELINE_PRODUCTIVE_ACCEPTANCE=PASS",
    "NASH_PROVIDER_ATTEMPT=PASS",
    "NASH_DETERMINISTIC_FALLBACK=PASS",
    "NFAST06_EXACT_APPROVAL=PASS",
    "MANUAL_WHATSAPP_BOUNDARY=PASS",
    "QUOTE_SUBSTANTIVE_RESULT=PASS",
    "ALFRED_INDEPENDENCE=PASS",
  ]) assert.match(diagnostic, new RegExp(gate));
});

test("productive prospect uses a structured Material 3 card layout", async () => {
  const source = await readFile(
    "docs/static-preview/forge-alive-material3/pipeline-module.js",
    "utf8",
  );
  const adapter = await readFile(
    "docs/static-preview/forge-alive-material3/pipeline-productive-intelligence-adapter.js",
    "utf8",
  );
  const css = await readFile(
    "docs/static-preview/forge-alive-material3/app.css",
    "utf8",
  );

  assert.match(source, /pipeline-module__productive-card/);
  assert.match(source, /data-productive-card-identity/);
  assert.match(source, /data-productive-card-metadata/);
  assert.match(source, /data-productive-card-status/);
  assert.match(source, /data-productive-card-actions/);
  assert.match(
    source,
    /data-productive-card-actions[^>]*aria-label="Acciones del prospecto"[\s\S]*Ver contexto[\s\S]*Preparar mensaje[\s\S]*NASH Combat[\s\S]*Revisar NBA[\s\S]*Llamar[\s\S]*Agendar/,
  );
  assert.doesNotMatch(source, /card\.intelligenceState/);
  assert.doesNotMatch(source, /CONVERSATION_BRIEF_AVAILABLE_ON_REQUEST/);
  assert.doesNotMatch(adapter, /CONVERSATION_BRIEF_AVAILABLE_ON_REQUEST/);
  assert.match(adapter, /intelligenceLabel:\s*"Asistencia de conversación disponible"/);
  assert.match(adapter, /PROSPECT_CREATED:\s*"Prospecto creado"/);
  assert.match(adapter, /OBJECTION_RECORDED:\s*"Objeción clasificada"/);
  assert.match(adapter, /label:\s*timelineEventLabel\(latest\.eventType\)/);
  assert.match(css, /\.pipeline-module__productive-card\s*\{[^}]*display:\s*grid[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/s);
  assert.match(css, /\.pipeline-module__productive-identity\s*\{[^}]*justify-content:\s*space-between/s);
  assert.match(css, /\.pipeline-module__productive-status\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(css, /\.pipeline-module__card-actions\s*\{[^}]*display:\s*flex[^}]*flex-wrap:\s*wrap/s);
  assert.match(css, /word-break:\s*normal/);
});
