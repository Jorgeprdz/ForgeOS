import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";

const require = createRequire(import.meta.url);
const runtime = require(
  "../platform/event-evidence/push-deep-link-runtime.js",
);
const manifest = readFileSync(
  "docs/architecture/source-truth/" +
    "FES_07C_PUSH_AND_DEEP_LINK_RUNTIME_ACCEPTANCE_MANIFEST_001.md",
  "utf8",
);
const runtimeSource = readFileSync(
  "platform/event-evidence/push-deep-link-runtime.js",
  "utf8",
);
const fixtureSource = readFileSync(
  "tests/e2e/fixtures/fes07c-push-deep-link-runtime/index.html",
  "utf8",
);

function target(overrides = {}) {
  return {
    target_id: "target-07c-001",
    tenant_id: "tenant-07c",
    target_type: "PROSPECT_DETAIL",
    resource_reference: "prospect-ref-07c",
    ...overrides,
  };
}

function intent(overrides = {}) {
  return runtime.createNotificationIntent({
    intent_id: "intent-07c-001",
    tenant_id: "tenant-07c",
    actor_id: "advisor-07c",
    created_at: "2026-07-28T15:00:00.000Z",
    scheduled_for: "2026-07-28T16:00:00.000Z",
    timezone: "America/Mexico_City",
    deduplication_key: "dedupe-07c",
    cancellation_key: "cancel-07c",
    target: target(),
    payload_references: ["activity-ref-07c"],
    permission_state: "GRANTED",
    subscription_state: "REGISTERED",
    max_attempts: 2,
    ...overrides,
  });
}

test("FES 07C manifest authorizes isolated acceptance", () => {
  assert.match(
    manifest,
    /FES_07C_PUSH_AND_DEEP_LINK_RUNTIME_ACCEPTANCE_MANIFEST=APPROVED/,
  );
  assert.match(
    manifest,
    /ACCEPTANCE_MODE=ISOLATED_LOCAL_RUNTIME_AND_BROWSER_FIXTURE/,
  );
  assert.match(manifest, /RUNTIME_MUTATION=NO/);
  assert.match(manifest, /PRODUCTIVE_UI_BINDING=NO/);
});

for (const disabled of [
  "PUSH_EXECUTION",
  "PERMISSION_PROMPT_EXECUTION",
  "SUBSCRIPTION_REGISTRATION",
  "SERVICE_WORKER_MUTATION",
  "EXTERNAL_PROVIDER_CALL",
  "DELIVERY_CLAIM",
  "CANONICAL_TRUTH_MUTATION",
  "SUPABASE_REMOTE_MUTATION",
  "DATABASE_MIGRATION",
  "MAIN_MUTATION",
]) {
  test(`FES 07C manifest keeps ${disabled} disabled`, () => {
    assert.match(manifest, new RegExp(`${disabled}=NO`));
  });
}

test("permission explanation precedes and never executes a prompt", () => {
  const explanation = runtime.createPermissionExplanation({
    capability_reference: "push-reminders",
  });
  assert.equal(explanation.explanation_required, true);
  assert.equal(explanation.explicit_user_gesture_required, true);
  assert.equal(explanation.permission_prompt_executed, false);
});

test("notification intent remains reference-only and non-delivery", () => {
  const result = intent();
  assert.deepEqual(result.payload_references, ["activity-ref-07c"]);
  assert.equal(result.push_execution, false);
  assert.equal(result.external_provider_call, false);
  assert.equal(result.delivery_claimed, false);
});

test("allowlisted target resolves without truth mutation", () => {
  const result = runtime.resolveInternalTarget(target());
  assert.equal(result.navigation_mode, "INTERNAL_ONLY");
  assert.equal(result.browser_navigation_executed, false);
  assert.equal(result.canonical_truth_mutation, false);
});

test("arbitrary external URL is rejected", () => {
  assert.throws(
    () => runtime.createDeepLinkTarget({
      ...target(),
      url: "https://example.invalid",
    }),
    { code: "FES07B_TARGET_FIELDS_INVALID" },
  );
});

test("tenant mismatch is rejected", () => {
  assert.throws(
    () => intent({
      target: target({ tenant_id: "other-tenant" }),
    }),
    { code: "FES07B_TARGET_TENANT_MISMATCH" },
  );
});

test("exact replay deduplicates deterministically", () => {
  const candidate = intent();
  const queue = runtime.createIntentQueue([candidate, candidate]);
  assert.equal(queue.intent_count, 1);
  assert.equal(queue.idempotent_replay_count, 1);
});

test("conflicting content under one identity fails closed", () => {
  assert.throws(
    () => runtime.createIntentQueue([
      intent(),
      intent({
        intent_id: "intent-07c-002",
        payload_references: ["activity-ref-conflict"],
      }),
    ]),
    { code: "FES07B_DEDUPLICATION_CONFLICT" },
  );
});

test("retry is bounded and exhausted retry requires fallback", () => {
  const first = runtime.registerLocalAttempt(intent(), {
    attempt_id: "attempt-07c-001",
    attempted_at: "2026-07-28T16:01:00.000Z",
    outcome: "ADAPTER_UNAVAILABLE",
  });
  const second = runtime.registerLocalAttempt(first, {
    attempt_id: "attempt-07c-002",
    attempted_at: "2026-07-28T16:02:00.000Z",
    outcome: "ADAPTER_UNAVAILABLE",
  });
  assert.equal(first.state, "RETRY_PENDING");
  assert.equal(second.state, "INTERNAL_FALLBACK_REQUIRED");
  assert.throws(
    () => runtime.registerLocalAttempt(second, {
      attempt_id: "attempt-07c-003",
      attempted_at: "2026-07-28T16:03:00.000Z",
      outcome: "ADAPTER_UNAVAILABLE",
    }),
    { code: "FES07B_RETRY_LIMIT_REACHED" },
  );
});

test("cancellation requires the exact governed key", () => {
  assert.throws(
    () => runtime.cancelIntent(
      intent(),
      "wrong-key",
      "2026-07-28T16:04:00.000Z",
    ),
    { code: "FES07B_CANCELLATION_KEY_MISMATCH" },
  );
  assert.equal(
    runtime.cancelIntent(
      intent(),
      "cancel-07c",
      "2026-07-28T16:04:00.000Z",
    ).state,
    "CANCELLED",
  );
});

test("runtime outputs are deeply immutable", () => {
  const result = intent();
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.target), true);
  assert.equal(Object.isFrozen(result.payload_references), true);
});

test("tampered digest is rejected", () => {
  assert.throws(
    () => runtime.assertIntent({
      ...intent(),
      intent_digest: "tampered",
    }),
    { code: "FES07B_INTENT_DIGEST_MISMATCH" },
  );
});

test("runtime and fixture contain no prohibited execution APIs", () => {
  const combined = `${runtimeSource}\n${fixtureSource}`;
  for (const forbidden of [
    /Notification\s*\.\s*requestPermission\s*\(/,
    /serviceWorker\s*\.\s*register\s*\(/,
    /pushManager\s*\.\s*subscribe\s*\(/,
    /\bfetch\s*\(/,
    /\bsupabase\b/i,
    /\blocalStorage\b/,
    /\bsessionStorage\b/,
    /window\s*\.\s*location\s*=/,
    /location\s*\.\s*(?:assign|replace)\s*\(/,
  ]) {
    assert.doesNotMatch(combined, forbidden);
  }
});

test("fixture does not import productive Forge Alive UI", () => {
  assert.doesNotMatch(fixtureSource, /forge-alive/i);
  assert.doesNotMatch(fixtureSource, /app\.js/);
  assert.doesNotMatch(fixtureSource, /nav-pill/i);
});
