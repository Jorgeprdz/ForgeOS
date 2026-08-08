import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const read = p => fs.readFileSync(p, "utf8");
const moduleSource = read("docs/static-preview/forge-aura/activity/activity-module.js");
const dailySource = read("docs/static-preview/forge-aura/activity/activity-daily-confirmation.js");
const pointsProjection = read("docs/static-preview/forge-aura/activity/activity-points-projection.js");
const pointsAdapter = read("platform/productivity/activity-points-authority-adapter.mjs");
const appSource = read("docs/static-preview/forge-aura/app-v4.js");
const routerSource = read("docs/static-preview/forge-aura/aura-router-v4.js");
const shellSource = read("docs/static-preview/forge-aura/aura-shell.js");
const css = read("docs/static-preview/forge-aura/activity/activity.css");

test("Activity reuses productive read/write authorities", () => {
  assert.match(moduleSource, /createActivityReportsProductivityRuntime/);
  assert.match(moduleSource, /createManualActivityEntry/);
  assert.doesNotMatch(moduleSource, /platform\/productivity\/activity-(operational-calendar|reporting-adapters|writer)/);
  assert.doesNotMatch(moduleSource, /supabase\/migrations/);
});

test("point rules and recommendations come only from the official adapter", () => {
  assert.match(pointsAdapter, /DAILY_POINTS_RULES, calcularPuntosDiarios/);
  assert.match(pointsProjection, /calculateActivityPoints/);
  assert.match(pointsProjection, /findPointCombinations/);
  assert.match(moduleSource, /projectOfficialActivityPoints/);
  assert.doesNotMatch(moduleSource, /DAILY_POINTS_RULES|calcularPuntosDiarios|const\s+BAREMO/);
  assert.doesNotMatch(pointsProjection, /referidos\s*:\s*3|llamadas\s*:\s*1|polizas_pagadas\s*:\s*10/);
});

test("Activity is a 25-point cockpit, not a duplicate eight-counter intake", () => {
  assert.match(moduleSource, /Puntos de actividad/);
  assert.match(moduleSource, /Te faltan/);
  assert.match(moduleSource, /ACTIVIDAD DE HOY/);
  assert.match(moduleSource, /Opciones para avanzar/);
  assert.match(dailySource, /REVISIÓN DEL DÍA/);
  assert.match(dailySource, /metrics: \[metricPayload\(key, value\)\]/);
  assert.doesNotMatch(dailySource, /METRICS\.map\(\(\[key\]\) => metricPayload/);
  assert.doesNotMatch(dailySource, /suggestion\?\.value \?\? 0/);
});

test("user-facing Activity copy hides implementation jargon and preserves unknown", () => {
  const userCopy = `${moduleSource}\n${dailySource}`;
  assert.doesNotMatch(userCopy, /Esta confirmación crea un hecho operativo FES|HUMAN_CONFIRMED|evidence strength|idempotency key|source reference|provenance/i);
  assert.match(moduleSource, /Lo desconocido no se convierte en cero/);
  assert.match(dailySource, /No hay evidencia suficiente para asumir cero/);
});

test("session scrub and late-result rejection remain present in the Activity boundary", () => {
  assert.match(moduleSource, /if \(!mounted \|\| selected !== revision\) return/);
  assert.match(moduleSource, /revision \+= 1/);
  assert.match(moduleSource, /manual\?\.scrub/);
  assert.match(moduleSource, /daily\?\.scrub/);
  assert.match(moduleSource, /mail\?\.scrub/);
  assert.match(moduleSource, /reporting\?\.scrub/);
});

test("Router and shell retain Pipeline and Activity", () => {
  assert.match(routerSource, /pipeline/);
  assert.match(routerSource, /actividad/);
  assert.match(shellSource, /data-aura-route-link=\"pipeline\"/);
  assert.match(shellSource, /data-aura-route-link=\"actividad\"/);
  assert.match(appSource, /createPipelineModule/);
  assert.match(appSource, /createActivityModule/);
});

test("Activity visual layer uses Aura Light canonical tokens and accessibility guards", () => {
  assert.match(css, /--forge-brand/);
  assert.match(css, /--forge-surface/);
  assert.match(css, /--forge-text-primary/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /focus-visible/);
  assert.match(css, /min-height:44px/);
  assert.match(css, /@media\(max-width:720px\)/);
});
