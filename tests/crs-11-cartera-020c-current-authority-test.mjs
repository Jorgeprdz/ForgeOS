import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const closure = readFileSync(
  new URL(
    "../docs/evidence/FORGE_CARTERA_020C_REMOTE_ACCEPTANCE_CLOSURE_001.md",
    import.meta.url,
  ),
  "utf8",
);
const retirement = readFileSync(
  new URL(
    "../docs/evidence/FORGE_CARTERA_020C_ONE_SHOT_RUNNER_RETIREMENT_001.md",
    import.meta.url,
  ),
  "utf8",
);
const dispatcher = readFileSync(
  new URL(
    "../.github/workflows/cartera-020c-remote-dispatch.yml",
    import.meta.url,
  ),
  "utf8",
);

function requireMarkers(text, markers) {
  for (const marker of markers) {
    assert.match(
      text,
      new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      `Missing marker: ${marker}`,
    );
  }
}

test("020C retains immutable accepted remote evidence", () => {
  requireMarkers(closure, [
    "WORKFLOW_RUN=30675286681",
    "WORKFLOW_JOB=91301111909",
    "ARTIFACT_ID=8810199540",
    "ARTIFACT_SHA256=b396f1b95338a4f280c63eb4cd10ff799481b57aceb3194d2947e979c4d8e1f4",
    "CARTERA_020C_COMPLETE=YES",
  ]);
  for (let version = 230; version <= 241; version += 1) {
    assert.match(closure, new RegExp(`20260731000${version}`));
  }
});

test("020C closure proves conflicts, RLS, replay safety and cleanup", () => {
  requireMarkers(closure, [
    "AUTHORIZATION_DIGEST_BINDING=PASS",
    "CHANGED_INPUT_CONFLICT=PASS",
    "RETRY_GOVERNANCE=PASS",
    "PARALLEL_STATE_VERSION_SERIALIZATION=PASS",
    "RLS_CROSS_ADVISOR=PASS",
    "DIRECT_WRITES=BLOCKED",
    "TEST_FIXTURES_ROLLED_BACK=YES",
    "RESIDUAL_FIXTURES=0",
    "ACCOUNT_MUTATION=NOT_AUTHORIZED",
  ]);
});

test("one-shot remote mutation surface is retired", () => {
  requireMarkers(retirement, [
    "REMOTE_ACCEPTANCE_STATUS=PASS",
    "SUPABASE_REMOTE_MUTATION=NONE",
    "ACCOUNT_MUTATION=NOT_AUTHORIZED",
    "DEFAULT_BRANCH_REMOTE_DISPATCH=READ_ONLY_CLOSURE_VERIFIER",
    "SUPABASE_ACCESS_TOKEN=NOT_REFERENCED",
    "REMOTE_MUTATION=IMPOSSIBLE",
    "CARTERA_020C_COMPLETE=YES",
  ]);
  assert.match(retirement, /Neutralized one-shot workflows/);
});

test("default-branch dispatcher is a pinned read-only verifier", () => {
  assert.match(dispatcher, /^  workflow_dispatch:/m);
  assert.doesNotMatch(dispatcher, /^  (push|pull_request):/m);
  assert.match(dispatcher, /permissions:\n  contents: read/);
  assert.match(dispatcher, /ref: e7982dd263a4f2e894569bc4821edf94bfa1a9da/);
  assert.match(dispatcher, /REMOTE_ACCEPTANCE_ALREADY_CLOSED=YES/);
  assert.match(dispatcher, /REMOTE_MUTATION=NONE/);
  assert.match(dispatcher, /ACCOUNT_MUTATION=NOT_AUTHORIZED/);
  assert.doesNotMatch(dispatcher, /SUPABASE_ACCESS_TOKEN|service_role|database password/i);
});
