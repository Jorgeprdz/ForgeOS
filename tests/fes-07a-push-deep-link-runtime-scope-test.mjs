import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const scopePath =
  "docs/architecture/source-truth/" +
  "FES_07A_PUSH_AND_DEEP_LINK_RUNTIME_SCOPE_001.md";

const scope =
  readFileSync(scopePath, "utf8");

test("FES 07A locks the scope identifier", () => {
  assert.match(
    scope,
    /FES_07A_PUSH_AND_DEEP_LINK_RUNTIME_SCOPE=SCOPED/,
  );
});

test("FES 07A keeps its parent runtime open", () => {
  assert.match(
    scope,
    /FES_07_PUSH_AND_DEEP_LINK_RUNTIME=OPEN/,
  );
});

test("FES 07A points to implementation next", () => {
  assert.match(
    scope,
    /NEXT=FES_07B_PUSH_AND_DEEP_LINK_RUNTIME_IMPLEMENTATION/,
  );
});

for (
  const component of [
    "PERMISSION_UX",
    "SUBSCRIPTIONS",
    "SCHEDULER",
    "PUSH",
    "DEEP_LINKS",
    "RETRY",
    "DEDUPLICATION",
    "INTERNAL_FALLBACK",
  ]
) {
  test(`FES 07A scopes ${component}`, () => {
    assert.match(
      scope,
      new RegExp(`COMPONENTS=[^\\n]*${component}`),
    );
  });
}

test("FES 07A requires an implementation manifest", () => {
  assert.match(
    scope,
    /IMPLEMENTATION_REQUIRES_APPROVED_MANIFEST=YES/,
  );
});

for (
  const disabled of [
    "PUSH_EXECUTION",
    "PERMISSION_PROMPT_EXECUTION",
    "SUBSCRIPTION_REGISTRATION",
    "SERVICE_WORKER_MUTATION",
    "EXTERNAL_PROVIDER_CALL",
    "PRODUCTIVE_UI_MUTATION",
    "NAV_PILL_MUTATION",
    "SUPABASE_REMOTE_MUTATION",
    "DATABASE_MIGRATION",
    "MAIN_MUTATION",
  ]
) {
  test(`FES 07A keeps ${disabled} disabled`, () => {
    assert.match(
      scope,
      new RegExp(`${disabled}=NO`),
    );
  });
}

test("FES 07A requires explicit user gesture", () => {
  assert.match(
    scope,
    /explicit user gesture/i,
  );
});

test("FES 07A forbids automatic permission prompts", () => {
  assert.match(
    scope,
    /Automatic\s+permission\s+prompts[^.]*forbidden/i,
  );
});

test("FES 07A makes subscription tenant-bound and reversible", () => {
  assert.match(
    scope,
    /tenant-bound and reversible/i,
  );
});

test("FES 07A separates scheduling from outcome truth", () => {
  assert.match(
    scope,
    /not\s+proof\s+that\s+a\s+message\s+was\s+delivered/i,
  );
});

test("FES 07A requires reference-only push payloads", () => {
  assert.match(
    scope,
    /Push payloads must be reference-only/i,
  );
});

test("FES 07A rejects raw private payload fields", () => {
  for (
    const field of [
      "telephone numbers",
      "WhatsApp",
      "conversation text",
      "credentials",
      "provider tokens",
    ]
  ) {
    assert.match(
      scope,
      new RegExp(field, "i"),
    );
  }
});

test("FES 07A forbids arbitrary external deep links", () => {
  assert.match(
    scope,
    /Arbitrary\s+external\s+URLs[^.]*forbidden/i,
  );
});

test("FES 07A keeps deep links read-only", () => {
  assert.match(
    scope,
    /does not mutate canonical truth/i,
  );
});

test("FES 07A requires bounded retry", () => {
  assert.match(
    scope,
    /Retries must be bounded and observable/i,
  );
});

test("FES 07A requires stable deduplication identity", () => {
  assert.match(
    scope,
    /stable\s+deduplication identity/i,
  );
});

test("FES 07A deduplicates exact replay", () => {
  assert.match(
    scope,
    /Exact replay is deduplicated/i,
  );
});

test("FES 07A rejects conflicting idempotency content", () => {
  assert.match(
    scope,
    /conflicting content under\s+the same identity fails closed/i,
  );
});

test("FES 07A requires explicit internal fallback", () => {
  assert.match(
    scope,
    /explicit internal fallback state/i,
  );
});

test("FES 07A fallback cannot claim external delivery", () => {
  assert.match(
    scope,
    /may not claim external delivery/i,
  );
});
