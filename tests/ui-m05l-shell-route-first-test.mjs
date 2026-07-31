import assert from "node:assert/strict";
import fs from "node:fs";

const appPath = "docs/static-preview/forge-alive-material3/app.js";
const navigationPath =
  "docs/static-preview/forge-alive-material3/forge-navigation-contract.js";

const app = fs.readFileSync(appPath, "utf8");
const navigation = fs.readFileSync(navigationPath, "utf8");

const shellInitialize = app.indexOf("shell.initialize();");
const firstDeferredAuthorityWait = app.indexOf(
  'await loadAuthority(envBase, "env.js")',
);
const quoteAuthorityBoot = app.indexOf("void loadQuoteAuthorities();");
const authAuthorityBoot = app.indexOf("void loadAuthAuthorities();");

assert.ok(shellInitialize >= 0, "shell.initialize() is missing");
assert.ok(
  firstDeferredAuthorityWait >= 0,
  "The governed environment authority wait is missing",
);
assert.ok(quoteAuthorityBoot >= 0, "quote authority boot is missing");
assert.ok(authAuthorityBoot >= 0, "auth authority boot is missing");
assert.ok(
  shellInitialize < firstDeferredAuthorityWait,
  "The shell must initialize before any authority can wait on network work",
);
assert.ok(
  shellInitialize < quoteAuthorityBoot,
  "Quotes authorities must start after the shell resolves the initial route",
);
assert.ok(
  shellInitialize < authAuthorityBoot,
  "Auth authorities must start after the shell resolves the initial route",
);
assert.match(
  app,
  /document\.documentElement\.dataset\.forgeShellBoot = "route-first"/,
);
assert.match(
  navigation,
  /requested === "cotizaciones" \? "quotes" : requested/,
  "The public cotizaciones alias must resolve to the quotes route",
);
assert.match(
  navigation,
  /target: "\?nav=cotizaciones"/,
  "The Cotizaciones nav item must preserve the public URL",
);

console.log("PASS UI-M05L shell-first navigation and cotizaciones route");
