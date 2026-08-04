import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

const [page, controller, bridge] = await Promise.all([
  read("docs/static-preview/forge-alive/nueva-cotizacion/index.html"),
  read("docs/static-preview/quote-runtime/forge-quote-intake-state.js"),
  read("docs/static-preview/quote-runtime/forge-accepted-quote-bridge.js"),
]);

assert.match(page, /data-forge-intake-state="empty"/);
assert.match(page, /data-forge-intake-results hidden aria-hidden="true"/);
assert.match(page, /class="fq-send-pdf-105dr"[\s\S]*?hidden[\s\S]*?aria-hidden="true"/);
assert.match(page, />Seleccionar PDF<\/label>/);
assert.match(page, /También admite JSON extraído\./);
assert.match(page, /Carga tu cotización/);
assert.match(
  page,
  /Selecciona el PDF de Solución Online\. Se procesa localmente en tu navegador\./,
);
assert.match(page, /No se sube ni se publica\./);
assert.match(page, /forge-quote-intake-state\.js\?v=r16a_quote_intake_empty_state_20260713_1/);
assert.match(page, /forge-accepted-quote-bridge\.js\?v=r16a_quote_intake_empty_state_20260713_1/);

for (const state of ["EMPTY", "LOADING", "ERROR", "READY"]) {
  assert.match(controller, new RegExp(`${state}: "${state}"`));
}
assert.match(controller, /results\.hidden = !ready/);
assert.match(controller, /results\.setAttribute\("aria-hidden", ready \? "false" : "true"\)/);
assert.match(controller, /submit\.hidden = !ready/);
assert.match(controller, /restoreInitialResults\(\)/);
assert.match(controller, /document\.addEventListener\("change"[\s\S]*?true\)/);
assert.match(controller, /MutationObserver/);
assert.match(controller, /role", state === STATES\.ERROR \? "alert" : "status"/);
assert.match(controller, /label\.addEventListener\("keydown"/);
assert.match(controller, /input\.click\(\)/);

assert.match(bridge, /packet = validatePacket\(JSON\.parse\(raw\)\)/);
assert.match(
  bridge,
  /packet = validatePacket\(JSON\.parse\(raw\)\)[\s\S]*?applyPacketToExistingPage\?\.\(packet\)[\s\S]*?setIntakeState\("READY"/,
);
assert.match(bridge, /setIntakeState\("ERROR"/);
assert.match(bridge, /setIntakeState\("EMPTY"/);
assert.match(bridge, /label\.textContent = "Seleccionar PDF"/);

assert.match(page, /min-height:\s*44px/);
assert.match(page, /max-width:\s*100%/);
assert.match(page, /min-width:\s*0/);
assert.match(page, /white-space:\s*normal/);
assert.match(page, /word-break:\s*normal/);
assert.match(page, /\.fq-file-label-105dr:focus-visible/);
assert.match(page, /\[hidden\]\s*\{[\s\S]*?display:\s*none\s*!important/);

console.log("PASS R16A Forge Alive quote intake state contract", {
  states: ["EMPTY", "LOADING", "ERROR", "READY"],
  emptyResultsHidden: true,
  readyRequiresValidatedPacket: true,
  mobileCta: "Seleccionar PDF",
  minimumTouchTarget: 44,
  keyboardAccessible: true,
});
