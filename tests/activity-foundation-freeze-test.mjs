import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  execFileSync,
} from "node:child_process";
import {
  fileURLToPath,
} from "node:url";

import {
  EXPECTED_FREEZE_ID,
  EXPECTED_FREEZE_SCHEMA,
  EXPECTED_FROZEN_FILE_COUNT,
  EXPECTED_SOURCE_COMMIT,
  verifyActivityFoundationFreeze,
} from "../scripts/ci/verify-activity-foundation-freeze.mjs";

const testDirectory =
  path.dirname(
    fileURLToPath(import.meta.url),
  );

const repository =
  execFileSync(
    "git",
    [
      "-c",
      "safe.directory=*",
      "-C",
      testDirectory,
      "rev-parse",
      "--show-toplevel",
    ],
    {
      encoding: "utf8",
    },
  ).trim();

const manifestPath =
  path.join(
    repository,
    "advisor-os/activity/foundation/" +
      "activity-foundation-freeze.v1.json",
  );

function manifest() {
  return JSON.parse(
    fs.readFileSync(
      manifestPath,
      "utf8",
    ),
  );
}

test("exports freeze schema", () => {
  assert.equal(
    EXPECTED_FREEZE_SCHEMA,
    "activity-foundation-freeze.v1",
  );
});

test("exports freeze identity", () => {
  assert.equal(
    EXPECTED_FREEZE_ID,
    "activity-foundation-v1",
  );
});

test("pins the accepted ACT-09 source commit", () => {
  assert.equal(
    EXPECTED_SOURCE_COMMIT,
    "97f7884080d6e687065e3be60cb5cd6d51c032c9",
  );
});

test("contains exactly twenty frozen artifacts", () => {
  assert.equal(
    EXPECTED_FROZEN_FILE_COUNT,
    20,
  );
  assert.equal(
    manifest().frozenFiles.length,
    20,
  );
});

test("freezes the complete contract vocabulary", () => {
  assert.deepEqual(
    manifest().contracts,
    {
      activityRecord:
        "activity-record.v1",
      pipelineEvent:
        "pipeline-transition.v1",
      pipelineProjection:
        "pipeline-activity-projection.v1",
      periodAggregation:
        "activity-period-aggregation.v1",
      feed:
        "activity-feed.v1",
      feedItem:
        "activity-feed-item.v1",
      readRuntime:
        "activity-read-runtime.v1",
      persistenceMigration:
        "20260726000200",
    },
  );
});

test("records zero-residue remote acceptance", () => {
  assert.deepEqual(
    manifest().remoteAcceptance,
    {
      phase: "ACT-09",
      status: "REMOTE_ACCEPTED",
      appendRpcCalls: 0,
      temporaryActivityRows: 0,
      temporaryAuthResidue: "ZERO",
      schemaMutation: false,
    },
  );
});

test("keeps productive UI outside the freeze", () => {
  assert.equal(
    manifest().boundaries
      .productiveUiMutation,
    false,
  );
  assert.equal(
    manifest().boundaries
      .muiTokenAuthority,
    false,
  );
});

test("keeps scoring outside Activity authority", () => {
  assert.equal(
    manifest().boundaries
      .scoringAuthority,
    false,
  );
});

test("freezes append-only write authority", () => {
  assert.equal(
    manifest().boundaries
      .writeAuthority,
    "ACTIVITY_REPOSITORY_APPEND_ONLY",
  );
});

test("freezes the read runtime authority", () => {
  assert.equal(
    manifest().boundaries
      .readAuthority,
    "ACTIVITY_READ_RUNTIME",
  );
});

test("contains unique sorted file paths", () => {
  const paths =
    manifest().frozenFiles.map(
      (entry) => entry.path,
    );

  assert.equal(
    new Set(paths).size,
    paths.length,
  );
  assert.deepEqual(
    paths,
    [...paths].sort(),
  );
});

test("contains valid SHA-256 hashes", () => {
  for (
    const entry of
    manifest().frozenFiles
  ) {
    assert.match(
      entry.sha256,
      /^[0-9a-f]{64}$/,
    );
    assert.ok(entry.bytes > 0);
    assert.ok(entry.lines > 0);
  }
});

test("verifier accepts the frozen foundation", () => {
  const result =
    verifyActivityFoundationFreeze({
      repository,
    });

  assert.equal(
    result.freezeId,
    "activity-foundation-v1",
  );
  assert.equal(
    result.frozenFileCount,
    20,
  );
});

test("command-line verifier emits PASS", () => {
  const output =
    execFileSync(
      "node",
      [
        "scripts/ci/verify-activity-foundation-freeze.mjs",
      ],
      {
        cwd: repository,
        encoding: "utf8",
      },
    );

  assert.match(
    output,
    /ACTIVITY_FOUNDATION_FREEZE_VERIFY=PASS/,
  );
  assert.match(
    output,
    /FROZEN_FILES=20/,
  );
});

test("freeze points to the immutable tag name", () => {
  assert.equal(
    manifest().tag,
    "activity-foundation-v1",
  );
});
