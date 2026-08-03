import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

const workflowPath =
  ".github/workflows/restore-productive-forge-alive-authority.yml";
const scriptPath = "scripts/prepare-productive-canonical-pages.mjs";

test("the corrective deploy runs only after the canonical Pages deploy", () => {
  const workflow = readFileSync(workflowPath, "utf8");
  assert.match(workflow, /workflow_run:/);
  assert.match(workflow, /Deploy ForgeOS to GitHub Pages/);
  assert.match(workflow, /github\.event\.workflow_run\.conclusion == 'success'/);
  assert.match(workflow, /github\.event\.workflow_run\.head_branch == 'main'/);
  assert.match(workflow, /actions\/artifacts\/\$\{artifact_id\}\/zip/);
  assert.match(workflow, /prepare-productive-canonical-pages\.mjs/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
});

test("the final canonical artifact restores the productive UI and rejects MD3", () => {
  const temporaryRoot = mkdtempSync(
    path.join(os.tmpdir(), "forge-productive-canonical-"),
  );
  const siteDir = path.join(temporaryRoot, "_site");
  mkdirSync(siteDir, { recursive: true });

  try {
    execFileSync(
      process.execPath,
      [scriptPath, siteDir, "TEST_PRODUCTIVE_AUTHORITY_SHA"],
      {
        cwd: process.cwd(),
        env: {
          ...process.env,
          PRODUCTIVE_INDEX_COMMIT:
            "5e7974152aee9bbe7256a6396ece42cabe934df9",
        },
        stdio: "pipe",
      },
    );

    const canonical = path.join(
      siteDir,
      "static-preview",
      "forge-alive",
    );
    const index = readFileSync(path.join(canonical, "index.html"), "utf8");
    const authority = JSON.parse(
      readFileSync(path.join(canonical, "productive-authority.json"), "utf8"),
    );

    assert.match(index, /Forge Alive Vista Estática/);
    assert.match(index, /forge-alive-auth-entry-067g17b1\.js/);
    assert.match(index, /phone-shell/);
    assert.match(index, /forge-alive-saas-router-r16c5l\.js/);
    assert.doesNotMatch(index, /forge-alive-material3/);
    assert.doesNotMatch(index, /FORGE_CANONICAL_ENTRY_BRIDGE/);
    assert.doesNotMatch(index, /Inicio MD3 \+ Alfred/);
    assert.ok(
      existsSync(path.join(canonical, "forge-alive-auth-entry-067g17b1.js")),
      "productive auth entry must remain in the canonical surface",
    );
    assert.equal(authority.authority, "FORGE_ALIVE_PRODUCTIVE_CANONICAL");
    assert.equal(authority.material3Canonical, false);
    assert.equal(authority.buildSha, "TEST_PRODUCTIVE_AUTHORITY_SHA");
    assert.equal(
      authority.canonicalPath,
      "/ForgeOS/static-preview/forge-alive/",
    );
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
});
