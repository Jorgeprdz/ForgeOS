import test from "node:test";
import assert from "node:assert/strict";

const {
  reconcileUpdatedProspectState,
} = await import(
  "../docs/static-preview/forge-alive-material3/pipeline-productive-intelligence-adapter.js?pipeline-stage-authority-test=1"
);

test("stage mutation result becomes the immediate card and record authority", () => {
  const originalProspect = Object.freeze({
    id: "prospect-1",
    fullName: "Jorge",
    status: "appointment_scheduled",
  });
  const originalCard = Object.freeze({
    id: "prospect-1",
    fullName: "Jorge",
    status: "appointment_scheduled",
    stageLabel: "Cita agendada",
    timeline: Object.freeze([]),
    prospect: originalProspect,
  });
  const updatedProspect = Object.freeze({
    ...originalProspect,
    status: "proposal",
    updatedAt: "2026-07-30T18:00:00.000Z",
  });

  const result = reconcileUpdatedProspectState({
    records: [originalProspect],
    cards: [originalCard],
    updatedProspect,
    requestedStatus: "proposal",
  });

  assert.equal(result.records[0], updatedProspect);
  assert.equal(result.cards[0].status, "proposal");
  assert.equal(result.cards[0].stageLabel, "Propuesta");
  assert.equal(result.cards[0].prospect, updatedProspect);
  assert.equal(result.cards[0].timeline, originalCard.timeline);
  assert.notEqual(result.cards[0], originalCard);
});

test("stage mutation fails closed when the returned row does not confirm the requested state", () => {
  assert.throws(
    () => reconcileUpdatedProspectState({
      records: [{ id: "prospect-1", status: "appointment_scheduled" }],
      cards: [{ id: "prospect-1", status: "appointment_scheduled" }],
      updatedProspect: { id: "prospect-1", status: "appointment_scheduled" },
      requestedStatus: "proposal",
    }),
    error => error?.code === "PRODUCTIVE_STAGE_PERSISTENCE_MISMATCH",
  );
});
