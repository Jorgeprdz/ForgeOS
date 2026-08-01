import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();
const bridgePath = join(
  root,
  "docs/static-preview/forge-alive-material3/activity-ledger-reporting-bridge.mjs",
);
const reportingSource = join(root, "advisor-os/reporting");
const reportingTarget = join(root, "docs/advisor-os/reporting");
const eventEvidenceSource = join(root, "platform/event-evidence");
const eventEvidenceTarget = join(root, "docs/platform/event-evidence");
const activityLedgerRuntimeFiles = [
  "canonical-activity-event-contract.js",
  "activity-ledger-contract.js",
  "activity-ledger-local-store.js",
  "activity-ledger-sync-service.js",
  "activity-ledger-supabase-gateway.js",
  "activity-ledger-browser-runtime.js",
];

async function listFiles(directory, predicate, prefix = "") {
  const entries = await readdir(directory, { withFileTypes: true });
  const selected = [];
  for (const entry of entries) {
    const relativePath = prefix ? join(prefix, entry.name) : entry.name;
    const absolutePath = join(directory, entry.name);
    if (entry.isDirectory()) {
      selected.push(...await listFiles(absolutePath, predicate, relativePath));
    } else if (predicate(relativePath)) {
      selected.push(relativePath);
    }
  }
  return selected.sort();
}

async function assertEqualFiles(source, target) {
  const [sourceContent, targetContent] = await Promise.all([
    readFile(source),
    readFile(target),
  ]);
  assert.equal(
    sourceContent.equals(targetContent),
    true,
    `generated file drifted: ${target}`,
  );
}

test("REP-16F generator materializes only governed Activity runtime assets", async () => {
  const originalBridge = await readFile(bridgePath, "utf8");
  try {
    execFileSync(
      process.execPath,
      ["scripts/build-advisor-presentation-pages-runtime.mjs"],
      {
        cwd: root,
        env: {
          ...process.env,
          FORGE_PAGES_RUNTIME_MODE: "pages",
          GITHUB_WORKFLOW: "REP-16F Generator Contract",
        },
        stdio: "pipe",
      },
    );

    const reportingFiles = await listFiles(
      reportingSource,
      (file) => file.endsWith(".mjs"),
    );
    assert.ok(reportingFiles.length >= 19);
    assert.deepEqual(
      await listFiles(reportingTarget, (file) => file.endsWith(".mjs")),
      reportingFiles,
    );
    for (const file of reportingFiles) {
      await assertEqualFiles(
        join(reportingSource, file),
        join(reportingTarget, file),
      );
    }

    assert.deepEqual(
      await listFiles(eventEvidenceTarget, (file) => file.endsWith(".js")),
      [...activityLedgerRuntimeFiles].sort(),
    );
    for (const file of activityLedgerRuntimeFiles) {
      await assertEqualFiles(
        join(eventEvidenceSource, file),
        join(eventEvidenceTarget, file),
      );
    }

    const deployedBridge = await readFile(bridgePath, "utf8");
    assert.equal(
      deployedBridge.includes("../../../advisor-os/reporting/"),
      false,
    );
    assert.equal(
      deployedBridge.split("../../advisor-os/reporting/").length - 1,
      2,
    );

    const indexed = execFileSync(
      "git",
      ["ls-files", "-z"],
      { cwd: root, encoding: "utf8" },
    ).split("\0");
    assert.ok(indexed.includes(
      "docs/advisor-os/reporting/runtime/activity-reporting-runtime.mjs",
    ));
    assert.ok(indexed.includes(
      "docs/platform/event-evidence/activity-ledger-browser-runtime.js",
    ));
  } finally {
    await writeFile(bridgePath, originalBridge);
    execFileSync(
      "git",
      [
        "reset",
        "-q",
        "HEAD",
        "--",
        "docs/advisor-os/reporting",
        "docs/platform/event-evidence",
        "docs/static-preview/forge-alive-material3/activity-ledger-reporting-bridge.mjs",
      ],
      { cwd: root, stdio: "ignore" },
    );
    await Promise.all([
      rm(join(root, "docs/advisor-os"), { recursive: true, force: true }),
      rm(join(root, "docs/platform"), { recursive: true, force: true }),
    ]);
  }
});
