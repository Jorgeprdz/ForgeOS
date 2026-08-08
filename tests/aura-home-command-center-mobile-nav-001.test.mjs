import assert from "node:assert/strict";
import { access, readFile, rm } from "node:fs/promises";
import { resolve } from "node:path";
import {
  buildAgendaInputFromPipeline,
  firstNameFor,
  greetingFor,
  normalizeRadarForOrchestrator,
  resolveBrowserTimeZone,
  selectCarteraAttention,
} from "../docs/static-preview/forge-aura/home/home-core.js";
import { buildAgendaReadModel } from "../advisor-os/next-action/agenda-read-model.js";
import { normalizeRoute, readRoute } from "../docs/static-preview/forge-aura/aura-router-v4.js";

const root = process.cwd();
const read = path => readFile(resolve(root, path), "utf8");
const pass = name => console.log(`${name}=PASS`);

assert.equal(firstNameFor({ user_metadata: { given_name: "Jorge", full_name: "Otro Nombre" } }), "Jorge");
assert.equal(firstNameFor({ user_metadata: { full_name: "Jorge Ignacio Palacios" } }), "Jorge");
assert.equal(firstNameFor({ user_metadata: { name: "Ana Pérez" } }), "Ana");
pass("HOME_AUTHENTICATED_NAME_TEST");

const instant = "2026-08-08T18:30:00.000Z";
assert.equal(greetingFor(instant, "America/Mexico_City"), "Buenas tardes");
assert.equal(greetingFor(instant, "Australia/Sydney"), "Buenas noches");
assert.equal(greetingFor(instant, "Europe/Madrid"), "Buenas noches");
assert.equal(greetingFor(instant, "America/New_York"), "Buenas tardes");
pass("HOME_DYNAMIC_GREETING_TEST");

const fakeIntl = { DateTimeFormat: () => ({ resolvedOptions: () => ({ timeZone: "Australia/Sydney" }) }) };
assert.equal(resolveBrowserTimeZone(fakeIntl), "Australia/Sydney");
pass("HOME_BROWSER_TIMEZONE_TEST");

const homeCore = await read("docs/static-preview/forge-aura/home/home-core.js");
const homeModule = await read("docs/static-preview/forge-aura/home/home-module.js");
const homeAdapter = await read("docs/static-preview/forge-aura/home/home-adapter-pages-v1.js");
const shell = await read("docs/static-preview/forge-aura/aura-shell.js");
const shellCss = await read("docs/static-preview/forge-aura/aura-shell.css");
const app = await read("docs/static-preview/forge-aura/app-v4.js");
const preparer = await read("scripts/prepare-aura-home-pages-authorities.mjs");

assert.doesNotMatch(homeCore, /const\s+TIME_ZONE\s*=\s*["']America\/Mexico_City/);
assert.doesNotMatch(homeModule, /America\/Mexico_City/);
assert.match(homeCore, /resolvedOptions\?\.\(\)\.timeZone|resolvedOptions\(\)\.timeZone/);
assert.match(homeModule, /pageshow/);
assert.match(homeModule, /visibilitychange/);
pass("HOME_TIMEZONE_REFRESH_TEST");

for (const banned of ["Lariza", "Octavio", "Ana Rodríguez", "Claudia", "Roberto"]) {
  assert.equal(homeCore.includes(banned) || homeModule.includes(banned), false, `runtime fixture leaked: ${banned}`);
}
assert.match(homeModule, /No mostraremos cero|no mostrará cero|no mostraremos datos de ejemplo/i);
assert.match(homeCore, /missing_or_incomplete_operational_evidence/);
pass("HOME_NO_FAKE_DATA_TEST");
pass("HOME_UNKNOWN_IS_NOT_ZERO_TEST");

const agendaInput = buildAgendaInputFromPipeline([
  { id: "p-1", fullName: "Persona A", status: "contacted", nextCommitment: { type: "Seguimiento", dueAt: "2026-08-08T15:00:00.000Z" }, timelineState: "CONNECTED" },
  { id: "p-2", fullName: "Persona B", status: "proposal", nextCommitment: null, timelineState: "CONNECTED", priority: 4 },
]);
const agenda = buildAgendaReadModel({ ...agendaInput, now: new Date("2026-08-08T18:00:00.000Z") });
assert.equal(agenda.diagnostics.projectionOnly, true);
assert.equal(agenda.diagnostics.persistenceOwned, false);
assert.equal(agenda.diagnostics.unknownAsZero, false);
assert.equal(agenda.sections.some(section => section.id === "UNSCHEDULED_ACTIVE_CASES"), true);
pass("HOME_AGENDA_PROJECTION_TEST");

assert.match(homeAdapter, /advisor-os\/next-action\/agenda-read-model\.js/);
assert.match(homeAdapter, /productive-smart-widget-orchestrator\.mjs/);
assert.match(homeAdapter, /buildProductiveSmartWidgetStack/);
assert.match(homeAdapter, /forge_cartera050_list_future_radar/);
assert.doesNotMatch(homeAdapter, /\.insert\s*\(|\.update\s*\(|\.upsert\s*\(|\.delete\s*\(/);
assert.match(homeAdapter, /productWrites:\s*0/);
pass("HOME_PRIORITY_OWNER_TEST");
pass("HOME_NO_DUPLICATE_ENGINE_TEST");

const radar = normalizeRadarForOrchestrator({
  items: [{ signalReference: "s1", signalType: "UNCONFIRMED_PAYMENT_EVIDENCE", truthClass: "DETECTED_EVIDENCE", sourceAuthority: "PAYMENT_OBLIGATION", whyNow: "Falta confirmar evidencia", uncertainty: "Pago no confirmado", smallestUsefulAction: "Revisar pago", advisorConfirmationRequired: true }],
  focusItems: [{ signalReference: "s1", signalType: "UNCONFIRMED_PAYMENT_EVIDENCE", truthClass: "DETECTED_EVIDENCE", sourceAuthority: "PAYMENT_OBLIGATION", whyNow: "Falta confirmar evidencia", uncertainty: "Pago no confirmado", smallestUsefulAction: "Revisar pago", advisorConfirmationRequired: true }],
});
assert.equal(radar.signals[0].signalType, "PAYMENT_CONFIRMATION_REQUIRED");
const attention = selectCarteraAttention(radar, 1)[0];
assert.equal(attention.truthClass, "DETECTED_EVIDENCE");
assert.equal(attention.uncertainty, "Pago no confirmado");
assert.equal(attention.advisorConfirmationRequired, true);
pass("HOME_POLICY_TRUTH_TEST");

assert.doesNotMatch(homeCore + homeModule, /eres indisciplinado|eres flojo|mala actitud|no tienes potencial/i);
assert.match(homeCore, /(sin|no) inferir disciplina, motivación ni carácter/i);
pass("HOME_MICK_BOUNDARY_TEST");

assert.match(app, /forge-alive-material3\/alfred-command-runtime\.js/);
assert.match(app, /data\.alfredCommandRuntimeStyles|dataset\.alfredCommandRuntimeStyles/);
assert.doesNotMatch(app, /alfred-command-runtime\.css/);
pass("HOME_ALFRED_REUSE_TEST");

assert.equal(normalizeRoute("dashboard"), "inicio");
assert.equal(normalizeRoute(""), "inicio");
assert.equal(readRoute("https://example.test/static-preview/forge-aura/"), "inicio");
pass("AURA_HOME_DEFAULT_ROUTE_TEST");

const mobileMarkup = shell.match(/<nav class="aura-mobile-nav"[\s\S]*?<\/nav>/)?.[0] || "";
const labels = [...mobileMarkup.matchAll(/<span>(Inicio|Pipeline|Alfred|Cartera|Más|Actividad|Ingresos)<\/span>/g)].map(match => match[1]);
assert.deepEqual(labels, ["Inicio", "Pipeline", "Alfred", "Cartera", "Más"]);
assert.equal(mobileMarkup.includes("Actividad"), false);
assert.match(shell, /data-aura-more-route="actividad"/);
assert.match(shell, /data-aura-productive-link="cotizaciones"/);
assert.match(shell, /data-aura-more-route="comisiones"/);
pass("AURA_MOBILE_NAV_CONTRACT_TEST");
pass("AURA_MORE_SHEET_TEST");

assert.match(shell, /data-aura-alfred-command-pill/);
assert.match(shellCss, /env\(safe-area-inset-bottom\)/);
assert.match(shell, /visualViewport/);
assert.match(shellCss, /--aura-keyboard-inset/);
assert.match(shellCss, /height:64px/);
assert.match(shellCss, /left:12px;right:12px/);
pass("AURA_ALFRED_COMMAND_PILL_TEST");
pass("AURA_SAFE_AREA_CONTRACT_TEST");
pass("AURA_MOBILE_KEYBOARD_CONTRACT_TEST");

assert.match(shellCss, /focus|:focus-visible|:focus-within/);
assert.match(shellCss, /min-width:44px|width:44px|height:44px/);
pass("AURA_VISIBLE_FOCUS_CONTRACT_TEST");
assert.match(await read("docs/static-preview/forge-aura/aura-tokens.css"), /prefers-reduced-motion/);
pass("AURA_REDUCED_MOTION_CONTRACT_TEST");

assert.match(homeModule, /controller\?\.abort/);
assert.match(homeAdapter, /revision !== generation|generation/);
assert.match(homeAdapter, /HOME_SESSION_CHANGED_AFTER_READ/);
assert.match(homeModule, /scrub\(reason/);
assert.match(app, /advisor-switch-scrub/);
pass("HOME_SESSION_SCRUB_TEST");
pass("HOME_LATE_RESULT_REJECTION_TEST");
pass("HOME_ADVISOR_SWITCH_SCRUB_TEST");

assert.match(preparer, /CANONICAL_REPOSITORY_MODULES_COPIED_WITHOUT_REWRITE/);
assert.match(preparer, /visualAssets:\s*0/);
assert.match(await read("scripts/build-advisor-presentation-pages-runtime.mjs"), /prepare-aura-home-pages-authorities\.mjs/);
await import(`../scripts/prepare-aura-home-pages-authorities.mjs?test=${Date.now()}`);
for (const target of [
  "docs/static-preview/forge-alive-material3/home-authorities/repo/advisor-os/next-action/agenda-read-model.js",
  "docs/static-preview/forge-alive-material3/home-authorities/repo/advisor-os/forge-alive/smart-widgets/productive-smart-widget-orchestrator.mjs",
  "docs/static-preview/forge-alive/home-authorities/repo/advisor-os/next-action/agenda-read-model.js",
]) await access(resolve(root, target));
pass("AURA_PAGES_IMPORT_GRAPH_TEST");

for (const path of [
  "docs/static-preview/forge-alive-material3/home-authorities",
  "docs/static-preview/forge-alive/home-authorities",
]) await rm(resolve(root, path), { recursive: true, force: true });

console.log("HOME_COMMAND_CENTER_CONTRACT_SUITE=PASS");
