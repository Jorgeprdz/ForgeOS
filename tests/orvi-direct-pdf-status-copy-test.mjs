import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

globalThis.document = {
  getElementById() {
    return null;
  },
  createElement() {
    return {};
  },
  head: {
    appendChild() {},
  },
  querySelectorAll() {
    return [];
  },
  body: {
    setAttribute() {},
  },
};

const {
  isDirectPdfSyntheticPacketChange,
} = await import(
  "../docs/static-preview/quote-preview-live/forge-accepted-quote-bridge.js"
);

const pdfStatus = {
  dataset: { tone: "success" },
  textContent: "PDF convertido a cotización aceptada. Abriendo modal…",
};
const input = {
  closest() {
    return {
      querySelector() {
        return pdfStatus;
      },
    };
  },
};
const syntheticPacket = { name: "documento.accepted-quote.json" };

assert.equal(
  isDirectPdfSyntheticPacketChange(
    input,
    syntheticPacket,
    { isTrusted: false },
  ),
  true,
);
assert.equal(
  isDirectPdfSyntheticPacketChange(
    input,
    syntheticPacket,
    { isTrusted: true },
  ),
  false,
  "a real user-selected JSON keeps the JSON-specific status copy",
);
assert.equal(
  isDirectPdfSyntheticPacketChange(
    input,
    { name: "cotizacion.json" },
    { isTrusted: false },
  ),
  false,
);

const bridge = await readFile(
  new URL(
    "../docs/static-preview/quote-preview-live/forge-accepted-quote-bridge.js",
    import.meta.url,
  ),
  "utf8",
);
const page = await readFile(
  new URL(
    "../docs/static-preview/forge-alive/nueva-cotizacion/index.html",
    import.meta.url,
  ),
  "utf8",
);

assert.match(
  bridge,
  /PDF procesado localmente\. Listo para revisar\./,
);
assert.match(
  bridge,
  /`\$\{file\.name\} cargado\. Listo para revisar\.`/,
  "manual JSON retains its own filename-based message",
);
assert.match(
  page,
  /El PDF se procesa localmente en tu navegador\. No se sube ni se publica\./,
);
assert.doesNotMatch(
  page,
  /No se sube, no se lee y no se procesa el PDF/,
);

console.log("PASS R15M2C ORVI direct PDF status copy", {
  directPdfStatus: "PDF_PROCESSED_LOCALLY",
  internalJsonFilenameVisible: false,
  manualJsonStatusPreserved: true,
  staleNoProcessingCopyVisible: false,
});
