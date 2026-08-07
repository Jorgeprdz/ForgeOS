import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import { officialActivityPeriods, compatibleComparison } from "../docs/static-preview/forge-aura/activity/activity-periods.js";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const moduleSource = () => `${read("docs/static-preview/forge-aura/activity/activity-module.js")}
${read("docs/static-preview/forge-aura/activity/activity-view.js")}`;
const captureSource = () => read("docs/static-preview/forge-aura/activity/activity-capture-adapter.js");
const cssSource = () => read("docs/static-preview/forge-aura/activity/activity.css");

const requiredStates = [
  "ACTIVITY_LOADING", "ACTIVITY_READY", "ACTIVITY_EMPTY", "ACTIVITY_PARTIAL",
  "ACTIVITY_CONFIGURATION_REQUIRED", "ACTIVITY_SOURCE_UNAVAILABLE", "ACTIVITY_SESSION_REQUIRED", "ACTIVITY_ERROR",
];

test("Activity exposes one primary human capture and no technical identifier field", () => {
  const source = moduleSource();
  assert.match(source, />Registrar actividad</);
  assert.doesNotMatch(source, /name="subjectId"|appointment_reference.*<input|UUID|Referencia del sujeto/);
  assert.match(source, /Prospecto o cliente/);
  assert.match(source, /Tipo de actividad/);
  assert.match(source, /Próxima acción/);
  assert.equal((source.match(/type="range"/g) || []).length, 0);
});

test("capture resolves canonical references internally and writes one canonical event", () => {
  const source = captureSource();
  assert.match(source, /toCanonicalInput/);
  assert.match(source, /"appointment"/);
  assert.match(source, /"activity"/);
  assert.doesNotMatch(source, /localStorage|sessionStorage|indexedDB/);
  const module = moduleSource();
  assert.equal((module.match(/runtime\.appendOne\(/g) || []).length, 1);
  assert.doesNotMatch(module, /changeStage\(|sendMessage|createTask|calendar\.insert/);
  assert.doesNotMatch(source, /ADVISOR_REFERRAL_RECEIVED/);
  assert.doesNotMatch(source, /Sin respuesta/);
});

test("official periods include exact dates and block incompatible comparisons", () => {
  const periods = officialActivityPeriods(new Date(2026, 7, 6, 12, 0, 0));
  assert.deepEqual(periods.map((period) => period.id), ["TODAY", "CURRENT_WEEK", "CURRENT_MONTH", "LAST_30_DAYS", "PREVIOUS_WEEK"]);
  assert.ok(periods.every((period) => /^\d{4}-\d{2}-\d{2}$/.test(period.from) && /^\d{4}-\d{2}-\d{2}$/.test(period.to)));
  assert.ok(periods.every((period) => period.exactLabel.length > 5));
  assert.equal(compatibleComparison(periods[1], periods[4]), false);
});

test("Activity and Reports distinguish unknown from confirmed zero", () => {
  const source = moduleSource();
  assert.match(source, /Cero confirmado en el periodo/);
  assert.match(source, /Ausencia de evidencia; no es cero/);
  assert.match(source, /value === null|total === null/);
  assert.match(source, /NO_BASE" \? "Sin base confirmada" : "Evidencia insuficiente"/);
  assert.doesNotMatch(source, /NO_BASE" \? "0%"|UNKNOWN" \? "0%"/);
});

test("required states, accessible tabs, dialog and chart fallback are present", () => {
  const source = moduleSource();
  for (const state of requiredStates) assert.match(source, new RegExp(state));
  assert.match(source, /role="tablist"/);
  assert.match(source, /role="tabpanel"/);
  assert.match(source, /aria-controls/);
  assert.match(source, /ArrowLeft/);
  assert.match(source, /aria-modal="true"/);
  assert.match(source, /event\.key === "Escape"/);
  assert.match(source, /tabla accesible/i);
  assert.match(source, /requestedPersonId/);
  assert.match(cssSource(), /min-height:44px/);
  assert.match(cssSource(), /prefers-reduced-motion/);
});

test("Reports use productive reporting and preserve drilldown evidence", () => {
  const source = moduleSource();
  assert.match(source, /runtime\.loadReporting/);
  assert.match(source, /CUSTOM_RANGE/);
  assert.match(source, /row\.rowKey/);
  assert.match(source, /Actividad confirmada por fecha y tipo/);
  assert.doesNotMatch(source, /Math\.random\(|mock|fixture|fakeData/i);
  assert.match(source, /resolvePolicySnapshot/);
  assert.match(source, /generateActivityTips/);
});

test("shared runtime keeps Pipeline and mounts Activity without automatic merge behavior", () => {
  const app = read("docs/static-preview/forge-aura/app-v4.js");
  const router = read("docs/static-preview/forge-aura/aura-router-v4.js");
  const shell = read("docs/static-preview/forge-aura/aura-shell.js");
  assert.match(app, /createPipelineModule/);
  assert.match(app, /createActivityModule/);
  assert.match(app, /ensureActivityAssets/);
  assert.match(app, /activity-reports-ux-001/);
  assert.match(router, /actividad/);
  assert.match(shell, />Actividad</);
});
