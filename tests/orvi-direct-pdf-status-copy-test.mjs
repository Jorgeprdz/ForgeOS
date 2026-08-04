import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const parser = await readFile(
  new URL(
    "../docs/static-preview/quote-runtime/forge-pdf-browser-parser.js",
    import.meta.url,
  ),
  "utf8",
);
const bridge = await readFile(
  new URL(
    "../docs/static-preview/quote-runtime/forge-accepted-quote-bridge.js",
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
  parser,
  /PDF recibido\. Extrayendo renglones del estudio…/,
);
assert.match(
  parser,
  /PDF extraído localmente\. Abriendo confirmación para revisión humana…/,
);
assert.doesNotMatch(parser, /Listo para continuar/);
assert.match(parser, /forge:accepted-quote-packet-ready/);
assert.match(parser, /automaticCalculationRequested:\s*false/);
assert.match(parser, /automaticAcceptance:\s*false/);
assert.doesNotMatch(parser, /transfer\.items\.add\(jsonFile\)/);
assert.doesNotMatch(parser, /new File\([\s\S]*application\/json/);

assert.match( bridge, /\$\{file\.name\} cargado\./, "manual JSON remains a separate supported upload path", ); assert.match( bridge, /Calculando resultado automáticamente/, );

assert.match(
  page,
  /Selecciona el PDF de Solución Online\. Se procesa localmente en tu navegador\./,
);
assert.match(page, /No se sube ni se publica\.<\/p>/);
assert.doesNotMatch(
  page,
  /No se sube, no se lee y no se procesa el PDF/,
);

console.log("PASS R16J1C1 incremental direct PDF status contract", {
  directPdfPacketEvent: true,
  syntheticJsonHandoff: false,
  automaticCalculationRequested: false,
  automaticAcceptance: false,
  manualJsonUploadPreserved: true,
});
