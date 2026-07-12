import assert from "node:assert/strict";
import fs from "node:fs";
import {
  buildImaginaSerDashboardModel,
  formatImaginaSerAmount,
  formatImaginaSerNumber,
  isImaginaSerProduct,
  renderImaginaSerDashboard
} from "../docs/static-preview/quote-preview-live/forge-imagina-ser-product-dashboard-adapter.js";
import { buildQuoteBenefitSummary } from "../quote-benefit-summary-engine.js";

class TestElement {
  constructor(tagName) {
    this.tagName = tagName.toUpperCase();
    this.className = "";
    this.dataset = {};
    this.children = [];
    this.textContent = "";
  }

  append(...children) {
    this.children.push(...children);
  }

  appendChild(child) {
    this.children.push(child);
    return child;
  }
}

const documentRef = {
  createElement(tagName) {
    return new TestElement(tagName);
  }
};

assert.equal(isImaginaSerProduct({ productFamily: "Imagina Ser" }), true);
assert.equal(isImaginaSerProduct({ product: "IMAGINA_SER" }), true);
assert.equal(isImaginaSerProduct({ productFamily: "Vida Mujer" }), false);
assert.equal(isImaginaSerProduct({ nativeResult: { productName: "IMAGINA SER 65 PAGOS LIMITADOS 15" } }), true);
assert.equal(formatImaginaSerNumber(607685.9251110773), "607,686");
assert.equal(formatImaginaSerAmount({ udi: 607685.9251110773 }), "607,686 UDI");
assert.equal(formatImaginaSerAmount({ mxn: 607685.9251110773 }), "≈ $607,686 MXN");
assert.equal(
  formatImaginaSerAmount({ udi: 89982.75, mxnAtRetirement: 4155098.814, targetAge: 65 }),
  "89,983 UDI · ≈ $4,155,099 MXN · edad 65"
);

const benefitSummary = [
  {
    type: "contribution_summary",
    lines: [
      { id: "total_contributed_udi", label: "Total aportado", value: 50000, unit: "UDI", source: "udiProjection" },
      { id: "total_contributed_mxn_projected", label: "Total aportado proyectado", value: 600000, unit: "MXN", source: "udiProjection" },
      { id: "premium_paying_years", label: "Años de pago", value: 15, unit: "years", source: "nativeResult" }
    ]
  },
  {
    type: "protection_summary",
    lines: [
      { id: "sum_assured_udi", label: "Suma asegurada", value: 75000, unit: "UDI", source: "nativeResult" }
    ]
  },
  {
    type: "retirement_scenarios",
    scenarios: [
      {
        id: "base",
        label: "Base",
        singlePayment: { udi: 90000, mxn: 4000000, targetAge: 65 },
        monthlyIncome: { udi: 600, mxn: 27000, targetAge: 65 },
        accumulatedIncome: [{ toAge: 75, mxn: 4600000 }]
      },
      {
        id: "favorable",
        label: "Favorable",
        singlePayment: { udi: 110000, mxn: 5000000, targetAge: 65 }
      }
    ],
    missing: ["Falta escenario desfavorable"]
  },
  {
    type: "missing_information",
    lines: [{ label: "Falta escenario desfavorable" }]
  }
];

const formattedObjects = [];
const model = buildImaginaSerDashboardModel(benefitSummary, {
  formatAmount(value) {
    formattedObjects.push(value);
    if (value?.udi) return `${value.udi} UDI`;
    if (value?.mxn) return `${value.mxn} MXN`;
    return null;
  }
});

assert.equal(model.productType, "imagina_ser");
assert.deepEqual(
  model.sections.map((section) => section.title),
  ["Resumen del plan", "Lo que aportas", "Lo que construyes", "Lo que proteges"]
);
assert.equal(model.sections.find((section) => section.kind === "summary").items[0].value, "15 años");
assert.equal(model.sections.find((section) => section.kind === "summary").items[0].label, "Plazo de aportación");
assert.equal(model.sections.find((section) => section.kind === "contribution").items[0].label, "Total aportado");
assert.equal(model.sections.find((section) => section.kind === "contribution").items[1].label, "Total aportado proyectado");
assert.equal(model.sections.find((section) => section.kind === "construction").items[0].evidence, benefitSummary[2].scenarios[0].singlePayment);
assert.equal(model.sections.find((section) => section.kind === "construction").items[0].label, "Meta patrimonial");
assert.equal(model.sections.find((section) => section.kind === "construction").items[1].label, "Valor futuro · edad 75");
assert.ok(formattedObjects.includes(benefitSummary[2].scenarios[0].singlePayment));
assert.equal(model.sections.some((section) => section.kind === "future_scenario"), false);
const constructionSection = model.sections.find((section) => section.kind === "construction");
assert.equal(constructionSection.key, "contribution");
assert.equal(constructionSection.presentation, "primary_metrics");
assert.ok(constructionSection.items.some((item) => item.label === "Escenario Favorable"));
assert.ok(model.missingInformation.includes("Falta escenario desfavorable"));
assert.ok(model.missingInformation.includes("No hay beneficios recomendados con evidencia estructurada"));
assert.ok(model.missingInformation.includes("No hay otros detalles con evidencia estructurada"));

const dashboard = renderImaginaSerDashboard(model, { documentRef });
assert.equal(dashboard.dataset.forgeProductType, "imagina_ser");
assert.equal(dashboard.dataset.forgeProductLayout, "imagina_ser_desktop_r13g");
assert.equal(dashboard.className, "fq-benefit-dashboard-107z15p2");
assert.equal(dashboard.children[0].dataset.forgeProductSection, "summary");
assert.equal(dashboard.children.at(-1).dataset.forgeProductSection, "missing_information");

const sparseModel = buildImaginaSerDashboardModel([], { formatAmount: () => null });
assert.equal(sparseModel.sections.length, 0);
assert.ok(sparseModel.missingInformation.includes("Faltan datos de aportación"));
assert.ok(sparseModel.missingInformation.includes("Faltan datos de protección"));
assert.ok(sparseModel.missingInformation.includes("Faltan escenarios futuros con evidencia"));

const productIntelligenceBlocks = buildQuoteBenefitSummary({
  productFamily: "Imagina Ser",
  nativeResult: {
    productName: "IMAGINA SER",
    premiumStructure: { premiumPayingYears: 10 },
    scenarios: {
      base: {
        singlePaymentUdi: 1,
        monthlyIncomeUdi: 1,
        targetAge: 65
      }
    }
  },
  udiProjection: {}
});
const integratedModel = buildImaginaSerDashboardModel(productIntelligenceBlocks, {
  formatAmount: (value) => value?.udi ? `${value.udi} UDI` : null
});
assert.ok(integratedModel.sections.some((section) => section.kind === "summary"));
assert.ok(integratedModel.sections.some((section) => section.kind === "construction"));
assert.equal(integratedModel.sections.some((section) => section.kind === "future_scenario"), false);
assert.ok(integratedModel.missingInformation.includes("Faltan datos de aportación"));
assert.ok(integratedModel.missingInformation.includes("Faltan datos de protección"));

const layoutSource = fs.readFileSync(
  new URL("../docs/static-preview/quote-preview-live/forge-benefit-summary-layout.js", import.meta.url),
  "utf8"
);
assert.match(layoutSource, /data-forge-product-type=\\?"imagina_ser\\?"/);
assert.match(layoutSource, /data-forge-product-section=\\?"construction\\?"/);
assert.match(layoutSource, /grid-column:\s*1 \/ -1/);
assert.match(layoutSource, /@media \(min-width: 1181px\)/);
assert.match(layoutSource, /data-forge-benefit-block=\\?"endowments\\?"/);
assert.match(layoutSource, /data-forge-benefit-block=\\?"recommended\\?"/);

console.log("PASS Imagina Ser product dashboard adapter R13C");
