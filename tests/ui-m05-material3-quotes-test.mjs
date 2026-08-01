import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  buildQuoteResultViewModel,
  renderQuoteResult,
} from "../docs/static-preview/forge-alive-material3/quotes-result-adapter.js";
import {
  createQuoteResultSnapshot,
} from "../docs/static-preview/forge-alive-material3/quote-product-intelligence-presenter.js";

test("structured quote adapter prepares the canonical presenter snapshot", () => {
  const bridge = {
    getCurrentQuoteCandidate: () => ({
      productName: "Vida Creciente",
      clientName: "Ana",
      annualPremium: 12500,
    }),
    getCurrentQuotePreviewCalculation: () => ({
      currency: "MXN",
      projectedValue: 245000,
      assumptions: ["Vista preliminar"],
    }),
    getCurrentQuotePreviewCalculationState: () => ({
      state: "READY",
      humanConfirmationRequired: true,
    }),
  };

  const model = buildQuoteResultViewModel(bridge);
  const host = renderQuoteResult(model);
  const snapshot = createQuoteResultSnapshot({
    packet: model.candidate,
    calculation: model.calculation,
  });

  assert.equal(model.state, "ready");
  assert.equal(model.humanConfirmationRequired, true);
  assert.match(host, /data-quote-product-intelligence-host/);
  assert.doesNotMatch(host, /Vida Creciente|12500|245000/);

  assert.equal(snapshot.identity.name, "Vida Creciente");
  assert.equal(snapshot.mandatory.annualContribution.value, 12500);
  assert.equal(snapshot.calculation.projectedValue, 245000);
  assert.deepEqual(snapshot.calculation.assumptions, ["Vista preliminar"]);
  assert.equal(Object.isFrozen(snapshot), true);
  assert.equal(Object.isFrozen(snapshot.identity), true);
});

test("empty, partial and error states remain explicit around presenter composition", async () => {
  const empty = renderQuoteResult(buildQuoteResultViewModel({
    getCurrentQuoteCandidate: () => null,
    getCurrentQuotePreviewCalculation: () => null,
    getCurrentQuotePreviewCalculationState: () => ({ state: "IDLE" }),
  }));
  assert.match(empty, /Sin información suficiente/);

  const source = await readFile(
    "docs/static-preview/forge-alive-material3/quotes-module.js",
    "utf8",
  );
  const adapter = await readFile(
    "docs/static-preview/forge-alive-material3/quotes-result-adapter.js",
    "utf8",
  );
  const presenter = await readFile(
    "docs/static-preview/forge-alive-material3/quote-product-intelligence-presenter.js",
    "utf8",
  );

  assert.doesNotMatch(source, /cloneNode|sanitizeProjection/);
  assert.match(source, /globalThis\.ForgeAcceptedQuoteBridge/);
  assert.match(adapter, /getCurrentQuoteCandidate/);
  assert.match(adapter, /getCurrentQuotePreviewCalculation/);
  assert.match(adapter, /getCurrentQuotePreviewCalculationState/);
  assert.match(adapter, /calculateCurrentQuoteCandidatePreview/);
  assert.match(adapter, /createQuoteResultSnapshot/);
  assert.match(adapter, /renderQuoteResultSnapshot/);
  assert.match(adapter, /appendReview/);
  assert.match(adapter, /appendActions/);
  assert.match(adapter, /data-quote-product-intelligence-host/);
  assert.match(adapter, /data-quote-error-state/);
  assert.match(adapter, /state === "partial"/);
  assert.doesNotMatch(adapter, /function objectMarkup|function valueMarkup/);
  assert.doesNotMatch(adapter, /069C|073D|GMM/);

  assert.match(presenter, /data-quote-mandatory-metric/);
  assert.match(presenter, /missingInformation/);
  assert.match(presenter, /Pendiente/);
});

test("partial and failed paths never print raw packet internals directly", () => {
  const candidate = {
    schemaVersion: "forge.accepted_quote_packet.v1",
    productName: "Producto Prueba",
    productFamily: "general",
    annualPremium: 2524.19,
    currency: "UDI",
    nativeResult: {
      sourceRecordReference: "RAW_SHOULD_NOT_RENDER",
      nested: { deeply: { technical: "INTERNAL" } },
    },
  };

  const partial = buildQuoteResultViewModel({
    getCurrentQuoteCandidate: () => candidate,
    getCurrentQuotePreviewCalculation: () => null,
    getCurrentQuotePreviewCalculationState: () => ({ state: "PARTIAL" }),
  });
  const partialHost = renderQuoteResult(partial);
  const snapshot = createQuoteResultSnapshot({ packet: partial.candidate });

  assert.equal(partial.state, "partial");
  assert.match(partialHost, /data-quote-product-intelligence-host/);
  assert.doesNotMatch(
    partialHost,
    /RAW_SHOULD_NOT_RENDER|nativeResult|deeply|INTERNAL/,
  );
  assert.equal(snapshot.identity.name, "Producto Prueba");
  assert.equal(snapshot.mandatory.annualContribution.value, 2524.19);
  assert.doesNotMatch(
    JSON.stringify(snapshot),
    /RAW_SHOULD_NOT_RENDER|sourceRecordReference|deeply|INTERNAL/,
  );

  const failed = renderQuoteResult(buildQuoteResultViewModel({
    getCurrentQuoteCandidate: () => candidate,
    getCurrentQuotePreviewCalculation: () => null,
    getCurrentQuotePreviewCalculationState: () => ({
      state: "ERROR",
      error: "ERROR_CONTROLADO",
    }),
  }));
  assert.match(failed, /No pudimos preparar el resultado/);
  assert.match(failed, /ERROR_CONTROLADO/);
  assert.doesNotMatch(failed, /RAW_SHOULD_NOT_RENDER|INTERNAL/);
});
