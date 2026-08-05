import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [runtime, styles, loader, authority, productiveModule, pipelineLock] = await Promise.all([
  readFile("docs/static-preview/forge-alive-material3/pipeline-aura-light-2026.js", "utf8"),
  readFile("docs/static-preview/forge-alive-material3/pipeline-aura-light-2026.css", "utf8"),
  readFile("docs/static-preview/forge-alive-material3/pipeline-action-identity.js", "utf8"),
  readFile("adr/ADR-026 — Aura Light Pipeline Productive Rebuild Execution Authority.txt", "utf8"),
  readFile("docs/static-preview/forge-alive-material3/pipeline-module.js", "utf8"),
  readFile("docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_002_ADVISOR_PIPELINE_LOCK.md", "utf8"),
]);

for (const required of [
  "PIPELINE_REDESIGN=YES",
  "PROSPECT_VIEWS=CARDS_AND_LIST",
  "HOME_DASHBOARD=DEFERRED_UNTIL_WIDGET_SIGNALS_ARE_KNOWN",
  "VISIBLE_ROW_ACTIONS=WHATSAPP_CALL_TIMELINE_MORE",
  "MATERIAL_3_DESIGN_ALLOWED=NO",
  "AURA_LIGHT_ONLY=YES",
]) assert.match(authority, new RegExp(required));

for (const required of [
  "forge.pipeline.view.v1",
  "data-aura-pipeline-view",
  "data-aura-pipeline-more",
  "data-aura-pipeline-menu",
  "data-aura-menu-proxy",
  "Preparar WhatsApp",
  "Llamar a",
  "Abrir Timeline",
  "Agendar en Calendar",
  "Abrir NASH Combat",
  "Revisar siguiente mejor acción",
  "Editar prospecto",
  "Eliminar del Pipeline",
  "material3DesignUsed: false",
  "storedPrivateData: false",
]) assert.match(runtime, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));

assert.match(runtime, /localStorage\?\.setItem\(STORAGE_KEY, normalizedView\(value\)\)/);
assert.doesNotMatch(runtime, /localStorage[^\n]*(?:prospect|phone|email|timeline|fullName)/i);
assert.match(runtime, /source\.click\(\)/);
assert.match(runtime, /event\.key !== "Escape"/);
assert.match(runtime, /aria-haspopup/);
assert.match(runtime, /role", "menu"/);
assert.match(runtime, /role", "menuitem"/);

for (const required of [
  "--aura-canvas: #f7f8fc",
  "--aura-surface: #ffffff",
  "--aura-brand: #6c3ce8",
  "--aura-text-primary: #11152b",
  "min-block-size: 44px",
  "data-aura-view=\"cards\"",
  "data-aura-view=\"list\"",
  "@media (max-width: 760px)",
  "@media (prefers-reduced-motion: reduce)",
  "@media (forced-colors: active)",
]) assert.match(styles, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));

for (const prohibited of [
  "--forge-sys-",
  "#ffc95f",
  "#ffe09c",
  "rgba(16, 34, 61",
  "rgba(7, 20, 38",
]) assert.equal(styles.toLowerCase().includes(prohibited.toLowerCase()), false, `PROHIBITED_PIPELINE_VISUAL=${prohibited}`);

assert.match(loader, /pipeline-aura-light-2026\.js/);
assert.match(loader, /visibleActions: Object\.freeze\(\["whatsapp", "call", "timeline", "more"\]\)/);
assert.match(loader, /material3DesignUsed: false/);

for (const protectedContract of [
  "data-productive-stage-control",
  "productiveAdapter.updateStage",
  "PRODUCTIVE_STAGE_RENDER_CONFIRMATION_MISMATCH",
  "data-productive-filter-source",
  "data-productive-filter-status",
  "data-view-productive-context",
  "data-prepare-productive-message",
]) assert.match(productiveModule, new RegExp(protectedContract.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));

for (const lockedRequirement of [
  "same card DOM identity retained",
  "zero authentication refresh during save",
  "no automatic Stage transition",
  "no automatic task or message send",
]) assert.match(pipelineLock, new RegExp(lockedRequirement, "i"));

console.log("AURA_LIGHT_PIPELINE_PRODUCTIVE_REBUILD=PASS");
console.log("PIPELINE_VIEWS=CARDS_AND_LIST");
console.log("PIPELINE_VISIBLE_ACTIONS=WHATSAPP_CALL_TIMELINE_MORE");
console.log("MATERIAL_3_DESIGN_USAGE=0");
console.log("HOME_DASHBOARD_MUTATION=0");
