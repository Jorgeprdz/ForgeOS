import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const moduleSource = await readFile(
  new URL("../docs/static-preview/forge-alive-material3/person-intelligence-module.js", import.meta.url),
  "utf8",
);
const cssSource = await readFile(
  new URL("../docs/static-preview/forge-alive-material3/person-intelligence-module.css", import.meta.url),
  "utf8",
);
const bridgeSource = await readFile(
  new URL("../docs/static-preview/forge-alive-material3/person-workspace-entry-bridge.js", import.meta.url),
  "utf8",
);

test("mounts CRS 10 inside the existing CRS 09 workspace instead of creating another route", () => {
  assert.match(moduleSource, /data-person-workspace-ready/);
  assert.match(moduleSource, /workspace\.insertBefore/);
  assert.match(moduleSource, /data-person-intelligence-host/);
  assert.match(moduleSource, /Inteligencia relacional existente/);
  assert.doesNotMatch(moduleSource, /registerRouteModule/);
  assert.doesNotMatch(moduleSource, /history\.pushState/);
});

test("renders all six accepted Cartera domains with explicit person or advisor scope", () => {
  for (const token of [
    "FUTURE_RADAR",
    "RELATIONSHIP_GROWTH",
    "RELATIONAL_ACTIVATION",
    "ECONOMIC_CONNECTION",
    "RELATIONSHIP_CAPITAL",
    "PRODUCTIVITY_PROOF",
  ]) assert.match(moduleSource, new RegExp(token));
  assert.match(moduleSource, /domain\.scope === "ADVISOR" \? "Asesor" : "Persona"/);
  assert.match(moduleSource, /Productividad se muestra como contexto del asesor/);
});

test("keeps the UI read-only and routes review back to Cartera", () => {
  assert.match(moduleSource, /data-person-workspace-deep-link/);
  assert.match(moduleSource, /Abrir en Cartera/);
  assert.match(moduleSource, /Sin score oculto ni acción automática/);
  assert.doesNotMatch(moduleSource, /<form/i);
  assert.doesNotMatch(moduleSource, /<input/i);
  assert.doesNotMatch(moduleSource, /<textarea/i);
  assert.doesNotMatch(moduleSource, /\.insert\s*\(/);
  assert.doesNotMatch(moduleSource, /\.update\s*\(/);
  assert.doesNotMatch(moduleSource, /\.delete\s*\(/);
  assert.doesNotMatch(moduleSource, /\.upsert\s*\(/);
  assert.doesNotMatch(moduleSource, /\.rpc\s*\(/);
});

test("rejects late results and scrubs intelligence on logout or route exit", () => {
  assert.match(moduleSource, /generation !== state\.generation/);
  assert.match(moduleSource, /lateResultRejectCount/);
  assert.match(moduleSource, /forge:auth-state-changed/);
  assert.match(moduleSource, /scrubPersonIntelligence/);
  assert.match(bridgeSource, /forge:person-workspace-mounted/);
  assert.match(bridgeSource, /route-unmounted/);
  assert.match(bridgeSource, /signed-out/);
});

test("responsive layout collapses safely and preserves accessible touch targets", () => {
  assert.match(cssSource, /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(cssSource, /@media \(max-width: 860px\)/);
  assert.match(cssSource, /grid-template-columns: 1fr/);
  assert.match(cssSource, /min-height: 44px/);
  assert.match(cssSource, /focus-visible/);
  assert.match(cssSource, /prefers-reduced-motion/);
});
