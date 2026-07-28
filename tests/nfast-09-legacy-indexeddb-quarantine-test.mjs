"use strict";

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const repo = path.resolve(path.dirname(currentFile), "..");

const quarantineRelative =
  "legacy/quarantine/crmaddlife-indexeddb";
const quarantine = path.join(repo, quarantineRelative);
const manifestPath = path.join(
  quarantine,
  "quarantine-manifest.json",
);

const legacyRootFiles = [
  "db.js",
  "storage-engine.js",
  "storage-validator.js",
  "storage-queue.js",
];

function read(relative) {
  return fs.readFileSync(
    path.join(repo, relative),
    "utf8",
  );
}

function walk(directory) {
  if (!fs.existsSync(directory)) return [];

  return fs.readdirSync(
    directory,
    {
      withFileTypes: true,
    },
  ).flatMap(entry => {
    const absolute = path.join(
      directory,
      entry.name,
    );

    if (
      entry.isDirectory() &&
      [
        ".git",
        "node_modules",
      ].includes(entry.name)
    ) {
      return [];
    }

    if (entry.isDirectory()) {
      return walk(absolute);
    }

    return [absolute];
  });
}

test(
  "legacy IndexedDB files are physically quarantined",
  () => {
    for (const relative of legacyRootFiles) {
      assert.equal(
        fs.existsSync(
          path.join(repo, relative),
        ),
        false,
        `${relative} must not remain at repository root`,
      );

      assert.equal(
        fs.existsSync(
          path.join(quarantine, relative),
        ),
        true,
        `${relative} must exist in quarantine`,
      );
    }
  },
);

test(
  "quarantine manifest freezes allowed legacy importers",
  () => {
    const manifest = JSON.parse(
      fs.readFileSync(manifestPath, "utf8"),
    );

    assert.equal(
      manifest.status,
      "QUARANTINED_COMPATIBILITY_ONLY",
    );
    assert.equal(
      manifest.newCodeImportsAllowed,
      false,
    );
    assert.equal(
      manifest.nfast09ImportsAllowed,
      false,
    );
    assert.ok(
      manifest.allowedLegacyImporters.length > 0,
    );

    for (
      const importer
      of manifest.allowedLegacyImporters
    ) {
      assert.ok(
        read(importer).includes(
          quarantineRelative,
        ),
        `${importer} must use the explicit quarantine path`,
      );
    }
  },
);

test(
  "only manifest allowlisted consumers may import quarantined storage",
  () => {
    const manifest = JSON.parse(
      fs.readFileSync(manifestPath, "utf8"),
    );

    const allowed = [
      ...manifest.allowedLegacyImporters,
    ].sort();

    const quarantineTargets = new Set(
      legacyRootFiles.map(relative =>
        path.resolve(
          quarantine,
          relative,
        ),
      ),
    );

    const importPattern =
      /(?<quote>["'])(?<specifier>[^"']+\.js)\k<quote>/g;

    const actualImporters = new Set();

    for (
      const absolute
      of walk(repo)
    ) {
      if (
        !/\.(?:js|mjs|cjs|html)$/.test(
          absolute,
        ) ||
        absolute.startsWith(quarantine) ||
        absolute.includes(
          `${path.sep}.git${path.sep}`,
        )
      ) {
        continue;
      }

      const source = fs.readFileSync(
        absolute,
        "utf8",
      );

      for (
        const match
        of source.matchAll(importPattern)
      ) {
        const specifier =
          match.groups.specifier;

        if (
          specifier.includes("://") ||
          specifier.startsWith("/") ||
          specifier.startsWith("data:")
        ) {
          continue;
        }

        const resolved = path.resolve(
          path.dirname(absolute),
          specifier,
        );

        if (
          quarantineTargets.has(resolved)
        ) {
          actualImporters.add(
            path.relative(
              repo,
              absolute,
            ).replaceAll(
              path.sep,
              "/",
            ),
          );
        }
      }
    }

    assert.deepEqual(
      [...actualImporters].sort(),
      allowed,
    );
  },
);

test(
  "no import resolves to removed root IndexedDB files",
  () => {
    const removedRootTargets = new Set(
      legacyRootFiles.map(relative =>
        path.resolve(repo, relative),
      ),
    );

    const importPattern =
      /(?<quote>["'])(?<specifier>[^"']+\.js)\k<quote>/g;

    for (
      const absolute
      of walk(repo)
    ) {
      if (
        !/\.(?:js|mjs|cjs|html)$/.test(
          absolute,
        ) ||
        absolute.startsWith(quarantine) ||
        absolute.includes(
          `${path.sep}.git${path.sep}`,
        )
      ) {
        continue;
      }

      const source = fs.readFileSync(
        absolute,
        "utf8",
      );

      for (
        const match
        of source.matchAll(importPattern)
      ) {
        const specifier =
          match.groups.specifier;

        if (
          specifier.includes("://") ||
          specifier.startsWith("/") ||
          specifier.startsWith("data:")
        ) {
          continue;
        }

        const resolved = path.resolve(
          path.dirname(absolute),
          specifier,
        );

        assert.equal(
          removedRootTargets.has(resolved),
          false,
          [
            path.relative(repo, absolute),
            "resolves to removed root target",
            path.relative(repo, resolved),
          ].join(" "),
        );
      }
    }
  },
);

test(
  "quarantined database identity stays legacy and isolated",
  () => {
    const source = read(
      `${quarantineRelative}/storage-engine.js`,
    );

    assert.ok(
      source.includes(
        "ADDLIFE_CRM_ENTERPRISE",
      ),
    );
    assert.equal(
      source.includes(
        "FORGE_OS_DUE_ACTIONS",
      ),
      false,
    );
  },
);
