import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  firstNameFor,
  greetingFor,
  rankOpportunityCards,
} from "../docs/static-preview/forge-alive-material3/home-live-dashboard.js";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("greeting follows Mexico City dayparts", () => {
  assert.equal(greetingFor("2026-08-03T14:00:00.000Z"), "Buenos días");
  assert.equal(greetingFor("2026-08-03T19:00:00.000Z"), "Buenas tardes");
  assert.equal(greetingFor("2026-08-04T03:00:00.000Z"), "Buenas noches");
});

test("Google identity uses the authenticated given name", () => {
  assert.equal(firstNameFor({ user_metadata: { given_name: "Alejandra", full_name: "Alejandra Moleres" } }), "Alejandra");
  assert.equal(firstNameFor({ user_metadata: { full_name: "Jorge Ignacio Palacios Rodríguez" } }), "Jorge");
  assert.equal(firstNameFor({ email: "maria.lopez@example.com" }), "maria");
});

test("opportunities are ranked from real operational evidence without probabilities", () => {
  const rows = rankOpportunityCards([
    { id: "new", fullName: "Prospecto nuevo", status: "referred_new", stageLabel: "Nuevo", latestActivity: null },
    {
      id: "overdue",
      fullName: "Seguimiento vencido",
      status: "contacted",
      stageLabel: "Contactado",
      latestActivity: { label: "Conversación registrada", occurredAt: "2026-07-25T12:00:00.000Z" },
      nextCommitment: { dueAt: "2026-08-01T12:00:00.000Z" },
    },
    { id: "client", fullName: "Cliente confirmado", status: "client", stageLabel: "Cliente" },
    {
      id: "decision",
      fullName: "Decisión pendiente",
      status: "decision",
      stageLabel: "En decisión",
      latestActivity: { label: "Propuesta presentada", occurredAt: "2026-08-02T12:00:00.000Z" },
    },
  ], { now: "2026-08-03T12:00:00.000Z" });

  assert.deepEqual(rows.map((row) => row.card.id), ["overdue", "decision", "new"]);
  assert.equal(rows[0].reason.label, "Seguimiento vencido");
  assert.ok(rows.every((row) => !("score" in row) && !("probability" in row)));
});

test("canonical shell schedules a route gate only after initial page load", async () => {
  const [runtime, routeGate, authorityEntry, legacy] = await Promise.all([
    read("docs/static-preview/forge-alive-material3/home-live-dashboard-runtime.js"),
    read("docs/static-preview/forge-alive-material3/home-live-dashboard-route-gate.js"),
    read("docs/static-preview/forge-alive-material3/home-opportunity-authority-entry.js"),
    read("docs/static-preview/forge-alive-material3/legacy-ui-retirement.js"),
  ]);
  assert.doesNotMatch(legacy, /^import "\.\/home-live-dashboard/m);
  assert.match(legacy, /home-live-dashboard-route-gate\.js\?v=home-live-dashboard-005/);
  assert.match(legacy, /addEventListener\("load", installHomeRouteGateAfterLoad/);
  assert.match(routeGate, /routeAllowsHome/);
  assert.match(routeGate, /!root\.hidden/);
  assert.match(routeGate, /root\.dataset\.moduleActive !== "false"/);
  assert.match(routeGate, /home-live-dashboard-runtime\.js\?v=home-live-dashboard-005/);
  assert.doesNotMatch(runtime, /\bimport\s*(?:\(|\{)/);
  assert.match(runtime, /home-opportunity-authority-entry\.js\?v=home-live-dashboard-003/);
  assert.match(runtime, /PRODUCTIVE_PIPELINE_AND_TIMELINE/);
  assert.match(authorityEntry, /createProductiveIntelligenceAdapter/);
  assert.match(authorityEntry, /pipeline-productive-intelligence-adapter\.js\?v=home-live-dashboard-003/);
});

test("runtime retires static mock content and never invents percentages", async () => {
  const runtime = await read("docs/static-preview/forge-alive-material3/home-live-dashboard-runtime.js");
  assert.match(runtime, /dataset\.homeStaticMockRetired/);
  assert.match(runtime, /user_metadata/);
  assert.match(runtime, /Buenos días/);
  assert.match(runtime, /Buenas tardes/);
  assert.match(runtime, /Buenas noches/);
  assert.doesNotMatch(runtime, /Lariza|Octavio|María|72%|65%|40%/);
  assert.doesNotMatch(runtime, /Math\.random|probability|opportunityScore/);
});

test("focus refresh preserves the current authenticated identity", async () => {
  const runtime = await read("docs/static-preview/forge-alive-material3/home-live-dashboard-runtime.js");
  assert.match(runtime, /const onFocus = \(\) => \{[\s\S]*updateIdentity\(root, currentUser\)/);
  assert.doesNotMatch(runtime, /addEventListener\("focus", \(\) => \{\s*updateIdentity\(root, null\)/s);
});

test("dashboard layout creates one coherent primary row", async () => {
  const css = await read("docs/static-preview/forge-alive-material3/home-live-dashboard.css");
  assert.match(css, /grid-template-columns:\s*repeat\(12, minmax\(0, 1fr\)\)/);
  assert.match(css, /> \.summary-section\.productive-home-section[\s\S]*grid-column:\s*1 \/ 9/);
  assert.match(css, /> \.opportunities\[data-home-live-opportunities\][\s\S]*grid-column:\s*9 \/ -1/);
  assert.match(css, /> \.plan-card,[\s\S]*display:\s*none !important/);
  assert.doesNotMatch(css, /position:\s*absolute[^}]*opportunities/s);
});
