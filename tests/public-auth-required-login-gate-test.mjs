import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const guard = await readFile(
  "docs/static-preview/forge-alive-material3/authenticated-route-guard.js",
  "utf8",
);

test("public auth remains fail-closed while exposing the required login gate", () => {
  assert.match(guard, /FORGE_AUTHENTICATED_ROUTE_GUARD_V4/);
  assert.match(guard, /FORGE_AUTH_REQUIRED_LOGIN_GATE_V1/);
  assert.match(guard, /function openRequiredLoginGate/);
  assert.match(guard, /ForgeAliveAuthEntry067G17B1/);
  assert.match(guard, /openAuthPanel/);
  assert.match(guard, /forgeAuthLoginGate = "visible"/);
  assert.match(guard, /forge:auth-panel-closed/);
  assert.match(guard, /forgeAuthLoginGate = "reopening"/);
  assert.match(guard, /function releaseRequiredLoginGate/);
  assert.match(guard, /closeAuthPanel/);
  assert.match(guard, /releaseRequiredLoginGate\(\);/);
  assert.match(guard, /setPrivateSurfaceAvailable\(true\);/);
  assert.match(guard, /setPrivateSurfaceAvailable\(false\);/);
  assert.match(guard, /openRequiredLoginGate\(\);/);
});
