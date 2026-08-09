import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = "_site/static-preview/forge-aura";
const required = [
  "index.html",
  "auth-v4.html",
  "aura-auth-v4.js",
  "aura-auth.css",
  "aura-router-v4.js",
  "aura-bootstrap-v4-r1.js",
  "app-v4-r1.js",
  "oauth-callback-v4.html",
  "oauth-callback-v4.js",
  "aura-tokens.css",
  "aura-shell.css",
  "pipeline/pipeline.css",
];

test("canonical Pages artifact publishes the complete Auth runtime graph", () => {
  for (const file of required) {
    assert.equal(existsSync(join(root, file)), true, `missing Pages asset ${file}`);
  }
});

test("published Auth entry does not import Pipeline presentation before authentication", () => {
  const index = readFileSync(join(root, "index.html"), "utf8");
  const auth = readFileSync(join(root, "auth-v4.html"), "utf8");
  const app = readFileSync(join(root, "app-v4-r1.js"), "utf8");
  const callback = readFileSync(join(root, "oauth-callback-v4.js"), "utf8");

  assert.doesNotMatch(index, /pipeline\/pipeline\.css/);
  assert.doesNotMatch(auth, /pipeline\/pipeline\.css/);
  assert.match(app, /route === "pipeline".*pipeline\/pipeline\.css/s);
  assert.doesNotMatch(callback, /route=pipeline|Abriendo Pipeline/);
});
