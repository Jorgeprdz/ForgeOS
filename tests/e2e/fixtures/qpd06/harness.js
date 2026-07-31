const reviewSnapshot = Object.freeze({
  packetType: "ACCEPTED_QUOTE_AND_CALCULATION_REVIEW_SNAPSHOT",
  reviewOnly: true,
  acceptedQuote: {
    quoteId: "quote-qpd06-browser",
    acceptedAt: "2026-07-30T18:00:00-06:00",
    client: { fullName: "Cliente QPD Browser" },
    advisor: { name: "Jorge Palacios" },
    context: { productFamily: "ORVI" },
    nativeResult: {
      product: "ORVI 10 PAY USD",
      productFamily: "ORVI",
    },
    source: {
      pdfSha256:
        "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    },
  },
  calculation: {
    product: "ORVI 10 PAY USD",
    productFamily: "ORVI",
    plan: "ORVI 10 PAY",
    currency: "USD",
    paymentMode: "Anual",
    paymentYears: 10,
    coveragePeriod: "10 años",
    sumInsured: 1000000,
    annualPremium: 12000,
    totalAnnualPremium: 14000,
    totalContributed: 100000,
    totalRecovery: 154000,
    monthlyIncomeMXN: 23100,
    calculatedAt: "2026-07-30T17:55:00-06:00",
  },
  productIntelligence: {
    schema: {
      id: "forge.product_intelligence.orvi",
      version: "1.0.0",
    },
    identity: {
      detected_product_name: "ORVI 10 PAY USD",
    },
    protection_summary: {
      basic_sum_assured: {
        value: 1000000,
        currency: "USD",
        truth_status: "source_provided",
      },
    },
    premium_structure: {
      payment_term_years: 10,
      basic_annual_premium: {
        value: 12000,
        currency: "USD",
        truth_status: "source_provided",
      },
      total_annual_premium: {
        value: 14000,
        currency: "USD",
        truth_status: "source_provided",
      },
    },
    provenance: {
      source_date: "2026-07-30",
    },
  },
  authority: {
    numericTruthOwner: "QUOTE_SOURCE_AND_PRODUCT_INTELLIGENCE",
    finalAuthority: "HUMAN",
  },
  safety: {
    exportEnabled: false,
    sendable: false,
    crmMutationAllowed: false,
    quoteMutationAllowed: false,
    rawPdfAllowed: false,
  },
});

const lifecycleReceipt = Object.freeze({
  status: "PERSISTED",
  durable: true,
  quoteReference: "quote:11111111-1111-4111-8111-111111111111",
  quoteVersionReference:
    "quote-version:22222222-2222-4222-8222-222222222222",
  prospectReference: "33333333-3333-4333-8333-333333333333",
  productReference: "product:orvi-10-pay-usd",
  snapshotDigest:
    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
});

globalThis.ForgeAcceptedQuoteBridge = Object.freeze({
  getAcceptedQuoteReviewSnapshot() {
    return reviewSnapshot;
  },
});

globalThis.ForgeQuoteLifecycleBrowserBridgeCartera001B = Object.freeze({
  async captureCurrentAcceptedQuote() {
    globalThis.dispatchEvent(
      new CustomEvent("forge:quote-lifecycle-persisted", {
        detail: lifecycleReceipt,
      }),
    );
    return lifecycleReceipt;
  },
});

await import(
  "/docs/static-preview/forge-alive/forge-quote-printable-entrypoint-qpd06.js?v=qpd06-e2e"
);

globalThis.ForgeQuotePrintableEntrypointQPD06?.refresh?.();
globalThis.dispatchEvent(
  new CustomEvent("forge:accepted-quote-confirmed", {
    detail: {
      accepted: true,
      automatic: false,
    },
  }),
);

document.documentElement.dataset.qpd06HarnessReady = "true";
