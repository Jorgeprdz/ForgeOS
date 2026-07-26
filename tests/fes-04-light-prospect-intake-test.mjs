import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const canonical = require(
  "../platform/event-evidence/canonical-activity-event-contract.js",
);
const ledger = require(
  "../platform/event-evidence/activity-ledger-contract.js",
);
const timelineContract = require(
  "../platform/event-evidence/canonical-activity-timeline-contract.js",
);
const runtime = require(
  "../platform/event-evidence/projection-runtime.js",
);
const intakeContract = require(
  "../platform/event-evidence/light-prospect-intake.js",
);

const {
  createLedgerRecord,
} = ledger;

const {
  createCanonicalActivityTimeline,
} = timelineContract;

const {
  createProjectionRuntimeSnapshot,
} = runtime;

const {
  CONTRACT_VERSION,
  INTAKE_VERSION,
  EVENT_ZERO_VERSION,
  CAPTURE_MODES,
  CANDIDATE_FIELDS,
  CANDIDATE_DECISIONS,
  EVENT_ZERO_TYPES,
  FORBIDDEN_INTAKE_FIELDS,
  createLightProspectIntake,
  assertLightProspectIntake,
  validateLightProspectIntake,
  rebuildLightProspectIntake,
} = intakeContract;

function source(overrides = {}) {
  return {
    submission_reference:
      "submission-001",
    tenant_id:
      "tenant-advisor-001",
    advisor_id:
      "advisor-001",
    source_category:
      "NATURAL_MARKET",
    full_name:
      "María Fernanda López",
    contact: {
      phone: "+52 55 1234 5678",
      whatsapp: null,
    },
    initial_context: {
      capture_mode: "VOICE",
      content:
        "Es amiga de la universidad y quiere revisar protección familiar.",
    },
    referral: null,
    optional_profile: {},
    extracted_candidates: [],
    candidate_decisions: [],
    occurred_at:
      "2026-07-26T19:10:00.000Z",
    recorded_at:
      "2026-07-26T19:10:01.000Z",
    ...overrides,
  };
}

function candidate(
  id,
  field,
  value,
  confidence = 0.8,
) {
  return {
    candidate_id: id,
    field,
    value,
    confidence,
    source_reference:
      `source-${id}`,
  };
}

function decision(
  id,
  selected,
) {
  return {
    candidate_id: id,
    decision: selected,
  };
}

function timelineFromIntake(intake) {
  const records =
    intake.event_zero.events.map(
      (event, index) =>
        createLedgerRecord({
          canonical_event: event,
          evidence_references: [],
          appended_at: new Date(
            Date.parse(
              event.recorded_at,
            ) +
              1000 +
              index,
          ).toISOString(),
        }),
    );

  return createCanonicalActivityTimeline({
    tenant_id: intake.tenant_id,
    correlation_id:
      intake.event_zero.events[0]
        .correlation_id,
    ledger_records: records,
  });
}

test("FES 04 exposes locked intake contracts", () => {
  assert.equal(CONTRACT_VERSION, "FES-04.1");
  assert.equal(
    INTAKE_VERSION,
    "forge.light_prospect_intake.v1",
  );
  assert.equal(
    EVENT_ZERO_VERSION,
    "forge.prospect_event_zero.v1",
  );
  assert.deepEqual(CAPTURE_MODES, [
    "VOICE",
    "TEXT",
  ]);
  assert.deepEqual(CANDIDATE_DECISIONS, [
    "ACCEPTED",
    "REJECTED",
  ]);
});

test("FES 04 requires a stable submission reference", () => {
  const input = source();
  delete input.submission_reference;

  assert.throws(
    () =>
      createLightProspectIntake(input),
    error =>
      error.code ===
      "LIGHT_INTAKE_FIELDS_REQUIRED",
  );
});

test("FES 04 requires full name", () => {
  assert.throws(
    () =>
      createLightProspectIntake(
        source({
          full_name: "",
        }),
      ),
    error =>
      error.code ===
      "LIGHT_INTAKE_FULL_NAME_INVALID",
  );
});

test("FES 04 requires phone or WhatsApp", () => {
  assert.throws(
    () =>
      createLightProspectIntake(
        source({
          contact: {
            phone: null,
            whatsapp: null,
          },
        }),
      ),
    error =>
      error.code ===
      "LIGHT_INTAKE_CONTACT_REQUIRED",
  );
});

test("FES 04 normalizes contact without inventing a second channel", () => {
  const intake =
    createLightProspectIntake(
      source(),
    );

  assert.equal(
    intake.profile_draft
      .contact.phone,
    "+525512345678",
  );
  assert.equal(
    intake.profile_draft
      .contact.whatsapp,
    null,
  );
});

test("FES 04 accepts text and voice only", () => {
  for (const mode of [
    "VOICE",
    "TEXT",
  ]) {
    const intake =
      createLightProspectIntake(
        source({
          initial_context: {
            capture_mode: mode,
            content:
              "Contexto suficiente para crear el prospecto.",
          },
        }),
      );

    assert.equal(
      intake.context_draft.capture_mode,
      mode,
    );
  }

  assert.throws(
    () =>
      createLightProspectIntake(
        source({
          initial_context: {
            capture_mode:
              "SYSTEM_DERIVED",
            content:
              "No debe aceptarse.",
          },
        }),
      ),
    error =>
      error.code ===
      "LIGHT_INTAKE_CAPTURE_MODE_INVALID",
  );
});

test("FES 04 requires referral details for referral source", () => {
  assert.throws(
    () =>
      createLightProspectIntake(
        source({
          source_category:
            "REFERRAL",
          referral: null,
        }),
      ),
    error =>
      error.code ===
      "LIGHT_INTAKE_REFERRAL_REQUIRED",
  );
});

test("FES 04 accepts explicit referral details", () => {
  const intake =
    createLightProspectIntake(
      source({
        source_category:
          "REFERRAL",
        referral: {
          referred_by:
            "Gabriel Torres",
          relationship_to_referrer:
            "Cliente y amigo",
        },
      }),
    );

  assert.deepEqual(
    intake.profile_draft.referral,
    {
      referred_by:
        "Gabriel Torres",
      relationship_to_referrer:
        "Cliente y amigo",
    },
  );
});

test("FES 04 rejects referral data on non-referral source", () => {
  assert.throws(
    () =>
      createLightProspectIntake(
        source({
          referral: {
            referred_by:
              "Gabriel Torres",
            relationship_to_referrer:
              "Cliente",
          },
        }),
      ),
    error =>
      error.code ===
      "LIGHT_INTAKE_NON_REFERRAL_DATA_FORBIDDEN",
  );
});

test("FES 04 keeps optional details collapsed and nullable", () => {
  const intake =
    createLightProspectIntake(
      source(),
    );

  assert.deepEqual(
    intake.profile_draft.optional,
    {
      email: null,
      date_of_birth: null,
      occupation: null,
    },
  );
});

test("FES 04 normalizes explicit optional details", () => {
  const intake =
    createLightProspectIntake(
      source({
        optional_profile: {
          email:
            "  MARIA@EXAMPLE.COM ",
          date_of_birth:
            "1988-05-14",
          occupation:
            "Arquitecta",
        },
      }),
    );

  assert.deepEqual(
    intake.profile_draft.optional,
    {
      email:
        "maria@example.com",
      date_of_birth:
        "1988-05-14",
      occupation:
        "Arquitecta",
    },
  );
});

test("FES 04 leaves undecided candidates pending", () => {
  const intake =
    createLightProspectIntake(
      source({
        extracted_candidates: [
          candidate(
            "candidate-email",
            "email",
            "maria@example.com",
          ),
        ],
      }),
    );

  assert.equal(
    intake.profile_draft.optional.email,
    null,
  );
  assert.equal(
    intake.candidate_review.state,
    "PENDING_CONFIRMATION",
  );
  assert.equal(
    intake.candidate_review.pending_count,
    1,
  );
  assert.equal(
    intake.candidate_review
      .candidates[0]
      .promotion_state,
    "PENDING_CONFIRMATION",
  );
});

test("FES 04 promotes only accepted candidates", () => {
  const intake =
    createLightProspectIntake(
      source({
        extracted_candidates: [
          candidate(
            "candidate-email",
            "email",
            "maria@example.com",
          ),
          candidate(
            "candidate-job",
            "occupation",
            "Arquitecta",
          ),
        ],
        candidate_decisions: [
          decision(
            "candidate-email",
            "ACCEPTED",
          ),
          decision(
            "candidate-job",
            "REJECTED",
          ),
        ],
      }),
    );

  assert.equal(
    intake.profile_draft.optional.email,
    "maria@example.com",
  );
  assert.equal(
    intake.profile_draft.optional.occupation,
    null,
  );
  assert.equal(
    intake.candidate_review.accepted_count,
    1,
  );
  assert.equal(
    intake.candidate_review.rejected_count,
    1,
  );
});

test("FES 04 can satisfy referral details through accepted candidates", () => {
  const intake =
    createLightProspectIntake(
      source({
        source_category:
          "REFERRAL",
        extracted_candidates: [
          candidate(
            "candidate-referrer",
            "referred_by",
            "Gabriel Torres",
          ),
          candidate(
            "candidate-relation",
            "relationship_to_referrer",
            "Cliente y amigo",
          ),
        ],
        candidate_decisions: [
          decision(
            "candidate-referrer",
            "ACCEPTED",
          ),
          decision(
            "candidate-relation",
            "ACCEPTED",
          ),
        ],
      }),
    );

  assert.equal(
    intake.profile_draft
      .referral.referred_by,
    "Gabriel Torres",
  );
});

test("FES 04 rejects accepted candidate against explicit value", () => {
  assert.throws(
    () =>
      createLightProspectIntake(
        source({
          optional_profile: {
            occupation:
              "Arquitecta",
          },
          extracted_candidates: [
            candidate(
              "candidate-job",
              "occupation",
              "Abogada",
            ),
          ],
          candidate_decisions: [
            decision(
              "candidate-job",
              "ACCEPTED",
            ),
          ],
        }),
      ),
    error =>
      error.code ===
      "LIGHT_INTAKE_CANDIDATE_CONFLICT",
  );
});

test("FES 04 rejects incompatible accepted candidates", () => {
  assert.throws(
    () =>
      createLightProspectIntake(
        source({
          extracted_candidates: [
            candidate(
              "candidate-job-a",
              "occupation",
              "Arquitecta",
            ),
            candidate(
              "candidate-job-b",
              "occupation",
              "Abogada",
            ),
          ],
          candidate_decisions: [
            decision(
              "candidate-job-a",
              "ACCEPTED",
            ),
            decision(
              "candidate-job-b",
              "ACCEPTED",
            ),
          ],
        }),
      ),
    error =>
      error.code ===
      "LIGHT_INTAKE_CANDIDATE_CONFLICT",
  );
});

test("FES 04 rejects unsupported candidate fields", () => {
  assert.throws(
    () =>
      createLightProspectIntake(
        source({
          extracted_candidates: [
            candidate(
              "candidate-income",
              "estimated_income",
              "100000",
            ),
          ],
        }),
      ),
    error =>
      error.code ===
      "LIGHT_INTAKE_CANDIDATE_FIELD_INVALID",
  );
});

test("FES 04 rejects orphan candidate decisions", () => {
  assert.throws(
    () =>
      createLightProspectIntake(
        source({
          candidate_decisions: [
            decision(
              "missing",
              "ACCEPTED",
            ),
          ],
        }),
      ),
    error =>
      error.code ===
      "LIGHT_INTAKE_DECISION_ORPHAN",
  );
});

test("FES 04 rejects duplicate candidate decisions", () => {
  assert.throws(
    () =>
      createLightProspectIntake(
        source({
          extracted_candidates: [
            candidate(
              "candidate-email",
              "email",
              "maria@example.com",
            ),
          ],
          candidate_decisions: [
            decision(
              "candidate-email",
              "ACCEPTED",
            ),
            decision(
              "candidate-email",
              "REJECTED",
            ),
          ],
        }),
      ),
    error =>
      error.code ===
      "LIGHT_INTAKE_DECISION_DUPLICATE",
  );
});

test("FES 04 does not promote confidence without a human decision", () => {
  const intake =
    createLightProspectIntake(
      source({
        extracted_candidates: [
          candidate(
            "candidate-email",
            "email",
            "maria@example.com",
            1,
          ),
        ],
      }),
    );

  assert.equal(
    intake.profile_draft.optional.email,
    null,
  );
  assert.equal(
    intake.candidate_review.pending_count,
    1,
  );
});

test("FES 04 removes legacy mandatory fields from intake", () => {
  assert.deepEqual(
    FORBIDDEN_INTAKE_FIELDS,
    [
      "age",
      "marital_status",
      "dependents",
      "estimated_income",
      "product_interests",
      "due_action_type",
      "due_action_at",
      "next_action_type",
      "next_action_at",
    ],
  );

  assert.throws(
    () =>
      createLightProspectIntake({
        ...source(),
        age: 38,
      }),
    error =>
      error.code ===
      "LIGHT_INTAKE_FIELDS_INVALID",
  );
});

test("FES 04 creates exactly four canonical event-zero members", () => {
  const intake =
    createLightProspectIntake(
      source(),
    );

  assert.equal(
    intake.event_zero.atomic,
    true,
  );
  assert.deepEqual(
    intake.event_zero.event_types,
    EVENT_ZERO_TYPES,
  );
  assert.deepEqual(
    intake.event_zero.events.map(
      event => event.event_type,
    ),
    EVENT_ZERO_TYPES,
  );
  assert.equal(
    intake.event_zero
      .persistence_state,
    "NOT_PERSISTED_BY_CONTRACT",
  );
});

test("FES 04 preserves source and evidence distinctions", () => {
  const events =
    createLightProspectIntake(
      source(),
    ).event_zero.events;

  assert.deepEqual(
    events.map(event => [
      event.event_type,
      event.source.type,
      event.evidence_strength,
      event.confirmation_state,
    ]),
    [
      [
        "TIMELINE_INITIALIZED",
        "SYSTEM_OBSERVED",
        "SYSTEM_OBSERVED",
        "CONFIRMED",
      ],
      [
        "PROSPECT_PROFILE_CREATED",
        "ADVISOR_CONFIRMED",
        "HUMAN_CONFIRMED",
        "CONFIRMED",
      ],
      [
        "PROSPECT_CREATED",
        "ADVISOR_CONFIRMED",
        "HUMAN_CONFIRMED",
        "CONFIRMED",
      ],
      [
        "INITIAL_CONTEXT_CAPTURED",
        "ADVISOR_REPORTED",
        "REPORTED",
        "REPORTED",
      ],
    ],
  );
});

test("FES 04 keeps raw private intake data outside canonical events", () => {
  const intake =
    createLightProspectIntake(
      source({
        optional_profile: {
          email:
            "maria@example.com",
          occupation:
            "Arquitecta",
        },
      }),
    );
  const serialized = JSON.stringify(
    intake.event_zero.events,
  );

  for (const privateValue of [
    "María Fernanda López",
    "+525512345678",
    "maria@example.com",
    "Arquitecta",
    "Es amiga de la universidad",
  ]) {
    assert.equal(
      serialized.includes(privateValue),
      false,
    );
  }
});

test("FES 04 creates deterministic references and event identities", () => {
  const left =
    createLightProspectIntake(
      source(),
    );
  const right =
    createLightProspectIntake(
      JSON.parse(
        JSON.stringify(source()),
      ),
    );

  assert.equal(
    left.intake_id,
    right.intake_id,
  );
  assert.deepEqual(
    left.event_zero.events,
    right.event_zero.events,
  );
});

test("FES 04 creates unique event idempotency keys", () => {
  const events =
    createLightProspectIntake(
      source(),
    ).event_zero.events;
  const keys = events.map(
    event => event.idempotency_key,
  );

  assert.equal(
    new Set(keys).size,
    4,
  );
});

test("FES 04 preserves event-zero causation chain", () => {
  const events =
    createLightProspectIntake(
      source(),
    ).event_zero.events;

  assert.equal(
    events[0].causation_id,
    null,
  );
  assert.equal(
    events[1].causation_id,
    events[0].event_id,
  );
  assert.equal(
    events[2].causation_id,
    events[1].event_id,
  );
  assert.equal(
    events[3].causation_id,
    events[2].event_id,
  );
});

test("FES 04 event zero feeds the accepted projection runtime", () => {
  const intake =
    createLightProspectIntake(
      source({
        source_category:
          "REFERRAL",
        referral: {
          referred_by:
            "Gabriel Torres",
          relationship_to_referrer:
            "Cliente",
        },
      }),
    );
  const timeline =
    timelineFromIntake(intake);
  const snapshot =
    createProjectionRuntimeSnapshot({
      plan_reference:
        "plan-intake-001",
      timelines: [timeline],
    });

  assert.equal(
    snapshot.bundles[0]
      .prospect_detail.profile.state,
    "CONFIRMED",
  );
  assert.equal(
    snapshot.bundles[0]
      .prospect_detail
      .contexts[0].state,
    "REPORTED_REVIEWABLE",
  );
  assert.equal(
    snapshot.bundles[0]
      .pipeline_card.stage.code,
    "CONTEXT_CAPTURED",
  );
  assert.equal(
    snapshot.mi_dia.items[0]
      .action_code,
    "REVIEW_PENDING_CONFIRMATION",
  );
});

test("FES 04 validates and rebuilds byte-equivalent output", () => {
  const input = source();
  const intake =
    createLightProspectIntake(
      input,
    );
  const asserted =
    assertLightProspectIntake(
      intake,
      input,
    );
  const rebuilt =
    rebuildLightProspectIntake({
      intake,
      source: input,
    });

  assert.deepEqual(asserted, intake);
  assert.deepEqual(rebuilt, intake);
});

test("FES 04 rejects validation against different source", () => {
  const input = source();
  const intake =
    createLightProspectIntake(
      input,
    );
  const report =
    validateLightProspectIntake(
      intake,
      source({
        full_name:
          "Otra persona",
      }),
    );

  assert.equal(report.valid, false);
  assert.equal(
    report.errors[0].code,
    "LIGHT_INTAKE_NOT_CANONICAL",
  );
});

test("FES 04 detects tampered candidate promotion", () => {
  const input = source({
    extracted_candidates: [
      candidate(
        "candidate-email",
        "email",
        "maria@example.com",
      ),
    ],
  });
  const intake =
    createLightProspectIntake(
      input,
    );
  const tampered =
    JSON.parse(JSON.stringify(intake));
  tampered.profile_draft
    .optional.email =
    "maria@example.com";

  const report =
    validateLightProspectIntake(
      tampered,
      input,
    );

  assert.equal(report.valid, false);
  assert.equal(
    report.errors[0].code,
    "LIGHT_INTAKE_NOT_CANONICAL",
  );
});

test("FES 04 rejects unsupported output fields", () => {
  const input = source();
  const intake =
    createLightProspectIntake(
      input,
    );
  const tampered = {
    ...JSON.parse(JSON.stringify(intake)),
    sent_to_provider: true,
  };

  assert.throws(
    () =>
      assertLightProspectIntake(
        tampered,
        input,
      ),
    error =>
      error.code ===
        "LIGHT_INTAKE_OUTPUT_FIELDS_INVALID" &&
      error.details
        .unsupported_keys
        .includes("sent_to_provider"),
  );
});

test("FES 04 output is deeply immutable", () => {
  const intake =
    createLightProspectIntake(
      source(),
    );

  assert.equal(
    Object.isFrozen(intake),
    true,
  );
  assert.equal(
    Object.isFrozen(
      intake.profile_draft,
    ),
    true,
  );
  assert.equal(
    Object.isFrozen(
      intake.event_zero.events,
    ),
    true,
  );
  assert.throws(
    () => {
      intake.event_zero.events.push({});
    },
    TypeError,
  );
});

test("FES 04 does not mutate source input", () => {
  const input = source({
    extracted_candidates: [
      candidate(
        "candidate-email",
        "email",
        "maria@example.com",
      ),
    ],
  });
  const before = JSON.stringify(input);

  createLightProspectIntake(
    input,
  );

  assert.equal(
    JSON.stringify(input),
    before,
  );
});

test("FES 04 keeps intake identity stable while digest follows content", () => {
  const left =
    createLightProspectIntake(
      source(),
    );
  const right =
    createLightProspectIntake(
      source({
        initial_context: {
          capture_mode: "VOICE",
          content:
            "Contexto actualizado y más específico.",
        },
      }),
    );

  assert.equal(
    left.intake_id,
    right.intake_id,
  );
  assert.notEqual(
    left.intake_digest,
    right.intake_digest,
  );
});

test("FES 04 requires explicit timestamps and never reads wall-clock time", () => {
  const input = source();
  delete input.recorded_at;

  assert.throws(
    () =>
      createLightProspectIntake(input),
    error =>
      error.code ===
      "LIGHT_INTAKE_FIELDS_REQUIRED",
  );
});
