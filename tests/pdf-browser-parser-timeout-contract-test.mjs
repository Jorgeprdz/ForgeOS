import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const parser = await readFile(
  new URL(
    "../docs/static-preview/quote-preview-live/" +
      "forge-pdf-browser-parser.js",
    import.meta.url,
  ),
  "utf8",
);

const loader = await readFile(
  new URL(
    "../docs/static-preview/forge-alive/" +
      "forge-alive-runtime-lazy-loader-r16j1c1.js",
    import.meta.url,
  ),
  "utf8",
);

assert.match(parser, /function withPdfTimeoutR16J1C1\(/);
assert.match(
  parser,
  /import\(candidate\.module\),\s*12000,\s*"La carga de PDF\.js"/s,
);
assert.match(
  parser,
  /pdfjsPromise107z15p2R11E,\s*15000,\s*"La inicialización de PDF\.js"/s,
);
assert.match(
  parser,
  /file\.arrayBuffer\(\),\s*12000,\s*"La lectura del archivo PDF"/s,
);
assert.match(
  parser,
  /documentTask\.promise,\s*30000,\s*"La apertura del documento PDF"/s,
);
assert.match(
  parser,
  /pdf\.getPage\(pageNumber\),\s*12000,\s*`La carga de la página \$\{pageNumber\}`/s,
);
assert.match(
  parser,
  /page\.getTextContent\(\),\s*12000,\s*`La extracción de texto de la página \$\{pageNumber\}`/s,
);
assert.match(
  parser,
  /parsePdfFileToAcceptedQuotePacket\(file,[\s\S]*60000,[\s\S]*"El procesamiento completo del PDF"/,
);
assert.match(parser, /await documentTask\.destroy\?\.\(\)/);
assert.match(parser, /page\?\.cleanup\?\.\(\)/);
assert.match(parser, /forge:accepted-quote-packet-ready/);
assert.match(parser, /automaticCalculationRequested:\s*false/);
assert.match(parser, /automaticAcceptance:\s*false/);
assert.doesNotMatch(parser, /transfer\.items\.add\(jsonFile\)/);

assert.match(
  loader,
  /forge-pdf-browser-parser\.js\?v=r16j1c1\-main\-thread\-latency\-20260716\-1/,
);
assert.doesNotMatch(
  loader,
  /forge-pdf-browser-parser\.js\?v=r16j1c1-pdf-timeouts-20260715-1/,
);

console.log(
  "PASS R16J1C1 PDF extraction timeout contract",
  {
    pdfJsImportTimeoutMs: 12000,
    pdfJsInitTimeoutMs: 15000,
    arrayBufferTimeoutMs: 12000,
    documentOpenTimeoutMs: 30000,
    pageLoadTimeoutMs: 12000,
    pageTextTimeoutMs: 12000,
    totalProcessingTimeoutMs: 60000,
    documentDestroyed: true,
    pageCleaned: true,
    directPacketEventPreserved: true,
    parserReferenceAuthority: "lazy-loader",
    parserCacheKey: "r16j1c1-main-thread-latency-20260716-1",
    automaticCalculationRequested: false,
    automaticAcceptance: false,
  },
);
