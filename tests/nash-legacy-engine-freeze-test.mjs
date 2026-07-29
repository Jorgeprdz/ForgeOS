import assert from "node:assert/strict";
import {
  createHash,
} from "node:crypto";
import {
  execFileSync,
} from "node:child_process";
import {
  readFileSync,
} from "node:fs";
import test from "node:test";

const registryPath =
  "platform/conversation-intelligence/" +
  "nash-legacy-freeze-registry.json";
const baselinePath =
  "docs/architecture/source-truth/" +
  "NASH_LEGACY_IMPORT_BASELINE_001.txt";

const registry =
  JSON.parse(
    readFileSync(registryPath, "utf8"),
  );

function sha256(path) {
  return createHash("sha256")
    .update(readFileSync(path))
    .digest("hex");
}

function currentReferences(path) {
  const stem =
    path.replace(/\.js$/, "");
  try {
    return execFileSync(
      "git",
      [
        "grep",
        "-nF",
        stem,
        "--",
        "*.js",
        "*.mjs",
        "*.cjs",
        "*.ts",
        "*.tsx",
        ":!tests/**",
        ":!docs/**",
        ":!platform/conversation-intelligence/**",
      ],
      {
        encoding: "utf8",
      },
    ).trim();
  } catch (error) {
    if (error.status === 1) {
      return "";
    }
    throw error;
  }
}

function baselineSection(path) {
  const marker =
    `### ${path}\n`;
  const source =
    readFileSync(baselinePath, "utf8");
  const start =
    source.indexOf(marker);
  assert.notEqual(
    start,
    -1,
    `Missing baseline marker for ${path}`,
  );
  const bodyStart =
    start + marker.length;
  const next =
    source.indexOf("\n### ", bodyStart);
  return source
    .slice(
      bodyStart,
      next === -1
        ? source.length
        : next + 1,
    )
    .trim();
}

test(
  "legacy freeze registry has canonical status",
  () => {
    assert.equal(
      registry.schema,
      "forge.nash_legacy_engine_freeze.v1",
    );
    assert.equal(
      registry.status,
      "FROZEN_DO_NOT_IMPORT_DO_NOT_EXECUTE",
    );
    assert.equal(
      registry.files.length,
      7,
    );
  },
);

for (const item of registry.files) {
  test(
    `${item.path} remains content-frozen`,
    () => {
      assert.equal(
        sha256(item.path),
        item.sha256,
      );
    },
  );

  test(
    `${item.path} gains no production references`,
    () => {
      assert.equal(
        currentReferences(item.path),
        baselineSection(item.path),
      );
    },
  );
}

test(
  "Conversation Desk foundation imports no frozen engine",
  () => {
    const tracked =
      execFileSync(
        "git",
        [
          "ls-files",
          "platform/conversation-intelligence",
          "advisor-os/conversation",
        ],
        {
          encoding: "utf8",
        },
      )
        .split("\n")
        .filter(Boolean);

    for (const path of tracked) {
      if (
        !/\.(js|mjs|cjs|ts|tsx)$/.test(path)
      ) {
        continue;
      }
      const source =
        readFileSync(path, "utf8");
      for (const item of registry.files) {
        assert.equal(
          source.includes(item.path),
          false,
          `${path} references frozen ${item.path}`,
        );
        assert.equal(
          source.includes(
            item.path.replace(/\.js$/, ""),
          ),
          false,
          `${path} references frozen ${item.path}`,
        );
      }
    }
  },
);
