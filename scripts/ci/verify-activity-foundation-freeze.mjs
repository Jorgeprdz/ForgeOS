import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {
  execFileSync,
} from "node:child_process";
import {
  fileURLToPath,
} from "node:url";

export const EXPECTED_FREEZE_SCHEMA =
  "activity-foundation-freeze.v1";

export const EXPECTED_FREEZE_ID =
  "activity-foundation-v1";

export const EXPECTED_SOURCE_COMMIT =
  "97f7884080d6e687065e3be60cb5cd6d51c032c9";

export const EXPECTED_FROZEN_FILE_COUNT = 20;

function fail(message) {
  throw new Error(
    `ActivityFoundationFreeze: ${message}`,
  );
}

function sha256(value) {
  return crypto
    .createHash("sha256")
    .update(value)
    .digest("hex");
}

function repositoryRoot() {
  const scriptDirectory =
    path.dirname(
      fileURLToPath(import.meta.url),
    );

  return execFileSync(
    "git",
    [
      "-c",
      "safe.directory=*",
      "-C",
      scriptDirectory,
      "rev-parse",
      "--show-toplevel",
    ],
    {
      encoding: "utf8",
    },
  ).trim();
}

function gitBytes(
  repository,
  sourceCommit,
  relativePath,
) {
  return execFileSync(
    "git",
    [
      "-c",
      "safe.directory=*",
      "-C",
      repository,
      "show",
      `${sourceCommit}:${relativePath}`,
    ],
    {
      encoding: "buffer",
      maxBuffer: 32 * 1024 * 1024,
    },
  );
}

function assertPlainObject(value, label) {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    fail(`${label} must be an object`);
  }
}

function assertSafeRelativePath(value) {
  if (
    typeof value !== "string" ||
    value.trim() === "" ||
    path.isAbsolute(value) ||
    value.split("/").includes("..")
  ) {
    fail(`unsafe frozen path ${value}`);
  }
}

export function verifyActivityFoundationFreeze({
  repository = repositoryRoot(),
  manifestPath =
    "advisor-os/activity/foundation/" +
    "activity-foundation-freeze.v1.json",
} = {}) {
  const absoluteManifest =
    path.join(repository, manifestPath);
  const manifest = JSON.parse(
    fs.readFileSync(
      absoluteManifest,
      "utf8",
    ),
  );

  assertPlainObject(manifest, "manifest");

  if (
    manifest.schemaVersion !==
    EXPECTED_FREEZE_SCHEMA
  ) {
    fail("schema version mismatch");
  }

  if (
    manifest.freezeId !==
    EXPECTED_FREEZE_ID
  ) {
    fail("freeze id mismatch");
  }

  if (
    manifest.sourceCommit !==
    EXPECTED_SOURCE_COMMIT
  ) {
    fail("source commit mismatch");
  }

  if (
    manifest.branch !==
    "feature/activity-domain-runtime-foundation"
  ) {
    fail("branch mismatch");
  }

  if (
    manifest.tag !==
    "activity-foundation-v1"
  ) {
    fail("tag mismatch");
  }

  assertPlainObject(
    manifest.contracts,
    "contracts",
  );

  const expectedContracts = {
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
  };

  if (
    JSON.stringify(manifest.contracts) !==
    JSON.stringify(expectedContracts)
  ) {
    fail("contract vocabulary mismatch");
  }

  assertPlainObject(
    manifest.remoteAcceptance,
    "remoteAcceptance",
  );

  const acceptance =
    manifest.remoteAcceptance;

  if (
    acceptance.phase !== "ACT-09" ||
    acceptance.status !==
      "REMOTE_ACCEPTED" ||
    acceptance.appendRpcCalls !== 0 ||
    acceptance.temporaryActivityRows !== 0 ||
    acceptance.temporaryAuthResidue !==
      "ZERO" ||
    acceptance.schemaMutation !== false
  ) {
    fail(
      "remote acceptance boundary mismatch",
    );
  }

  assertPlainObject(
    manifest.boundaries,
    "boundaries",
  );

  const boundaries =
    manifest.boundaries;

  for (const key of [
    "productiveUiMutation",
    "muiTokenAuthority",
    "scoringAuthority",
    "pipelineWriterMutation",
    "remoteSchemaMutation",
  ]) {
    if (boundaries[key] !== false) {
      fail(`boundary ${key} must be false`);
    }
  }

  if (
    boundaries.writeAuthority !==
    "ACTIVITY_REPOSITORY_APPEND_ONLY"
  ) {
    fail("write authority mismatch");
  }

  if (
    boundaries.readAuthority !==
    "ACTIVITY_READ_RUNTIME"
  ) {
    fail("read authority mismatch");
  }

  if (
    !Array.isArray(manifest.frozenFiles) ||
    manifest.frozenFiles.length !==
      EXPECTED_FROZEN_FILE_COUNT
  ) {
    fail("frozen file count mismatch");
  }

  const seen = new Set();
  const verified = [];

  execFileSync(
    "git",
    [
      "-c",
      "safe.directory=*",
      "-C",
      repository,
      "merge-base",
      "--is-ancestor",
      manifest.sourceCommit,
      "HEAD",
    ],
    {
      stdio: "pipe",
    },
  );

  for (const entry of manifest.frozenFiles) {
    assertPlainObject(
      entry,
      "frozen file entry",
    );
    assertSafeRelativePath(entry.path);

    if (seen.has(entry.path)) {
      fail(
        `duplicate frozen path ${entry.path}`,
      );
    }

    seen.add(entry.path);

    if (
      !/^[0-9a-f]{64}$/.test(entry.sha256)
    ) {
      fail(
        `invalid hash for ${entry.path}`,
      );
    }

    const absolute =
      path.join(repository, entry.path);

    if (
      !fs.existsSync(absolute) ||
      !fs.statSync(absolute).isFile()
    ) {
      fail(
        `frozen file missing ${entry.path}`,
      );
    }

    const currentBytes =
      fs.readFileSync(absolute);
    const sourceBytes =
      gitBytes(
        repository,
        manifest.sourceCommit,
        entry.path,
      );

    const currentHash =
      sha256(currentBytes);
    const sourceHash =
      sha256(sourceBytes);

    if (
      currentHash !== entry.sha256 ||
      sourceHash !== entry.sha256
    ) {
      fail(
        `frozen drift detected ${entry.path}`,
      );
    }

    if (
      currentBytes.length !==
      entry.bytes
    ) {
      fail(
        `byte count mismatch ${entry.path}`,
      );
    }

    verified.push(entry.path);
  }

  const required = [
    "advisor-os/activity/domain/activity-record.mjs",
    "advisor-os/activity/application/activity-repository-port.mjs",
    "advisor-os/activity/application/pipeline-to-activity-projector.mjs",
    "advisor-os/activity/application/activity-period-aggregator.mjs",
    "advisor-os/activity/application/activity-feed-projector.mjs",
    "advisor-os/activity/runtime/activity-read-runtime.mjs",
    "advisor-os/activity/infrastructure/supabase-activity-repository.mjs",
    "supabase/migrations/20260726000200_act04_activity_records.sql",
    "docs/evidence/activity/ACT-09_ACTIVITY_REMOTE_READ_ACCEPTANCE.md",
  ];

  for (const requiredPath of required) {
    if (!seen.has(requiredPath)) {
      fail(
        `required frozen path missing ${requiredPath}`,
      );
    }
  }

  return Object.freeze({
    schemaVersion:
      manifest.schemaVersion,
    freezeId:
      manifest.freezeId,
    sourceCommit:
      manifest.sourceCommit,
    frozenFileCount:
      verified.length,
    verifiedPaths:
      Object.freeze([...verified]),
  });
}

const currentFile =
  fileURLToPath(import.meta.url);

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) ===
    path.resolve(currentFile)
) {
  const result =
    verifyActivityFoundationFreeze();

  console.log(
    "ACTIVITY_FOUNDATION_FREEZE_VERIFY=PASS",
  );
  console.log(
    `FREEZE_ID=${result.freezeId}`,
  );
  console.log(
    `SOURCE_COMMIT=${result.sourceCommit}`,
  );
  console.log(
    `FROZEN_FILES=${result.frozenFileCount}`,
  );
}
