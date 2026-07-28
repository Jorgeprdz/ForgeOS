import test from "node:test";
import assert from "node:assert/strict";
import {
  createRequire,
} from "node:module";
import {
  readFileSync,
} from "node:fs";

const require =
  createRequire(import.meta.url);

const runtime =
  require(
    "../platform/event-evidence/" +
    "push-deep-link-runtime.js",
  );

const manifest =
  readFileSync(
    "docs/architecture/source-truth/" +
    "FES_07B_PUSH_AND_DEEP_LINK_RUNTIME_IMPLEMENTATION_MANIFEST_001.md",
    "utf8",
  );

const source =
  readFileSync(
    "platform/event-evidence/" +
    "push-deep-link-runtime.js",
    "utf8",
  );

function target(overrides = {}) {
  return {
    target_id: "target-001",
    tenant_id: "tenant-001",
    target_type:
      "PROSPECT_DETAIL",
    resource_reference:
      "prospect-ref-001",
    ...overrides,
  };
}

function intent(overrides = {}) {
  return runtime
    .createNotificationIntent({
      intent_id: "intent-001",
      tenant_id: "tenant-001",
      actor_id: "advisor-001",
      created_at:
        "2026-07-28T15:00:00.000Z",
      scheduled_for:
        "2026-07-28T16:00:00.000Z",
      timezone:
        "America/Mexico_City",
      deduplication_key:
        "dedupe-001",
      cancellation_key:
        "cancel-001",
      target: target(),
      payload_references: [
        "activity-ref-001",
      ],
      permission_state:
        "GRANTED",
      subscription_state:
        "REGISTERED",
      max_attempts: 3,
      ...overrides,
    });
}

test("FES 07B manifest is approved", () => {
  assert.match(
    manifest,
    /FES_07B_PUSH_AND_DEEP_LINK_RUNTIME_IMPLEMENTATION_MANIFEST=APPROVED/,
  );
});

test("FES 07B manifest authorizes one runtime file", () => {
  assert.match(
    manifest,
    /RUNTIME_FILES=1/,
  );
  assert.match(
    manifest,
    /RUNTIME_FILE_1=platform\/event-evidence\/push-deep-link-runtime\.js/,
  );
});

test("FES 07B manifest authorizes one test file", () => {
  assert.match(
    manifest,
    /TEST_FILES=1/,
  );
  assert.match(
    manifest,
    /TEST_FILE_1=tests\/fes-07b-push-deep-link-runtime-implementation-test\.mjs/,
  );
});

for (
  const disabled of [
    "PUSH_EXECUTION",
    "PERMISSION_PROMPT_EXECUTION",
    "SUBSCRIPTION_REGISTRATION",
    "SERVICE_WORKER_MUTATION",
    "EXTERNAL_PROVIDER_CALL",
    "DELIVERY_CLAIM",
    "PRODUCTIVE_UI_MUTATION",
    "NAV_PILL_MUTATION",
    "SUPABASE_REMOTE_MUTATION",
    "DATABASE_MIGRATION",
    "MAIN_MUTATION",
  ]
) {
  test(`FES 07B manifest keeps ${disabled} disabled`, () => {
    assert.match(
      manifest,
      new RegExp(`${disabled}=NO`),
    );
  });
}

test("FES 07B exposes immutable contracts", () => {
  assert.equal(
    runtime.RUNTIME_VERSION,
    "FES-07B.1",
  );
  assert.equal(
    Object.isFrozen(runtime),
    true,
  );
  assert.equal(
    Object.isFrozen(
      runtime.TARGET_TYPES,
    ),
    true,
  );
});

test("permission explanation requires a user gesture", () => {
  const result =
    runtime
      .createPermissionExplanation({
        capability_reference:
          "push-reminders",
      });

  assert.equal(
    result.explanation_required,
    true,
  );
  assert.equal(
    result.explicit_user_gesture_required,
    true,
  );
  assert.equal(
    result.automatic_prompt,
    false,
  );
  assert.equal(
    result.permission_prompt_executed,
    false,
  );
});

test("permission explanation rejects raw private content", () => {
  assert.throws(
    () =>
      runtime
        .createPermissionExplanation({
          capability_reference:
            "push-reminders",
          message:
            "contenido privado",
        }),
    {
      code:
        "FES07B_RAW_PRIVATE_CONTENT_FORBIDDEN",
    },
  );
});

for (
  const targetType
  of runtime.TARGET_TYPES
) {
  test(`internal target accepts ${targetType}`, () => {
    const result =
      runtime
        .createDeepLinkTarget(
          target({
            target_type: targetType,
          }),
        );

    assert.equal(
      result.target_type,
      targetType,
    );
    assert.equal(
      result.tenant_id,
      "tenant-001",
    );
  });
}

test("internal target rejects unknown type", () => {
  assert.throws(
    () =>
      runtime
        .createDeepLinkTarget(
          target({
            target_type:
              "EXTERNAL_URL",
          }),
        ),
    {
      code:
        "FES07B_TARGET_TYPE_INVALID",
    },
  );
});

test("internal target rejects arbitrary URL field", () => {
  assert.throws(
    () =>
      runtime
        .createDeepLinkTarget({
          ...target(),
          url:
            "https://example.com",
        }),
    {
      code:
        "FES07B_TARGET_FIELDS_INVALID",
    },
  );
});

test("target resolution is internal and non-mutating", () => {
  const result =
    runtime
      .resolveInternalTarget(
        target(),
      );

  assert.equal(
    result.navigation_mode,
    "INTERNAL_ONLY",
  );
  assert.equal(
    result.arbitrary_external_url_allowed,
    false,
  );
  assert.equal(
    result.browser_navigation_executed,
    false,
  );
  assert.equal(
    result.canonical_truth_mutation,
    false,
  );
});

test("notification intent is reference-only", () => {
  const result = intent();

  assert.deepEqual(
    result.payload_references,
    ["activity-ref-001"],
  );
  assert.equal(
    result.push_execution,
    false,
  );
  assert.equal(
    result.external_provider_call,
    false,
  );
  assert.equal(
    result.delivery_claimed,
    false,
  );
});

test("notification intent becomes adapter-ready without execution", () => {
  const result = intent();

  assert.equal(
    result.state,
    "READY_FOR_PROVIDER_ADAPTER",
  );
  assert.equal(
    result.external_provider_call,
    false,
  );
});

test("notification intent uses fallback when permission is unavailable", () => {
  const result =
    intent({
      permission_state:
        "UNAVAILABLE",
    });

  assert.equal(
    result.state,
    "INTERNAL_FALLBACK_PENDING",
  );
});

test("notification intent uses fallback when subscription is unavailable", () => {
  const result =
    intent({
      subscription_state:
        "UNAVAILABLE",
    });

  assert.equal(
    result.state,
    "INTERNAL_FALLBACK_PENDING",
  );
});

test("notification intent rejects schedule before creation", () => {
  assert.throws(
    () =>
      intent({
        scheduled_for:
          "2026-07-28T14:00:00.000Z",
      }),
    {
      code:
        "FES07B_SCHEDULE_BEFORE_CREATION",
    },
  );
});

test("notification intent requires a valid timezone", () => {
  assert.throws(
    () =>
      intent({
        timezone: "Mexico City",
      }),
    {
      code:
        "FES07B_TIMEZONE_INVALID",
    },
  );
});

test("notification intent rejects mixed target tenant", () => {
  assert.throws(
    () =>
      intent({
        target:
          target({
            tenant_id:
              "tenant-002",
          }),
      }),
    {
      code:
        "FES07B_TARGET_TENANT_MISMATCH",
    },
  );
});

test("notification intent rejects raw private fields", () => {
  assert.throws(
    () =>
      intent({
        note:
          "nota privada",
      }),
    {
      code:
        "FES07B_RAW_PRIVATE_CONTENT_FORBIDDEN",
    },
  );
});

test("notification intent rejects duplicate references", () => {
  assert.throws(
    () =>
      intent({
        payload_references: [
          "ref-001",
          "ref-001",
        ],
      }),
    {
      code:
        "FES07B_PAYLOAD_REFERENCE_DUPLICATE",
    },
  );
});

test("notification intent bounds max attempts", () => {
  assert.throws(
    () =>
      intent({
        max_attempts: 6,
      }),
    {
      code:
        "FES07B_MAX_ATTEMPTS_INVALID",
    },
  );
});

test("exact replay is deduplicated", () => {
  const candidate = intent();
  const queue =
    runtime
      .createIntentQueue([
        candidate,
        candidate,
      ]);

  assert.equal(
    queue.intent_count,
    1,
  );
  assert.equal(
    queue.idempotent_replay_count,
    1,
  );
});

test("same dedupe identity with different content is rejected", () => {
  assert.throws(
    () =>
      runtime
        .createIntentQueue([
          intent(),
          intent({
            intent_id:
              "intent-002",
            payload_references: [
              "activity-ref-002",
            ],
          }),
        ]),
    {
      code:
        "FES07B_DEDUPLICATION_CONFLICT",
    },
  );
});

test("queue rejects mixed tenants", () => {
  assert.throws(
    () =>
      runtime
        .createIntentQueue([
          intent(),
          intent({
            intent_id:
              "intent-002",
            tenant_id:
              "tenant-002",
            deduplication_key:
              "dedupe-002",
            cancellation_key:
              "cancel-002",
            target:
              target({
                target_id:
                  "target-002",
                tenant_id:
                  "tenant-002",
              }),
          }),
        ]),
    {
      code:
        "FES07B_QUEUE_TENANT_MIXED",
    },
  );
});

test("queue ordering is deterministic", () => {
  const later =
    intent({
      intent_id:
        "intent-later",
      deduplication_key:
        "dedupe-later",
      cancellation_key:
        "cancel-later",
      scheduled_for:
        "2026-07-28T18:00:00.000Z",
    });
  const earlier =
    intent({
      intent_id:
        "intent-earlier",
      deduplication_key:
        "dedupe-earlier",
      cancellation_key:
        "cancel-earlier",
      scheduled_for:
        "2026-07-28T17:00:00.000Z",
    });

  const queue =
    runtime
      .createIntentQueue([
        later,
        earlier,
      ]);

  assert.deepEqual(
    queue.intents.map(
      item => item.intent_id,
    ),
    [
      "intent-earlier",
      "intent-later",
    ],
  );
});

test("local attempt never claims provider delivery", () => {
  const result =
    runtime
      .registerLocalAttempt(
        intent(),
        {
          attempt_id:
            "attempt-001",
          attempted_at:
            "2026-07-28T16:01:00.000Z",
          outcome:
            "ADAPTER_UNAVAILABLE",
        },
      );

  assert.equal(
    result.attempt_count,
    1,
  );
  assert.equal(
    result.state,
    "RETRY_PENDING",
  );
  assert.equal(
    result.external_provider_call,
    false,
  );
  assert.equal(
    result.delivery_claimed,
    false,
  );
});

test("retry becomes explicit internal fallback at limit", () => {
  const first =
    runtime
      .registerLocalAttempt(
        intent({
          max_attempts: 2,
        }),
        {
          attempt_id:
            "attempt-001",
          attempted_at:
            "2026-07-28T16:01:00.000Z",
          outcome:
            "ADAPTER_UNAVAILABLE",
        },
      );

  const second =
    runtime
      .registerLocalAttempt(
        first,
        {
          attempt_id:
            "attempt-002",
          attempted_at:
            "2026-07-28T16:02:00.000Z",
          outcome:
            "ADAPTER_UNAVAILABLE",
        },
      );

  assert.equal(
    second.attempt_count,
    2,
  );
  assert.equal(
    second.state,
    "INTERNAL_FALLBACK_REQUIRED",
  );
});

test("retry beyond limit is rejected", () => {
  const limited =
    runtime
      .registerLocalAttempt(
        intent({
          max_attempts: 1,
        }),
        {
          attempt_id:
            "attempt-001",
          attempted_at:
            "2026-07-28T16:01:00.000Z",
          outcome:
            "TARGET_UNRESOLVED",
        },
      );

  assert.throws(
    () =>
      runtime
        .registerLocalAttempt(
          limited,
          {
            attempt_id:
              "attempt-002",
            attempted_at:
              "2026-07-28T16:02:00.000Z",
            outcome:
              "TARGET_UNRESOLVED",
          },
        ),
    {
      code:
        "FES07B_RETRY_LIMIT_REACHED",
    },
  );
});

test("cancel intent requires exact cancellation key", () => {
  assert.throws(
    () =>
      runtime
        .cancelIntent(
          intent(),
          "wrong-key",
          "2026-07-28T16:03:00.000Z",
        ),
    {
      code:
        "FES07B_CANCELLATION_KEY_MISMATCH",
    },
  );
});

test("cancel intent remains non-executing", () => {
  const result =
    runtime
      .cancelIntent(
        intent(),
        "cancel-001",
        "2026-07-28T16:03:00.000Z",
      );

  assert.equal(
    result.state,
    "CANCELLED",
  );
  assert.equal(
    result.external_provider_call,
    false,
  );
  assert.equal(
    result.delivery_claimed,
    false,
  );
});

test("runtime outputs are deeply immutable", () => {
  const result = intent();

  assert.equal(
    Object.isFrozen(result),
    true,
  );
  assert.equal(
    Object.isFrozen(result.target),
    true,
  );
  assert.equal(
    Object.isFrozen(
      result.payload_references,
    ),
    true,
  );
});

test("runtime does not mutate input", () => {
  const input = {
    target_id: "target-001",
    tenant_id: "tenant-001",
    target_type: "ACTIVITY",
    resource_reference:
      "activity-ref-001",
  };
  const before =
    JSON.stringify(input);

  runtime
    .createDeepLinkTarget(input);

  assert.equal(
    JSON.stringify(input),
    before,
  );
});

test("tampered intent digest is rejected", () => {
  const candidate = {
    ...intent(),
    scheduled_for:
      "2026-07-29T18:00:00.000Z",
  };

  assert.throws(
    () =>
      runtime
        .assertIntent(candidate),
    {
      code:
        "FES07B_INTENT_DIGEST_MISMATCH",
    },
  );
});

test("runtime source does not request browser permission", () => {
  assert.doesNotMatch(
    source,
    /Notification\s*\.\s*requestPermission\s*\(/,
  );
});

test("runtime source does not register a service worker", () => {
  assert.doesNotMatch(
    source,
    /serviceWorker\s*\.\s*register\s*\(/,
  );
});

test("runtime source does not subscribe through PushManager", () => {
  assert.doesNotMatch(
    source,
    /pushManager\s*\.\s*subscribe\s*\(/i,
  );
});

test("runtime source does not call fetch", () => {
  assert.doesNotMatch(
    source,
    /\bfetch\s*\(/,
  );
});

test("runtime source does not reference Supabase", () => {
  assert.doesNotMatch(
    source,
    /supabase/i,
  );
});
