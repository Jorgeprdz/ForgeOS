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
  assert.match(html, /12500/);
  assert.match(html, /245000/);
  assert.match(html, /ForgeAcceptedQuoteBridge/);
  assert.match(html, /Confirmación humana/);
  assert.equal((html.match(/data-quote-result-section/g) || []).length, 3);
  assert.doesNotMatch(html, /progress/);
});

test("missing quote fields remain explicit unknowns and progress is state-bound", async () => {
  const empty = renderQuoteResult(buildQuoteResultViewModel({
    getCurrentQuoteCandidate: () => null,
    getCurrentQuotePreviewCalculation: () => null,
    getCurrentQuotePreviewCalculationState: () => ({ state: "IDLE" }),
  }));
  assert.match(empty, /No disponible en el documento/);
  const source = await readFile("docs/static-preview/forge-alive-material3/quotes-module.js", "utf8");
  const adapter = await readFile("docs/static-preview/forge-alive-material3/quotes-result-adapter.js", "utf8");
  assert.doesNotMatch(source, /cloneNode|sanitizeProjection/);
  assert.match(source, /globalThis\.ForgeAcceptedQuoteBridge/);
  assert.match(adapter, /getCurrentQuoteCandidate/);
  assert.match(adapter, /getCurrentQuotePreviewCalculation/);
  assert.match(adapter, /getCurrentQuotePreviewCalculationState/);
  assert.match(adapter, /calculateCurrentQuoteCandidatePreview/);
  assert.doesNotMatch(adapter, /069C|073D|GMM/);
});
