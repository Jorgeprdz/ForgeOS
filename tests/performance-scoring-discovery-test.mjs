import test from "node:test";
import fs from "node:fs";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  DEFAULT_SOURCE_REF,
  DISCOVERY_SCHEMA_VERSION,
  SCAN_ENGINE,
  TERMS,
  classifyPath,
  inventoryTsv,
  matchLine,
  repositoryFromScript,
  summaryJson,
} from "../scripts/ci/perf-01-scoring-authority-discovery.mjs";

const repository = path.resolve(
  path.dirname(
    fileURLToPath(import.meta.url),
  ),
  "..",
);

const inventoryPath =
  path.join(
    repository,
    "docs/evidence/performance/" +
      "PERF-01_SCORING_AUTHORITY_INVENTORY.tsv",
  );

const summaryPath =
  path.join(
    repository,
    "docs/evidence/performance/" +
      "PERF-01_SCORING_AUTHORITY_SUMMARY.json",
  );

function readSummary() {
  return JSON.parse(
    fs.readFileSync(
      summaryPath,
      "utf8",
    ),
  );
}

test("exports discovery schema", () => {
  assert.equal(
    DISCOVERY_SCHEMA_VERSION,
    "performance-scoring-discovery.v1",
  );
  assert.equal(
    SCAN_ENGINE,
    "git-grep-batch.v1",
  );
});

test("uses Activity freeze tag", () => {
  assert.equal(DEFAULT_SOURCE_REF, "activity-foundation-v1");
});

test("defines scoring vocabulary", () => {
  assert.ok(TERMS.length >= 12);
  assert.equal(Object.isFrozen(TERMS), true);
});

test("matches score, points and weight", () => {
  assert.deepEqual(matchLine("weighted score points"), ["POINT", "SCORE", "WEIGHT"]);
});

test("matches Spanish vocabulary", () => {
  const result = matchLine("puntuación ponderación metas");
  assert.ok(result.includes("SCORE"));
  assert.ok(result.includes("WEIGHT"));
  assert.ok(result.includes("TARGET"));
});

test("classifies frozen Activity", () => {
  assert.equal(classifyPath("advisor-os/activity/domain/activity-record.mjs"), "FROZEN_ACTIVITY_REFERENCE");
});

test("classifies performance candidate", () => {
  assert.equal(classifyPath("advisor-os/performance/domain/score.mjs"), "PERFORMANCE_CANDIDATE");
});

test("classifies legacy and tests", () => {
  assert.equal(classifyPath("docs/99-archive/score.md"), "LEGACY_ARCHIVE");
  assert.equal(classifyPath("tests/score-test.mjs"), "TEST");
});

test("resolves paths without percent encoding", () => {
  assert.equal(repositoryFromScript().includes("%20"), false);
});

test("renders deterministic synthetic evidence", () => {
  const value = {
    schemaVersion:
      "performance-scoring-discovery.v1",
    sourceRef:
      "activity-foundation-v1",
    matches: [
      {
        path: "example.mjs",
        line: 1,
        classification: "TEST",
        keywords: ["SCORE"],
        snippet: "score",
      },
    ],
  };

  assert.equal(
    inventoryTsv(value),
    inventoryTsv(value),
  );
  assert.equal(
    summaryJson(value),
    summaryJson(value),
  );
});

test("pins accepted Activity and rejects scoring authority", () => {
  const value =
    readSummary();

  assert.equal(
    value.sourceCommit,
    "de90bcbda6e96f92d6d8569dca604e5a4335a8b9",
  );
  assert.equal(
    value.activityFoundation
      .scoringAuthority,
    false,
  );
});

test("renders clean deterministic evidence", () => {
  const inventory =
    fs.readFileSync(
      inventoryPath,
      "utf8",
    );
  const summary =
    readSummary();

  assert.match(
    inventory,
    /^path\tline\tclassification\tkeywords\tsnippet\n/u,
  );
  assert.doesNotMatch(
    inventory,
    /[ \t]+\n/gu,
  );
  assert.equal(
    inventory.endsWith("\n\n"),
    false,
  );
  assert.equal(
    Object.hasOwn(summary, "matches"),
    false,
  );
  assert.ok(
    summary.unresolvedPolicyQuestions
      .includes("WEIGHT_VERSIONING"),
  );
});
