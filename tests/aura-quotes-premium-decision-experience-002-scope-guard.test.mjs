import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import test from "node:test";

const allowed = [
  /^docs\/static-preview\/forge-aura\/quotes\//,
  /^tests\/.*quotes.*$/i,
  /^tests\/e2e\/.*quotes.*$/i,
  /^tests\/fixtures\/.*quotes.*$/i,
  /^docs\/architecture\/source-truth\/FORGE_AURA_QUOTES_PREMIUM_DECISION_EXPERIENCE_RECONCILIATION_002\.md$/,
  /^docs\/evidence\/FORGE_AURA_QUOTES_PREMIUM_DECISION_EXPERIENCE_ACCEPTANCE_002\.md$/,
  /^\.github\/workflows\/aura-quotes-premium-decision-experience-002\.yml$/,
];

const forbidden = [
  /^supabase\/migrations\//,
  /^supabase\/functions\//,
  /^platform\/(?:policy|product|forecast|compensation)-/i,
  /^docs\/static-preview\/forge-aura\/(?:pipeline|cartera|income|home|activity|auth)\//i,
  /^docs\/static-preview\/forge-alive-material3\//,
  /^\.github\/workflows\/pages\.yml$/,
];

function output(command, args) {
  return execFileSync(command, args, { encoding: "utf8" }).trim();
}

test("QUOTES_SCOPE_GUARD: diff is calculated from the current origin/main merge-base", () => {
  const mergeBase = output("git", ["merge-base", "origin/main", "HEAD"]);
  assert.match(mergeBase, /^[0-9a-f]{40}$/);
  const changed = output("git", ["diff", "--name-only", `${mergeBase}...HEAD`]).split(/\r?\n/).filter(Boolean);
  assert.ok(changed.length > 0, "At least one Quotes reconciliation file must change.");

  const outOfScope = changed.filter(path => !allowed.some(pattern => pattern.test(path)));
  const forbiddenPaths = changed.filter(path => forbidden.some(pattern => pattern.test(path)));
  assert.deepEqual(outOfScope, [], `OUT_OF_SCOPE_MUTATION:\n${outOfScope.join("\n")}`);
  assert.deepEqual(forbiddenPaths, [], `FORBIDDEN_SCOPE_MUTATION:\n${forbiddenPaths.join("\n")}`);
  console.log(`MERGE_BASE=${mergeBase}`);
});

test("QUOTES_SCOPE_GUARD: changed visual sources contain no forbidden legacy imports", () => {
  const mergeBase = output("git", ["merge-base", "origin/main", "HEAD"]);
  const changed = output("git", ["diff", "--name-only", `${mergeBase}...HEAD`]).split(/\r?\n/).filter(Boolean);
  const visual = changed.filter(path => /docs\/static-preview\/forge-aura\/quotes\/.*\.(?:js|css)$/.test(path));
  const violations = [];
  for (const path of visual) {
    const source = readFileSync(path, "utf8");
    if (/forge-alive-material3|FORGE_ALIVE_MATERIAL3_CSS|legacy recovery|recovery\.css/i.test(source)) violations.push(path);
  }
  assert.deepEqual(violations, [], `LEGACY_VISUAL_IMPORT=${violations.join(",")}`);
});