import assert from "node:assert/strict";

import {
  ACCEPTED_QUOTE_SNAPSHOT_TYPE,
  buildQuotePrintableReadModel,
} from "../printable/quote-printable-read-model.js";
import {
  PRODUCT_PROFILE_TYPE,
  PROFILED_READ_MODEL_CONTRACT_VERSION,
  buildProductSpecificQuotePrintableDocument,
  buildProductSpecificQuotePrintableReadModel,
} from "../printable/quote-printable-product-profile.js";
import {
  buildQuotePrintablePdf,
} from "../printable/quote-printable-pdf-generator.js";

const pass = (number, message) =>
  console.log(`PASS ${number} - ${message}`);

function snapshot({
  family,
  product,
  currency = "MXN",
  calculation = {},
  acceptedQuote = {},
  productIntelligence = {},
} = {}) {
  return {
    packetType: ACCEPTED_QUOTE_SNAPSHOT_TYPE,
    reviewOnly: true,
    acceptedQuote: {
      quoteId: `quote-${String(family).toLowerCase()}`,
      acceptedAt: "2026-07-30T18:00:00-06:00",
      client: { fullName: "Cliente de prueba" },
      advisor: { name: "Jorge Palacios" },
      context: { productFamily: family },
      nativeResult: {
        product,
        productFamily: family,
      },
      ...acceptedQuote,
    },
    calculation: {
      product,
      productFamily: family,
      plan: `${product} plan`,
      currency,
      paymentMode: "Anual",
      paymentYears: 10,
      coveragePeriod: "10 años",
      sumInsured: 1000000,
      annualPremium: 12000,
      totalAnnualPremium: 14000,
      calculatedAt: "2026-07-30T17:55:00-06:00",
      ...calculation,
    },
    productIntelligence: {
      schema: {
        id: `forge.product_intelligence.${String(family).toLowerCase()}`,
        version: "1.0.0",
      },
      identity: {
        detected_product_name: product,
      },
      protection_summary: {
        basic_sum_assured: {
          value: 1000000,
          currency,
          truth_status: "source_provided",
        },
      },
      premium_structure: {
        payment_term_years: 10,
        basic_annual_premium: {
          value: 12000,
          currency,
          truth_status: "source_provided",
        },
        total_annual_premium: {
          value: 14000,
          currency,
          truth_status: "source_provided",
        },
      },
      provenance: {
        source_date: "2026-07-30",
      },
      ...productIntelligence,
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
  };
}

function profile(input) {
  const readModel = buildQuotePrintableReadModel({
    reviewSnapshot: input,
    generatedAt: "2026-07-30T18:05:00-06:00",
  });
  return buildProductSpecificQuotePrintableReadModel({
    readModel,
    reviewSnapshot: input,
  });
}

function sectionIds(model) {
  return model.sections.map((section) => section.id);
}

function field(model, fieldId) {
  return model.sections
    .flatMap((section) => section.fields)
    .find((item) => item.id === fieldId);
}

const orviSnapshot = snapshot({
  family: "ORVI",
  product: "ORVI 10 PAY USD",
  currency: "USD",
  calculation: {
    totalContributed: 100000,
    totalContributedMXN: 1800000,
    totalRecovery: 154000,
    totalRecoveryMXN: 2772000,
    monthlyIncomeMXN: 23100,
    annualIncomeMXN: 277200,
    exchangeRate: {
      value: 18,
      currency: "MXN/USD",
      truth_status: "source_provided",
    },
  },
});
const orvi = profile(orviSnapshot);
assert.equal(orvi.productProfile.packetType, PRODUCT_PROFILE_TYPE);
assert.equal(orvi.productProfile.id, "ORVI");
assert.equal(orvi.contractVersion, PROFILED_READ_MODEL_CONTRACT_VERSION);
pass(1, "ORVI is detected and receives a governed product profile");

assert.deepEqual(sectionIds(orvi), [
  "identity",
  "terms",
  "protection",
  "premiums",
  "projections",
  "evidence",
]);
assert.equal(orvi.sections[4].title, "Recuperación e ingreso proyectado");
assert.equal(field(orvi, "udi_value"), undefined);
pass(2, "ORVI keeps life, contribution and recovery sections without UDI noise");

const imagina = profile(snapshot({
  family: "imagina_ser",
  product: "Imagina Ser",
  calculation: {
    annualPremiumWithAve: 18000,
    annualAvePremium: 4000,
    totalContributed: 180000,
    totalRecovery: 245000,
    interestRate: "4% ilustrativo",
  },
}));
assert.equal(imagina.productProfile.id, "IMAGINA_SER");
assert.equal(field(imagina, "annual_premium_with_ave").value, 18000);
assert.equal(field(imagina, "annual_ave_premium").value, 4000);
assert.equal(imagina.sections[3].title, "Aportaciones y AVE");
pass(3, "Imagina Ser exposes AVE and recovery-specific composition");

const vidaMujer = profile(snapshot({
  family: "vida_mujer",
  product: "Vida Mujer",
  acceptedQuote: {
    optionalCoverages: [
      "Cáncer femenino",
      "Complicaciones del embarazo",
    ],
  },
}));
assert.equal(vidaMujer.productProfile.id, "VIDA_MUJER");
assert.equal(
  vidaMujer.sections.find((section) => section.id === "protection").title,
  "Protección y coberturas para la mujer",
);
assert.ok(
  vidaMujer.review.warnings.some((warning) =>
    warning.includes("coberturas especializadas"),
  ),
);
pass(4, "Vida Mujer receives specialized protection wording without invented benefits");

const segubeca = profile(snapshot({
  family: "segubeca",
  product: "SeguBeca 18",
  currency: "UDI",
  calculation: {
    paymentYears: 14,
    coveragePeriod: "14 años",
    totalContributed: 35339,
    totalContributedMXN: 294492,
    totalRecovery: 30000,
    totalRecoveryMXN: 250000,
    interestRate: "1% anual estimado",
    udiValue: 8.334,
  },
  acceptedQuote: {
    nativeResult: {
      product: "SeguBeca 18",
      productFamily: "segubeca",
      deliveryAge: 18,
      recommendedCoverages: [
        "Protección por fallecimiento e invalidez del contratante",
      ],
    },
  },
}));
assert.equal(segubeca.productProfile.id, "SEGUBECA");
assert.deepEqual(sectionIds(segubeca), [
  "identity",
  "education_goal",
  "contractor_protection",
  "premiums",
  "education_delivery",
  "evidence",
]);
assert.equal(field(segubeca, "delivery_age").value, 18);
assert.equal(field(segubeca, "udi_value").value, 8.334);
pass(5, "SeguBeca separates educational goal, contractor protection and UDI evidence");

const gmmSnapshot = snapshot({
  family: "GMM",
  product: "Alfa Medical Flex",
  calculation: {
    coveragePeriod: "Anual renovable",
    deductible: 25000,
    coinsurancePercent: 10,
    coinsuranceCap: 60000,
    hospitalLevel: "Íntegro",
    hospitalNetwork: "Red nacional",
    territory: "México",
    roomType: "Privada estándar",
    insuredMembers: ["Titular", "Cónyuge"],
    maternityCoverage: "Incluida según condiciones",
    waitingPeriods: ["10 meses maternidad", "24 meses padecimientos específicos"],
    medicalBenefits: ["Telemedicina", "Ambulancia"],
  },
});
const gmm = profile(gmmSnapshot);
assert.equal(gmm.productProfile.id, "GMM");
assert.deepEqual(sectionIds(gmm), [
  "identity",
  "medical_plan",
  "cost_sharing",
  "medical_coverage",
  "premium",
  "evidence",
]);
assert.equal(field(gmm, "deductible").value, 25000);
assert.equal(field(gmm, "coinsurance").value, 10);
assert.equal(field(gmm, "hospital_level").value, "Íntegro");
pass(6, "GMM exposes plan configuration and insured cost sharing");

assert.equal(
  gmm.sections.some((section) => section.id === "projections"),
  false,
);
assert.equal(field(gmm, "total_recovery"), undefined);
assert.equal(field(gmm, "total_contributed"), undefined);
assert.ok(gmm.productProfile.suppressedGenericSectionIds.includes("projections"));
pass(7, "GMM suppresses savings and recovery sections completely");

const incompleteGmm = profile(snapshot({
  family: "gastos_medicos_mayores",
  product: "Alfa Medical",
}));
assert.ok(
  incompleteGmm.productProfile.missingRecommendedFieldIds.includes("deductible"),
);
assert.ok(
  incompleteGmm.review.warnings.some((warning) =>
    warning.includes("Faltan datos recomendados"),
  ),
);
assert.equal(
  incompleteGmm.summary.annualPremium.status,
  "CONFIRMED",
);
pass(8, "missing GMM mechanics are warned, not invented or converted to zero");

const genericSnapshot = snapshot({
  family: "producto_nuevo",
  product: "Producto experimental",
});
const generic = profile(genericSnapshot);
assert.equal(generic.productProfile.id, "GENERIC");
assert.equal(generic.productProfile.fallbackUsed, true);
assert.deepEqual(
  sectionIds(generic),
  buildQuotePrintableReadModel({ reviewSnapshot: genericSnapshot })
    .sections.map((section) => section.id),
);
pass(9, "unknown products preserve the generic composition with an explicit warning");

const mismatchedReadModel = buildQuotePrintableReadModel({
  reviewSnapshot: orviSnapshot,
});
assert.throws(
  () => buildProductSpecificQuotePrintableReadModel({
    readModel: mismatchedReadModel,
    reviewSnapshot: gmmSnapshot,
  }),
  /does not match the printable read model revision/,
);
pass(10, "profile enrichment rejects a snapshot from another quote revision");

assert.equal(gmm.safety.recalculationAllowed, false);
assert.equal(gmm.safety.productMutationAllowed, false);
assert.equal(gmm.safety.quoteMutationAllowed, false);
assert.equal(gmm.safety.automaticSendAllowed, false);
assert.equal(gmm.authority.productProfileOwner,
  "ADVISOR_OS_QUOTE_PRINTABLE_PRODUCT_PROFILE");
pass(11, "product profiles remain composition-only and preserve all safety boundaries");

assert.equal(Object.isFrozen(gmm), true);
assert.equal(Object.isFrozen(gmm.productProfile), true);
assert.equal(Object.isFrozen(gmm.sections[0].fields[0]), true);
assert.throws(() => {
  gmm.productProfile.id = "MUTATED";
}, TypeError);
pass(12, "profiled read models are deeply immutable");

const gmmDocument = buildProductSpecificQuotePrintableDocument({
  readModel: gmm,
  pageFormat: "A4",
});
assert.equal(gmmDocument.status, "PRINTABLE_HTML_READY");
assert.equal(gmmDocument.productProfile.id, "GMM");
assert.match(gmmDocument.html, /Cotización de Gastos Médicos Mayores/);
assert.match(gmmDocument.html, /Participación del asegurado/);
assert.doesNotMatch(gmmDocument.html, /Recuperación y escenarios/);
pass(13, "the HTML composer receives the product title and profiled sections");

const gmmPdf = buildQuotePrintablePdf({
  readModel: gmm,
  printableDocument: gmmDocument,
  title: gmm.productProfile.documentTitle,
  generatedAt: "2026-07-30T18:10:00-06:00",
});
assert.equal(gmmPdf.status, "PDF_BINARY_READY");
assert.equal(gmmPdf.mediaType, "application/pdf");
assert.equal(new TextDecoder("latin1").decode(gmmPdf.getBytes().slice(0, 8)), "%PDF-1.4");
pass(14, "product-profiled documents remain compatible with the real PDF generator");

assert.throws(
  () => buildProductSpecificQuotePrintableReadModel(),
  /readModel must be a plain object/,
);
assert.throws(
  () => buildProductSpecificQuotePrintableDocument({
    readModel: buildQuotePrintableReadModel({
      reviewSnapshot: orviSnapshot,
    }),
  }),
  /Product-profiled printable read model required/,
);
pass(15, "missing or unprofiled inputs fail closed");

console.log("STATUS=PASS_QPD04_PRODUCT_SPECIFIC_QUOTE_SECTIONS");
console.log("Quote Printable Product Profiles PASS 15/15");
