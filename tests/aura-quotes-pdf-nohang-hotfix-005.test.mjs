import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { __quotesAuraTest } from "../docs/static-preview/forge-aura/quotes/quotes-adapter.js";

const source = await readFile(
  new URL("../docs/static-preview/forge-aura/quotes/quotes-adapter.js", import.meta.url),
  "utf8",
);

test("Aura Quotes watchdog rejects an unresolved calculation instead of loading forever", async () => {
  const startedAt = Date.now();
  await assert.rejects(
    __quotesAuraTest.withQuoteTimeout(
      new Promise(() => {}),
      25,
      "WATCHDOG_TEST",
    ),
    /WATCHDOG_TEST/,
  );
  assert.ok(Date.now() - startedAt < 500);
});

test("PDF parse and quote calculation have explicit upper bounds", () => {
  assert.deepEqual(__quotesAuraTest.timeoutMs, {
    parse: 62000,
    calculation: 15000,
  });
  assert.match(source, /withQuoteTimeout\([\s\S]*parsePdfFileToAcceptedQuotePacket\(file\)/);
  assert.match(source, /withQuoteTimeout\([\s\S]*calculateAcceptedQuote\(packet\)/);
});

test("non-calculable document exits with an actionable Cartera hint", () => {
  assert.match(source, /Este PDF no contiene una cotización calculable/);
  assert.match(source, /póliza emitida o un documento de Cartera/);
});
