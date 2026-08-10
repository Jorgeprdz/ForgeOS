import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const guard = readFileSync(
  "docs/static-preview/forge-alive-material3/rep-17-session-transition-guard.js",
  "utf8",
);
const entry = readFileSync("index.html", "utf8");
const authEntry = readFileSync(
  "docs/static-preview/forge-alive-material3/forge-alive-auth-entry-067g17b1.js",
  "utf8",
);
const touchGate = readFileSync(
  "docs/static-preview/forge-alive-material3/public-auth-touch-gate.js",
  "utf8",
);

test("shared Forge Alive auth runtime cannot inherit a retired pathname", () => {
  assert.match(
    guard,
    /const CANONICAL_ENTRY_PATH = "\/ForgeOS\/static-preview\/forge-alive\/"/,
  );
  assert.match(
    guard,
    /signInWithGoogle\(options = \{\}\)[\s\S]*redirectTo: canonicalAuthRedirect\(options\)/,
  );
  assert.match(
    guard,
    /target\.searchParams\.set\("auth_return", String\(now\)\)/,
  );
  assert.doesNotMatch(
    guard,
    /new URL\(current\.pathname[^\n]*current\.origin\)/,
  );
});

test("canonical Aura root preserves OAuth parameters, route and hash", async () => {
  const script = entry.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script, "CANONICAL_ENTRY_SCRIPT_MISSING");

  let replaced = "";
  const location = {
    href: "https://jorgeprdz.github.io/ForgeOS/?nav=cartera&code=oauth-code&state=oauth-state&auth_return=1700000000000#access_token=token",
    replace(value) {
      replaced = value;
    },
  };

  vm.runInNewContext(script, {
    URL,
    URLSearchParams,
    Promise,
    navigator: {
      serviceWorker: {
        async getRegistrations() {
          return [];
        },
      },
    },
    caches: {
      async keys() {
        return [];
      },
      async delete() {
        return true;
      },
    },
    window: { location, caches: true },
  });

  await new Promise((resolve) => setImmediate(resolve));

  const target = new URL(replaced);
  assert.equal(target.pathname, "/ForgeOS/static-preview/forge-aura/");
  assert.equal(target.searchParams.get("nav"), "cartera");
  assert.equal(target.searchParams.get("code"), "oauth-code");
  assert.equal(target.searchParams.get("state"), "oauth-state");
  assert.equal(target.searchParams.get("auth_return"), "1700000000000");
  assert.equal(target.searchParams.get("v"), "auth-1700000000000");
  assert.equal(target.hash, "#access_token=token");
});

test("root entry exposes only current ForgeOS Aura presentation", () => {
  assert.match(entry, /<title>ForgeOS<\/title>/);
  assert.match(entry, /Abriendo ForgeOS/);
  assert.match(entry, /static-preview\/forge-aura/);
  assert.doesNotMatch(entry, /static-preview\/forge-alive\/\?nav=inicio/);
  assert.doesNotMatch(entry, /forge-alive-material3/);
  assert.doesNotMatch(entry, /Forge Alive Vista Estática/i);
  assert.doesNotMatch(entry, /phone-shell|Muestra segura · solo lectura/);
});

test("retired pre-redesign authorities cannot republish over production", () => {
  for (const path of [
    ".github/workflows/restore-productive-forge-alive-authority.yml",
    ".github/workflows/deploy-quotes-preview-pages.yml",
    "scripts/prepare-productive-canonical-pages.mjs",
    "tests/restore-productive-canonical-authority-test.mjs",
    "docs/static-preview/forge-alive/index.html",
  ]) {
    assert.equal(existsSync(path), false, `${path} must stay deleted`);
  }
});

test("shared Forge Alive authentication authorities remain available for shared runtime compatibility", () => {
  for (const path of [
    "docs/static-preview/forge-alive-material3/forge-alive-public-config-067g17a1.js",
    "docs/static-preview/forge-alive-material3/forge-alive-auth-entry-067g17b1.js",
    "docs/static-preview/forge-alive-material3/forge-alive-auth-entry-067g17b1.css",
  ]) {
    assert.equal(existsSync(path), true, `${path} is required`);
  }
});

test("legacy Forge Alive auth paths remain self-contained inside the shared runtime", () => {
  assert.match(authEntry, /new URL\('\/ForgeOS\/static-preview\/forge-alive\/'/);
  assert.match(touchGate, /new URL\("\/ForgeOS\/static-preview\/forge-alive\/"/);
  assert.doesNotMatch(authEntry, /new URL\(url\.pathname/);
  assert.doesNotMatch(touchGate, /new URL\(current\.pathname/);
  assert.doesNotMatch(authEntry, /forge-alive-runtime/);
});