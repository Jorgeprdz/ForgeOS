import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const corePath = new URL("../docs/static-preview/forge-alive-material3/pipeline-aura-core.js", import.meta.url);
const calendarPath = new URL("../docs/static-preview/forge-alive-material3/pipeline-aura-calendar.js", import.meta.url);
const calendarCompatibilityPath = new URL("../docs/static-preview/forge-alive-material3/pipeline-google-calendar.js", import.meta.url);
const modulePath = new URL("../docs/static-preview/forge-alive-material3/pipeline-module.js", import.meta.url);
const stylesPath = new URL("../docs/static-preview/forge-alive-material3/pipeline-aura-light-2026.css", import.meta.url);
const actionIdentityPath = new URL("../docs/static-preview/forge-alive-material3/pipeline-action-identity.js", import.meta.url);
const appPath = new URL("../docs/static-preview/forge-alive-material3/app.js", import.meta.url);
const authorityPath = new URL("../adr/ADR-026 — Aura Light Pipeline Productive Rebuild Execution Authority.txt", import.meta.url);

const core = await import(`${pathToFileURL(corePath.pathname).href}?test=${Date.now()}`);
const calendar = await import(`${pathToFileURL(calendarPath.pathname).href}?test=${Date.now()}`);
const [runtime, styles, calendarCompatibility, actionIdentity, app, authority] = await Promise.all([
  readFile(modulePath, "utf8"),
  readFile(stylesPath, "utf8"),
  readFile(calendarCompatibilityPath, "utf8"),
  readFile(actionIdentityPath, "utf8"),
  readFile(appPath, "utf8"),
  readFile(authorityPath, "utf8"),
]);

const sample = Object.freeze({
  id: "prospect-1",
  fullName: "Ana López",
  status: "contacted",
  stageLabel: "Contactado",
  sourceValue: "Referido",
  sourceSummary: "Referido · María",
  phone: "+525512345678",
  latestActivity: {
    label: "Conversación registrada",
    occurredAt: "2026-08-04T18:00:00Z",
  },
  nextCommitment: {
    type: "Seguimiento",
    dueAt: "2026-08-06T16:00:00Z",
  },
  prospect: {
    id: "prospect-1",
    fullName: "Ana López",
    phone: "+525512345678",
    source: "Referido",
  },
});

assert.equal(core.DESIGN_AUTHORITY, "FORGE_AURA_LIGHT_2026_V1");
assert.equal(core.VIEW_STORAGE_KEY, "forge.pipeline.view");
assert.equal(
  core.matchesFilters(sample, {
    query: "ana",
    source: "Referido",
    status: "contacted",
  }),
  true,
);
assert.equal(core.matchesFilters(sample, { query: "jorge" }), false);

const card = core.cardMarkup(sample);
const row = core.rowMarkup(sample);
for (const markup of [card, row]) {
  assert.match(markup, /data-aura-record="prospect-1"/);
  assert.match(markup, /data-aura-stage-select="prospect-1"/);
  assert.match(markup, /data-aura-action="whatsapp"/);
  assert.match(markup, /href="tel:\+525512345678"/);
  assert.match(markup, /data-aura-action="timeline"/);
  assert.match(markup, /data-aura-action="more"/);
  assert.match(markup, /role="menu"/);
  assert.match(markup, /data-aura-action="calendar"/);
  assert.match(markup, /data-aura-action="edit"/);
  assert.match(markup, /data-aura-action="combat"/);
  assert.match(markup, /data-aura-action="nba"/);
  assert.match(markup, /data-aura-action="archive"/);
}

const calendarUrl = calendar.buildAuraPipelineGoogleCalendarUrl({
  prospect: {
    fullName: "Ana López",
    stageLabel: "Contactado",
    sourceSummary: "Referido · María",
    latestActivity: "Conversación registrada",
  },
  date: "2026-08-06",
  time: "10:30",
  durationMinutes: 45,
});
assert.match(calendarUrl, /^https:\/\/calendar\.google\.com\/calendar\/render\?/);
assert.match(calendarUrl, /ctz=America%2FMexico_City/);
assert.ok(calendarUrl.includes("text=Cita+con+Ana+L%C3%B3pez"));
assert.equal(
  calendar.buildAuraPipelineGoogleCalendarUrl({
    prospect: sample,
    date: "invalid",
    time: "10:30",
    durationMinutes: 45,
  }),
  null,
);

for (const required of [
  'root.dataset.pipelineRenderer = "aura-native"',
  "createProductiveIntelligenceAdapter",
  "requestStageTransition",
  "AURA_STAGE_RECORD_IDENTITY_CHANGED",
  "data-aura-collection=\"cards\"",
  "data-aura-collection=\"list\"",
  "matchesFilters",
  "applyFilters",
  "role=\"menuitem\"",
  "event.key === \"ArrowDown\"",
  "event.key === \"Escape\"",
  "appendEntry",
  "PROSPECT_JOURNAL_TIMELINE_LINK_MISSING",
  "buildPipelineGoogleCalendarUrl",
  "prepareMessage",
  "registerObjectionClassification",
  "service.updateProspect",
  "service.archiveProspect",
  "legacyDomEnhancerUsed: false",
  "storedPrivateData: false",
  "material3DesignUsed: false",
]) {
  assert.ok(runtime.includes(required), `MISSING_RUNTIME_CONTRACT=${required}`);
}

for (const prohibited of [
  "MutationObserver",
  "data-productive-prospect-card",
  "pipeline-module__productive-card",
  "data-aura-menu-proxy",
  "source.click()",
  "pipeline-aura-light-2026.js",
]) {
  assert.equal(runtime.includes(prohibited), false, `LEGACY_ENHANCER_FOUND=${prohibited}`);
}

assert.match(runtime, /localStorage\?\.setItem\(VIEW_STORAGE_KEY, view\)/);
assert.doesNotMatch(
  runtime,
  /localStorage[^\n]*(?:fullName|phone|email|timeline|prospect)/i,
);

assert.match(calendarCompatibility, /pipeline-aura-calendar\.js\?v=aura-native-pipeline-002/);
assert.match(calendarCompatibility, /automaticWorkspaceInstallation: false/);
assert.match(calendarCompatibility, /material3DesignUsed: false/);
for (const prohibited of [
  "MutationObserver",
  "document.body.append",
  "pipeline-google-calendar.css",
  "installPipelineGoogleCalendar();",
]) {
  assert.equal(
    calendarCompatibility.includes(prohibited),
    false,
    `LEGACY_CALENDAR_OBSERVER_FOUND=${prohibited}`,
  );
}

assert.ok(app.includes("pipeline-module.js?v=aura-native-pipeline-002"));
assert.ok(app.includes("pipeline-action-identity.js?v=aura-native-pipeline-002"));
for (const retiredImport of [
  "pipeline-ui-stability.js",
  "pipeline-stage-rpc-authority.js",
  "pipeline-interaction-authority.js",
  "pipeline-prospect-admin.js",
  "pipeline-google-calendar.js",
  "pipeline-context-journal.js",
  "pipeline-public-acceptance-hotfix.js",
  "pipeline-filter-count-authority.js",
  "pipeline-stage-filter-authority.js",
]) {
  assert.equal(app.includes(retiredImport), false, `LEGACY_BOOT_IMPORT=${retiredImport}`);
}

for (const required of [
  "--aura-canvas: #f7f8fc",
  "--aura-surface: #ffffff",
  "--aura-brand: #6c3ce8",
  "--aura-text-primary: #11152b",
  "min-block-size: 44px",
  ".aura-pipeline__cards",
  ".aura-pipeline__list",
  ".aura-pipeline__menu",
  "@media (max-width: 860px)",
  "@media (max-width: 620px)",
  "@media (prefers-reduced-motion: reduce)",
  "@media (forced-colors: active)",
]) {
  assert.ok(styles.includes(required), `MISSING_STYLE_CONTRACT=${required}`);
}

for (const prohibited of [
  "--forge-sys-",
  "#ffc95f",
  "#ffe09c",
  "rgba(16, 34, 61",
  "rgba(7, 20, 38",
]) {
  assert.equal(
    styles.toLowerCase().includes(prohibited.toLowerCase()),
    false,
    `PROHIBITED_VISUAL=${prohibited}`,
  );
}

for (const required of [
  "nativeRenderer: true",
  "material3DesignUsed: false",
  "pipelineActionIdentity = \"aura-native\"",
]) {
  assert.ok(actionIdentity.includes(required), `ACTION_IDENTITY_MISSING=${required}`);
}

for (const required of [
  "PIPELINE_REDESIGN=YES",
  "PROSPECT_VIEWS=CARDS_AND_LIST",
  "HOME_DASHBOARD=DEFERRED_UNTIL_WIDGET_SIGNALS_ARE_KNOWN",
  "VISIBLE_ROW_ACTIONS=WHATSAPP_CALL_TIMELINE_MORE",
  "MATERIAL_3_DESIGN_ALLOWED=NO",
  "AURA_LIGHT_ONLY=YES",
]) {
  assert.ok(authority.includes(required), `AUTHORITY_MISSING=${required}`);
}

console.log("AURA_LIGHT_PIPELINE_NATIVE_RENDERER=PASS");
console.log("PIPELINE_VIEWS=CARDS_AND_LIST");
console.log("PIPELINE_ACTIONS=WHATSAPP_CALL_TIMELINE_MORE");
console.log("PIPELINE_LEGACY_DOM_ENHANCER=0");
console.log("PIPELINE_LEGACY_CALENDAR_OBSERVER=0");
console.log("PIPELINE_LEGACY_BOOT_IMPORTS=0");
console.log("MATERIAL_3_DESIGN_USAGE=0");
console.log("HOME_DASHBOARD_MUTATION=0");
