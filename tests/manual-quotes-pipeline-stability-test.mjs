import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  buildQuoteResultViewModel,
  renderQuoteResult,
} from "../docs/static-preview/forge-alive-material3/quotes-result-adapter-complete.js";
import {
  stageLabelFor,
  applyStagePresentation,
  restoreStagePresentation,
} from "../docs/static-preview/forge-alive-material3/pipeline-ui-stability.js";

test("complete quote projection preserves every commercial field from the real packet shape", () => {
  const candidate = {
    schemaVersion: "forge.accepted_quote_packet.v1",
    context: { productFamily: "Retiro" },
    nativeResult: {
      prospect: "Jorge Palacios",
      product: "Imagina Ser",
      plan: "Plan 65",
      sumInsured: 2500000,
      currency: "MXN",
      premiumTable: {
        annual: 120000,
        plannedAnnual: 150000,
        annualAve: 30000,
        accumulatedWithAve: 3000000,
      },
      baseAnnualPremium: 90000,
      paymentMode: "Anual",
      policyTerm: "Hasta los 65 años",
      paymentTerm: 20,
      guaranteePeriod: "10 años",
      totalContributed: 3000000,
      totalRecovery: 5100000,
      retirementInterestRate: 0.045,
      retirementScenarioBase: 5100000,
      retirementScenarioFavorable: 6200000,
      retirementScenarioUnfavorable: 4300000,
      quoteDate: "2026-07-30",
      advisor: "Jorge Palacios",
    },
    benefitSummary: {
      blocks: [
        {
          type: "protection_summary",
          title: "Protección principal",
          lines: [{ label: "Fallecimiento", value: 2500000, unit: "MXN" }],
        },
        {
          type: "additional_coverages",
          title: "Coberturas adicionales",
          benefits: [{ name: "Invalidez", value: 2500000 }],
        },
        {
          type: "missing_information",
          missing: ["Beneficiarios"],
        },
      ],
    },
  };
  const calculation = {
    currency: "MXN",
    projectedValue: 5000000,
    guaranteedValue: 3200000,
    cashValue: 2800000,
    assumptions: ["Escenario preliminar"],
  };
  const bridge = {
    getCurrentQuoteCandidate: () => candidate,
    getCurrentQuotePreviewCalculation: () => calculation,
    getCurrentQuotePreviewCalculationState: () => ({
      state: "READY",
      humanConfirmationRequired: true,
    }),
  };

  const model = buildQuoteResultViewModel(bridge);
  const html = renderQuoteResult(model);
  assert.equal(model.state, "ready");

  for (const value of [
    "Jorge Palacios",
    "Retiro",
    "Imagina Ser",
    "Plan 65",
    "2,500,000 MXN",
    "90,000 MXN",
    "120,000 MXN",
    "150,000 MXN",
    "30,000 MXN",
    "3,000,000 MXN",
    "Anual",
    "Hasta los 65 años",
    "20 años",
    "10 años",
    "5,100,000 MXN",
    "4.5%",
    "6,200,000 MXN",
    "4,300,000 MXN",
    "2026-07-30",
    "Fallecimiento",
    "Invalidez",
    "Beneficiarios",
  ]) {
    assert.match(html, new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.doesNotMatch(html, /nativeResult|premiumTable|accepted_quote_packet/);
  assert.match(html, /LECTURA COMERCIAL COMPLETA/);
  assert.match(html, /data-quote-scenarios/);
  assert.match(html, /data-quote-benefits/);
  assert.match(html, /Confirmación humana/);
  assert.ok(html.length < 30000, "the structured projection must remain bounded");
});

test("stage presentation changes card border authority immediately and can roll back", () => {
  function fakeNode() {
    const attributes = new Map();
    return {
      textContent: "",
      value: "",
      setAttribute(name, value) { attributes.set(name, String(value)); },
      removeAttribute(name) { attributes.delete(name); },
      getAttribute(name) { return attributes.get(name) ?? null; },
    };
  }

  const badge = fakeNode();
  const select = fakeNode();
  const card = {
    dataset: { productiveStage: "referred_new" },
    querySelector(selector) {
      if (selector === "[data-productive-stage-label]") return badge;
      if (selector === "[data-productive-stage-control]") return select;
      return null;
    },
  };

  assert.equal(stageLabelFor("appointment_scheduled"), "Cita agendada");
  const snapshot = applyStagePresentation(card, "appointment_scheduled", "saving");
  assert.equal(snapshot.previous, "referred_new");
  assert.equal(card.dataset.productiveStage, "appointment_scheduled");
  assert.equal(card.dataset.stagePersistence, "saving");
  assert.equal(badge.textContent, "Cita agendada");
  assert.equal(select.value, "appointment_scheduled");
  assert.equal(select.getAttribute("aria-busy"), "true");

  assert.equal(restoreStagePresentation(card, snapshot), true);
  assert.equal(card.dataset.productiveStage, "referred_new");
  assert.equal(badge.textContent, "Nuevo");
  assert.equal(select.value, "referred_new");
});

test("application loads the complete Quotes module and Pipeline stability layer", async () => {
  const app = await readFile(
    "docs/static-preview/forge-alive-material3/app.js",
    "utf8",
  );
  const quotesModule = await readFile(
    "docs/static-preview/forge-alive-material3/quotes-module.js",
    "utf8",
  );
  const quoteAdapter = await readFile(
    "docs/static-preview/forge-alive-material3/quotes-result-adapter-complete.js",
    "utf8",
  );
  const pipelineStability = await readFile(
    "docs/static-preview/forge-alive-material3/pipeline-ui-stability.js",
    "utf8",
  );

  assert.match(app, /quotes-module\.js\?v=quote-calculator-parity-006/);
  assert.match(app, /pipeline-ui-stability\.js\?v=manual-pipeline-stability-001/);
  assert.match(quotesModule, /quotes-result-adapter\.js\?v=quote-calculator-parity-006/);
  assert.match(quoteAdapter, /premiumTable/);
  assert.match(pipelineStability, /windowRef\.innerWidth - documentRef\.documentElement\.clientWidth/);
  assert.match(pipelineStability, /data-productive-stage-label/);
  assert.match(pipelineStability, /border-color:\s*color-mix/);
  assert.match(pipelineStability, /@media \(hover: none\), \(pointer: coarse\)/);
  assert.match(pipelineStability, /restoreAnchorAfterRender/);
});
