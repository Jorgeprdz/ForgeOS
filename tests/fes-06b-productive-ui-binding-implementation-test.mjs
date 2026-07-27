import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const binding = require(
  "../advisor-os/event-evidence/" +
  "productive-ui-projection-binding.js",
);

const {
  BINDING_VERSION,
  SNAPSHOT_VERSION,
  ACCEPTANCE_VERSION,
  SURFACES,
  UI_STATES,
  EVENT_NAME,
  createSurfaceModel,
  renderActivityMarkup,
  renderMiDiaMarkup,
  renderPipelineMarkup,
  renderProspectDetailMarkup,
  styleText,
} = binding;

function projectionSnapshot(
  overrides = {},
) {
  return {
    snapshot_version:
      SNAPSHOT_VERSION,
    snapshot_id:
      "runtime-snapshot-001",
    snapshot_digest:
      "digest-snapshot-001",
    bundles: [
      {
        prospect_id:
          "prospect-001",
        activity: {
          items: [
            {
              activity_id:
                "activity-001",
              event_id:
                "event-001",
              category:
                "MESSAGE",
              title:
                "Mensaje aprobado",
              occurred_at:
                "2026-07-27T02:00:00.000Z",
              confirmation_state:
                "CONFIRMED",
              pending_state:
                "NONE",
              is_correction:
                false,
              is_corrected:
                false,
              payload: {
                raw_message:
                  "PRIVATE MESSAGE",
              },
            },
          ],
        },
        prospect_detail: {
          prospect_id:
            "prospect-001",
          identity: {
            display_name:
              "Prospecto verificado",
          },
          contexts: [{ id: 1 }],
          appointments: [
            { id: 1 },
          ],
          due_actions: [
            { id: 1 },
            { id: 2 },
          ],
          correction_conflicts: [],
          counters: {
            context_count: 1,
            appointment_count: 1,
            due_action_count: 2,
            conflict_count: 0,
          },
          projection_digest:
            "digest-detail-001",
          notes: [
            {
              raw_text:
                "PRIVATE NOTE",
            },
          ],
        },
        pipeline_card: {
          prospect_id:
            "prospect-001",
          stage: {
            code:
              "appointment_scheduled",
            label:
              "Cita",
          },
          last_activity: {
            title:
              "Mensaje aprobado",
            occurred_at:
              "2026-07-27T02:00:00.000Z",
          },
          primary_attention: {
            label:
              "Confirmar cita",
          },
          operational_status:
            "ACTIONABLE",
          conflict: false,
          projection_digest:
            "digest-card-001",
          provenance: {
            raw:
              "PRIVATE PROVENANCE",
          },
        },
      },
    ],
    mi_dia: {
      items: [
        {
          work_item_id:
            "work-001",
          prospect_id:
            "prospect-001",
          action_code:
            "CONFIRM_APPOINTMENT",
          label:
            "Confirmar cita",
          required: true,
          priority:
            "HIGH",
          due_at:
            "2026-07-27T16:00:00.000Z",
          reason_code:
            "DUE_SOON",
          stage_code:
            "appointment_scheduled",
          source_payload: {
            raw:
              "PRIVATE SOURCE",
          },
        },
      ],
    },
    ...overrides,
  };
}

function acceptance(
  overrides = {},
) {
  return {
    acceptance_version:
      ACCEPTANCE_VERSION,
    projection_snapshot:
      projectionSnapshot(),
    blocked_observations: [
      {
        payload: {
          raw_message:
            "BLOCKED PRIVATE",
        },
      },
    ],
    ...overrides,
  };
}

test("FES 06B exposes the binding version", () => {
  assert.equal(
    BINDING_VERSION,
    "FES-06B.1",
  );
});

test("FES 06B locks four productive surfaces", () => {
  assert.deepEqual(
    SURFACES,
    [
      "ACTIVITY",
      "PROSPECT_DETAIL",
      "PIPELINE_CARD",
      "MI_DIA",
    ],
  );
});

test("FES 06B locks five explicit UI states", () => {
  assert.deepEqual(
    UI_STATES,
    [
      "LOADING",
      "READY",
      "EMPTY",
      "UNAVAILABLE",
      "INVALID",
    ],
  );
});

test("FES 06B exposes one projection event", () => {
  assert.equal(
    EVENT_NAME,
    "forge:event-evidence-projection-snapshot",
  );
});

test("FES 06B treats absent source as unavailable", () => {
  assert.equal(
    createSurfaceModel(null).state,
    "UNAVAILABLE",
  );
});

test("FES 06B preserves explicit loading", () => {
  assert.equal(
    createSurfaceModel({
      state: "LOADING",
    }).state,
    "LOADING",
  );
});

test("FES 06B rejects unknown source contracts", () => {
  assert.equal(
    createSurfaceModel({
      version: "unknown",
    }).state,
    "INVALID",
  );
});

test("FES 06B accepts a FES 05D acceptance", () => {
  assert.equal(
    createSurfaceModel(
      acceptance(),
    ).state,
    "READY",
  );
});

test("FES 06B accepts a direct projection snapshot", () => {
  assert.equal(
    createSurfaceModel(
      projectionSnapshot(),
    ).state,
    "READY",
  );
});

test("FES 06B rejects a wrong snapshot version", () => {
  assert.equal(
    createSurfaceModel(
      projectionSnapshot({
        snapshot_version:
          "wrong",
      }),
    ).state,
    "INVALID",
  );
});

test("FES 06B rejects missing snapshot identity", () => {
  assert.equal(
    createSurfaceModel(
      projectionSnapshot({
        snapshot_id: "",
      }),
    ).state,
    "INVALID",
  );
});

test("FES 06B rejects missing bundles", () => {
  assert.equal(
    createSurfaceModel(
      projectionSnapshot({
        bundles: null,
      }),
    ).state,
    "INVALID",
  );
});

test("FES 06B rejects missing Mi Día projection", () => {
  assert.equal(
    createSurfaceModel(
      projectionSnapshot({
        mi_dia: null,
      }),
    ).state,
    "INVALID",
  );
});

test("FES 06B returns empty for a valid empty snapshot", () => {
  const model =
    createSurfaceModel(
      projectionSnapshot({
        bundles: [],
        mi_dia: {
          items: [],
        },
      }),
    );

  assert.equal(
    model.state,
    "EMPTY",
  );
});

test("FES 06B maps Activity read-only fields", () => {
  const item =
    createSurfaceModel(
      projectionSnapshot(),
    ).surfaces.ACTIVITY[0];

  assert.deepEqual(
    Object.keys(item),
    [
      "activity_id",
      "prospect_id",
      "category",
      "title",
      "occurred_at",
      "confirmation_state",
      "pending_state",
      "is_correction",
      "is_corrected",
    ],
  );
});

test("FES 06B maps Prospect Detail read-only fields", () => {
  const item =
    createSurfaceModel(
      projectionSnapshot(),
    ).surfaces
      .PROSPECT_DETAIL[0];

  assert.equal(
    item.display_name,
    "Prospecto verificado",
  );
  assert.equal(
    item.due_action_count,
    2,
  );
});

test("FES 06B maps Pipeline Card read-only fields", () => {
  const item =
    createSurfaceModel(
      projectionSnapshot(),
    ).surfaces
      .PIPELINE_CARD[0];

  assert.equal(
    item.stage_label,
    "Cita",
  );
  assert.equal(
    item.operational_status,
    "ACTIONABLE",
  );
});

test("FES 06B maps Mi Día read-only fields", () => {
  const item =
    createSurfaceModel(
      projectionSnapshot(),
    ).surfaces.MI_DIA[0];

  assert.equal(
    item.label,
    "Confirmar cita",
  );
  assert.equal(
    item.required,
    true,
  );
});

test("FES 06B does not expose raw activity payload", () => {
  const serialized =
    JSON.stringify(
      createSurfaceModel(
        projectionSnapshot(),
      ),
    );

  assert.equal(
    serialized.includes(
      "PRIVATE MESSAGE",
    ),
    false,
  );
});

test("FES 06B does not expose raw prospect notes", () => {
  const serialized =
    JSON.stringify(
      createSurfaceModel(
        projectionSnapshot(),
      ),
    );

  assert.equal(
    serialized.includes(
      "PRIVATE NOTE",
    ),
    false,
  );
});

test("FES 06B does not expose provenance", () => {
  const serialized =
    JSON.stringify(
      createSurfaceModel(
        projectionSnapshot(),
      ),
    );

  assert.equal(
    serialized.includes(
      "PRIVATE PROVENANCE",
    ),
    false,
  );
});

test("FES 06B does not expose blocked observation payloads", () => {
  const serialized =
    JSON.stringify(
      createSurfaceModel(
        acceptance(),
      ),
    );

  assert.equal(
    serialized.includes(
      "BLOCKED PRIVATE",
    ),
    false,
  );
});

test("FES 06B does not expose Mi Día source payload", () => {
  const serialized =
    JSON.stringify(
      createSurfaceModel(
        projectionSnapshot(),
      ),
    );

  assert.equal(
    serialized.includes(
      "PRIVATE SOURCE",
    ),
    false,
  );
});

test("FES 06B marks all authority diagnostics read-only", () => {
  const diagnostics =
    createSurfaceModel(
      projectionSnapshot(),
    ).diagnostics;

  assert.deepEqual(
    {
      read_only:
        diagnostics.read_only,
      canonical_event_creation:
        diagnostics
          .canonical_event_creation,
      ledger_mutation:
        diagnostics.ledger_mutation,
      timeline_mutation:
        diagnostics.timeline_mutation,
      projection_mutation:
        diagnostics
          .projection_mutation,
      external_execution:
        diagnostics
          .external_execution,
      business_truth_inference:
        diagnostics
          .business_truth_inference,
      raw_private_content_rendering:
        diagnostics
          .raw_private_content_rendering,
    },
    {
      read_only: true,
      canonical_event_creation:
        false,
      ledger_mutation: false,
      timeline_mutation: false,
      projection_mutation: false,
      external_execution: false,
      business_truth_inference:
        false,
      raw_private_content_rendering:
        false,
    },
  );
});

test("FES 06B model is deeply immutable", () => {
  const model =
    createSurfaceModel(
      projectionSnapshot(),
    );

  assert.equal(
    Object.isFrozen(model),
    true,
  );
  assert.equal(
    Object.isFrozen(
      model.surfaces.ACTIVITY,
    ),
    true,
  );
  assert.throws(
    () => {
      model.surfaces.ACTIVITY
        .push({});
    },
    TypeError,
  );
});

test("FES 06B escapes Activity markup", () => {
  const snapshot =
    projectionSnapshot();

  snapshot
    .bundles[0]
    .activity
    .items[0]
    .title =
      "<script>alert(1)</script>";

  const markup =
    renderActivityMarkup(
      createSurfaceModel(snapshot),
    );

  assert.equal(
    markup.includes("<script>"),
    false,
  );
  assert.match(
    markup,
    /&lt;script&gt;/,
  );
});

test("FES 06B Activity markup contains no action controls", () => {
  const markup =
    renderActivityMarkup(
      createSurfaceModel(
        projectionSnapshot(),
      ),
    );

  assert.equal(
    /<button|<a\s/i.test(markup),
    false,
  );
});

test("FES 06B Mi Día markup contains no action controls", () => {
  const markup =
    renderMiDiaMarkup(
      createSurfaceModel(
        projectionSnapshot(),
      ),
    );

  assert.equal(
    /<button|<a\s/i.test(markup),
    false,
  );
});

test("FES 06B Pipeline markup contains no action controls", () => {
  const markup =
    renderPipelineMarkup(
      createSurfaceModel(
        projectionSnapshot(),
      ),
    );

  assert.equal(
    /<button|<a\s/i.test(markup),
    false,
  );
});

test("FES 06B Prospect Detail markup contains no action controls", () => {
  const markup =
    renderProspectDetailMarkup(
      createSurfaceModel(
        projectionSnapshot(),
      ),
      "prospect-001",
    );

  assert.equal(
    /<button|<a\s/i.test(markup),
    false,
  );
});

test("FES 06B renders unavailable state explicitly", () => {
  const markup =
    renderActivityMarkup(
      createSurfaceModel(null),
    );

  assert.match(
    markup,
    /data-fes06b-state="UNAVAILABLE"/,
  );
});

test("FES 06B renders empty state explicitly", () => {
  const markup =
    renderMiDiaMarkup(
      createSurfaceModel(
        projectionSnapshot({
          bundles: [],
          mi_dia: {
            items: [],
          },
        }),
      ),
    );

  assert.match(
    markup,
    /data-fes06b-state="EMPTY"/,
  );
});

test("FES 06B renders invalid state explicitly", () => {
  const markup =
    renderPipelineMarkup(
      createSurfaceModel({
        invalid: true,
      }),
    );

  assert.match(
    markup,
    /data-fes06b-state="INVALID"/,
  );
});

test("FES 06B stylesheet covers mobile detail layout", () => {
  assert.match(
    styleText(),
    /max-width:\s*640px/,
  );
});

test("FES 06B exported constants are immutable", () => {
  assert.equal(
    Object.isFrozen(SURFACES),
    true,
  );
  assert.equal(
    Object.isFrozen(UI_STATES),
    true,
  );
});
