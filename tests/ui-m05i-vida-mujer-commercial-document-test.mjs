import assert from "node:assert/strict";
import fs from "node:fs";

import {
  ACCEPTED_QUOTE_SNAPSHOT_TYPE,
  buildQuotePrintableReadModel,
  normalizePrintableReviewSnapshot,
} from "../advisor-os/quotes/printable/quote-printable-read-model-m05e005.js";
import {
  VIDA_MUJER_LAYOUT_ID,
  buildProductSpecificQuotePrintableReadModel,
} from "../advisor-os/quotes/printable/quote-printable-product-profile-m05e008.js";
import {
  buildQuotePrintableDocument,
} from "../advisor-os/quotes/printable/quote-printable-document-composer-m05e008-pink.js";
import {
  buildQuotePrintablePdf,
} from "../advisor-os/quotes/printable/quote-printable-pdf-generator-m05e008.js";
import {
  PRODUCT_INTELLIGENCE_SCHEMA,
  enrichVidaMujerCalculation,
  enrichVidaMujerSnapshot,
} from "../docs/static-preview/forge-alive-material3/quote-runtime-vida-mujer-handoff-m05e009.js";
import {
  createQuoteResultSnapshot,
} from "../docs/static-preview/forge-alive-material3/quote-product-intelligence-presenter.js";

const currentUdi = 8.797743;
const sumAssuredUdi = 35000;
const annualContributionUdi = 2143.24;
const years = [5, 7, 9, 11, 13, 15, 17, 20];
const projectionRows = years.map((year) => ({
  year,
  projectedUdiValue: currentUdi * (1.045 ** year),
}));

const source = {
  packetType: ACCEPTED_QUOTE_SNAPSHOT_TYPE,
  reviewOnly: true,
  acceptedQuote: {
    quoteId: "VM-M05I-001",
    acceptedAt: "2026-07-31T11:54:00-06:00",
    context: {
      productFamily: "VIDA_MUJER",
      clientName: "Cliente Vida Mujer",
    },
    nativeResult: {
      product: "Vida Mujer",
      productFamily: "VIDA_MUJER",
      currency: "UDI",
      sumAssured: sumAssuredUdi,
      totalAnnualPremium: annualContributionUdi,
      paymentYears: 20,
      coverages: [
        {
          code: "VIDA_MUJER",
          name: "Vida Mujer",
          sumAssured: sumAssuredUdi,
          annualPremium: annualContributionUdi,
        },
        {
          code: "PCF",
          name: "Protección por Cáncer Femenino",
          sumAssured: sumAssuredUdi,
        },
        {
          code: "BAIT",
          name: "Invalidez Total y Permanente",
          sumAssured: sumAssuredUdi,
        },
        {
          code: "BIT",
          name: "Exención de Pago de Primas BIT",
        },
        {
          code: "BAM",
          name: "Asistencia Médica BAM",
        },
      ],
      recommendedCoverages: [
        { code: "PEP", name: "PEP recomendado", sumAssured: 35000 },
        { code: "CLP", name: "Cuidados a Largo Plazo recomendado", sumAssured: 35000 },
        { code: "ADAPTA", name: "ADAPTA recomendado", sumAssured: 35000 },
      ],
      udiProjection: {
        rows: projectionRows,
      },
    },
  },
  calculation: {
    product: "Vida Mujer",
    productFamily: "vida_mujer",
    currency: "UDI",
    paymentYears: 20,
    annualPremium: annualContributionUdi,
    currentProtectionMXN: sumAssuredUdi * currentUdi,
    totalContributed: annualContributionUdi * 20,
    totalContributedMXN: annualContributionUdi * 20 * currentUdi,
    udiRateMetadata: {
      value: currentUdi,
      source: "BANXICO_SIE_API",
      source_date: "31/07/2026",
      series_id: "SP68257",
      stale: false,
    },
    udiProjection: {
      rows: projectionRows,
    },
    nativeResult: {
      product: "Vida Mujer",
      productFamily: "VIDA_MUJER",
      currency: "UDI",
      sumAssured: sumAssuredUdi,
      totalAnnualPremium: annualContributionUdi,
      paymentYears: 20,
      coverages: [
        { code: "VIDA_MUJER", name: "Vida Mujer", sumAssured: sumAssuredUdi },
        { code: "PCF", name: "Protección por Cáncer Femenino", sumAssured: sumAssuredUdi },
        { code: "BAIT", name: "Invalidez Total y Permanente", sumAssured: sumAssuredUdi },
        { code: "BIT", name: "Exención de Pago de Primas BIT" },
        { code: "BAM", name: "Asistencia Médica BAM" },
      ],
      recommendedCoverages: [
        { code: "PEP", name: "PEP recomendado", sumAssured: 35000 },
        { code: "CLP", name: "Cuidados a Largo Plazo recomendado", sumAssured: 35000 },
        { code: "ADAPTA", name: "ADAPTA recomendado", sumAssured: 35000 },
      ],
      udiProjection: {
        rows: projectionRows,
      },
    },
  },
  productIntelligence: {
    schema: {
      id: "forge.product_intelligence.vida_mujer",
      version: "R9F3",
    },
    ownership: {
      canonical_owner: "product-intelligence",
    },
    identity: {
      detected_product_name: "Vida Mujer",
      currency: "UDI",
    },
    protection_summary: {
      basic_sum_assured: {
        value: sumAssuredUdi,
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
  generatedAt: "2026-07-31T11:54:00-06:00",
});
const profiled = buildProductSpecificQuotePrintableReadModel({
  readModel,
  reviewSnapshot: normalized,
});

assert.equal(profiled.productProfile.id, "VIDA_MUJER");
assert.equal(profiled.commercialSummary.layoutId, VIDA_MUJER_LAYOUT_ID);
assert.equal(profiled.commercialSummary.sumAssured.udi, sumAssuredUdi);
assert.equal(
  profiled.commercialSummary.sumAssured.mxn,
  sumAssuredUdi * currentUdi,
);
assert.equal(
  profiled.commercialSummary.annualContribution.udi,
  annualContributionUdi,
);
assert.equal(
  profiled.commercialSummary.annualContribution.mxn,
  annualContributionUdi * currentUdi,
);
assert.equal(profiled.commercialSummary.annualContribution.includesAve, false);
assert.deepEqual(
  profiled.commercialSummary.endowments.map((item) => item.policyYear),
  years,
);
assert.deepEqual(
  profiled.commercialSummary.endowments.map((item) => item.benefitUdi),
  [1750, 1750, 1750, 1750, 1750, 1750, 1750, 28000],
);
assert.equal(profiled.commercialSummary.survivalTotal.udi, 40250);
assert.equal(profiled.commercialSummary.pcfDiseases.length, 7);
assert.deepEqual(
  profiled.commercialSummary.protections.map((item) => item.id),
  ["pcf", "bait", "bit", "bam"],
);

const printable = buildQuotePrintableDocument({
  readModel: profiled,
  pageFormat: "A4",
  documentTitle: "Cotización Vida Mujer",
});
const pdf = buildQuotePrintablePdf({
  readModel: profiled,
  printableDocument: printable,
  title: "Cotización Vida Mujer",
  generatedAt: "2026-07-31T11:54:00-06:00",
});

assert.equal(printable.pageOrientation, "PORTRAIT");
assert.equal(printable.presentationPalette.dominant, "PINK_BERRY");
assert.match(printable.html, /data-layout="vida-mujer-protection-endowments"/);
assert.match(printable.html, /#702447/i);
assert.match(printable.html, /#c65383/i);
assert.match(printable.html, />Suma asegurada</);
assert.match(printable.html, />Aportación anual</);
assert.match(printable.html, />Dotales por supervivencia</);
assert.match(printable.html, /Total por supervivencia · 115%/);
assert.match(printable.html, /Beneficios PCF/);
assert.match(printable.html, /Protección por cáncer femenino/);
assert.match(printable.html, /Invalidez total y permanente/);
assert.doesNotMatch(printable.html, /PEP recomendado/);
assert.doesNotMatch(printable.html, /Cuidados a Largo Plazo recomendado/);
assert.doesNotMatch(printable.html, /ADAPTA recomendado/);
assert.doesNotMatch(printable.html, /acceptedQuote\./);
assert.doesNotMatch(printable.html, /productIntelligence\./);
assert.doesNotMatch(printable.html, /#07172d/i);

assert.equal(pdf.pageCount, 2);
assert.equal(pdf.pageOrientation, "PORTRAIT");
assert.ok(pdf.pageWidth < pdf.pageHeight);
assert.ok(pdf.byteLength > 1000);
assert.equal(pdf.getBytes()[0], 0x25);

// Device regression: this is the real browser packet shape shown in the
// rejected Samsung Browser acceptance. It intentionally begins as generic
// `life` and without Product Intelligence.
const realCandidate = {
  schemaVersion: "forge.accepted_quote_packet.v1",
  source: "browser_pdf_parser",
  extractionVersion: "107z15p2_R11E",
  family: "life",
  productFamily: "life",
  product_family: "life",
  product: "Vida Mujer",
  sumAssured: 50000,
  sumInsured: 50000,
  annualPremium: 3062,
  paymentYears: 20,
  coveragePeriod: "20 años",
  context: {
    family: "life",
    productFamily: "life",
    product_family: "life",
    product: "Vida Mujer",
  },
  currencyMetadata: {
    value: currentUdi,
    currentUdiValue: currentUdi,
    source: "BANXICO_SIE_API",
    source_date: "10/08/2026",
    series_id: "SP68257",
    stale: false,
  },
  nativeResult: {
    source: "browser_pdf_parser",
    extractionVersion: "107z15p2_R11E",
    product: "Vida Mujer",
    productFamily: "life",
    product_family: "life",
    currency: "UDI",
    sumAssured: 50000,
    sumInsured: 50000,
    basicSumAssured: 50000,
    totalAnnualPremium: 3062,
    annualPremium: 3062,
    paymentYears: 20,
    policyTerm: "20 años",
    coveragePeriod: "20 años",
    coverages: [
      { code: "BAM", label: "BAM UI" },
      { code: "BAIT", label: "BAIT 60 P", sumAssured: 50000 },
      { code: "AV", label: "AV UI" },
      { code: "BIT", label: "BIT 60 P" },
      { code: "PCF", label: "PCF A", sumAssured: 50000 },
    ],
    recommendedCoverages: [
      { code: "PEP", label: "PEP A", sumAssured: 50000 },
      { code: "CLP", label: "CLP", sumAssured: 50000 },
      { code: "ADAPTA", label: "ADAPTA", sumAssured: 50000 },
    ],
    guaranteedValues: [
      {
        year: 20,
        annualPremiumAccumulatedWithAve: 61240,
        aveSurrenderValue: 8800,
        cashValue: 0,
        recoveryTotal: 66300,
        sumAssured: 50000,
      },
    ],
    currencyMetadata: {
      value: currentUdi,
      currentUdiValue: currentUdi,
      source: "BANXICO_SIE_API",
      source_date: "10/08/2026",
      series_id: "SP68257",
      stale: false,
    },
  },
};

const rawDeviceCalculation = {
  product: "Vida Mujer",
  productFamily: "life",
  product_family: "life",
  productIntelligence: null,
  currency: "UDI",
  annualPremium: 3062,
  paymentYears: 20,
  currentProtectionMXN: 50000 * currentUdi,
  totalContributed: 61240,
  totalContributedMXN: 61240 * currentUdi,
  udiRateMetadata: realCandidate.currencyMetadata,
  nativeResult: realCandidate.nativeResult,
};

const enrichedDeviceCalculation = enrichVidaMujerCalculation(
  realCandidate,
  rawDeviceCalculation,
);

assert.equal(realCandidate.productFamily, "life");
assert.equal(rawDeviceCalculation.productIntelligence, null);
assert.equal(enrichedDeviceCalculation.productFamily, "vida_mujer");
assert.equal(
  enrichedDeviceCalculation.productIntelligence.schema.id,
  PRODUCT_INTELLIGENCE_SCHEMA,
);
assert.equal(
  enrichedDeviceCalculation.productIntelligence.protection_summary
    .basic_sum_assured.value,
  50000,
);
assert.equal(
  enrichedDeviceCalculation.productIntelligence.premium_structure
    .total_annual_premium.value,
  3062,
);
assert.ok(enrichedDeviceCalculation.benefitSummary.length >= 4);

const deviceUiSnapshot = createQuoteResultSnapshot({
  packet: realCandidate,
  calculation: enrichedDeviceCalculation,
});
assert.equal(deviceUiSnapshot.identity.family, "vida_mujer");
assert.equal(deviceUiSnapshot.dashboard.type, "vida_mujer");
assert.ok(deviceUiSnapshot.dashboard.model.sections.length >= 4);
assert.ok(
  deviceUiSnapshot.dashboard.model.sections.some(
    (section) => section.kind === "scheduled_endowments",
  ),
);
assert.ok(
  deviceUiSnapshot.dashboard.model.sections.some(
    (section) => section.kind === "women_health_benefits",
  ),
);
assert.equal(
  deviceUiSnapshot.productIntelligence.schema.id,
  PRODUCT_INTELLIGENCE_SCHEMA,
);

const brokenDeviceSnapshot = {
  packetType: ACCEPTED_QUOTE_SNAPSHOT_TYPE,
  reviewOnly: true,
  acceptedQuote: realCandidate,
  calculation: rawDeviceCalculation,
  productIntelligence: null,
};
const repairedDeviceSnapshot = enrichVidaMujerSnapshot(
  brokenDeviceSnapshot,
  realCandidate,
);
assert.equal(
  repairedDeviceSnapshot.productIntelligence.schema.id,
  PRODUCT_INTELLIGENCE_SCHEMA,
);
assert.equal(
  repairedDeviceSnapshot.acceptedQuote.context.productFamily,
  "vida_mujer",
);

const repairedNormalized = normalizePrintableReviewSnapshot(
  repairedDeviceSnapshot,
);
const repairedReadModel = buildQuotePrintableReadModel({
  reviewSnapshot: repairedNormalized,
  generatedAt: "2026-07-31T12:35:00-06:00",
});
const repairedProfiled = buildProductSpecificQuotePrintableReadModel({
  readModel: repairedReadModel,
  reviewSnapshot: repairedNormalized,
});
const repairedPrintable = buildQuotePrintableDocument({
  readModel: repairedProfiled,
  pageFormat: "A4",
  documentTitle: "Cotización Vida Mujer",
});
const repairedPdf = buildQuotePrintablePdf({
  readModel: repairedProfiled,
  printableDocument: repairedPrintable,
  title: "Cotización Vida Mujer",
  generatedAt: "2026-07-31T12:35:00-06:00",
});

assert.equal(repairedProfiled.productProfile.id, "VIDA_MUJER");
assert.equal(repairedProfiled.commercialSummary.sumAssured.udi, 50000);
assert.equal(repairedProfiled.commercialSummary.annualContribution.udi, 3062);
assert.equal(repairedProfiled.commercialSummary.protections.length, 5);
assert.equal(repairedProfiled.commercialSummary.pcfDiseases.length, 7);
assert.equal(repairedPdf.pageCount, 2);
assert.equal(repairedPdf.pageOrientation, "PORTRAIT");
assert.match(repairedPrintable.html, /#702447/i);
assert.doesNotMatch(
  repairedPrintable.html,
  /Accepted quote, calculation and Product Intelligence are required/,
);

const runtimeController = fs.readFileSync(
  new URL(
    "../docs/static-preview/quote-printable-runtime/forge-quote-printable-route-controller-m05e005.js",
    import.meta.url,
  ),
  "utf8",
);
const productiveApp = fs.readFileSync(
  new URL(
    "../docs/static-preview/forge-alive-material3/app.js",
    import.meta.url,
  ),
  "utf8",
);
assert.match(runtimeController, /m05e008/);
assert.match(productiveApp, /quote-runtime-vida-mujer-handoff-m05e009/);

console.log("PASS UI-M05I Vida Mujer pink commercial document", {
  layout: VIDA_MUJER_LAYOUT_ID,
  palette: printable.presentationPalette,
  pageCount: pdf.pageCount,
  sumAssured: [
    profiled.commercialSummary.sumAssured.udi,
    profiled.commercialSummary.sumAssured.mxn,
  ],
  annualContribution: [
    profiled.commercialSummary.annualContribution.udi,
    profiled.commercialSummary.annualContribution.mxn,
  ],
  endowments: profiled.commercialSummary.endowments.map((item) => ({
    year: item.policyYear,
    percentage: item.percentage,
    udi: item.benefitUdi,
    mxn: item.benefitMxn,
  })),
  survivalTotalUdi: profiled.commercialSummary.survivalTotal.udi,
  contractedProtectionOnly: true,
  recommendedCoveragesExcluded: true,
  realPacketFamilyPromoted: enrichedDeviceCalculation.productFamily,
  realPacketDashboardSections:
    deviceUiSnapshot.dashboard.model.sections.length,
  realPacketPrintableReady: repairedPdf.pageCount === 2,
});
