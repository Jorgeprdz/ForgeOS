import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("canonical boot graph mounts Alfred command runtime", async () => {
  const legacy = await read(
    "docs/static-preview/forge-alive-material3/legacy-ui-retirement.js",
  );
  assert.match(
    legacy,
    /import "\.\/alfred-command-runtime\.js\?v=alfred-command-runtime-001"/,
  );
});

test("send, Enter, suggestions and follow-ups invoke protected function", async () => {
  const runtime = await read(
    "docs/static-preview/forge-alive-material3/alfred-command-runtime.js",
  );
  assert.match(runtime, /const FUNCTION_NAME = "alfred-command"/);
  assert.match(runtime, /client\.functions\.invoke\(FUNCTION_NAME/);
  assert.match(runtime, /submit\.addEventListener\("click"/);
  assert.match(runtime, /event\.key !== "Enter"/);
  assert.match(runtime, /data-alfred-command-suggestion/);
  assert.match(runtime, /data-alfred-followup-command/);
  assert.match(runtime, /ForgeProductiveProspectBootstrap067G17B/);
});

test("runtime reads only the active visible route and keeps memory ephemeral", async () => {
  const runtime = await read(
    "docs/static-preview/forge-alive-material3/alfred-command-runtime.js",
  );
  assert.match(runtime, /activeRouteRoot/);
  assert.match(runtime, /\[data-route-module\]:not\(\[hidden\]\)/);
  assert.match(runtime, /state\.history = \[\]/);
  assert.match(runtime, /forge:auth-state-changed/);
  assert.doesNotMatch(runtime, /localStorage|sessionStorage|indexedDB/);
});

test("response UI exposes loading, degraded, error and review boundary", async () => {
  const [runtime, css] = await Promise.all([
    read("docs/static-preview/forge-alive-material3/alfred-command-runtime.js"),
    read("docs/static-preview/forge-alive-material3/alfred-command-runtime.css"),
  ]);
  assert.match(runtime, /Solo lectura · requiere tu aprobación/);
  assert.match(css, /\.alfred-command-response\[hidden\]/);
  assert.match(css, /\.alfred-command-response\s*\{[\s\S]*display:\s*grid/);
  assert.match(css, /data-state="error"/);
  assert.match(css, /data-state="degraded"/);
  assert.match(css, /alfred-command-response__loading/);
});
