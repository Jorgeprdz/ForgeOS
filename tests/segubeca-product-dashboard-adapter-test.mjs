import assert from "node:assert/strict";
import {
  SEGUBECA_PRODUCT_TYPE,
  buildSegubecaDashboardModel,
  formatSegubecaAmount,
  formatSegubecaNumber,
  isSegubecaProduct,
  renderSegubecaDashboard
} from "../docs/static-preview/quote-preview-live/forge-segubeca-product-dashboard-adapter.js";

function createFakeDocument() {
  return {
    createElement(tag) {
      return {
        tagName: String(tag).toUpperCase(),
        className: "",
        dataset: {},
        children: [],
        textContent: "",
        append(...nodes) {
          this.children.push(...nodes);
        },
        appendChild(node) {
          this.children.push(node);
          return node;
        }
      };
    }
  };
}

const benefitSummary = [
  { type: "summary_plan", lines: [{ id: "product", label: "Producto", value: "SeguBeca" }, { id: "payment_term", value: 13, unit: "years" }] },
  { type: "participants", participant_modality: "joint", participants: { primary_insured: "Papá", joint_insured: "Mamá", child_or_education_beneficiary: "Menor" } },
  { type: "contribution_summary", lines: [{ id: "annual_premium", value: 12500.49, unit: "MXN" }, { id: "total_contributed", value: { mxn: 162500.51 } }] },
  { type: "education_goal", lines: [{ id: "target_amount", value: { udi: 50000.62, mxn: 441497.47 } }] },
  { type: "payout_options", lines: [{ id: "payout_mode", value: "Pago único o mensualidades" }, { id: "payout_duration", value: 48, unit: "months" }] },
  { type: "protection_summary", lines: [{ id: "death_benefit", value: "Meta educativa protegida" }, { id: "disability_waiver", value: "Exención de aportaciones con evidencia" }] },
  { type: "included_benefits", benefits: [{ name: "Administración del ahorro", description: "Con evidencia estructurada" }] },
  { type: "missing_information", missing: ["Confirmar forma final de entrega"] }
];

assert.equal(SEGUBECA_PRODUCT_TYPE, "segubeca");
assert.equal(formatSegubecaNumber(607685.9251110773), "607,686");
assert.equal(formatSegubecaAmount({ udi: 50000.62, mxn: 441497.47 }), "50,001 UDI · ≈ $441,497 MXN");
assert.equal(isSegubecaProduct({ product: "SeguBeca" }), true);
assert.equal(isSegubecaProduct({ product_type: "segubeca" }), true);
assert.equal(isSegubecaProduct({ benefitSummary }), true);
assert.equal(isSegubecaProduct({ product: "Vida Mujer" }), false);

const model = buildSegubecaDashboardModel(benefitSummary);
assert.equal(model.productType, "segubeca");
assert.equal(model.sections[0].title, "Resumen del plan");
assert.equal(model.sections.find((section) => section.kind === "participants").title, "Quiénes quedan protegidos");
assert.equal(model.sections.find((section) => section.kind === "participants").items[0].label, "Modalidad");
assert.equal(model.sections.find((section) => section.kind === "participants").items[0].value, "Mancomunado");
assert.equal(model.sections.find((section) => section.kind === "participants").items[1].label, "Asegurado principal");
assert.equal(model.sections.find((section) => section.kind === "participants").items[2].label, "Asegurado adicional");
assert.equal(model.sections.find((section) => section.kind === "participants").items[3].label, "Menor asociado");
assert.equal(model.sections.find((section) => section.kind === "education_goal").title, "Meta educativa");
assert.equal(model.sections.find((section) => section.kind === "payout").title, "Cómo se entrega");
assert.equal(model.sections.find((section) => section.kind === "contribution").items[0].value, "≈ $12,500 MXN");
assert.ok(model.missingInformation.includes("Confirmar forma final de entrega"));
assert.equal(model.missingInformation.includes("Falta estructura de participantes"), false);

const sparseModel = buildSegubecaDashboardModel([{ type: "education_goal", lines: [{ id: "target_amount", value: { mxn: 1000000 } }] }]);
assert.ok(sparseModel.missingInformation.includes("Falta estructura de participantes"));
assert.ok(sparseModel.missingInformation.includes("Falta forma de entrega con evidencia"));

const documentRef = createFakeDocument();
const dashboard = renderSegubecaDashboard(model, { documentRef });
assert.equal(dashboard.dataset.forgeProductType, "segubeca");
assert.equal(dashboard.dataset.forgeProductLayout, "segubeca_desktop_r14a");
assert.equal(dashboard.className, "fq-benefit-dashboard-107z15p2");
assert.ok(dashboard.children.some((child) => child.dataset.forgeProductSection === "education_goal"));
assert.ok(dashboard.children.some((child) => child.dataset.forgeProductSection === "participants"));
const recommendedModel = buildSegubecaDashboardModel([
  {
    type: "additional_coverages",
    benefits: [
      {
        name: "Cobertura de prueba",
        value: { udi: 1234.4 },
        fields: [
          { label: "Prima", value: { udi: 50.4 } }
        ]
      }
    ]
  }
]);
const recommendedSection = recommendedModel.sections.find((section) => section.kind === "additional_coverages");
assert.ok(recommendedSection);
assert.equal(recommendedSection.items[0].value.includes("[object Object]"), false);
assert.equal(recommendedSection.items[0].fields[0].value.includes("[object Object]"), false);

console.log("PASS SeguBeca product dashboard adapter R14A");
