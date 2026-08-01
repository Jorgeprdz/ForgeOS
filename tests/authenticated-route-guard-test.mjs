import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const appPath = "docs/static-preview/forge-alive-material3/app.js";
const guardPath = "docs/static-preview/forge-alive-material3/authenticated-route-guard.js";

const [app, guard] = await Promise.all([
  readFile(appPath, "utf8"),
  readFile(guardPath, "utf8"),
]);

test("guard loads before productive shell and demo adapter", () => {
  const guardImport = app.indexOf("authenticated-route-guard.js");
  const demoImport = app.indexOf("login-integrated-demo.js");
  const shellImport = app.indexOf("forge-shell.js");
  assert.ok(guardImport >= 0);
  assert.ok(guardImport < demoImport);
  assert.ok(guardImport < shellImport);
});

test("anonymous sessions cannot expose private route surfaces", () => {
  assert.match(guard, /status:\s*"resolving"/);
  assert.match(guard, /root\.hidden\s*=\s*!available/);
  assert.match(guard, /root\.inert\s*=\s*!available/);
  assert.match(guard, /canonicalizeAnonymousLocation/);
  assert.match(guard, /searchParams\.set\("nav",\s*"inicio"\)/);
  assert.match(guard, /scrubPrivateSurfaces/);
  assert.match(guard, /forge:auth-state-changed/);
});

test("deep links restore only after authentication", () => {
  assert.match(guard, /forge\.auth\.requested-route\.v1/);
  assert.match(guard, /status === "authenticated"/);
  assert.match(guard, /restoreAuthenticatedRoute/);
  assert.match(guard, /dispatchEvent\(new PopStateEvent\("popstate"\)\)/);
});
