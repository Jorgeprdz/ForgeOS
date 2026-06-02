const {
  calculateEventBenefits
} = require("./event-benefit-engine");

const pcfEvents = [
  { code: "PCF_BREAST_MALIGNANT", category: "PCF", name: "Tumor maligno de la mama", percentage: 1.00, source: "VIDA_MUJER_MANUAL_PAGE_8" },
  { code: "PCF_BREAST_LOCALIZED", category: "PCF", name: "Tumor maligno de la mama localizado", percentage: 0.47, source: "VIDA_MUJER_MANUAL_PAGE_8" },
  { code: "PCF_OVARY_MALIGNANT", category: "PCF", name: "Tumor maligno del ovario", percentage: 0.38, source: "VIDA_MUJER_MANUAL_PAGE_8" },
  { code: "PCF_UTERUS_MALIGNANT", category: "PCF", name: "Tumor maligno del útero", percentage: 0.21, source: "VIDA_MUJER_MANUAL_PAGE_8" },
  { code: "PCF_UTERUS_LOCALIZED", category: "PCF", name: "Tumor maligno del útero localizado", percentage: 0.12, source: "VIDA_MUJER_MANUAL_PAGE_8" },
  { code: "PCF_FALLOPIAN_TUBE", category: "PCF", name: "Tumor maligno de trompas de falopio", percentage: 0.12, source: "VIDA_MUJER_MANUAL_PAGE_8" },
  { code: "PCF_VAGINA_VULVA_BENIGN", category: "PCF", name: "Tumor benigno de vagina o vulva", percentage: 0.09, source: "VIDA_MUJER_MANUAL_PAGE_8" }
];

const pepEvents = [
  { code: "PEP_PELVIC_INFLAMMATORY", category: "PEP", name: "Enfermedad inflamatoria pélvica", percentage: 0.60, source: "VIDA_MUJER_MANUAL_PAGE_11" },
  { code: "PEP_GENITAL_PROLAPSE", category: "PEP", name: "Prolapso genital femenino", percentage: 0.60, source: "VIDA_MUJER_MANUAL_PAGE_11" },
  { code: "PEP_FIBROADENOMAS", category: "PEP", name: "Fibroadenomas", percentage: 0.45, source: "VIDA_MUJER_MANUAL_PAGE_11" },
  { code: "PEP_PREMATURE_BIRTH", category: "PEP", name: "Parto prematuro", percentage: 1.00, source: "VIDA_MUJER_MANUAL_PAGE_11" },
  { code: "PEP_MULTIPLE_BIRTHS", category: "PEP", name: "Partos múltiples", percentage: 0.60, source: "VIDA_MUJER_MANUAL_PAGE_11" },
  { code: "PEP_ECLAMPSIA_HELLP", category: "PEP", name: "Eclampsia o síndrome de Hellp", percentage: 0.60, source: "VIDA_MUJER_MANUAL_PAGE_11" },
  { code: "PEP_ECTOPIC_PREGNANCY", category: "PEP", name: "Embarazo ectópico o extrauterino", percentage: 0.40, source: "VIDA_MUJER_MANUAL_PAGE_11" },
  { code: "PEP_MOLAR_PREGNANCY", category: "PEP", name: "Embarazo molar hidatiforme", percentage: 0.30, source: "VIDA_MUJER_MANUAL_PAGE_11" },
  { code: "PEP_SPINA_BIFIDA", category: "PEP", name: "Espina bífida", percentage: 0.75, source: "VIDA_MUJER_MANUAL_PAGE_11" },
  { code: "PEP_CLEFT_LIP", category: "PEP", name: "Labio leporino", percentage: 0.75, source: "VIDA_MUJER_MANUAL_PAGE_11" },
  { code: "PEP_DOWN_SYNDROME", category: "PEP", name: "Síndrome de Down", percentage: 0.75, source: "VIDA_MUJER_MANUAL_PAGE_11" },
  { code: "PEP_CYANOTIC_HEART_DISEASE", category: "PEP", name: "Cardiopatía cianógena", percentage: 0.50, source: "VIDA_MUJER_MANUAL_PAGE_11" }
];

function money(value) {
  if (value === null) return "N/A";
  return value.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0
  });
}

function printSection(title, items) {
  console.log(`\n${title}\n`);

  items.forEach((item) => {
    console.log(`${item.category} | ${item.name}`);
    console.log(`% SA: ${item.percentage * 100}%`);
    console.log(`Pago: ${item.benefitAmount.toLocaleString("es-MX")} ${item.currency}`);
    console.log(`MXN: ${money(item.mxn)}`);
    console.log(`Status: ${item.conversionStatus}`);
    console.log("");
  });
}

console.log("\nFORGE VIDA MUJER EVENT BENEFITS REPORT v0.1\n");

const pcfUdi = calculateEventBenefits({
  sumAssured: 35000,
  currency: "UDI",
  eventDefinitions: pcfEvents,
  currentExchangeRate: 8.7
});

const pepUdi = calculateEventBenefits({
  sumAssured: 35000,
  currency: "UDI",
  eventDefinitions: pepEvents,
  currentExchangeRate: 8.7
});

const pcfUsd = calculateEventBenefits({
  sumAssured: 50000,
  currency: "USD",
  eventDefinitions: pcfEvents,
  currentExchangeRate: 18
});

printSection("PCF UDI", pcfUdi);
printSection("PEP UDI", pepUdi);
printSection("PCF USD", pcfUsd);

const noRateCase = calculateEventBenefits({
  sumAssured: 35000,
  currency: "UDI",
  eventDefinitions: pcfEvents,
  currentExchangeRate: null
});

const tests = [
  {
    name: "PCF mama maligno paga 100%",
    pass: pcfUdi[0].benefitAmount === 35000
  },
  {
    name: "PCF mama localizado paga 47%",
    pass: pcfUdi[1].benefitAmount === 16450
  },
  {
    name: "PCF ovario paga 38%",
    pass: pcfUdi[2].benefitAmount === 13300
  },
  {
    name: "PEP parto prematuro paga 100%",
    pass: pepUdi[3].benefitAmount === 35000
  },
  {
    name: "PEP embarazo ectópico paga 40%",
    pass: pepUdi[6].benefitAmount === 14000
  },
  {
    name: "PEP cardiopatía cianógena paga 50%",
    pass: pepUdi[11].benefitAmount === 17500
  },
  {
    name: "PCF USD convierte a MXN",
    pass: pcfUsd[0].mxn === 900000
  },
  {
    name: "Bloquea conversión sin tipo de cambio",
    pass: noRateCase[0].conversionStatus === "BLOCKED_NO_EXCHANGE_RATE"
  }
];

console.log("\nResultados\n");

tests.forEach((test) => {
  console.log(`${test.pass ? "✅" : "❌"} ${test.name}`);
});

const pass = tests.filter((test) => test.pass).length;
const fail = tests.length - pass;

console.log("\nResumen:");
console.log(`Total: ${tests.length}`);
console.log(`Pass: ${pass}`);
console.log(`Fail: ${fail}`);
