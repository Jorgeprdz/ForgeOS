import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const parser = await readFile(new URL("../docs/static-preview/quote-runtime/forge-pdf-browser-parser.js", import.meta.url), "utf8");
const quotes = await readFile(new URL("../docs/static-preview/forge-aura/quotes/quotes-module.js", import.meta.url), "utf8");

test("Aura Quotes declares native ownership of its PDF input", () => {
  assert.match(quotes, /data-quotes-file data-forge-pdf-owner="native"/);
  assert.match(quotes, /fileInput\?\.addEventListener\("change", \(\) => processFile\(fileInput\.files\?\.\[0\]\)\)/);
});

test("legacy PDF capture interceptor yields before cancelling native-owned input", () => {
  const interceptor = parser.indexOf("function installPdfInputInterceptor107z15p2R11E");
  const ownerGuard = parser.indexOf('if (input.dataset.forgePdfOwner === "native") return;', interceptor);
  const preventDefault = parser.indexOf("event.preventDefault();", interceptor);
  const stopImmediate = parser.indexOf("event.stopImmediatePropagation();", interceptor);
  assert.ok(interceptor >= 0, "interceptor missing");
  assert.ok(ownerGuard > interceptor, "native owner guard missing");
  assert.ok(ownerGuard < preventDefault, "owner guard must run before preventDefault");
  assert.ok(ownerGuard < stopImmediate, "owner guard must run before stopImmediatePropagation");
});

test("legacy parser behavior remains available for non-native file inputs", () => {
  assert.match(parser, /convertPdfInputToJsonChange107z15p2R11E\(input, file\)/);
  assert.match(parser, /PDF recibido\. Extrayendo renglones del estudio/);
});
