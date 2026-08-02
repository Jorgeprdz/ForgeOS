import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");
const guard = read(
  "docs/static-preview/forge-alive-material3/authenticated-route-guard.js",
);
const compensationBootstrap = read(
  "docs/static-preview/forge-alive-material3/compensation-route-bootstrap-100b.js",
);
const retirement = read(
  "docs/static-preview/forge-alive-material3/legacy-ui-retirement.js",
);
const broker = read("supabase/functions/forge-demo-login/index.ts");

test("canonical authenticated guard owns the Commissions private deep link", () => {
  assert.match(guard, /const PRIVATE_ROUTES = new Set\(\[[\s\S]*"comisiones"/);
  assert.match(guard, /sessionStorage\.setItem\("forge\.auth\.requested-route\.v1", state\.requestedRoute\)/);
  assert.match(guard, /sessionStorage\.setItem\("forge\.auth\.requested-route\.v1", requested\)/);
  assert.match(guard, /restoreAuthenticatedRoute\(\)/);
  assert.match(guard, /globalThis\.dispatchEvent\(new PopStateEvent\("popstate"\)\)/);
});

test("anonymous Commissions remains fail-closed while preserving the requested route", () => {
  assert.match(guard, /url\.searchParams\.set\("nav", "inicio"\)/);
  assert.match(guard, /setPrivateSurfaceAvailable\(false\)/);
  assert.match(guard, /openRequiredLoginGate\(\)/);
  assert.match(guard, /html:not\(\[data-forge-auth-boundary="authenticated"\]\)/);
});

test("required login bypasses the authenticated menu wrapper after logout", () => {
  assert.match(guard, /function requiredLoginAuthEntry\(\)/);
  assert.match(guard, /entry\.__forgeAuthenticatedSessionSource \|\| entry/);
  assert.match(guard, /const authEntry = requiredLoginAuthEntry\(\)/);
  assert.match(guard, /authEntry\.openAuthPanel\(\{ nav: state\.requestedRoute \|\| currentRoute\(\) \}\)/);
});

test("private-runtime scrub unmounts Commissions instead of leaving a blocked route mounted", () => {
  assert.match(
    compensationBootstrap,
    /const unmountPrivateCompensation = \(\) => module\.unmount\(\)/,
  );
  assert.match(
    compensationBootstrap,
    /addEventListener\("forge:private-runtime-scrub", unmountPrivateCompensation\)/,
  );
  assert.match(
    compensationBootstrap,
    /addEventListener\("forge:session-required", unmountPrivateCompensation\)/,
  );
  assert.match(
    compensationBootstrap,
    /addEventListener\("forge:logout", unmountPrivateCompensation\)/,
  );
  assert.doesNotMatch(compensationBootstrap, /module\.scrub\("logout"\)/);
});

test("no parallel route-restoration runtime is mounted", () => {
  assert.ok(retirement.startsWith(
    'import "./compensation-route-bootstrap-100b.js?v=advisor-compensation-100";\n',
  ));
  assert.doesNotMatch(retirement, /demo-auth-route-restoration/);
});

test("broker source recognizes Commissions without triggering a remote deployment", () => {
  assert.match(broker, /FUNCTION_VERSION = "FORGE-DEMO-LOGIN-002"/);
  assert.match(broker, /"comisiones"/);
  assert.match(broker, /redirect\.searchParams\.set\("nav", nav\)/);
  assert.doesNotMatch(broker, /supabase\s+functions\s+deploy/);
});
