import test from "node:test";
import assert from "node:assert/strict";

import {
  createMiDiaDueActionSurfaceModel,
} from "../advisor-os/home/mi-dia-due-action-surface-adapter.js";

function view(overrides = {}) {
  return {
    fingerprint: "NFAST09-MIDIA-12345678",
    summary: "2 seguimientos requieren tu atención.",
    hiddenActionableCount: 0,
    items: [
      {
        itemKey: "prospect-001:2",
        prospectReference: "prospect-001",
        approvedDisplayName: "Juan Pérez",
        actionLabel: "Llamar",
        bucketLabel: "Vencido",
        dueText: "Venció hace 2 h",
        stale: false,
        conflict: false,
      },
      {
        itemKey: "prospect-002:1",
        prospectReference: "prospect-002",
        approvedDisplayName: "María López",
        actionLabel: "Seguimiento",
        bucketLabel: "Hoy",
        dueText: "Hoy, 04:00 p. m.",
        stale: false,
        conflict: false,
      },
    ],
    ...overrides,
  };
}

test("Stage 3E maps the first due action into the existing NBA surface", () => {
  const result = createMiDiaDueActionSurfaceModel(view());
  const recommendation = result.primaryRecommendation;

  assert.equal(recommendation.recommendationAvailable, true);
  assert.equal(recommendation.subjectId, "prospect-001");
  assert.equal(recommendation.subjectLabel, "Juan Pérez");
  assert.equal(recommendation.recommendedAction, "Llamar");
  assert.equal(recommendation.responseActionsAllowed, false);
});

test("Stage 3E preserves remaining actions as a supporting queue", () => {
  const result = createMiDiaDueActionSurfaceModel(view());

  assert.equal(result.supportingQueue.length, 1);
  assert.equal(
    result.supportingQueue[0].prospectReference,
    "prospect-002",
  );
});

test("Stage 3E exposes conflict and stale uncertainty", () => {
  const base = view().items[0];
  const result = createMiDiaDueActionSurfaceModel(
    view({
      items: [
        {
          ...base,
          conflict: true,
          stale: true,
          bucketLabel: "Revisar conflicto",
          dueText: "Elige qué cambio conservar",
        },
      ],
    }),
  );

  assert.equal(
    result.primaryRecommendation.recommendedAction,
    "Revisar conflicto",
  );
  assert.equal(result.primaryRecommendation.uncertainty.length, 2);
});

test("Stage 3E produces a limited state when no action is due", () => {
  const result = createMiDiaDueActionSurfaceModel(
    view({
      items: [],
      summary: "No hay seguimientos inmediatos.",
    }),
  );

  assert.equal(
    result.primaryRecommendation.recommendationAvailable,
    false,
  );
  assert.match(
    result.primaryRecommendation.limitations[0],
    /No hay seguimientos/,
  );
});

test("Stage 3E forbids a new permanent dashboard section", () => {
  const result = createMiDiaDueActionSurfaceModel(view());

  assert.equal(
    result.diagnostics.newPermanentDashboardSection,
    false,
  );
  assert.equal(result.diagnostics.existingPrimarySurfaceOnly, true);
  assert.equal(result.diagnostics.staticPreviewMutation, false);
});
