import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  buildQuoteResultViewModel,
  renderQuoteResult,
} from "../docs/static-preview/forge-alive-material3/quotes-result-adapter.js";

test("structured quote adapter renders candidate and calculation truth", () => {
  const bridge = {
    getCurrentQuoteCandidate: () => ({ productName: "Vida Creciente", clientName: "Ana", annualPremium: 12500 }),
    getCurrentQuotePreviewCalculation: () => ({ currency: "MXN", projectedValue: 245000, assumptions: ["Vista preliminar"] }),
    getCurrentQuotePreviewCalculationState: () => ({ state: "READY", humanConfirmationRequired: true }),
  };
  const model = buildQuoteResultViewModel(bridge);
  const html = renderQuoteResult(model);
  assert.equal(model.state, "ready");
  assert.match(html, /Vida Creciente/);
  assert.match(html, /12,500 MXN/);
  assert.match(html, /245,000 MXN/);
  assert.match(html, /ForgeAcceptedQuoteBridge/);
  assert.match(html, /Confirmación humana/);
  assert.ok((html.match(/data-quote-result-section/g) || []).length >= 6);
  assert.match(html, /data-quote-commercial-projection/);
  assert.match(html, /data-quote-technical-evidence/);
  assert.doesNotMatch(html, /nativeResult|accepted_quote_packet/);
  assert.doesNotMatch(html, /progress/);
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
  assert.match(adapter, /Pendiente de confirmar/);
  assert.match(adapter, /data-quote-error-state/);
  assert.match(adapter, /data-quote-partial-state|state === "partial"/);
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
  assert.match(partialHtml, /SeguBeca 18/);
  assert.match(partialHtml, /Evidencia técnica resumida/);
  assert.doesNotMatch(partialHtml, /RAW_SHOULD_NOT_RENDER|nativeResult|deeply|INTERNAL/);

  const invalid = renderQuoteResult(buildQuoteResultViewModel({
    getCurrentQuoteCandidate: () => "invalid-packet",
    getCurrentQuotePreviewCalculation: () => null,
    getCurrentQuotePreviewCalculationState: () => ({ state: "READY" }),
  }));
  assert.match(invalid, /Paquete inválido/);
  assert.doesNotMatch(invalid, /invalid-packet/);

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
