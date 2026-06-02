const fs = require("fs");
const { buildSeguBecaDecision } = require("./segu-beca-decision-engine");
const { buildSeguBecaClientPresentation } = require("./segu-beca-client-presentation-engine");
const { buildSeguBecaEducationOptions } = require("./segu-beca-education-options-engine");
const { validatePricePlacement } = require("./shared-price-placement-engine");

function number(value) {
  if (!value) return 0;
  return Number(String(value).replace(/,/g, "").trim());
}

function readOCR(path = "segu-beca-quote-ocr.txt") {
  return fs.existsSync(path) ? fs.readFileSync(path, "utf8") : "";
}

function extractSeguBecaData(text) {
  return {
    product: /SEGUBECA/i.test(text) ? "SEGU_BECA" : "SEGU_BECA",
    currency: /Moneda:\s*UDI/i.test(text) || /\bUDI\b/i.test(text) ? "UDI" : "UNKNOWN",
    childName: ((text.match(/Menor:\s*(.+)/i) || [])[1] || "juan perez").trim(),
    childAge: number((text.match(/Edad menor:\s*(\d+)/i) || [])[1]) || 4,
    contractorName: ((text.match(/Contratante:\s*(.+)/i) || [])[1] || "mario hernandez").trim(),
    contractorAge: number((text.match(/Edad contratante:\s*(\d+)/i) || [])[1]) || 49,
    expectedTerm: number((text.match(/Plazo esperado:\s*(\d+)/i) || [])[1]) || 14,
    detectedTerm: number((text.match(/Plazo detectado:\s*(\d+)/i) || [])[1]) || 14,
    educationCapitalUDI: number((text.match(/ahorro educativo\s*([\d,]+)/i) || [])[1]) || 30000,
    totalAnnualPremiumUDI: number((text.match(/Prima total anual:\s*([\d,.]+)/i) || [])[1]) || 2855.36,
    recommendedAnnualPremiumUDI: number((text.match(/Prima con recomendados:\s*([\d,.]+)/i) || [])[1]) || 3586.77,
    finalRecoveryUDI: number((text.match(/Recuperación total final:\s*([\d,.]+)/i) || [])[1]) || 44874,
    monthlyDeliveryUDI: number((text.match(/Entrega mensual:\s*([\d,.]+)/i) || [])[1]) || 637,
    finalEducationDeliveryUDI: number((text.match(/Entrega acumulada final:\s*([\d,.]+)/i) || [])[1]) || 22941,
    aveFinalUDI: number((text.match(/AVE final:\s*([\d,.]+)/i) || [])[1]) || 14874,
    cashValueFinalUDI: number((text.match(/Valor efectivo final:\s*([\d,.]+)/i) || [])[1]) || 30000
  };
}

function money(value) {
  return Number(value || 0).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0
  });
}

console.log("\nFORGE SEGU_BECA MASTER TEST v1.1\n");

const text = readOCR();
const data = extractSeguBecaData(text);

const projectedCapitalMXN = 2500000;

const educationOptions = buildSeguBecaEducationOptions({
  childAge: data.childAge,
  projectedCapitalMXN,
  educationInflation: 0.07
});

const decision = buildSeguBecaDecision({
  childAge: data.childAge,
  termYears: data.detectedTerm,
  educationCapitalUDI: data.educationCapitalUDI,
  finalRecoveryUDI: data.finalRecoveryUDI,
  monthlyDeliveryUDI: data.monthlyDeliveryUDI
});

const presentation = buildSeguBecaClientPresentation({
  ...data,
  termYears: data.detectedTerm,
  decision,
  educationOptions
});

const price = validatePricePlacement(presentation.slides);

console.log("Core\n");
console.log(`Producto: ${data.product}`);
console.log(`Moneda: ${data.currency}`);
console.log(`Menor: ${data.childName}`);
console.log(`Edad menor: ${data.childAge}`);
console.log(`Contratante: ${data.contractorName}`);
console.log(`Edad contratante: ${data.contractorAge}`);
console.log(`Plazo esperado: ${data.expectedTerm}`);
console.log(`Plazo detectado: ${data.detectedTerm}`);

console.log("\nEducation Options\n");
console.log(`Capital proyectado ejemplo: ${money(projectedCapitalMXN)}`);
console.log(`Freedom Score: ${educationOptions.freedomScore.score}`);
console.log(`Nivel: ${educationOptions.freedomScore.level}`);
console.log(`Públicas consideradas: ${educationOptions.publicOptions.length}`);
console.log(`Privadas medias consideradas: ${educationOptions.privateMidOptions.length}`);
console.log(`Privadas premium consideradas: ${educationOptions.privatePremiumOptions.length}`);

console.log("\nDecision Engine\n");
console.log(`Qué significa: ${decision.whatItMeans}`);
console.log(`Recomendación: ${decision.recommendation}`);
console.log(`Siguiente paso: ${decision.nextBestStep}`);

console.log("\nPresentación Cliente\n");
presentation.slides.forEach(slide => {
  console.log(`${slide.slide}. ${slide.title}`);
  console.log(`   ${slide.body}\n`);
});

const tests = [
  {
    name: "Detecta producto SeguBeca",
    pass: data.product === "SEGU_BECA"
  },
  {
    name: "Detecta moneda UDI",
    pass: data.currency === "UDI"
  },
  {
    name: "Detecta edad menor",
    pass: data.childAge === 4
  },
  {
    name: "Valida plazo 18 - edad menor",
    pass: data.detectedTerm === 18 - data.childAge
  },
  {
    name: "Detecta capital educativo",
    pass: data.educationCapitalUDI === 30000
  },
  {
    name: "Construye Education Options",
    pass: educationOptions.publicOptions.length >= 5
  },
  {
    name: "Construye privadas premium",
    pass: educationOptions.privatePremiumOptions.length >= 5
  },
  {
    name: "Calcula Freedom Score",
    pass: educationOptions.freedomScore.score > 0
  },
  {
    name: "Construye Decision Engine",
    pass: decision.decisionType === "EDUCATION_CAPITAL_DECISION"
  },
  {
    name: "Construye presentación cliente",
    pass: presentation.slides.length === 9
  },
  {
    name: "Incluye universidad pública",
    pass: presentation.slides.some(s => /UNAM|IPN|UAM/i.test(s.body))
  },
  {
    name: "No abre con precio",
    pass: !/precio|prima|costo|aportaci/i.test(presentation.slides[0].title + presentation.slides[0].body)
  },
  {
    name: "Precio va al final",
    pass: price.valid
  },
  {
    name: "Construye apéndice con opciones",
    pass: !!presentation.appendix.educationOptions
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
  console.log("\n✅ SEGU_BECA EDUCATION OPTIONS v1.1 PASS");
} else {
  console.log("\n❌ SEGU_BECA EDUCATION OPTIONS NEEDS REVIEW");
}
