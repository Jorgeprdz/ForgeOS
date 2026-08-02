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

test("resolving and anonymous sessions keep viewport and navigation fail-closed", () => {
  assert.match(guard, /FORGE_AUTHENTICATED_ROUTE_GUARD_V3/);
  assert.match(guard, /FORGE_AUTH_FAIL_CLOSED_V1/);
  assert.match(guard, /\[data-forge-module-viewport\]/);
  assert.match(guard, /\[data-forge-shell-controls\]/);
  assert.match(
    guard,
    /html:not\(\[data-forge-auth-boundary="authenticated"\]\)/,
  );
  assert.match(guard, /display:\s*none\s*!important/);
  assert.match(guard, /visibility:\s*hidden\s*!important/);
  assert.match(guard, /pointer-events:\s*none\s*!important/);
  assert.match(guard, /forgeAuthFailClosed\s*=\s*"armed"/);
  assert.match(guard, /setBooleanPropertyOnce\(root,\s*"hidden",\s*unavailable\)/);
  assert.match(guard, /setBooleanPropertyOnce\(root,\s*"inert",\s*unavailable\)/);
  assert.match(guard, /attributes:\s*true/);
  assert.match(
    guard,
    /attributeFilter:\s*\["hidden",\s*"inert",\s*"aria-hidden"\]/,
  );
});

test("anonymous sessions cannot navigate or retain private route surfaces", () => {
  assert.match(guard, /status:\s*"resolving"/);
  assert.match(guard, /canonicalizeAnonymousLocation/);
  assert.match(guard, /searchParams\.set\("nav",\s*"inicio"\)/);
  assert.match(guard, /scrubPrivateSurfaces/);
  assert.match(guard, /forge:auth-state-changed/);
  assert.match(guard, /stopImmediatePropagation/);
});

test("deep links restore only after authentication", () => {
  assert.match(guard, /forge\.auth\.requested-route\.v1/);
  assert.match(guard, /status === "authenticated"/);
  assert.match(guard, /restoreAuthenticatedRoute/);
  assert.match(guard, /dispatchEvent\(new PopStateEvent\("popstate"\)\)/);
});

test("browser acceptance harness cannot activate on Pages or arbitrary local ports", () => {
  assert.match(guard, /\["127\.0\.0\.1",\s*"localhost",\s*"\[::1\]"\]/);
  assert.match(guard, /location\.port === "4173"/);
  assert.doesNotMatch(guard, /github\.io/);
  assert.match(guard, /forgeAuthAcceptanceHarness = "loopback-only"/);
  assert.match(
    guard,
    /state\.acceptanceHarness && \["anonymous", "auth_error"\]\.includes\(status\)/,
  );
});
