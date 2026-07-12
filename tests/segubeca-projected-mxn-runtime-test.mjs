import assert from "node:assert/strict";
import {
  DEFAULT_SAVINGS_UDI_GROWTH_RATE,
  SEGUBECA_UDI_GROWTH_RATE,
  SEGUBECA_MXN_INTEGRATION_VERSION,
  createForgeUdiMxnRuntime
} from "../docs/static-preview/quote-preview-live/forge-udi-mxn-runtime.js";

const verifiedRate = {
  cacheStatus: "CACHE_HIT",
  rates: {
    UDI_MXN: {
      value: 8.8,
      date: "2026-07-10",
      source: "BANXICO_SIE_API"
    }
  }
};

function makePacket() {
  const benefitSummary = {
    blocks: [
      { type: "summary_plan", lines: [{ id: "plan", label: "Plan", value: "SeguBeca 18" }] },
      { type: "participants", participants: { primary_insured: "Contratante sintético", child_or_education_beneficiary: "Menor sintético", participant_modality: "individual" } },
      { type: "contribution_summary", lines: [
        { id: "annual_premium", value: 2500, unit: "UDI" },
        { id: "annual_premium_with_recommended", value: 3000, unit: "UDI" },
        { id: "total_contributed", value: 30000, unit: "UDI" }
      ] },
      { type: "education_goal", lines: [{ id: "target_amount", value: { udi: 30000, mxn: null } }] },
      { type: "payout_options", lines: [
        { id: "monthly_payout", value: 637, unit: "UDI" },
        { id: "accumulated_delivery", value: 30588, unit: "UDI" }
      ] },
      { type: "protection_summary", benefits: [{ name: "Protección base", value: { udi: 30000, mxn: null }, fields: [{ label: "Prima", value: { udi: 80, mxn: null } }] }] },
      { type: "additional_coverages", benefits: [{ name: "Cobertura adicional", value: { udi: 100000, mxn: null }, fields: [{ label: "Prima", value: { udi: 420, mxn: null } }] }] },
      { type: "guaranteed_values", lines: [
        { id: "final_cash_value", value: 30000, unit: "UDI" },
        { id: "final_recovery", value: 30000, unit: "UDI" }
      ] }
    ]
  };

  return {
    product: "SeguBeca 18",
    productFamily: "segubeca",
    productType: "segubeca",
    paymentYears: 12,
    benefitSummary,
    nativeResult: {
      product: "SeguBeca 18",
      productFamily: "segubeca",
      productType: "segubeca",
      paymentYears: 12,
      baseCoverage: { coverageYears: 12, sumAssured: 30000, annualPremium: 2500 },
      coverages: [{ code: "PIM", sumAssured: 30000, annualPremium: 80 }],
      recommendedCoverages: [{ code: "ADAPTA", sumAssured: 100000, annualPremium: 420 }],
      guaranteedRows: [
        { policyYear: 1, annualPremium: 2500, accumulatedAnnualPremiumWithAve: 2500, cashValue: 0, totalRecovery: 0, basicSumAssured: 30000 },
        { policyYear: 12, annualPremium: 2500, accumulatedAnnualPremiumWithAve: 30000, cashValue: 30000, totalRecovery: 30000, basicSumAssured: 30000 }
      ],
      administrationRows: [
        { policyYear: 1, sumAssuredToAdminister: 30000, monthlyDelivery: 637, accumulatedDelivery: 7647, deathBenefit: 22819, cashValue: 24979 },
        { policyYear: 4, sumAssuredToAdminister: 7612, monthlyDelivery: 637, accumulatedDelivery: 30588, deathBenefit: 0, cashValue: 6702 }
      ],
      totalAnnualPremium: 2500,
      annualPremium: 2500,
      annualPremiumWithRecommended: 3000,
      totalContributed: 30000,
      sumAssured: 30000,
      sumInsured: 30000,
      monthlyDelivery: 637,
      accumulatedDelivery: 30588,
      totalRecovery: 30000,
      benefitSummary
    }
  };
}

function findLine(summary, type, id) {
  const block = summary.blocks.find((item) => item.type === type);
  return block?.lines?.find((line) => line.id === id) || null;
}

function finiteCoverageAmount(value) {
  if (value === null || value === undefined || value === "" || typeof value === "boolean") return null;
  const parsed = typeof value === "number"
    ? value
    : Number(String(value).replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}
function monetaryCoverage(root) {
  const stats = { monetary: 0, withMxn: 0, nativeScalarUdi: 0, objectUdi: 0, missingMxn: 0 };
  (function walk(node) {
    if (!node || typeof node !== "object") return;
    if (!Array.isArray(node) && Object.prototype.hasOwnProperty.call(node, "value")) {
      const value = node.value;
      const objectUdi = value && typeof value === "object" && !Array.isArray(value)
        ? finiteCoverageAmount(value.udi)
        : null;
      const scalarUdi = typeof node.unit === "string" && /\bUDI\b/i.test(node.unit)
        ? finiteCoverageAmount(value)
        : null;
      if (objectUdi !== null || scalarUdi !== null) {
        stats.monetary += 1;
        if (objectUdi !== null) stats.objectUdi += 1;
        else stats.nativeScalarUdi += 1;
        const mxn = objectUdi !== null
          ? finiteCoverageAmount(value.mxn)
          : finiteCoverageAmount(node.mxn);
        if (mxn !== null) stats.withMxn += 1;
        else stats.missingMxn += 1;
      }
    }
    for (const child of Object.values(node)) walk(child);
  })(root);
  stats.ratio = stats.monetary ? stats.withMxn / stats.monetary : 0;
  return stats;
}

assert.equal(DEFAULT_SAVINGS_UDI_GROWTH_RATE, 0.04, "No se cambia el default genérico de otros productos");
assert.equal(SEGUBECA_UDI_GROWTH_RATE, 0.045);

const original = makePacket();
const snapshot = structuredClone(original);
const runtime = createForgeUdiMxnRuntime({ rateProvider: async () => verifiedRate });
const enriched = await runtime.enrichAcceptedQuotePacket(original);

assert.deepEqual(original, snapshot, "El runtime no debe mutar el packet fuente");
assert.equal(enriched.mxnProjectionVersion, SEGUBECA_MXN_INTEGRATION_VERSION);
assert.equal(enriched.currencyDisplay, "UDI_AND_MXN");
assert.equal(enriched.udiProjection.status, "READY");
assert.equal(enriched.udiProjection.annualGrowthRate, 0.045);
assert.equal(enriched.udiProjection.rows.length, 15, "12 años de aportación + 4 de administración, sin duplicar el año de madurez");

const annualPremium = findLine(enriched.benefitSummary, "contribution_summary", "annual_premium").value;
assert.equal(annualPremium.policyYear, 1);
assert.equal(annualPremium.mxn, 22000);
assert.equal(annualPremium.calculationMode, "CURRENT_VERIFIED_UDI_RATE");

const target = findLine(enriched.benefitSummary, "education_goal", "target_amount").value;
assert.equal(target.policyYear, 12);
assert.ok(target.mxn > 30000 * 8.8, "La meta futura debe usar UDI proyectada, no conversión plana de hoy");
assert.equal(target.guaranteed, false);

const accumulated = findLine(enriched.benefitSummary, "payout_options", "accumulated_delivery").value;
assert.equal(accumulated.policyYear, 15);
assert.ok(accumulated.mxn > accumulated.udi * 8.8);

const total = findLine(enriched.benefitSummary, "contribution_summary", "total_contributed").value;
assert.equal(total.projectedContributionSchedule.length, 12);
assert.notEqual(total.mxn, Math.round(total.udi * 8.8 * 100) / 100, "Total aportado no puede convertirse con una sola UDI");
assert.equal(total.installmentDerivation, "TOTAL_SOURCE_UDI_DIVIDED_BY_SOURCE_PAYMENT_YEARS");

const coverage = monetaryCoverage(enriched.benefitSummary);
assert.ok(coverage.monetary >= 10, `Se esperaban al menos 10 importes; llegaron ${coverage.monetary}`);
assert.ok(coverage.ratio >= 0.95, `Cobertura MXN insuficiente: ${coverage.withMxn}/${coverage.monetary}`);
assert.equal(enriched.nativeResult.administrationRows.at(-1).projectionPolicyYear, 15);
assert.equal(enriched.nativeResult.totalContributedAmount.projectedContributionSchedule.length, 12);

const blockedRuntime = createForgeUdiMxnRuntime({ rateProvider: async () => null });
const blocked = await blockedRuntime.enrichAcceptedQuotePacket(makePacket());
const blockedTarget = findLine(blocked.benefitSummary, "education_goal", "target_amount").value;
assert.equal(blocked.mxnProjectionStatus, "BLOCKED_NO_VERIFIED_UDI_RATE");
assert.equal(blockedTarget.mxn, null);
assert.equal(blockedTarget.projectionStatus, "BLOCKED_NO_VERIFIED_UDI_RATE");

const lifePacket = { productFamily: "life", paymentYears: 10, benefitSummary: { blocks: [{ type: "test", lines: [{ id: "native", value: 50, unit: "UDI" }] }] }, nativeResult: {} };
const lifeOutput = await runtime.enrichAcceptedQuotePacket(lifePacket);
assert.deepEqual(lifeOutput.benefitSummary, lifePacket.benefitSummary, "R14J no debe reescribir summaries de otros productos");
assert.equal(lifeOutput.udiProjection.annualGrowthRate, 0.04);

console.log("PASS R14J SeguBeca projected MXN runtime", coverage);
