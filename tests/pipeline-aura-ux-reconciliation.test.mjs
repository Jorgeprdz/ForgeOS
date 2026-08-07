import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const ROOT = new URL("../", import.meta.url);
const pipelinePath = relative => new URL(
  `docs/static-preview/forge-aura/pipeline/${relative}`,
  ROOT,
);

async function importStandalone(relative) {
  const source = await readFile(pipelinePath(relative), "utf8");
  const url = `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
  return import(url);
}

const NOW = new Date("2026-08-06T15:00:00-06:00");

function record(overrides = {}) {
  return {
    id: "p-1",
    fullName: "Mariana López",
    status: "contacted",
    stageLabel: "Contactado",
    sourceValue: "Referido",
    sourceSummary: "Referido",
    phone: "+525512345678",
    latestActivity: {
      label: "llamada",
      occurredAt: "2026-08-06T13:00:00-06:00",
    },
    nextCommitment: {
      type: "Seguimiento",
      dueAt: "2026-08-06T17:00:00-06:00",
    },
    timelineState: "CONNECTED",
    prospect: {
      id: "p-1",
      fullName: "Mariana López",
      source: "Referido",
      initialContext: "Pidió información de ahorro.",
      phone: "+525512345678",
    },
    ...overrides,
  };
}

test("PIPELINE_ATTENTION_LAYER_TEST: limits the initial layer to three explainable facts", async () => {
  const { deriveAttentionItems } = await importStandalone("pipeline-priority.js");
  const records = [
    record({ id: "overdue", nextCommitment: { type: "Cita", dueAt: "2026-08-04T10:00:00-06:00" } }),
    record({ id: "today" }),
    record({ id: "none", nextCommitment: null }),
    record({ id: "stale", nextCommitment: { type: "Cita", dueAt: "2026-08-12T10:00:00-06:00" }, latestActivity: { label: "mensaje", occurredAt: "2026-08-01T10:00:00-06:00" } }),
  ];
  const priorities = deriveAttentionItems(records, NOW, 3);
  assert.equal(priorities.length, 3);
  assert.deepEqual(priorities.map(item => item.kind), ["overdue", "today", "no_commitment"]);
  for (const item of priorities) {
    assert.ok(item.reason);
    assert.ok(item.consequence);
    assert.ok(item.evidence.source);
    assert.ok(item.action.label);
  }
});

test("PIPELINE_EXPLAINABLE_PRIORITY_TEST: does not infer stale activity from a disconnected Timeline", async () => {
  const { attentionForRecord } = await importStandalone("pipeline-priority.js");
  const disconnected = record({
    nextCommitment: { type: "Cita", dueAt: "2026-08-12T10:00:00-06:00" },
    latestActivity: null,
    timelineState: "UNAVAILABLE",
  });
  assert.equal(attentionForRecord(disconnected, NOW), null);
});

test("PIPELINE_NEXT_BEST_ACTION_TEST: recommendations require evidence and remain human initiated", async () => {
  const { nextBestAction } = await importStandalone("pipeline-priority.js");
  const recommendation = nextBestAction(record({ nextCommitment: null }), NOW);
  assert.equal(recommendation.type, "calendar");
  assert.match(recommendation.reason, /no tiene una siguiente fecha registrada/i);
});

test("PIPELINE_SMART_DEFAULTS_TEST: uses verified commitments and leaves unsupported time guesses empty", async () => {
  const { followupDefaults } = await importStandalone("pipeline-priority.js");
  const existing = followupDefaults(record(), NOW);
  assert.equal(existing.date, "2026-08-06");
  assert.equal(existing.time, "17:00");
  assert.equal(existing.durationMinutes, 45);
  assert.equal(existing.source, "existing_commitment");

  const suggested = followupDefaults(record({ nextCommitment: null }), NOW);
  assert.equal(suggested.time, "");
  assert.equal(suggested.durationMinutes, 45);
  assert.match(suggested.reason, /hora queda vacía/i);
});

test("PIPELINE_PRIMARY_ACTION_TEST and empty-state contracts exist in the rendered source", async () => {
  const source = await readFile(pipelinePath("pipeline-module.js"), "utf8");
  assert.equal((source.match(/data-primary-action data-action/g) || []).length, 1);
  assert.match(source, />Agregar prospecto</);
  assert.match(source, /Tu Pipeline comienza con una conversación/);
  assert.match(source, /Alta productiva no disponible/);
  assert.ok(source.indexOf("data-attention-layer") < source.indexOf("data-directory"));
});

test("PIPELINE_FILTERED_EMPTY_TEST exposes active filters and recovery", async () => {
  const source = await readFile(pipelinePath("pipeline-module.js"), "utf8");
  assert.match(source, /Filtros activos:/);
  assert.match(source, /data-clear/);
  assert.match(source, /Los prospectos siguen intactos/);
});

test("PIPELINE_CARD_LIST_PARITY_TEST shares one semantic key and recommendation renderer", async () => {
  const source = await readFile(pipelinePath("pipeline-module.js"), "utf8");
  assert.equal((source.match(/data-record-semantics=/g) || []).length, 2);
  assert.equal((source.match(/recommendationHtml\(record\)/g) || []).length, 3);
  assert.match(source, /role="columnheader"/);
});

test("PIPELINE_KEYBOARD_TEST and PIPELINE_FOCUS_TEST preserve dialog focus", async () => {
  const source = await readFile(pipelinePath("pipeline-module.js"), "utf8");
  assert.match(source, /event\.key !== "Tab"/);
  assert.match(source, /event\.key === "Escape"/);
  assert.match(source, /state\.restore\?\.focus/);
  assert.match(source, /aria-modal="true"/);
});

test("PIPELINE_ARIA_LIVE_TEST provides visible feedback and a polite live region", async () => {
  const source = await readFile(pipelinePath("pipeline-module.js"), "utf8");
  assert.match(source, /role="status" aria-live="polite"/);
  assert.match(source, /data-live/);
  assert.match(source, /aria-busy/);
});

test("PIPELINE_SESSION_SCRUB_TEST and PIPELINE_LATE_RESULT_REJECTION_TEST clear sensitive state", async () => {
  const source = await readFile(pipelinePath("pipeline-module.js"), "utf8");
  assert.match(source, /state\.records = \[\]/);
  assert.match(source, /state\.adapter = null/);
  assert.match(source, /revision \+= 1/);
  assert.ok((source.match(/currentRevision !== revision/g) || []).length >= 4);
});

test("PIPELINE_NO_CROSS_ADVISOR_TEST keeps authentication and RLS as authority", async () => {
  const source = await readFile(pipelinePath("pipeline-adapter-pages-v1.js"), "utf8");
  assert.match(source, /client\.auth\.getUser/);
  assert.match(source, /AUTH_REQUIRED/);
  assert.doesNotMatch(source, /\.eq\("advisor_id"/);
  assert.doesNotMatch(source, /service_role/i);
});

test("PIPELINE_NO_AUTOMATIC_ACTION_TEST blocks automatic commercial effects", async () => {
  const source = await readFile(pipelinePath("pipeline-module.js"), "utf8");
  assert.match(source, /Forge no creó ni confirmó una cita/);
  assert.match(source, /Forge no escribió ni envió ningún mensaje/);
  assert.match(source, /Ninguna acción se ejecuta automáticamente/);
  assert.doesNotMatch(source, /setInterval\(/);
});

test("PIPELINE_NO_FAKE_DATA_TEST keeps unknown sources honest", async () => {
  const source = await readFile(pipelinePath("pipeline-module.js"), "utf8");
  assert.match(source, /No se convirtió en cero/);
  assert.match(source, /no cargó datos demo/i);
  assert.doesNotMatch(source, /Mariana López/);
});

test("Aura CSS includes responsive, focus-compatible and reduced-motion behavior", async () => {
  const source = await readFile(pipelinePath("pipeline.css"), "utf8");
  assert.match(source, /@media \(max-width: 1180px\)/);
  assert.match(source, /@media \(max-width: 760px\)/);
  assert.match(source, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(source, /min-width: 0/);
  assert.match(source, /44px|var\(--aura-control\)/);
});
