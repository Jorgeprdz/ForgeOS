import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(testDir, "..");

const entry = path.join(
  root,
  "docs/static-preview/forge-alive/index.html",
);

const runtimeRoot = path.join(
  root,
  "docs/static-preview/forge-alive/ui-material3-runtime",
);

const tokensPath = path.join(
  runtimeRoot,
  "forge-material3-runtime-tokens.css",
);

const primitivesPath = path.join(
  runtimeRoot,
  "forge-material3-primitives.css",
);

const flagPath = path.join(
  runtimeRoot,
  "forge-material3-feature-flag.js",
);

const manifestPath = path.join(
  runtimeRoot,
  "forge-material3-runtime-manifest.json",
);

const read = (target) =>
  fs.readFileSync(target, "utf8");

const runFlag = (search) => {
  const attributes = new Map();
  const events = [];

  const documentElement = {
    getAttribute(name) {
      return attributes.has(name)
        ? attributes.get(name)
        : null;
    },
    hasAttribute(name) {
      return attributes.has(name);
    },
    setAttribute(name, value) {
      attributes.set(name, String(value));
    },
  };

  class CustomEvent {
    constructor(type, options = {}) {
      this.type = type;
      this.detail = options.detail;
    }
  }

  const window = {
    CustomEvent,
    location: { search },
    dispatchEvent(event) {
      events.push(event);
      return true;
    },
  };

  vm.runInNewContext(
    read(flagPath),
    {
      document: { documentElement },
      Object,
      URLSearchParams,
      window,
    },
    {
      filename: flagPath,
    },
  );

  return {
    attributes,
    events,
    state: window.ForgeUiRuntimeFlag,
  };
};

test(
  "default mode stays legacy and does not mark the DOM",
  () => {
    const result = runFlag("?nav=inicio");

    assert.equal(result.state.enabled, false);
    assert.equal(result.state.mode, "legacy");
    assert.equal(
      result.attributes.has("data-forge-ui-runtime"),
      false,
    );
    assert.equal(
      result.attributes.has("data-forge-theme"),
      false,
    );
  },
);

test(
  "material3 query enables the scoped runtime foundation",
  () => {
    const result = runFlag(
      "?nav=inicio&forgeUi=material3",
    );

    assert.equal(result.state.enabled, true);
    assert.equal(result.state.mode, "material3");
    assert.equal(
      result.attributes.get("data-forge-ui-runtime"),
      "material3",
    );
    assert.equal(
      result.attributes.get("data-forge-theme"),
      "dark",
    );
    assert.equal(
      result.events[0]?.type,
      "forge:ui-runtime-flag",
    );
  },
);

test(
  "unknown values remain in legacy mode",
  () => {
    const result = runFlag(
      "?nav=inicio&forgeUi=experimental",
    );

    assert.equal(result.state.enabled, false);
    assert.equal(result.state.mode, "legacy");
    assert.equal(
      result.attributes.has("data-forge-ui-runtime"),
      false,
    );
  },
);

test(
  "approved tokens are fully scoped behind the flag",
  () => {
    const tokens = read(tokensPath);

    assert.match(
      tokens,
      /\[data-forge-ui-runtime="material3"\]/,
    );

    assert.equal(tokens.includes(":root"), false);
    assert.equal(tokens.includes("\nhtml {"), false);
  },
);

test(
  "primitive selectors are inert outside material3 mode",
  () => {
    const primitives = read(primitivesPath);
    const selectorLines = primitives
      .split("\n")
      .map((line) => line.trim())
      .filter(
        (line) =>
          line.endsWith("{")
          && !line.startsWith("@")
          && !line.startsWith("/*"),
      );

    assert.ok(selectorLines.length >= 10);

    for (const selector of selectorLines) {
      assert.match(
        selector,
        /^\[data-forge-ui-runtime="material3"\]/,
      );
    }
  },
);

test(
  "real Forge Alive entrypoint loads the foundation once",
  () => {
    const html = read(entry);

    const occurrences = (
      value,
    ) => html.split(value).length - 1;

    assert.equal(
      occurrences(
        "FORGE:UI_M01_MATERIAL3_RUNTIME_FOUNDATION:START",
      ),
      1,
    );

    assert.equal(
      occurrences("forge-material3-feature-flag.js"),
      1,
    );

    assert.equal(
      occurrences("forge-material3-runtime-tokens.css"),
      1,
    );

    assert.equal(
      occurrences("forge-material3-primitives.css"),
      1,
    );
  },
);

test(
  "manifest preserves functional and visual boundaries",
  () => {
    const manifest = JSON.parse(read(manifestPath));

    assert.equal(
      manifest.schema,
      "forge.ui.material3.runtime-foundation.v1",
    );

    assert.equal(manifest.defaultMode, "legacy");
    assert.equal(manifest.enabledMode, "material3");
    assert.equal(
      manifest.contracts.productiveHomeReplacement,
      false,
    );
    assert.equal(
      manifest.contracts.defaultVisualMutation,
      false,
    );
    assert.equal(
      manifest.contracts.featureFlagRequired,
      true,
    );
  },
);
