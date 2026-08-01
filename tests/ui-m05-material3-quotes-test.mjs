import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  buildQuoteResultViewModel,
  renderQuoteResult,
} from "../docs/static-preview/forge-alive-material3/quotes-result-adapter.js";

test("structured quote adapter delegates ready candidates to the governed presenter host", () => {
  const bridge = {
    getCurrentQuoteCandidate: () => ({ productName: "Vida Creciente", clientName: "Ana", annualPremium: 12500 }),
    getCurrentQuotePreviewCalculation: () => ({ currency: "MXN", projectedValue: 245000, assumptions: ["Vista preliminar"] }),
    getCurrentQuotePreviewCalculationState: () => ({ state: "READY", humanConfirmationRequired: true }),
  };
  const model = buildQuoteResultViewModel(bridge);
  const html = renderQuoteResult(model);
  assert.equal(model.state, "ready");
  assert.equal(model.candidate.productName, "Vida Creciente");
  assert.equal(model.calculation.projectedValue, 245000);
  assert.equal(model.humanConfirmationRequired, true);
  assert.match(html, /data-quote-product-intelligence-host/);
  assert.doesNotMatch(html, /nativeResult|accepted_quote_packet|progress/);
});

test("missing quote fields remain explicit unknowns and progress is state-bound", async () => {
  const empty = renderQuoteResult(buildQuoteResultViewModel({
    getCurrentQuoteCandidate: () => null,
    getCurrentQuotePreviewCalculation: () => null,
    getCurrentQuotePreviewCalculationState: () => ({ state: "IDLE" }),
  }));
  assert.match(empty, /Sin información suficiente/);
  const source = await readFile("docs/static-preview/forge-alive-material3/quotes-module.js", "utf8");
  const adapter = await readFile("docs/static-preview/forge-alive-material3/quotes-result-adapter.js", "utf8");
  assert.doesNotMatch(source, /cloneNode|sanitizeProjection/);
  assert.match(source, /globalThis\.ForgeAcceptedQuoteBridge/);
  assert.match(adapter, /getCurrentQuoteCandidate/);
  assert.match(adapter, /getCurrentQuotePreviewCalculation/);
  assert.match(adapter, /getCurrentQuotePreviewCalculationState/);
  assert.match(adapter, /calculateCurrentQuoteCandidatePreview/);
  assert.doesNotMatch(adapter, /function objectMarkup|function valueMarkup/);
  assert.match(adapter, /No disponible en la propuesta/);
  assert.match(adapter, /data-quote-error-state/);
  assert.match(adapter, /data-quote-product-intelligence-host/);
  assert.match(adapter, /state === "partial"/);
  assert.doesNotMatch(adapter, /069C|073D|GMM/);
});

test("quote commercial projection bounds technical evidence and errors", () => {
  const candidate = {
    schemaVersion: "forge.accepted_quote_packet.v1",
    productName: "SeguBeca 18",
    productFamily: "segubeca",
    insured: "Contratante Prueba",
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
  const partialHtml = renderQuoteResult(partial);
  assert.equal(partial.state, "partial");
  assert.equal(partial.candidate.productName, "SeguBeca 18");
  assert.match(partialHtml, /data-quote-product-intelligence-host/);
  assert.doesNotMatch(partialHtml, /RAW_SHOULD_NOT_RENDER|nativeResult|deeply|INTERNAL/);

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
  assert.doesNotMatch(failed, /RAW_SHOULD_NOT_RENDER/);
});
