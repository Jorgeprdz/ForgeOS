import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";

function reconciliationBase() {
  const baseRef = process.env.GITHUB_BASE_REF || "main";
  try {
    return execFileSync(
      "git",
      ["merge-base", "HEAD", `origin/${baseRef}`],
      { encoding: "utf8" },
    ).trim();
  } catch {
    return execFileSync(
      "git",
      ["merge-base", "HEAD", "origin/main"],
      { encoding: "utf8" },
    ).trim();
  }
}

const allowed = [
  /^docs\/static-preview\/forge-aura\/pipeline\//,
  /^tests\/.*pipeline.*$/i,
  /^docs\/architecture\/source-truth\/.*PIPELINE.*$/i,
  /^docs\/evidence\/.*PIPELINE.*$/i,
  /^\.github\/workflows\/.*pipeline.*$/i,
  /^advisor-os\/sales-pipeline\/pipeline-domain-intelligence-consumer\.js$/,
  /^tests\/forge-domain-intelligence-authority-reconciliation-005a\.test\.mjs$/,
  /^docs\/evidence\/FORGE_DOMAIN_INTELLIGENCE_AUTHORITY_RECONCILIATION_005A_(DISCOVERY|CLOSURE)\.md$/,
  /^\.github\/workflows\/forge-domain-intelligence-authority-reconciliation-005a\.yml$/,
];

test("PIPELINE_SCOPE_GUARD_TEST: reconciliation commits remain inside the authorized delta", () => {
  const base = reconciliationBase();
  assert.ok(base, "A current main merge-base is required for scope validation.");

  const output = execFileSync(
    "git",
    ["diff", "--name-only", base, "HEAD"],
    { encoding: "utf8" },
  );

  const files = output.split(/\r?\n/).filter(Boolean);
  const blocked = files.filter(path => !allowed.some(pattern => pattern.test(path)));

  assert.deepEqual(
    blocked,
    [],
    `Out-of-scope files changed after ${base}:\n${blocked.join("\n")}`,
  );
  assert.ok(files.length > 0, "At least one reconciliation file must change.");
});
