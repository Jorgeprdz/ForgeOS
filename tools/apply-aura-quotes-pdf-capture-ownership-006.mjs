import { readFile, writeFile } from "node:fs/promises";

const parserPath = "docs/static-preview/quote-runtime/forge-pdf-browser-parser.js";
const quotesPath = "docs/static-preview/forge-aura/quotes/quotes-module.js";
const testPath = "tests/aura-quotes-pdf-capture-ownership-hotfix-006.test.mjs";

const parser = await readFile(parserPath, "utf8");
const parserAnchor = `    if (!(input instanceof HTMLInputElement)) return;\n    if (input.type !== "file") return;\n    const file = input.files?.[0];\n`;
const parserReplacement = `    if (!(input instanceof HTMLInputElement)) return;\n    if (input.type !== "file") return;\n    // Native owners process their own file input. This guard must run before\n    // the legacy capture interceptor calls preventDefault/stopImmediatePropagation.\n    if (input.dataset.forgePdfOwner === "native") return;\n    const file = input.files?.[0];\n`;
if (!parser.includes(parserAnchor)) throw new Error("PARSER_CAPTURE_ANCHOR_NOT_FOUND");
await writeFile(parserPath, parser.replace(parserAnchor, parserReplacement));

const quotes = await readFile(quotesPath, "utf8");
const quotesAnchor = `        <input type="file" accept=".pdf,application/pdf,.json,application/json" data-quotes-file ${'${busyAction ? "disabled" : ""}'}>\n`;
const quotesReplacement = `        <input type="file" accept=".pdf,application/pdf,.json,application/json" data-quotes-file data-forge-pdf-owner="native" ${'${busyAction ? "disabled" : ""}'}>\n`;
if (!quotes.includes(quotesAnchor)) throw new Error("AURA_QUOTES_INPUT_ANCHOR_NOT_FOUND");
await writeFile(quotesPath, quotes.replace(quotesAnchor, quotesReplacement));

await writeFile(testPath, `import assert from "node:assert/strict";\nimport { readFile } from "node:fs/promises";\nimport { test } from "node:test";\n\nconst parser = await readFile(new URL("../docs/static-preview/quote-runtime/forge-pdf-browser-parser.js", import.meta.url), "utf8");\nconst quotes = await readFile(new URL("../docs/static-preview/forge-aura/quotes/quotes-module.js", import.meta.url), "utf8");\n\ntest("Aura Quotes declares native ownership of its PDF input", () => {\n  assert.match(quotes, /data-quotes-file data-forge-pdf-owner="native"/);\n  assert.match(quotes, /fileInput\\?\\.addEventListener\\("change", \\(\\) => processFile\\(fileInput\\.files\\?\\.\\[0\\]\\)\\)/);\n});\n\ntest("legacy PDF capture interceptor yields before cancelling native-owned input", () => {\n  const interceptor = parser.indexOf("function installPdfInputInterceptor107z15p2R11E");\n  const ownerGuard = parser.indexOf('if (input.dataset.forgePdfOwner === "native") return;', interceptor);\n  const preventDefault = parser.indexOf("event.preventDefault();", interceptor);\n  const stopImmediate = parser.indexOf("event.stopImmediatePropagation();", interceptor);\n  assert.ok(interceptor >= 0, "interceptor missing");\n  assert.ok(ownerGuard > interceptor, "native owner guard missing");\n  assert.ok(ownerGuard < preventDefault, "owner guard must run before preventDefault");\n  assert.ok(ownerGuard < stopImmediate, "owner guard must run before stopImmediatePropagation");\n});\n\ntest("legacy parser behavior remains available for non-native file inputs", () => {\n  assert.match(parser, /convertPdfInputToJsonChange107z15p2R11E\\(input, file\\)/);\n  assert.match(parser, /PDF recibido\\. Extrayendo renglones del estudio/);\n});\n`);

console.log("AURA_QUOTES_PDF_CAPTURE_OWNERSHIP_PATCH=APPLIED");
