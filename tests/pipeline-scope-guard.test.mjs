import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";

const RECONCILIATION_BASE_SHA = "cbf493409fc9ff7787ec8da60a436cbed42dd12b";

const allowed = [
  /^docs\/static-preview\/forge-aura\/pipeline\//,
  /^tests\/.*pipeline.*$/i,
  /^docs\/architecture\/source-truth\/.*PIPELINE.*$/i,
  /^docs\/evidence\/.*PIPELINE.*$/i,
  /^\.github\/workflows\/.*pipeline.*$/i,
];

test("PIPELINE_SCOPE_GUARD_TEST: reconciliation commits remain inside the authorized delta", () => {
  const output = execFileSync(
    "git",
    ["diff", "--name-only", `${RECONCILIATION_BASE_SHA}...HEAD`],
    { encoding: "utf8" },
  );

  const files = output.split(/\r?\n/).filter(Boolean);
  const blocked = files.filter(path => !allowed.some(pattern => pattern.test(path)));

  assert.deepEqual(
    blocked,
    [],
    `Out-of-scope files changed after ${RECONCILIATION_BASE_SHA}:\n${blocked.join("\n")}`,
  );
  assert.ok(files.length > 0, "At least one reconciliation file must change.");
});
