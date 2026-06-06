const { extractImaginaSerDocument } = require("./imagina-ser-ocr-extractor");
const { analyzeRetirementFund } = require("./imagina-ser-retirement-fund-engine");
const { chooseDefaultScenario } = require("./imagina-ser-scenario-engine");
const { buildDecisionSummary } = require("./imagina-ser-decision-engine");
const { buildImaginaSerObjections } = require("./imagina-ser-objection-engine");
const { buildClientPresentation } = require("./imagina-ser-client-presentation-engine");
const { buildAdvisorAnalysis } = require("./imagina-ser-advisor-analysis-engine");
const { buildPresentationPrompt } = require("./imagina-ser-presentation-prompt-engine");
const { getCachedRates } = require("./exchange-rate-cache-engine");

const SCENARIO_DISCLOSURE = "SCENARIO_BASED_ESTIMATE_NOT_GUARANTEED";

async function resolveCurrencyMetadata() {
  try {
    const cache = await getCachedRates();
    const udi = cache?.rates?.UDI_MXN;
    const currentUdiValue = Number(udi?.value || 0);

    if (!currentUdiValue) {
      return {
        status: "BLOCKED_NO_VERIFIED_UDI_RATE",
        currentUdiValue: null,
        source: null,
        sourceDate: null,
        sourceMode: null,
        cacheStatus: cache?.cacheStatus || null
      };
    }

    return {
      status: "VERIFIED_UDI_RATE_AVAILABLE",
      currentUdiValue,
      source: udi.source,
      sourceDate: udi.date,
      sourceMode: cache.cacheStatus === "CACHE_HIT" ? "CACHE" : "LIVE",
      cacheStatus: cache.cacheStatus
    };
  } catch (error) {
    return {
      status: "BLOCKED_NO_VERIFIED_UDI_RATE",
      currentUdiValue: null,
      source: null,
      sourceDate: null,
      sourceMode: null,
      cacheStatus: null,
      error: error.message
    };
  }
}

const clientPdf =
  process.argv[2] || "/storage/emulated/0/Download/IS.PDF";

const advisorPdf =
  process.argv[3] || "/storage/emulated/0/Download/Solucionline_20260601_21_10.PDF";

async function main() {
console.log("\nFORGE IMAGINA SER MASTER TEST v1.0\n");

const clientDoc = extractImaginaSerDocument(clientPdf);
const advisorDoc = extractImaginaSerDocument(advisorPdf);
const currencyMetadata = await resolveCurrencyMetadata();

const scenario = chooseDefaultScenario(clientDoc.scenarios);
const fundAnalysis = analyzeRetirementFund(advisorDoc.rows);

const decision = buildDecisionSummary({
  monthlyIncomeUDI: scenario?.monthlyIncomeUDI,
  singlePaymentUDI: scenario?.singlePaymentUDI,
  hasPlannedPremium: true
});

const objections = buildImaginaSerObjections();

const clientPresentation = buildClientPresentation({
  clientData: clientDoc,
  scenarioData: scenario,
  decision,
  currencyMetadata,
  scenarioDisclosure: SCENARIO_DISCLOSURE
});

const advisorAnalysis = buildAdvisorAnalysis({
  clientDoc,
  advisorDoc,
  fundAnalysis
});

const prompt = buildPresentationPrompt({
  clientPresentation,
  advisorAnalysis,
  objections
});

console.log("Core\n");
console.log(`Client PDF: ${clientDoc.documentType}`);
console.log(`Advisor PDF: ${advisorDoc.documentType}`);
console.log(`Moneda: ${clientDoc.currency}`);
console.log(`Edad actual: ${clientDoc.insuredAge}`);
console.log(`Edad retiro: ${clientDoc.retirementAge}`);

console.log("\nEscenario Base\n");
console.log(`Pago único: ${scenario?.singlePaymentUDI} UDI`);
console.log(`Ingreso mensual: ${scenario?.monthlyIncomeUDI} UDI`);

console.log("\nCurrency Metadata\n");
console.log(`Status: ${currencyMetadata.status}`);
console.log(`Source: ${currencyMetadata.source || "N/A"}`);
console.log(`Source date: ${currencyMetadata.sourceDate || "N/A"}`);
console.log(`Source mode: ${currencyMetadata.sourceMode || "N/A"}`);
console.log(`Disclosure: ${clientPresentation.scenarioDisclosure}`);

console.log("\nFondo de Retiro\n");
console.log(`Años de pago detectados: ${fundAnalysis.paymentYears}`);
console.log(`Total aportado: ${fundAnalysis.totalContributedUDI} UDI`);
console.log(`Fondo final: ${fundAnalysis.finalReserveFundUDI} UDI`);
console.log(`Crecimiento: ${fundAnalysis.growthUDI} UDI`);
console.log(`Crecimiento %: ${fundAnalysis.growthPercent.toFixed(2)}%`);

console.log("\nDecision Engine\n");
console.log(`Qué significa: ${decision.whatItMeans}`);
console.log(`Siguiente paso: ${decision.nextBestStep}`);

console.log("\nPresentation Prompt Preview\n");
console.log(prompt.slice(0, 1200));

const tests = [
  {
    name: "Detecta PDF de cliente",
    pass: clientDoc.documentType === "CLIENT_DOCUMENT"
  },
  {
    name: "Detecta PDF de asesor",
    pass: advisorDoc.documentType === "ADVISOR_DOCUMENT"
  },
  {
    name: "Detecta moneda UDI",
    pass: clientDoc.currency === "UDI"
  },
  {
    name: "Detecta escenario base",
    pass: scenario?.monthlyIncomeUDI > 0
  },
  {
    name: "Detecta renta mensual",
    pass: scenario?.monthlyIncomeUDI > 0
  },
  {
    name: "Detecta pago único",
    pass: scenario?.singlePaymentUDI > 0
  },
  {
    name: "Detecta filas de desglose",
    pass: advisorDoc.rows.length > 20
  },
  {
    name: "Analiza fondo de retiro",
    pass: fundAnalysis.finalReserveFundUDI > 0
  },
  {
    name: "Construye decision engine",
    pass: decision.nextBestStep.includes("UDI")
  },
  {
    name: "Construye objeciones",
    pass: objections.length >= 5
  },
  {
    name: "Construye presentación cliente",
    pass: clientPresentation.slides.length >= 8
  },
  {
    name: "Preserva metadata de moneda",
    pass: Boolean(clientPresentation.currencyMetadata?.status)
  },
  {
    name: "Preserva disclosure de escenario",
    pass: clientPresentation.scenarioDisclosure === SCENARIO_DISCLOSURE
  },
  {
    name: "Precio va al final",
    pass: clientPresentation.slides[clientPresentation.slides.length - 1].title.includes("esfuerzo")
  },
  {
    name: "Construye análisis asesor",
    pass: advisorAnalysis.presentationType === "ADVISOR_VIEW"
  },
  {
    name: "Construye prompt de presentación",
    pass: prompt.includes("precio al final")
  }
];

console.log("\nResultados\n");

tests.forEach(test => {
  console.log(`${test.pass ? "✅" : "❌"} ${test.name}`);
});

const pass = tests.filter(t => t.pass).length;
const fail = tests.length - pass;

console.log("\nResumen:");
console.log(`Total: ${tests.length}`);
console.log(`Pass: ${pass}`);
console.log(`Fail: ${fail}`);

if (fail === 0) {
  console.log("\n✅ IMAGINA SER CORE v1.0 PASS");
} else {
  console.log("\n❌ IMAGINA SER CORE NEEDS REVIEW");
  process.exit(1);
}
}

main().catch(error => {
  console.error("\n❌ IMAGINA SER MASTER TEST ERROR");
  console.error(error.message);
  process.exit(1);
});
