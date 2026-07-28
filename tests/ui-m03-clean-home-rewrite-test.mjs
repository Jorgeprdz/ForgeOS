import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8");
const index = read(
  "docs/static-preview/forge-alive-material3/index.html",
);
const css = read(
  "docs/static-preview/forge-alive-material3/app.css",
);
const source = read(
  "docs/static-preview/forge-alive-material3/app.js",
);
const manifest = JSON.parse(
  read("docs/static-preview/forge-alive-material3/manifest.json"),
);

test("entrypoint loads only its clean approved assets", () => {
  assert.match(index, /tokens\.css\?v=ui-m03-approved-001/);
  assert.match(index, /app\.css\?v=ui-m03-approved-001/);
  assert.match(index, /app\.js\?v=ui-m03-approved-001/);
  assert.match(index, /manifest\.json/);
  assert.doesNotMatch(
    index,
    /phone-shell|forge-m3-app-shell|forge-desktop-workspace-056y|ui-material3-runtime|forge-alive-public-config/i,
  );
});

test("approved Home has one visual tree and one header", () => {
  assert.equal((index.match(/<main class="app"/g) || []).length, 1);
  assert.equal((index.match(/<header class="hero"/g) || []).length, 1);
  assert.equal((index.match(/class="bottom-shell"/g) || []).length, 1);
  assert.equal((index.match(/class="nav-pill"/g) || []).length, 1);
  assert.equal(
    (index.match(/data-alfred-scope="global"/g) || []).length,
    1,
  );
  assert.equal(
    (index.match(/data-alfred-scope="contextual"/g) || []).length,
    1,
  );
  assert.equal((index.match(/class="alfred-sheet"/g) || []).length, 1);
});

test("approved copy and accessible dialog are preserved", () => {
  for (const copy of [
    "Buenos días, Jorge",
    "Mi día · inteligencia comercial activa",
    "Plan de hoy",
    "Seguimiento prioritario",
    "Juan Martínez",
    "Abrir conversación",
    "¿Qué necesitas resolver?",
    "tú conservas la aprobación final",
  ]) {
    assert.match(index.toLowerCase(), new RegExp(copy.toLowerCase()));
  }
  assert.match(index, /role="dialog"/);
  assert.match(index, /aria-modal="true"/);
  assert.match(index, /aria-current="page"/);
});

test("responsive contracts cover mobile, both tablets, and desktop", () => {
  for (const rule of [
    /max-width:\s*390px/,
    /min-width:\s*760px[^}]+max-width:\s*899px/s,
    /min-width:\s*900px[^}]+max-width:\s*1199px/s,
    /min-width:\s*1200px/,
    /min-width:\s*1540px/,
    /safe-area-inset-top/,
    /safe-area-inset-bottom/,
    /prefers-reduced-motion:\s*reduce/,
    /--forge-keyboard-inset/,
  ]) {
    assert.match(css, rule);
  }
  assert.match(source, /window\.visualViewport/);
  assert.match(source, /keyboardInset/);
});

test("Alfred owns idle, thinking, action, close, and suggestions", () => {
  assert.match(source, /setAlfredState\("idle", "thinking"\)/);
  assert.match(source, /open \? "action" : "idle"/);
  assert.match(source, /open \? "action" : "thinking"/);
  assert.match(source, /event\.key === "Escape"/);
  assert.match(source, /input\.value = button\.textContent/);
  assert.match(source, /sheet-open/);
});

test("visual runtime has no data, backend, persistence, or reconciliation", () => {
  const combined = `${index}\n${source}`;
  for (const forbidden of [
    /\bfetch\s*\(/,
    /\bMutationObserver\b/,
    /\bsupabase\b/i,
    /\blocalStorage\b/,
    /\bsessionStorage\b/,
    /\bindexedDB\b/i,
  ]) {
    assert.equal(forbidden.test(combined), false);
  }
});

test("manifest records the approved isolated contract", () => {
  assert.equal(
    manifest.schema,
    "forge.ui.material3.approved-home.v1",
  );
  assert.equal(manifest.legacy.assetsLoadedByCleanEntrypoint, false);
  assert.equal(manifest.contracts.cleanDom, true);
  assert.equal(manifest.contracts.singleHeader, true);
  assert.equal(manifest.contracts.singleGlobalAlfred, true);
  assert.equal(manifest.contracts.singleContextualAlfred, true);
  assert.equal(manifest.contracts.backendConnected, false);
});
