import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const controls = await readFile(
  "docs/static-preview/forge-alive-material3/authenticated-session-controls.js",
  "utf8",
);
const transitionGuard = await readFile(
  "docs/static-preview/forge-alive-material3/rep-17-session-transition-guard.js",
  "utf8",
);

test("authenticated avatar owns a compact account and sign-out menu", () => {
  assert.match(controls, /FORGE_AUTHENTICATED_SESSION_CONTROLS_V1/);
  assert.match(controls, /data-forge-session-menu/);
  assert.match(controls, /data-forge-auth-signout/);
  assert.match(controls, /Cerrar sesión/);
  assert.match(controls, /openAuthPanel\(options = \{\}\)/);
  assert.match(controls, /toggleForAvatar\(visibleAvatar\(\)\)/);
  assert.match(controls, /touch-action:\s*manipulation/);
});

test("idle policy is exactly ten minutes with a one-minute warning", () => {
  assert.match(controls, /const IDLE_TIMEOUT_MS = 10 \* 60 \* 1000/);
  assert.match(controls, /const WARNING_LEAD_MS = 60 \* 1000/);
  assert.match(controls, /forge\.auth\.last_activity\.v1/);
  assert.match(controls, /INACTIVITY_TIMEOUT/);
  assert.match(controls, /Tu sesión se cerrará en menos de un minuto/);
  assert.match(controls, /Seguir conectado/);
  assert.match(controls, /visibilitychange/);
  assert.match(controls, /BroadcastChannel/);
});

test("real interaction refreshes the idle deadline without using mouse movement", () => {
  for (const eventName of ["pointerdown", "touchstart", "keydown", "scroll", "wheel"]) {
    assert.match(controls, new RegExp(`"${eventName}"`));
  }
  assert.doesNotMatch(controls, /"mousemove"/);
  assert.match(controls, /recordActivity\(\{ force: false, broadcast: true \}\)/);
});

test("REP-17 loads session controls after the public touch authority", () => {
  assert.match(
    transitionGuard,
    /^import "\.\/public-auth-touch-gate\.js\?v=public-auth-touch-gate-001";\nimport "\.\/authenticated-session-controls\.js\?v=auth-session-controls-001";/,
  );
});
