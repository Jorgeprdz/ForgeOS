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
  assert.match(root.innerHTML, /Agregar prospecto/);
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
  assert.match(source, /<select name="source" required data-prospect-source>/);
  for (const sourceLabel of [
    "Referido",
    "Mercado cálido",
    "Mercado frío",
    "Redes sociales",
    "Centro de influencia",
  ]) assert.match(source, new RegExp(`<option value="${sourceLabel}">${sourceLabel}</option>`));
  assert.doesNotMatch(source, /source:\s*"Referido"/);
  assert.match(source, /source,\s*\n\s*status:\s*"referred_new"/);
  assert.match(source, /const referred = source === "Referido"/);
  assert.match(source, /referrerName:\s*referred \? optional\("referrerName"\) : undefined/);
  assert.match(source, /data-referral-source-fields hidden/);
  assert.match(source, /source\.value === "Referido"/);
  assert.match(source, /referralFields\.hidden = !referred/);
  assert.match(source, /referralFields\.querySelectorAll\("input"\)/);
  assert.doesNotMatch(source, /name="status"/);

  assert.match(productiveAdapter, /ForgeProductiveProspectBootstrap067G17B/);
  assert.match(productiveAdapter, /ForgeProductiveProspectService067G17B/);
  assert.match(productiveAdapter, /serviceAuthority\.create\(client\)/);
  assert.match(source, /service\.createProspect\(referralPayload\(form\)\)/);
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
  assert.match(diagnostic, /Jorge Ignacio Palacios Rodríguez/);
  assert.match(diagnostic, /name:\s*"mobile",\s*width:\s*412,\s*height:\s*915,\s*expectedCardColumns:\s*1/);
  assert.match(diagnostic, /name:\s*"tablet",\s*width:\s*1024,\s*height:\s*768,\s*expectedCardColumns:\s*2/);
  assert.match(diagnostic, /name:\s*"desktop",\s*width:\s*1600,\s*height:\s*900,\s*expectedCardColumns:\s*4/);
  assert.match(diagnostic, /timelineCreatedEventVisible[\s\S]*Prospecto creado/);
  assert.match(diagnostic, /productiveTimelineHumanReadable[\s\S]*PROSPECT_CREATED/);
  assert.match(diagnostic, /productiveCardColumnCount/);
  assert.match(diagnostic, /getBoundingClientRect/);
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
  assert.match(source, /data-productive-stage-control/);
  assert.match(source, /Estado del prospecto/);
  assert.match(source, /data-productive-source-label/);
  assert.match(source, /data-productive-card-metadata[\s\S]*data-productive-source-label[\s\S]*pipeline-module__stage-control[\s\S]*data-productive-stage-control/);
  assert.match(source, /productiveAdapter\.updateStage\(card\.id,\s*select\.value\)/);
  assert.match(
    source,
    /data-productive-card-actions[^>]*aria-label="Acciones del prospecto"[\s\S]*Ver contexto[\s\S]*Preparar mensaje[\s\S]*NASH Combat[\s\S]*Revisar NBA[\s\S]*Llamar[\s\S]*Agendar/,
  );
  assert.doesNotMatch(source, /card\.intelligenceState/);
  assert.doesNotMatch(source, /CONVERSATION_BRIEF_AVAILABLE_ON_REQUEST/);
  assert.doesNotMatch(adapter, /CONVERSATION_BRIEF_AVAILABLE_ON_REQUEST/);
  assert.match(adapter, /intelligenceLabel:\s*"Asistencia de conversación disponible"/);
  assert.match(adapter, /referred_new:\s*"Nuevo"/);
  assert.match(adapter, /value:\s*"referred_new",\s*label:\s*"Nuevo"/);
  for (const [value, label] of [
    ["contacted", "Contactado"],
    ["appointment_scheduled", "Cita agendada"],
    ["proposal", "Propuesta"],
    ["decision", "En decisión"],
    ["client", "Cliente"],
  ]) {
    assert.match(adapter, new RegExp(`value: "${value}", label: "${label}"`));
  }
  assert.match(adapter, /PROSPECT_CREATED:\s*"Prospecto creado"/);
  assert.match(adapter, /OBJECTION_RECORDED:\s*"Objeción clasificada"/);
  assert.match(adapter, /label:\s*timelineEventLabel\(latest\.eventType\)/);
  assert.match(adapter, /service\.updateProspect\(prospectId,\s*\{\s*status\s*\}\)/);
  const stageUpdater = adapter.slice(
    adapter.indexOf("async function updateStage"),
    adapter.indexOf("return Object.freeze({", adapter.indexOf("async function updateStage")),
  );
  assert.doesNotMatch(stageUpdater, /source/);
  for (const status of [
    "referred_new",
    "contacted",
    "appointment_scheduled",
    "proposal",
    "decision",
    "client",
  ]) assert.match(adapter, new RegExp(`value: "${status}"`));
  assert.match(css, /\.pipeline-module__productive-card\s*\{[^}]*display:\s*grid[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/s);
  assert.match(css, /\[data-productive-pipeline-cards\]\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/s);
  assert.match(css, /@media \(min-width:\s*768px\) and \(max-width:\s*1199px\)[\s\S]*\[data-productive-pipeline-cards\][^{]*\{[^}]*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(css, /@media \(min-width:\s*1200px\)[\s\S]*\[data-productive-pipeline-cards\][^{]*\{[^}]*repeat\(4,\s*minmax\(0,\s*1fr\)\)/s);
  assert.doesNotMatch(css, /\[data-productive-pipeline-cards\][^{]*\{[^}]*(auto-fit|auto-fill)/s);
  assert.match(css, /\.pipeline-module__productive-card\s*\{[^}]*min-width:\s*0[^}]*gap:\s*11px[^}]*padding:\s*15px/s);
  assert.match(css, /\.pipeline-module__productive-status\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/s);
  assert.match(css, /\.pipeline-module__card-actions\s*\{[^}]*display:\s*grid[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(css, /word-break:\s*normal/);
  assert.match(css, /border-left:\s*4px solid var\(--pipeline-stage-accent\)/);
  assert.match(css, /data-productive-stage="referred_new"/);
  assert.match(css, /data-productive-stage="client"/);
  assert.match(css, /\.pipeline-module__action--combat/);
  assert.match(css, /\.pipeline-module__action--nba/);
  assert.match(css, /\.pipeline-module__action--call/);
  assert.match(css, /\.pipeline-module__action--calendar/);
  assert.match(css, /\.pipeline-module__stage-control select/);
  assert.match(css, /\[data-manual-whatsapp\][\s\S]*rgba\(78,\s*196,\s*119/);
  assert.doesNotMatch(source, /data-productive-card-actions[\s\S]{0,120}data-manual-whatsapp/);
});

test("productive Pipeline filters loaded cards without mutating productive truth", async () => {
  const source = await readFile(
    "docs/static-preview/forge-alive-material3/pipeline-module.js",
    "utf8",
  );
  const css = await readFile(
    "docs/static-preview/forge-alive-material3/app.css",
    "utf8",
  );
  const diagnostic = await readFile(
    "tools/forge-ui-visual-diagnostic.mjs",
    "utf8",
  );

  assert.match(source, /data-productive-filter-bar/);
  assert.match(source, /data-productive-filter-source/);
  assert.match(source, /data-productive-filter-status/);
  assert.match(source, /data-clear-productive-filters/);
  assert.match(source, /data-productive-filter-count aria-live="polite"/);
  assert.match(source, /No hay prospectos que coincidan con estos filtros\./);
  for (const option of [
    "Todas las fuentes",
    "Referido",
    "Mercado cálido",
    "Mercado frío",
    "Redes sociales",
    "Centro de influencia",
  ]) assert.match(source, new RegExp(option));
  for (const [value, label] of [
    ["", "Todos los estados"],
    ["referred_new", "Nuevo"],
    ["contacted", "Contactado"],
    ["appointment_scheduled", "Cita agendada"],
    ["proposal", "Propuesta"],
    ["decision", "En decisión"],
    ["client", "Cliente"],
  ]) {
    if (value) assert.match(source, new RegExp(`value: "${value}", label: "${label}"`));
    else assert.match(source, new RegExp(label));
  }
  assert.match(
    source,
    /productiveCards\.filter\(card =>\s*\(!productiveFilters\.source \|\| card\.sourceValue === productiveFilters\.source\)\s*&&\s*\(!productiveFilters\.status \|\| card\.status === productiveFilters\.status\)/s,
  );
  const filterListeners = source.slice(
    source.indexOf('root.querySelector?.("[data-productive-filter-source]")'),
    source.indexOf('createReferral?.addEventListener("click"'),
  );
  assert.doesNotMatch(filterListeners, /updateProspect|updateStage|reload\(|sourceValue\s*=|\.status\s*=/);
  assert.match(filterListeners, /productiveFilters = \{ \.\.\.productiveFilters, source: event\.currentTarget\.value \}/);
  assert.match(filterListeners, /productiveFilters = \{ \.\.\.productiveFilters, status: event\.currentTarget\.value \}/);
  assert.match(filterListeners, /productiveFilters = \{ source: "", status: "" \}/);
  assert.match(source, /\$\{filteredProductiveCards\.length\} de \$\{productiveCards\.length\} prospectos/);

  assert.match(css, /\.pipeline-module__filters\s*\{[^}]*display:\s*grid[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/s);
  assert.match(css, /\.pipeline-module__filters select\s*\{[^}]*min-width:\s*0[^}]*min-height:\s*36px/s);
  assert.match(css, /@media \(min-width:\s*768px\) and \(max-width:\s*1199px\)[\s\S]*\.pipeline-module__filters\s*\{[^}]*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(css, /@media \(min-width:\s*1200px\)[\s\S]*\.pipeline-module__filters\s*\{[^}]*minmax\(180px,\s*1fr\)/s);

  for (const gate of [
    "productiveSourceFilterAccepted",
    "productiveStatusFilterAccepted",
    "productiveCombinedFilterAccepted",
    "productiveClearFilterAccepted",
    "productiveEmptyFilterAccepted",
    "productiveFilterGeometryValid",
  ]) assert.match(diagnostic, new RegExp(gate));
  assert.match(diagnostic, /03bc-pipeline-filtered-referido-contactado/);
  assert.match(diagnostic, /03bd-pipeline-filter-no-results/);
});

test("final visual closure keeps Combat, NBA, NASH approval, and floating controls governed", async () => {
  const source = await readFile(
    "docs/static-preview/forge-alive-material3/pipeline-module.js",
    "utf8",
  );
  const css = await readFile(
    "docs/static-preview/forge-alive-material3/app.css",
    "utf8",
  );
  const sheetCss = await readFile(
    "docs/static-preview/forge-alive-material3/pipeline-referral-modal.css",
    "utf8",
  );
  const diagnostic = await readFile(
    "tools/forge-ui-visual-diagnostic.mjs",
    "utf8",
  );

  assert.match(source, /nash-combat-workspace__header/);
  assert.match(source, /nash-combat-workspace__body/);
  assert.match(source, /nash-combat-workspace__footer/);
  assert.match(source, /body\.scrollTop = 0/);
  assert.match(sheetCss, /\.nash-combat-workspace\s*\{[^}]*grid-template-rows:\s*auto minmax\(0,\s*1fr\) auto[^}]*overflow:\s*hidden/s);
  assert.match(sheetCss, /\.nash-combat-workspace__body\s*\{[^}]*overflow-x:\s*hidden[^}]*overflow-y:\s*auto[^}]*overscroll-behavior:\s*contain/s);
  assert.match(sheetCss, /\.nash-combat-workspace__footer[\s\S]*grid-template-columns:\s*minmax\(0,\s*1fr\)/);

  for (const [technical, human] of [
    ["CONTEXT_READY_FOR_HUMAN_REVIEW", "Contexto listo para revisión"],
    ["READY_FOR_HUMAN_REVIEW", "Listo para revisión"],
    ["HANDLE_OBJECTION", "Atender objeción"],
    ["OBJECTION_RECORDED", "Objeción registrada"],
    ["STALL", "Conversación estancada"],
  ]) assert.match(source, new RegExp(`${technical}: "${human}"`));
  assert.match(source, /nba-workspace__technical/);
  assert.match(source, /<summary>Evidencia técnica<\/summary>/);
  assert.match(sheetCss, /\.nba-workspace__body[\s\S]*overflow-wrap:\s*anywhere/);

  assert.match(source, /dataset\.nashApprovalState = "pending"/);
  assert.match(source, /dataset\.nashApprovalState = url \? "approved" : "blocked"/);
  assert.match(source, /approveButton\.textContent = url \? "Texto exacto aprobado"/);
  assert.match(diagnostic, /03c-pipeline-nash-before-acceptance/);
  assert.match(diagnostic, /03d-pipeline-nash-after-acceptance/);
  assert.match(diagnostic, /nashBefore\.equals\(nashAfter\)/);
  assert.match(diagnostic, /beforeAfterIdentical/);

  for (const token of [
    "--forge-mobile-nav-height",
    "--forge-mobile-nav-clearance",
    "--forge-mobile-floating-gap",
  ]) assert.match(css, new RegExp(token));
  assert.match(
    css,
    /padding-bottom:\s*calc\(\s*var\(--forge-mobile-nav-height\)\s*\+\s*var\(--forge-mobile-nav-clearance\)\s*\+\s*env\(safe-area-inset-bottom\)/s,
  );
  assert.match(
    css,
    /\.bottom-shell\s*\{[^}]*bottom:\s*calc\(\s*var\(--forge-mobile-floating-gap\)\s*\+\s*env\(safe-area-inset-bottom\)/s,
  );
  assert.doesNotMatch(css, /\[data-productive-pipeline-cards\]\s*\{[^}]*padding-bottom/s);
});

test("productive workspaces share one styled and recoverable lifecycle", async () => {
  const source = await readFile(
    "docs/static-preview/forge-alive-material3/pipeline-module.js",
    "utf8",
  );
  const sheetCss = await readFile(
    "docs/static-preview/forge-alive-material3/pipeline-referral-modal.css",
    "utf8",
  );

  assert.match(source, /pipeline-referral-modal\.css\?v=ui-m06-referral-004/);
  assert.match(source, /referralStylePromise = undefined/);
  assert.match(source, /const productiveWorkspaceController = \(\(\) =>/);
  assert.match(source, /await ensureReferralStyles\(\)/);
  assert.match(source, /close\(\{ restoreFocus: false \}\)/);
  assert.match(source, /document\.body\.style\.overflow = "hidden"/);
  assert.match(source, /document\.body\.style\.overflow = previousOverflow/);
  assert.match(source, /if \(event\.key !== "Escape"\) return/);
  assert.match(source, /data-close-workspace/);
  assert.match(source, /openingToken !== token/);
  assert.match(source, /trigger\.setAttribute\("aria-busy", "true"\)/);
  assert.match(source, /kind: "nash"/);
  assert.match(source, /kind: "combat"/);
  assert.match(source, /kind: "nba"/);
  assert.equal((source.match(/document\.body\.append\(layer\)/g) || []).length, 3);
  assert.match(sheetCss, /\.referral-sheet-layer\s*\{[^}]*position:\s*fixed/s);
  assert.match(sheetCss, /\.referral-sheet__body button,[\s\S]*appearance:\s*none/);
});
