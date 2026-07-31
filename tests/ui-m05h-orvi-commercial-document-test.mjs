import assert from "node:assert/strict";

import {
  ACCEPTED_QUOTE_SNAPSHOT_TYPE,
  buildQuotePrintableReadModel,
  normalizePrintableReviewSnapshot,
} from "../advisor-os/quotes/printable/quote-printable-read-model-m05e005.js";
import {
  LAYOUT_ID,
  buildProductSpecificQuotePrintableReadModel,
} from "../advisor-os/quotes/printable/quote-printable-product-profile-m05e007.js";
import {
  buildQuotePrintableDocument,
} from "../advisor-os/quotes/printable/quote-printable-document-composer-m05e007.js";
import {
  buildQuotePrintablePdf,
} from "../advisor-os/quotes/printable/quote-printable-pdf-generator-m05e007.js";

const rate = 8.797743;
const annualContributionUdi = 2443.63;
const source = {
  packetType: ACCEPTED_QUOTE_SNAPSHOT_TYPE,
  reviewOnly: true,
  acceptedQuote: {
    quoteId: "ORVI-M05H-001",
    acceptedAt: "2026-07-31T11:14:00-06:00",
    context: {
      productFamily: "ORVI",
      clientName: "Cliente ORVI",
    },
  },
  calculation: {
    product: "ORVI 99-20 PAGOS UDIS",
    productFamily: "ORVI",
    currency: "UDI",
    paymentYears: 20,
    annualPremium: annualContributionUdi,
    currentProtectionMXN: 791796.87,
    totalContributed: 58880,
    totalContributedMXN: 518011.11,
    totalRecovery: 52708,
    totalRecoveryMXN: 463711.44,
    orviRateMetadata: {
      value: rate,
      source: "BANXICO_SIE_API",
      source_date: "31/07/2026",
      series_id: "SP68257",
      stale: false,
    },
    orviDashboardViewModel: {
      view_model_id: "orvi.dashboard.dynamic-protection-recovery-view-model.v1",
      payment_term_years: 20,
      views: {
        protection: {
          source_sum_assured: {
            value: 90000,
            currency: "UDI",
          },
          current_mxn_equivalence: {
            value: 791796.87,
            currency: "MXN",
          },
          future_checkpoint_scenarios: [
            {
              policy_year: 20,
              projected_sum_assured_mxn: {
                value: 1906307.13,
                currency: "MXN",
              },
              annual_growth_rate: 0.045,
              status: "PROJECTED_NOT_GUARANTEED",
            },
            {
              policy_year: 25,
              projected_sum_assured_mxn: {
                value: 2378859.64,
                currency: "MXN",
              },
              annual_growth_rate: 0.045,
              status: "PROJECTED_NOT_GUARANTEED",
            },
            {
              policy_year: 30,
              projected_sum_assured_mxn: {
                value: 2968588.13,
                currency: "MXN",
              },
              annual_growth_rate: 0.045,
              status: "PROJECTED_NOT_GUARANTEED",
            },
          ],
        },
        guaranteed_recovery: {
          exact_checkpoint_years: [20, 25, 30],
          checkpoints: [
            {
              policy_year: 20,
              source_currency: {
                total_recovery: { value: 52708, currency: "UDI" },
              },
              current_mxn: {
                total_recovery: { value: 463711.44, currency: "MXN" },
              },
              future_mxn: {
                total_recovery: { value: 1116360.25, currency: "MXN" },
                status: "PROJECTED_NOT_GUARANTEED",
              },
            },
            {
              policy_year: 25,
              source_currency: {
                total_recovery: { value: 58590, currency: "UDI" },
              },
              current_mxn: {
                total_recovery: { value: 515453.74, currency: "MXN" },
              },
              future_mxn: {
                total_recovery: { value: 1548499.61, currency: "MXN" },
                status: "PROJECTED_NOT_GUARANTEED",
              },
            },
            {
              policy_year: 30,
              source_currency: {
                total_recovery: { value: 64687, currency: "UDI" },
              },
              current_mxn: {
                total_recovery: { value: 569087.27, currency: "MXN" },
              },
              future_mxn: {
                total_recovery: { value: 2134223.58, currency: "MXN" },
                status: "PROJECTED_NOT_GUARANTEED",
              },
            },
          ],
        },
      },
    },
  },
  productIntelligence: {
    schema: {
      id: "forge.product_intelligence.orvi",
      version: "R15A",
    },
    ownership: {
      canonical_owner: "product-intelligence",
    },
    identity: {
      detected_product_name: "ORVI 99-20 PAGOS UDIS",
      currency: "UDI",
    },
    protection_summary: {
      basic_sum_assured: {
        value: 90000,
        currency: "UDI",
        truth_status: "source_provided",
      },
    },
    premium_structure: {
      payment_term_years: 20,
      total_annual_premium: {
        value: annualContributionUdi,
        currency: "UDI",
        truth_status: "source_provided",
      },
    },
  },
};

const normalized = normalizePrintableReviewSnapshot(source);
const readModel = buildQuotePrintableReadModel({
  reviewSnapshot: normalized,
  generatedAt: "2026-07-31T11:14:00-06:00",
});
const profiled = buildProductSpecificQuotePrintableReadModel({
  readModel,
  reviewSnapshot: normalized,
});

assert.equal(profiled.productProfile.id, "ORVI");
assert.equal(profiled.commercialSummary.layoutId, LAYOUT_ID);
assert.equal(profiled.commercialSummary.sumAssured.udi, 90000);
assert.equal(profiled.commercialSummary.sumAssured.mxn, 791796.87);
assert.equal(
  profiled.commercialSummary.annualContribution.mxn,
  annualContributionUdi * rate,
);
assert.deepEqual(
  profiled.commercialSummary.checkpoints.map((item) => item.policyYear),
  [20, 25, 30],
);
assert.deepEqual(
  profiled.commercialSummary.checkpoints.map((item) => item.recoveryUdi),
  [52708, 58590, 64687],
);
assert.deepEqual(
  profiled.commercialSummary.checkpoints.map((item) => item.sumAssuredUdi),
  [90000, 90000, 90000],
);

const printable = buildQuotePrintableDocument({
  readModel: profiled,
  pageFormat: "A4",
  documentTitle: "Cotización ORVI",
});
const pdf = buildQuotePrintablePdf({
  readModel: profiled,
  printableDocument: printable,
  title: "Cotización ORVI",
  generatedAt: "2026-07-31T11:14:00-06:00",
});

assert.equal(printable.pageOrientation, "PORTRAIT");
assert.match(printable.html, /data-layout="orvi-commercial-three-blocks"/);
assert.match(printable.html, />Suma asegurada</);
assert.match(printable.html, />Aportación anual</);
assert.match(printable.html, />Recuperación y suma asegurada</);
assert.match(printable.html, /Recuperación UDI/);
assert.match(printable.html, /Recuperación MXN/);
assert.match(printable.html, /Suma asegurada UDI/);
assert.match(printable.html, /Suma asegurada MXN/);
assert.doesNotMatch(printable.html, /Fuentes del documento/);
assert.doesNotMatch(printable.html, /acceptedQuote\./);
assert.doesNotMatch(printable.html, /productIntelligence\./);
assert.doesNotMatch(printable.html, /dato confirmado/);
assert.doesNotMatch(printable.html, /Prima anual básica/);
assert.doesNotMatch(printable.html, /Prima anual total con AVE/);
assert.doesNotMatch(printable.html, /Ingreso mensual/);

assert.equal(pdf.pageCount, 2);
assert.equal(pdf.pageOrientation, "PORTRAIT");
assert.ok(pdf.pageWidth < pdf.pageHeight);
assert.ok(pdf.byteLength > 1000);
assert.equal(pdf.getBytes()[0], 0x25);

console.log("PASS UI-M05H concise ORVI commercial document", {
  layout: LAYOUT_ID,
  pageCount: pdf.pageCount,
  sumAssured: [
    profiled.commercialSummary.sumAssured.udi,
    profiled.commercialSummary.sumAssured.mxn,
  ],
  annualContribution: [
    profiled.commercialSummary.annualContribution.udi,
    profiled.commercialSummary.annualContribution.mxn,
  ],
  checkpoints: profiled.commercialSummary.checkpoints.map((item) => ({
    year: item.policyYear,
    recoveryUdi: item.recoveryUdi,
    recoveryMxn: item.recoveryMxn,
    sumAssuredUdi: item.sumAssuredUdi,
    sumAssuredMxn: item.sumAssuredMxn,
  })),
  rawTraceabilityHiddenFromClientDocument: true,
});
