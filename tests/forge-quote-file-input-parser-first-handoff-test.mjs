import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);

const loader = await readFile(
  new URL(
    "docs/static-preview/forge-alive/" +
      "forge-alive-runtime-lazy-loader-r16j1c1.js",
    root,
  ),
  "utf8",
);

const parser = await readFile(
  new URL(
    "docs/static-preview/quote-preview-live/" +
      "forge-pdf-browser-parser.js",
    root,
  ),
  "utf8",
);

function balancedArray(source, marker) {
  const markerOffset = source.indexOf(marker);
  assert.notEqual(markerOffset, -1);

  const arrayStart = source.indexOf(
    "[",
    markerOffset + marker.length,
  );
  assert.notEqual(arrayStart, -1);

  let depth = 0;
  let quote = "";
  let escaped = false;

  for (
    let index = arrayStart;
    index < source.length;
    index += 1
  ) {
    const char = source[index];

    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (char === quote) quote = "";
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }

    if (char === "[") depth += 1;

    if (char === "]") {
      depth -= 1;
      if (depth === 0) {
        return JSON.parse(
          source.slice(arrayStart, index + 1),
        );
      }
    }
  }

  throw new Error("Unbalanced QUOTE_SCRIPTS");
}

const entries = balancedArray(
  loader,
  "const QUOTE_SCRIPTS = Object.freeze(",
);
const keys = entries.map(
  (entry) => `${entry.type}|${entry.src}`,
);

assert.equal(entries.length, 14);
assert.equal(new Set(keys).size, 14);
assert.match(
  entries[0].src,
  /forge-pdf-browser-parser\.js\?v=r16j1c1\-nonblocking\-route\-20260716\-1/,
);

assert.ok(
  loader.includes(
    `const FILE_INPUT_SELECTOR = 'input[type="file"]';`,
  ),
);
assert.match(loader, /host\?\.contains\(target\)/);
assert.match(loader, /PDF recibido:/);
assert.match(loader, /No pude preparar el extractor:/);
assert.match(loader, /\[Forge parser-first file handoff\]/);
assert.equal(
  loader.split("loadQuoteShell().catch(() => {});").length - 1,
  0,
);
assert.equal(
  loader.split("loadQuoteRuntime().catch(() => {});").length - 1,
  3,
);
assert.match(
  loader,
  /"R16J1C1_RUNTIME_LAZY_03C1_PARSER_FIRST"/,
);

assert.match(
  parser,
  /\.\/forge-pdfjs-4\.10\.38\.js/,
);
assert.match(
  parser,
  /\.\/forge-pdfjs-worker-4\.10\.38\.js/,
);
assert.doesNotMatch(parser, /assets\/pdfjs/);

console.log(
  "PASS R16J1C1 03C1 parser-first file handoff",
  {
    quoteScripts: entries.length,
    parserPosition: 1,
    duplicateScripts: entries.length - new Set(keys).size,
    broadFileInputInsideQuoteHost: true,
    visibleHandoffStatus: true,
    runtimePreloadOnQuoteOpen: true,
    pdfJsRootModule: true,
    automaticAcceptance: false,
  },
);
