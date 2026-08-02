import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const touchGate = await readFile(
  "docs/static-preview/forge-alive-material3/public-auth-touch-gate.js",
  "utf8",
);
const transitionGuard = await readFile(
  "docs/static-preview/forge-alive-material3/rep-17-session-transition-guard.js",
  "utf8",
);

test("public login gate has direct pointer, touch and keyboard activation", () => {
  assert.match(touchGate, /FORGE_PUBLIC_AUTH_TOUCH_GATE_V1/);
  assert.match(touchGate, /document\.addEventListener\("pointerup", onPointerUp, true\)/);
  assert.match(touchGate, /document\.addEventListener\("touchend", onTouchEnd/);
  assert.match(touchGate, /document\.addEventListener\("click", onClick, true\)/);
  assert.match(touchGate, /event\.stopImmediatePropagation\(\)/);
  assert.match(touchGate, /data-forge-auth-google/);
  assert.match(touchGate, /data-forge-demo-login/);
  assert.match(touchGate, /signInWithGoogle/);
  assert.match(touchGate, /forge-demo-login/);
  assert.match(touchGate, /touch-action:\s*manipulation/);
});

test("required gate removes fake close controls instead of reopening invisibly", () => {
  assert.match(touchGate, /REQUIRED_GATE_STATES/);
  assert.match(touchGate, /data-forge-required-gate/);
  assert.match(touchGate, /\[data-forge-auth-close\]/);
  assert.match(touchGate, /display:\s*none !important/);
  assert.match(touchGate, /!requiredGateActive\(\)/);
});

test("avatar routing trusts its explicit rendered auth state", () => {
  assert.match(touchGate, /function openAvatarProfile\(control\)/);
  assert.match(
    touchGate,
    /control\?\.getAttribute\("data-forge-auth-state"\) === "authenticated"/,
  );
  assert.match(touchGate, /__forgeAuthenticatedSessionSource/);
  assert.match(touchGate, /original\.openAuthPanel\(\)/);
  assert.match(touchGate, /openAvatarProfile\(control\)/);
});

test("REP-17 loads touch gate before wrapping session transitions", () => {
  assert.match(
    transitionGuard,
    /^import "\.\/public-auth-touch-gate\.js\?v=public-auth-touch-gate-001";/,
  );
});
