import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const ROOT = new URL("../", import.meta.url);
const quotePath = relative => new URL(`docs/static-preview/forge-aura/quotes/${relative}`, ROOT);
const moduleSource = await readFile(quotePath("quotes-module.js"), "utf8");
const cssSource = await readFile(quotePath("quotes.css"), "utf8");
const adapterSource = await readFile(quotePath("quotes-adapter.js"), "utf8");

test("QUOTES_CONSTITUTIONAL_GATE: human decision remains explicit", () => {
  assert.match(moduleSource, /Cotización calculada/);
  assert.match(moduleSource, /Revisar y confirmar/);
  assert.match(moduleSource, /Cotización confirmada/);
  assert.match(moduleSource, /HUMAN_DECISION requerida para confirmar/);
  assert.doesNotMatch(moduleSource, /confirmar automáticamente/i);
});

test("AURA_LIGHT_GATE: one permanent module action and settled information hierarchy", () => {
  assert.match(moduleSource, />\+ Nueva cotización</);
  assert.match(moduleSource, /Convierte una cotización en una propuesta lista para presentar/);
  assert.match(moduleSource, /Elegir producto manualmente/);
  assert.match(moduleSource, /data-quotes-dropzone/);
  assert.doesNotMatch(moduleSource, /01 Contractual|02 Referencia actual|03 Proyección/);
  assert.doesNotMatch(moduleSource, /Lista para revisar|Confirmar Accepted Quote/);
  assert.doesNotMatch(cssSource, /aura-quotes__truth-card/);
  assert.doesNotMatch(cssSource, /#[0-9a-fA-F]{3,8}\b/);
});

test("PRODUCTIVE_AUTHORITIES_REUSED: frontend stays behind the existing adapter", () => {
  assert.match(moduleSource, /^import \{ createQuotesProductiveAdapter \} from "\.\/quotes-adapter\.js";/m);
  for (const authority of [
    "parsePdfFileToAcceptedQuotePacket",
    "calculateAcceptedQuote",
    "validatePacket",
    "createAcceptedQuoteReviewSnapshotBoundary",
    "captureReviewedQuoteLifecycle",
    "buildQuoteBenefitSummary",
    "createQuotePrintableRouteController",
  ]) assert.match(adapterSource, new RegExp(authority));
  assert.doesNotMatch(moduleSource, /from ["'][^"']*(?:quote-runtime|product-intelligence|projection|banxico)[^"']*["']/i);
});

test("NEW_ENGINE_AND_CALCULATION_COUNTS remain zero in presentation layer", () => {
  assert.doesNotMatch(moduleSource, /function\s+(?:calculate|forecast|project|convertUdi|score|inferProduct)\b/i);
  assert.doesNotMatch(moduleSource, /(?:\|\||\?\?)\s*0\b/);
  assert.match(moduleSource, /La ausencia permanece visible y no se convirtió en cero/);
});

test("PROGRESSIVE_DISCLOSURE: accessible user-language tabs replace truth cards", () => {
  for (const label of ["Resumen", "Beneficios", "Proyección", "Evidencia"]) assert.match(moduleSource, new RegExp(`"${label}"`));
  assert.match(moduleSource, /role="tablist"/);
  assert.match(moduleSource, /role="tab"/);
  assert.match(moduleSource, /aria-selected=/);
  assert.match(moduleSource, /role="tabpanel"/);
  assert.match(moduleSource, /ArrowLeft/);
  assert.match(moduleSource, /ArrowRight/);
  assert.match(moduleSource, /Home/);
  assert.match(moduleSource, /End/);
});

test("MAX_ATTENTION_SIGNALS=3 and consequence copy is evidence-bound", () => {
  assert.match(moduleSource, /return items\.slice\(0, 3\)/);
  assert.match(moduleSource, /Producto distinto al esperado/);
  assert.match(moduleSource, /Información pendiente/);
  assert.match(moduleSource, /Referencia económica no disponible/);
  assert.doesNotMatch(moduleSource, /countdown|última oportunidad|urgente/i);
});

test("LOADING_PROGRESS_HONEST and ARIA_LIVE are explicit", () => {
  assert.match(moduleSource, /Archivo recibido/);
  assert.match(moduleSource, /Procesando evidencia y motores productivos/);
  assert.match(moduleSource, /No se presentan porcentajes ficticios/);
  assert.match(moduleSource, /aria-live="polite"/);
  assert.match(moduleSource, /aria-busy="true"/);
  assert.doesNotMatch(moduleSource, /\b(?:25|50|75|100)%\b/);
});

test("FORECAST_TRUTH_PRESERVED: projections stay labeled and non-contractual", () => {
  assert.match(moduleSource, /Proyección \/ estimación\./);
  assert.match(moduleSource, /No constituye garantía contractual/);
  assert.match(moduleSource, /PROJECTION \/ ESTIMATE \/ SCENARIO/);
  assert.match(moduleSource, /FORECAST \/ DECISION_SUPPORT/);
  assert.doesNotMatch(moduleSource, /probability|probabilidad ponderada/i);
});

test("ECONOMIC_EVIDENCE_PRESERVED: unavailable remains unavailable", () => {
  assert.match(moduleSource, /<strong>UNAVAILABLE<\/strong>/);
  assert.match(moduleSource, /No se creó un valor sustituto/);
  assert.match(moduleSource, /Valor utilizado/);
  assert.match(moduleSource, /Fecha de referencia/);
  assert.match(moduleSource, /Fuente/);
});

test("ONE_PRIMARY_ACTION_PER_STATE: READY/PARTIAL and ACCEPTED have distinct hierarchy", () => {
  assert.match(moduleSource, /data-quotes-action="accept"[^>]*>\$\{busyAction === "accept" \? "Confirmando…" : "Revisar y confirmar"\}/);
  assert.match(moduleSource, /data-quotes-action="presentation"[^>]*>Crear presentación<\/button>/);
  assert.match(moduleSource, /data-quotes-action="preview"/);
  assert.match(moduleSource, /data-quotes-action="download"/);
});

test("KEYBOARD_FOCUS_AND_MODAL: Escape, focus trap and return focus are preserved", () => {
  assert.match(moduleSource, /aria-modal="true"/);
  assert.match(moduleSource, /event\.key === "Escape"/);
  assert.match(moduleSource, /event\.key !== "Tab"/);
  assert.match(moduleSource, /lastFocused\?\.focus/);
  assert.match(moduleSource, /data-quotes-modal-panel/);
});

test("RESPONSIVE_AND_REDUCED_MOTION: mobile tablet desktop and zoom-safe primitives exist", () => {
  assert.match(cssSource, /@media \(max-width: 834px\)/);
  assert.match(cssSource, /@media \(max-width: 760px\)/);
  assert.match(cssSource, /@media \(max-width: 430px\)/);
  assert.match(cssSource, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(cssSource, /min-height: var\(--aura-control\)/);
  assert.match(cssSource, /min-width: 0/);
  assert.match(cssSource, /env\(safe-area-inset-bottom\)/);
  assert.doesNotMatch(cssSource, /overflow-x:\s*(?:scroll|auto).*aura-quotes(?:\s|\{)/);
});

test("LEGACY_AND_MATERIAL_VISUAL_IMPORT_COUNTS remain zero", () => {
  assert.doesNotMatch(moduleSource, /forge-alive-material3|material 3|legacy recovery/i);
  assert.doesNotMatch(cssSource, /@import|forge-alive-material3|legacy recovery/i);
});