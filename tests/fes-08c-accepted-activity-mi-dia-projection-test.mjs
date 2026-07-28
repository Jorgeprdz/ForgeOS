import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";

const require = createRequire(import.meta.url);
const adapter = require(
  "../advisor-os/event-evidence/accepted-activity-mi-dia-projection.js",
);
const bindingModule = require(
  "../advisor-os/event-evidence/productive-ui-projection-binding.js",
);

class TestCustomEvent extends Event {
  constructor(type, options = {}) {
    super(type);
    this.detail = options.detail;
  }
}

function accepted(type, suffix = "001") {
  return {
    status: "PROJECTED",
    inserted: true,
    record: {
      schemaVersion: "activity-record.v1",
      id: `activity-${suffix}`,
      organizationId: "organization-001",
      advisorId: "advisor-001",
      prospectId: "prospect-001",
      appointmentId: `appointment-${suffix}`,
      type,
      occurredAt: "2026-07-28T20:00:00.000Z",
      dueAt: "2026-07-29T18:00:00.000Z",
      lifecycle: "CONFIRMED",
      source: {
        system: "FES_RECONCILIATION",
        eventId: `event-${suffix}`,
        producerVersion: "fes-event-activity-projection.v1",
        evidenceState: "VERIFIED",
      },
      confirmation: {
        method: "MANUAL_ADVISOR",
      },
      metadata: {
        lineageSchema: "forge.fes_activity_lineage.v1",
        projectionSchema: "fes-event-activity-projection.v1",
      },
    },
  };
}

function eventTarget() {
  const target = new EventTarget();
  target.CustomEvent = TestCustomEvent;
  return target;
}

test("FES 08C projects accepted scheduled appointment with preserved lineage", () => {
  const projection = adapter.projectAcceptedActivity(
    accepted("INITIAL_APPOINTMENT_SCHEDULED"),
  );
  assert.equal(projection.status, "PROJECTED");
  assert.equal(projection.activityState, "SCHEDULED");
  assert.equal(projection.sourceActivityId, "activity-001");
  assert.equal(projection.sourceEventId, "event-001");
  assert.equal(projection.provenance.lineageSchema, "forge.fes_activity_lineage.v1");
  assert.equal(Object.isFrozen(projection), true);
});

test("FES 08C projects accepted completed appointment through the same contract", () => {
  const projection = adapter.projectAcceptedActivity(
    accepted("INITIAL_APPOINTMENT_COMPLETED", "002"),
  );
  assert.equal(projection.status, "PROJECTED");
  assert.equal(projection.activityState, "COMPLETED");
  assert.equal(projection.label, "Cita inicial realizada");
  assert.equal(projection.schemaVersion, adapter.PROJECTION_SCHEMA);
});

test("FES 08C excludes unaccepted, rejected and incomplete activity", () => {
  assert.throws(
    () => adapter.projectAcceptedActivity({
      ...accepted("INITIAL_APPOINTMENT_SCHEDULED"),
      status: "REJECTED",
    }),
    error => error.code === "MI_DIA_ACTIVITY_NOT_ACCEPTED",
  );
  const incomplete = accepted("INITIAL_APPOINTMENT_SCHEDULED");
  incomplete.record.lifecycle = "PROPOSED";
  assert.throws(
    () => adapter.projectAcceptedActivity(incomplete),
    error => error.code === "MI_DIA_ACTIVITY_NOT_ACCEPTED",
  );
});

test("FES 08C refreshes Mi Día once and replays idempotently by Activity identity", () => {
  const target = eventTarget();
  const binding = bindingModule.create({ root: { querySelector() {}, defaultView: target } });
  const input = accepted("INITIAL_APPOINTMENT_SCHEDULED");

  adapter.publishAcceptedActivity(input, { eventTarget: target });
  adapter.publishAcceptedActivity(input, { eventTarget: target });

  assert.equal(binding.current().state, "READY");
  assert.equal(binding.current().surfaces.MI_DIA.length, 1);
  assert.equal(
    binding.current().surfaces.MI_DIA[0].reference,
    "activity-001",
  );
  assert.equal(binding.diagnostics().accepted_activity_count, 1);
  binding.destroy();
});

test("FES 08C attaches only after canonical Activity append acceptance", async () => {
  const runtime = await readFile(
    "advisor-os/sales-pipeline/productive-pipeline-action-runtime.js",
    "utf8",
  );
  const append = runtime.indexOf("await activity.appendEvent");
  const publish = runtime.indexOf("publishAcceptedActivity(activityResult");
  const list = runtime.indexOf("await activity.list()");
  assert.ok(append >= 0 && publish > append && list > publish);
  assert.equal((runtime.match(/publishAcceptedActivity\(/g) || []).length, 1);
  assert.doesNotMatch(runtime, /\.from\s*\(/);
});

test("FES 08C introduces no direct table, migration, score or transition write", async () => {
  const source = await readFile(
    "advisor-os/event-evidence/accepted-activity-mi-dia-projection.js",
    "utf8",
  );
  assert.doesNotMatch(source, /\.from\s*\(|activity_records_append_v1|create table|alter table/i);
  assert.doesNotMatch(source, /\b(points?|score|multiplier|pipeline[_-]transition)\b/i);
});
