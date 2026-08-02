import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("entry bridge opens the person workspace from Pipeline and canonical Cartera people", async () => {
  const source = await read("docs/static-preview/forge-alive-material3/person-workspace-entry-bridge.js");
  assert.match(source, /\[data-productive-prospect-card\]/);
  assert.match(source, /data-directory-kind=\\?"COMMERCIAL_PERSON/);
  assert.match(source, /sourceType: "PROSPECT"/);
  assert.match(source, /forge:open-person-workspace/);
  assert.match(source, /personReference/);
});

test("entry bridge reuses explicit person context for Activity, Quotes and Cartera", async () => {
  const source = await read("docs/static-preview/forge-alive-material3/person-workspace-entry-bridge.js");
  for (const route of ["quotes", "actividad", "cartera"]) {
    assert.match(source, new RegExp(`\\[\\"${route}\\"`));
  }
  assert.match(source, /searchParams\.get\("person"\)/);
  assert.match(source, /route === "persona"/);
});

test("entry bridge only navigates; it does not create duplicate business mutations", async () => {
  const source = await read("docs/static-preview/forge-alive-material3/person-workspace-entry-bridge.js");
  assert.doesNotMatch(source, /\.(insert|update|delete|upsert|rpc)\s*\(/);
  assert.doesNotMatch(source, /fetch\s*\(/);
  assert.doesNotMatch(source, /localStorage|sessionStorage|indexedDB/);
  assert.match(source, /CustomEvent\("forge:open-person-workspace"/);
});

test("entry controls preserve touch targets and focus visibility", async () => {
  const css = await read("docs/static-preview/forge-alive-material3/person-workspace-entry-bridge.css");
  assert.match(css, /min-height: 44px/);
  assert.match(css, /focus-visible/);
  assert.match(css, /outline: 2px solid/);
});

test("application registers the contextual route and bridge without adding a nav item", async () => {
  const [app, navigation] = await Promise.all([
    read("docs/static-preview/forge-alive-material3/app.js"),
    read("docs/static-preview/forge-alive-material3/forge-navigation-contract.js"),
  ]);
  assert.match(app, /person-workspace-entry-bridge\.js/);
  assert.match(app, /createPersonWorkspaceModule/);
  assert.match(app, /registerRouteModule\("persona", personWorkspace\)/);
  assert.match(navigation, /CONTEXTUAL_ROUTES/);
  assert.match(navigation, /new Set\(\["persona"\]\)/);
  const navigationItemsBlock = navigation.slice(
    navigation.indexOf("FORGE_NAVIGATION_ITEMS"),
    navigation.indexOf("const CONTEXTUAL_ROUTES"),
  );
  assert.doesNotMatch(navigationItemsBlock, /routeId: "persona"/);
});

test("fail-closed auth preserves and scrubs the contextual person route", async () => {
  const guard = await read("docs/static-preview/forge-alive-material3/authenticated-route-guard.js");
  const privateRoutes = guard.slice(
    guard.indexOf("const PRIVATE_ROUTES"),
    guard.indexOf("const PRIVATE_SURFACE_SELECTORS"),
  );
  assert.match(privateRoutes, /"persona"/);
  assert.match(guard, /\[data-forge-person-workspace-module\]/);
  assert.match(guard, /FORGE_AUTH_FAIL_CLOSED_V1/);
  assert.match(guard, /restoreAuthenticatedRoute/);
  assert.match(guard, /scrubPrivateSurfaces/);
});
