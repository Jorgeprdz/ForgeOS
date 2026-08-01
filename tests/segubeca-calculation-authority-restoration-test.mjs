import assert from "node:assert/strict";
import test from "node:test";

import {
  AUTHORITY,
  AUTHORITY_VERSION,
  CONTRACTUAL_VALUE_AUTHORITY,
  CURRENCY_PROJECTION_AUTHORITY,
  SEGUBECA_UDI_GROWTH_RATE,
  calculateFromAcceptedPacket,
  calculateFromPdfText,
} from "../advisor-os/quotes/products/segubeca/segubeca-calculation-authority.js";

const proposalText = `
UDI SeguBeca 18
Titular Menor Prueba No 25/06/2022 4 4 Masculino No
Contratante Contratante Prueba No 29/09/1992 33 31 Masculino No
SeguBeca 18 (SeguBeca 18) 14 años 30,000 2,284.33
Protección por Fallecimiento e Invalidez del Contratante (PIM 18 CT UI) 14 años Amparado 73.06
Cobertura de Protección Absoluta (CPA) 14 años 30,000 166.80
Beneficio de Asistencia Médica (BAM) 1 REN Amparado SIN COSTO
Prima Total Anual 2,524.19
ADAPTA (ADAPTA) 5 REN 100,000 418.73
Beneficio por Muerte Accidental (BMA) 14 años 100,000 137.17
Prima total con beneficios recomendados 3,080.09
0.00 % 4 2,524 2,524 0 0 0 2,284
84.89 % 17 2,524 35,339 0 30,000 30,000 30,000
La tasa de interes para entrega mensual es estimada a 1.0% anual vigente al momento de la cotización.
1 18 30,000 637 7,647 22,819 24,979
2 19 22,612 637 15,294 15,288 19,353
3 20 15,149 637 22,941 7,682 13,362
4 21 7,612 637 30,588 - 6,702
Todas las cantidades están expresadas en Unidades de Inversión (UDI).
`;

const verifiedRate = Object.freeze({
  cacheStatus: "CACHE_HIT",
  rates: Object.freeze({
    UDI_MXN: Object.freeze({
      value: 8.8,
      date: "2026-07-10",
      source: "BANXICO_SIE_API",
      seriesId: "SP68257",
    }),
  }),
});

const rateProvider = async () => verifiedRate;

test("promotes the accepted historical SeguBeca authorities without rebuilding product values", async () => {
  const result = await calculateFromPdfText(proposalText, {
    fileName: "synthetic-segubeca.pdf",
    rateProvider,
  });

  assert.equal(result.authorityVersion, AUTHORITY_VERSION);
  assert.equal(result.authority, AUTHORITY);
  assert.equal(result.contractualValueAuthority, CONTRACTUAL_VALUE_AUTHORITY);
  assert.equal(result.currencyProjectionAuthority, CURRENCY_PROJECTION_AUTHORITY);
  assert.equal(result.productCalculationReimplemented, false);

  assert.equal(result.sourceFacts.productFamily, "segubeca");
  assert.equal(result.sourceFacts.paymentYears, 14);
  assert.equal(result.sourceFacts.annualPremiumUdi, 2524.19);
  assert.equal(result.sourceFacts.annualPremiumWithRecommendedUdi, 3080.09);
  assert.equal(
    result.sourceFacts.totalContributedUdi,
    35339,
    "The source guaranteed table wins over annualPremium × years",
  );
  assert.equal(result.sourceFacts.totalRecoveryUdi, 30000);
  assert.equal(result.sourceFacts.sumAssuredUdi, 30000);
  assert.equal(result.sourceFacts.administrationRows.length, 4);
  assert.equal(result.sourceFacts.guaranteedRows.length, 2);

  assert.equal(result.boundaries.premiumRecalculated, false);
  assert.equal(result.boundaries.sumAssuredRecalculated, false);
  assert.equal(result.boundaries.guaranteedTableRecalculated, false);
  assert.equal(result.boundaries.administrationTableRecalculated, false);
  assert.equal(result.boundaries.flatTotalContributionConversionAuthorized, false);
  assert.equal(result.boundaries.projectionGuaranteed, false);
});

test("uses verified UDI and the accepted 4.5% year-aware projection", async () => {
  const result = await calculateFromPdfText(proposalText, { rateProvider });
  const projection = result.projection;

  assert.equal(SEGUBECA_UDI_GROWTH_RATE, 0.045);
  assert.equal(projection.status, "READY");
  assert.equal(projection.annualUdiGrowthRate, 0.045);
  assert.equal(projection.guaranteed, false);

  assert.equal(projection.educationTarget.udi, 30000);
  assert.equal(projection.educationTarget.policyYear, 14);
  assert.ok(projection.educationTarget.mxn > 30000 * 8.8);

  assert.equal(projection.monthlyDelivery.udi, 637);
  assert.equal(projection.monthlyDelivery.policyYear, 14);

  assert.equal(projection.accumulatedDelivery.udi, 30588);
  assert.equal(projection.accumulatedDelivery.policyYear, 17);

  assert.equal(projection.totalContributed.udi, 35339);
  assert.equal(projection.totalContributed.projectedContributionSchedule.length, 14);
  assert.equal(
    projection.totalContributed.installmentDerivation,
    "TOTAL_SOURCE_UDI_DIVIDED_BY_SOURCE_PAYMENT_YEARS",
  );
  assert.notEqual(
    projection.totalContributed.mxn,
    Math.round(35339 * 8.8 * 100) / 100,
    "Total contributed must not use one flat current UDI conversion",
  );
  assert.equal(projection.legacyCurrentRateFields.authoritative, false);
});

test("fails closed when no verified UDI rate exists", async () => {
  const result = await calculateFromPdfText(proposalText, {
    rateProvider: async () => null,
  });

  assert.equal(result.projection.status, "BLOCKED_NO_VERIFIED_UDI_RATE");
  assert.equal(result.projection.educationTarget.mxn, null);
  assert.equal(result.projection.totalContributed.mxn, null);
  assert.equal(result.projection.guaranteed, false);
});

test("rejects packets that do not come from the accepted SeguBeca PDF authority", async () => {
  await assert.rejects(
    () => calculateFromAcceptedPacket({
      productFamily: "segubeca",
      source: "manual",
      nativeResult: { productFamily: "segubeca", source: "manual" },
    }, { rateProvider }),
    /SEGUBECA_SOLUCIONLINE_SOURCE_AUTHORITY_REQUIRED/,
  );

  await assert.rejects(
    () => calculateFromAcceptedPacket({
      productFamily: "vida",
      source: "browser_pdf_parser",
      nativeResult: { productFamily: "vida", source: "browser_pdf_parser" },
    }, { rateProvider }),
    /SEGUBECA_PRODUCT_IDENTITY_REQUIRED/,
  );
});
