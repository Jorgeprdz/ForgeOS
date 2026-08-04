import assert from "node:assert/strict";
import fs from "node:fs";

const app = fs.readFileSync(
  "docs/static-preview/forge-alive-material3/app.js",
  "utf8",
);
const publicConfig = fs.readFileSync(
  "docs/static-preview/forge-alive-material3/forge-alive-public-config-067g17a1.js",
  "utf8",
);

const shellInitialize = app.indexOf("shell.initialize();");
const printableBoot = app.indexOf("void startPrintableAuthority();");
const environmentBoot = app.indexOf(
  "const environmentAuthority = loadEnvironmentAuthority();",
);
const environmentImport = app.indexOf('await loadAuthority(envBase, "env.js")');
const authFunction = app.indexOf("async function loadAuthAuthorities()");
const authEnvironmentGate = app.indexOf(
  "const environmentLoaded = await environmentAuthority;",
  authFunction,
);
const publicConfigImport = app.indexOf(
  '"forge-alive-public-config-067g17a1.js"',
  authFunction,
);

assert.ok(shellInitialize >= 0, "shell initialization is missing");
assert.ok(printableBoot > shellInitialize, "print actions must start after shell initialization");
assert.ok(environmentBoot > printableBoot, "the shared environment gate must start after eager print actions");
assert.ok(environmentImport > environmentBoot, "the environment import must belong to the shared gate");
assert.ok(authFunction >= 0, "auth boot function is missing");
assert.ok(authEnvironmentGate > authFunction, "auth must await the shared environment gate");
assert.ok(
  publicConfigImport > authEnvironmentGate,
  "public config must never evaluate before env.js has completed",
);

assert.match(app, /if \(!globalThis\.__ENV__ \|\| typeof globalThis\.__ENV__ !== "object"\)/);
assert.match(app, /async function loadQuoteAuthorities\(\)[\s\S]*await environmentAuthority/);
assert.match(app, /void loadQuoteAuthorities\(\);/);
assert.match(app, /void loadAuthAuthorities\(\);/);
assert.equal(
  (app.match(/loadAuthority\(envBase, "env\.js"\)/g) || []).length,
  1,
  "env.js must have exactly one authority load",
);

assert.match(publicConfig, /const result = resolveConfig\(global\.__ENV__\)/);
assert.match(publicConfig, /state: 'BLOCKED'/);
assert.match(publicConfig, /reason: !supabaseUrl && !supabaseKey \? 'PUBLIC_CONFIG_MISSING'/);
assert.doesNotMatch(app, /forge-alive-runtime|\.\.\/forge-alive\//);

console.log("PASS UI-M05N public config boot order", {
  eagerPrintActions: true,
  sharedEnvironmentAuthority: true,
  publicConfigAfterEnvironment: true,
  authRaceRemoved: true,
  canonicalAuthorityOnly: true,
  routeFirstBootContractPreserved: true,
});
