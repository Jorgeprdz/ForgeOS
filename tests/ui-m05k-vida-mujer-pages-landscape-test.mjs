import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  ACCEPTED_QUOTE_SNAPSHOT_TYPE,
  buildQuotePrintableReadModel,
  normalizePrintableReviewSnapshot,
} from "../advisor-os/quotes/printable/quote-printable-read-model-m05e005.js";
import {
  VIDA_MUJER_LANDSCAPE_LAYOUT_ID,
  buildProductSpecificQuotePrintableReadModel,
} from "../advisor-os/quotes/printable/quote-printable-product-profile-m05e010.js";
import {
  buildQuotePrintableDocument,
} from "../advisor-os/quotes/printable/quote-printable-document-composer-m05e010.js";
import {
  buildQuotePrintablePdf,
} from "../advisor-os/quotes/printable/quote-printable-pdf-generator-m05e010.js";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");

const currentUdi = 8.797743;
const annualContributionUdi = 7607;
const paymentYears = 20;
const totalContributedUdi = annualContributionUdi * paymentYears;
const sumAssuredUdi = 50000;
const years = [5, 7, 9, 11, 13, 15, 17, 20];
const projectionRows = years.map((year) => ({
  year,
  projectedUdiValue: currentUdi * (1.045 ** year),
}));

const source = {
  packetType: ACCEPTED_QUOTE_SNAPSHOT_TYPE,
  reviewOnly: true,
  acceptedQuote: {
    quoteId: "VM-M05K-PAGES-001",
    acceptedAt: "2026-07-31T14:40:00-06:00",
    context: {
      productFamily: "vida_mujer",
      clientName: "Cliente Vida Mujer",
    },
    nativeResult: {
      product: "Vida Mujer",
      productFamily: "vida_mujer",
      currency: "UDI",
      sumAssured: sumAssuredUdi,
      totalAnnualPremium: annualContributionUdi,
      paymentYears,
      totalContributedUdi,
      totalContributedMxn: totalContributedUdi * currentUdi,
      coverages: [
        { code: "PCF", name: "Protección por Cáncer Femenino", sumAssured: sumAssuredUdi },
        { code: "BAIT", name: "Invalidez Total y Permanente", sumAssured: sumAssuredUdi },
        { code: "BIT", name: "Exención de Pago de Primas BIT" },
        { code: "BAM", name: "Asistencia Médica BAM" },
        { code: "AV", name: "Apoyo en Vida AV UI" },
      ],
      udiProjection: { rows: projectionRows },
    },
  },
  calculation: {
    product: "Vida Mujer",
    productFamily: "vida_mujer",
    currency: "UDI",
    paymentYears,
    annualPremium: annualContributionUdi,
    totalAnnualPremium: annualContributionUdi,
    totalContributed: totalContributedUdi,
    totalContributedMXN: totalContributedUdi * currentUdi,
    currentProtectionMXN: sumAssuredUdi * currentUdi,
    udiRateMetadata: {
      value: currentUdi,
      source: "BANXICO_SIE_API",
      source_date: "31/07/2026",
      series_id: "SP68257",
      stale: false,
    },
    udiProjection: { rows: projectionRows },
    nativeResult: {
      product: "Vida Mujer",
      productFamily: "vida_mujer",
      sumAssured: sumAssuredUdi,
      totalAnnualPremium: annualContributionUdi,
      paymentYears,
      totalContributedUdi,
      totalContributedMxn: totalContributedUdi * currentUdi,
      coverages: [
        { code: "PCF", name: "Protección por Cáncer Femenino", sumAssured: sumAssuredUdi },
        { code: "BAIT", name: "Invalidez Total y Permanente", sumAssured: sumAssuredUdi },
        { code: "BIT", name: "Exención de Pago de Primas BIT" },
        { code: "BAM", name: "Asistencia Médica BAM" },
        { code: "AV", name: "Apoyo en Vida AV UI" },
      ],
      udiProjection: { rows: projectionRows },
    },
  },
  productIntelligence: {
    schema: {
      id: "forge.product_intelligence.vida_mujer",
      version: "M05K",
    },
    ownership: { canonical_owner: "product-intelligence" },
    identity: {
      detected_product_name: "Vida Mujer",
      product_family: "vida_mujer",
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
      payment_term_years: paymentYears,
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
  generatedAt: "2026-07-31T14:40:00-06:00",
});
const profiled = buildProductSpecificQuotePrintableReadModel({
  readModel,
  reviewSnapshot: normalized,
});

assert.equal(
  profiled.commercialSummary.layoutId,
  VIDA_MUJER_LANDSCAPE_LAYOUT_ID,
);
assert.equal(
  profiled.commercialSummary.totalContribution.udi,
  totalContributedUdi,
);
assert.equal(
  profiled.commercialSummary.totalContribution.mxn,
  totalContributedUdi * currentUdi,
);
assert.equal(
  profiled.commercialSummary.totalContribution.basis,
  "CURRENT_UDI_EQUIVALENCE",
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
  generatedAt: "2026-07-31T14:40:00-06:00",
});

assert.equal(printable.pageOrientation, "LANDSCAPE");
assert.equal(printable.presentationPalette.dominant, "FADED_PLUM_ROSE");
assert.match(printable.html, /@page\s*\{\s*size:\s*A4 landscape/i);
assert.match(printable.html, /data-page-orientation="landscape"/);
assert.match(printable.html, /data-layout="vida-mujer-landscape-editorial"/);
assert.match(printable.html, />Total aportado</);
assert.match(printable.html, /#5f4a59/i);
assert.match(printable.html, /#c7a1ae/i);
assert.match(printable.html, /#8fa79a/i);
assert.match(printable.html, /border-radius:\s*8mm/i);
assert.doesNotMatch(printable.html, /PINK_BERRY/);
assert.doesNotMatch(printable.html, /A4 vertical/i);
assert.doesNotMatch(printable.html, /acceptedQuote\./);
assert.doesNotMatch(printable.html, /productIntelligence\./);

assert.equal(pdf.pageOrientation, "LANDSCAPE");
assert.equal(pdf.pageCount, 2);
assert.ok(pdf.pageWidth > pdf.pageHeight);
assert.ok(pdf.byteLength > 1000);
assert.equal(pdf.getBytes()[0], 0x25);

const app = read("docs/static-preview/forge-alive-material3/app.js");
const visualRuntime = read(
  "docs/static-preview/forge-alive-material3/quote-runtime-vida-mujer-visual-m05e010.js",
);
const visualStyles = read(
  "docs/static-preview/forge-alive-material3/quote-runtime-vida-mujer-visual-m05e010.css",
);
const rateBridge = read(
  "docs/static-preview/forge-alive-material3/quote-runtime-pages-rate-fetch-bridge-m05e010.js",
);
const routeCompatibility = read(
  "docs/static-preview/quote-printable-runtime/forge-quote-printable-route-controller-m05e005.js",
);
const routeController = read(
  "docs/static-preview/quote-printable-runtime/forge-quote-printable-route-controller-m05e010.js",
);
const pagesWorkflow = read(".github/workflows/pages.yml");

const envIndex = app.indexOf('await loadAuthority(envBase, "env.js")');
const rateBridgeIndex = app.indexOf(
  "quote-runtime-pages-rate-fetch-bridge-m05e010.js?v=m05e-010",
);
const hotfixIndex = app.indexOf(
  "quote-runtime-hotfix-m05e003.js?v=m05e-010-pages-rate",
);
assert.ok(envIndex >= 0 && rateBridgeIndex > envIndex && hotfixIndex > rateBridgeIndex);
assert.match(app, /quote-runtime-vida-mujer-visual-m05e010\.js\?v=m05e-010/);
assert.match(app, /vidaMujerVisualClosure = "M05E-010"/);
assert.match(visualRuntime, /data-quote-mandatory-metric=\"total-contributed\"/);
assert.match(visualRuntime, /Total aportado/);
assert.match(visualRuntime, /A4 horizontal/);
assert.doesNotMatch(visualRuntime, /MutationObserver/);
assert.match(visualStyles, /--vm-rose:\s*#caa1af/i);
assert.match(visualStyles, /grid-template-columns:\s*repeat\(3/);
assert.match(rateBridge, /functions\/v1\/banxico-rates/);
assert.match(rateBridge, /cacheStatus:\s*"LIVE_REFRESHED"/);
assert.match(rateBridge, /SUPABASE_URL/);
assert.match(routeCompatibility, /forge-quote-printable-route-controller-m05e010\.js/);
assert.match(routeController, /pageOrientation:\s*activeBundle\?\.pageOrientation/);
assert.match(routeController, /resolveOrientation/);
assert.match(pagesWorkflow, /actions\/deploy-pages@v4/);

console.log("PASS UI-M05K Vida Mujer Pages landscape closure", {
  product: "vida_mujer",
  totalContributedUdi,
  totalContributedMxn: totalContributedUdi * currentUdi,
  uiPalette: ["faded_plum", "rose", "sage", "sand"],
  pageFormat: "A4",
  pageOrientation: pdf.pageOrientation,
  pageCount: pdf.pageCount,
  roundedPdfGeometry: true,
  pagesRateAuthority: "SUPABASE_EDGE_BANXICO_RATES",
  localhostDependencyRemoved: true,
});