import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const guard = readFileSync(
  "docs/static-preview/forge-alive-material3/rep-17-session-transition-guard.js",
  "utf8",
);
const entry = readFileSync(
  "docs/static-preview/forge-alive/index.html",
  "utf8",
);
const authEntry = readFileSync(
  "docs/static-preview/forge-alive/forge-alive-auth-entry-067g17b1.js",
  "utf8",
);
const touchGate = readFileSync(
  "docs/static-preview/forge-alive-material3/public-auth-touch-gate.js",
  "utf8",
);

test("second Google login cannot inherit the internal material3 pathname", () => {
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

test("canonical entry bridge preserves OAuth parameters, route and hash", () => {
  const script = entry.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script, "CANONICAL_ENTRY_SCRIPT_MISSING");

  let replaced = "";
  const location = {
    href: "https://jorgeprdz.github.io/ForgeOS/static-preview/forge-alive/?nav=cartera&code=oauth-code&state=oauth-state&auth_return=1700000000000#access_token=token",
    replace(value) {
      replaced = value;
    },
  };

  vm.runInNewContext(script, {
    URL,
    window: { location },
  });

  const target = new URL(replaced);
  assert.equal(
    target.pathname,
    "/ForgeOS/static-preview/forge-alive-material3/",
  );
  assert.equal(target.searchParams.get("nav"), "cartera");
  assert.equal(target.searchParams.get("code"), "oauth-code");
  assert.equal(target.searchParams.get("state"), "oauth-state");
  assert.equal(target.searchParams.get("auth_return"), "1700000000000");
  assert.equal(target.searchParams.get("v"), "auth-1700000000000");
  assert.equal(target.hash, "#access_token=token");
});

test("canonical entry no longer presents itself as a retired interface", () => {
  assert.match(entry, /<title>ForgeOS<\/title>/);
  assert.match(entry, /Abriendo ForgeOS/);
  assert.doesNotMatch(entry, /interfaz retirada/i);
  assert.doesNotMatch(entry, /Forge Alive Vista Estática/i);
});

test("retired pre-redesign authority cannot republish over the current Beta 1 shell", () => {
  assert.equal(
    existsSync(
      ".github/workflows/restore-productive-forge-alive-authority.yml",
    ),
    false,
  );
  assert.equal(
    existsSync("scripts/prepare-productive-canonical-pages.mjs"),
    false,
  );
  assert.equal(
    existsSync("tests/restore-productive-canonical-authority-test.mjs"),
    false,
  );
});

test("every login path returns through the canonical public entry", () => {
  assert.match(authEntry, /new URL\('\/ForgeOS\/static-preview\/forge-alive\/'/);
  assert.match(touchGate, /new URL\("\/ForgeOS\/static-preview\/forge-alive\/"/);
  assert.doesNotMatch(authEntry, /new URL\(url\.pathname/);
  assert.doesNotMatch(touchGate, /new URL\(current\.pathname/);
});
