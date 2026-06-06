const { readCache } = require("./exchange-rate-cache-engine");
const { buildDecisionSummary } = require("./imagina-ser-decision-engine");
const { buildClientPresentation } = require("./imagina-ser-client-presentation-engine");
const { extractClientScenario } = require("./imagina-ser-ocr-extractor");

const SCENARIO_DISCLOSURE = "SCENARIO_BASED_ESTIMATE_NOT_GUARANTEED";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  const {
    buildRetirementPresentationScenario,
    getVerifiedUdiRateMetadata
  } = await import("./retirement-presentation-scenario-engine.js");

  const cache = readCache();

  assert(cache, "Expected forge-rate-cache.json to exist");
  assert(cache.rates?.UDI_MXN?.value > 0, "Expected cached UDI rate");

  const currencyMetadata = await getVerifiedUdiRateMetadata({
    rateProvider: async () => ({
      ...cache,
      cacheStatus: "CACHE_HIT"
    })
  });

  const clientDoc = extractClientScenario(`
    Carta de presentacion Imagina Ser
    Edad: 38
    Moneda: UDI
    Opcion de liquidacion: Pago unico
    27 65 158,640 747 199,865 942 133,146 627
  `);

  const parsedQuote = {
    productName: "IMAGINA SER 65 PAGOS LIMITADOS 15",
    currency: "UDI",
    currentAge: 38,
    retirementAge: 65,
    coverageYears: 27,
    premiumStructure: {
      basicAnnualPremium: 7954,
      plannedAnnualContribution: 0,
      totalAnnualPremium: 7954,
      premiumPayingYears: 15,
      paidUntilAge: 53
    },
    scenarios: {
      base: {
        lumpSum: clientDoc.scenarios.BASE.singlePaymentUDI,
        monthlyIncome: clientDoc.scenarios.BASE.monthlyIncomeUDI
      }
    },
    evidence: {
      premiumStructure: "SOURCE_TEXT",
      scenarios: "SOURCE_TEXT"
    }
  };

  const retirementScenario = buildRetirementPresentationScenario({
    parsedQuote,
    udiRateMetadata: currencyMetadata
  });

  const decision = buildDecisionSummary({
    monthlyIncomeUDI: clientDoc.scenarios.BASE.monthlyIncomeUDI,
    singlePaymentUDI: clientDoc.scenarios.BASE.singlePaymentUDI,
    hasPlannedPremium: false
  });

  const presentation = buildClientPresentation({
    clientData: {
      product: "IMAGINA_SER",
      currency: "UDI"
    },
    scenarioData: {
      monthlyIncomeUDI: clientDoc.scenarios.BASE.monthlyIncomeUDI,
      singlePaymentUDI: clientDoc.scenarios.BASE.singlePaymentUDI
    },
    decision,
    currencyMetadata,
    scenarioDisclosure: SCENARIO_DISCLOSURE
  });

  const tests = [
    {
      name: "UDI retrieved from cache",
      pass:
        currencyMetadata.status === "VERIFIED_UDI_RATE_AVAILABLE" &&
        currencyMetadata.sourceMode === "CACHE" &&
        currencyMetadata.currentUdiValue === cache.rates.UDI_MXN.value
    },
    {
      name: "Imagina Ser consumes cached UDI",
      pass:
        retirementScenario.status === "READY" &&
        retirementScenario.currentUdiValue === cache.rates.UDI_MXN.value
    },
    {
      name: "No hardcoded 8.7 required",
      pass:
        retirementScenario.currentUdiValue === cache.rates.UDI_MXN.value &&
        retirementScenario.currentUdiValue !== 8.7
    },
    {
      name: "Presentation generated successfully",
      pass:
        presentation.presentationType === "CLIENT_VIEW" &&
        presentation.slides.length >= 8
    },
    {
      name: "Source metadata preserved",
      pass:
        presentation.currencyMetadata.source === "BANXICO_SIE_API" &&
        presentation.currencyMetadata.sourceDate === cache.rates.UDI_MXN.date &&
        presentation.currencyMetadata.sourceMode === "CACHE"
    },
    {
      name: "Scenario labels preserved",
      pass:
        presentation.scenarioDisclosure === SCENARIO_DISCLOSURE &&
        retirementScenario.calculationMode === SCENARIO_DISCLOSURE &&
        retirementScenario.summary.calculationMode === SCENARIO_DISCLOSURE
    }
  ];

  console.log("\nFORGE IMAGINA SER BANXICO INTEGRATION TEST v1.0\n");
  console.log(`Cached UDI: ${currencyMetadata.currentUdiValue}`);
  console.log(`Source: ${currencyMetadata.source}`);
  console.log(`Source date: ${currencyMetadata.sourceDate}`);
  console.log(`Source mode: ${currencyMetadata.sourceMode}`);

  for (const test of tests) {
    console.log(`${test.pass ? "✅" : "❌"} ${test.name}`);
  }

  const failed = tests.filter(test => !test.pass);

  console.log("\nResumen:");
  console.log(`Total: ${tests.length}`);
  console.log(`Pass: ${tests.length - failed.length}`);
  console.log(`Fail: ${failed.length}`);

  if (failed.length > 0) {
    process.exit(1);
  }
}

main().catch(error => {
  console.error("\n❌ IMAGINA SER BANXICO INTEGRATION TEST ERROR");
  console.error(error.message);
  process.exit(1);
});
