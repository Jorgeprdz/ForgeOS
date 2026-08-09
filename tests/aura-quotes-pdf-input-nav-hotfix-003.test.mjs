import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const index = await readFile(
  new URL("../docs/static-preview/forge-aura/index.html", import.meta.url),
  "utf8",
);
const shellCss = await readFile(
  new URL("../docs/static-preview/forge-aura/aura-shell.css", import.meta.url),
  "utf8",
);
const quotesModule = await readFile(
  new URL("../docs/static-preview/forge-aura/quotes/quotes-module.js", import.meta.url),
  "utf8",
);
const pdfParser = await readFile(
  new URL("../docs/static-preview/quote-runtime/forge-pdf-browser-parser.js", import.meta.url),
  "utf8",
);

assert.match(index, /data-aura-quotes-input-ownership="AURA_QUOTES_PDF_INPUT_OWNERSHIP_003"/);
assert.match(
  index,
  /auraRoot\.addEventListener\("change",[\s\S]*input\.matches\("\[data-quotes-file\]"\)[\s\S]*event\.stopPropagation\(\)/,
  "Aura root must stop the Quotes file-input change event before it reaches document-level legacy interceptors",
);
assert.match(
  quotesModule,
  /fileInput\?\.addEventListener\("change",\s*\(\)\s*=>\s*processFile\(fileInput\.files\?\.\[0\]\)\)/,
  "Aura Quotes must retain ownership of processing the selected file",
);
assert.match(
  pdfParser,
  /document\.addEventListener\("change",[\s\S]*event\.stopImmediatePropagation\(\)[\s\S]*convertPdfInputToJsonChange107z15p2R11E/,
  "The documented legacy global PDF interceptor remains unchanged and is isolated by the Aura boundary",
);

const tabletBlock = shellCss.match(/@media\(max-width:1120px\) and \(min-width:721px\)\{([\s\S]*?)\}\n@media\(max-width:720px\)/)?.[1] || "";
assert.match(tabletBlock, /\.aura-nav a\{[^}]*width:auto[^}]*font-size:12px/);
assert.match(tabletBlock, /\.aura-nav a span\{[^}]*position:static[^}]*white-space:nowrap/);
assert.doesNotMatch(tabletBlock, /clip:rect\(0 0 0 0\)/);
assert.match(index, /aura-shell\.css\?v=aura-quotes-pdf-input-nav-003/);

console.log("PASS Aura Quotes PDF input ownership + tablet nav labels hotfix 003");
