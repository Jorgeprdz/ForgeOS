const fs = require("fs");
const { execSync } = require("child_process");

const {
  getCachedRates
} = require("./exchange-rate-cache-engine");

const {
  getProjectionScenario
} = require("./shared-projection-scenarios-engine");

const {
  projectCurrencyValue
} = require("./shared-currency-projection-engine");

const {
  buildObjectionShield
} = require("./shared-objection-shield-engine");

const pdfPath = process.argv[2];

if (!pdfPath) {
  console.log("Uso:");
  console.log("node segu-beca-mxn-timeline-clean-report.js archivo.pdf");
  process.exit(1);
}

function number(value) {
  if (value === "-") return 0;
  return Number(String(value).replace(/,/g, "").trim());
}

function format(value) {
  return value.toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function parseGuaranteedRows(text) {
  const rows = [];

  text.split("\n").forEach((line) => {
    const clean = line.trim();

    const match = clean.match(
      /^([\d.]+)\s*%\s+(\d+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)$/
    );

    if (!match) return;

    rows.push({
      year: rows.length + 1,
      recoveryPercentageQuoted: Number(match[1]),
      childAge: number(match[2]),
      annualPremiumUDI: number(match[3]),
      accumulatedPremiumUDI: number(match[4]),
      aveRescueUDI: number(match[5]),
      cashValueUDI: number(match[6]),
      totalRecoveryUDI: number(match[7]),
      basicSumAssuredUDI: number(match[8])
    });
  });

  return rows;
}

async function main() {
  const txtPath = "segu-beca-quote-ocr.txt";
  execSync(`pdftotext -layout "${pdfPath}" "${txtPath}"`);
  const text = fs.readFileSync(txtPath, "utf8");

  const rows = parseGuaranteedRows(text);

  const cache = await getCachedRates();
  const currentUdi = cache.rates.UDI_MXN.value;

  const scenario = getProjectionScenario({
    mode: "ADVISOR_45"
  });

  let accumulatedPaidMXN = 0;

  const timeline = rows.map((row) => {
    const projectedUdi = projectCurrencyValue({
      currentValue: currentUdi,
      annualGrowthRate: scenario.annualGrowthRate,
      years: row.year
    });

    const annualPremiumMXN =
      row.annualPremiumUDI * projectedUdi;

    accumulatedPaidMXN += annualPremiumMXN;

    const aveRescueMXN =
      row.aveRescueUDI * projectedUdi;

    const cashValueMXN =
      row.cashValueUDI * projectedUdi;

    const totalRecoveryMXN =
      row.totalRecoveryUDI * projectedUdi;

    const basicSumAssuredMXN =
      row.basicSumAssuredUDI * projectedUdi;

    const realRecoveryPercentMXN =
      accumulatedPaidMXN > 0
        ? (totalRecoveryMXN / accumulatedPaidMXN) * 100
        : 0;

    return {
      ...row,
      projectedUdi,
      annualPremiumMXN,
      accumulatedPaidMXN,
      aveRescueMXN,
      cashValueMXN,
      totalRecoveryMXN,
      basicSumAssuredMXN,
      realRecoveryPercentMXN
    };
  });

  const finalRow = timeline[timeline.length - 1];

  console.log("\nFORGE SEGU_BECA MXN TIMELINE + OBJECTION SHIELD v0.1\n");

  console.log("Supuestos\n");
  console.log(`UDI actual Banxico: $${format(currentUdi)} MXN`);
  console.log(`Escenario usado: ${scenario.mode}`);
  console.log(`Crecimiento UDI supuesto: ${(scenario.annualGrowthRate * 100).toFixed(2)}% anual`);
  console.log("Nota: valores futuros en MXN estimados, no garantizados.\n");

  console.log("Números importantes\n");
  console.log(`Capital educativo contratado: 30,000 UDI`);
  console.log(`Equivalente hoy: $${format(30000 * currentUdi)} MXN`);
  console.log(`Capital educativo estimado al final: $${format(finalRow.basicSumAssuredMXN)} MXN`);
  console.log(`Aportación anual hoy estimada: $${format(rows[0].annualPremiumUDI * currentUdi)} MXN`);
  console.log(`Aportación anual año 7 estimada: $${format(timeline[6].annualPremiumMXN)} MXN`);
  console.log(`Aportación anual final estimada: $${format(finalRow.annualPremiumMXN)} MXN`);

  console.log("\nTabla anual estimada en MXN\n");
  console.log("Año | Edad | UDI est. | Aportación anual | Aportado acumulado | AVE rescate | Valor efectivo | Recuperación total | % recuperación real | Suma asegurada");

  timeline.forEach((row) => {
    console.log(
      `${row.year} | ${row.childAge} | $${format(row.projectedUdi)} | $${format(row.annualPremiumMXN)} | $${format(row.accumulatedPaidMXN)} | $${format(row.aveRescueMXN)} | $${format(row.cashValueMXN)} | $${format(row.totalRecoveryMXN)} | ${format(row.realRecoveryPercentMXN)}% | $${format(row.basicSumAssuredMXN)}`
    );
  });

  console.log("\nObjeciones anticipadas\n");

  const objections = buildObjectionShield({
    policyCurrency: "UDI",
    scenarioRate: scenario.annualGrowthRate
  });

  objections.forEach((item, index) => {
    console.log(`${index + 1}. ${item.objection}`);
    console.log(`   ${item.answer}\n`);
  });

  const tests = [
    {
      name: "Genera tabla anual completa",
      pass: timeline.length === 14
    },
    {
      name: "Convierte cada aportación anual con UDI de su año",
      pass: timeline[6].annualPremiumMXN > timeline[0].annualPremiumMXN
    },
    {
      name: "Calcula acumulado pagado MXN año por año",
      pass: finalRow.accumulatedPaidMXN > timeline[0].annualPremiumMXN
    },
    {
      name: "Calcula recuperación total MXN",
      pass: finalRow.totalRecoveryMXN > 0
    },
    {
      name: "Incluye objeciones anticipadas",
      pass: objections.length >= 4
    },
    {
      name: "No usa un solo valor futuro para todo el acumulado",
      pass: finalRow.accumulatedPaidMXN !== finalRow.accumulatedPremiumUDI * finalRow.projectedUdi
    }
  ];

  console.log("\nResultados\n");

  tests.forEach((test) => {
    console.log(`${test.pass ? "✅" : "❌"} ${test.name}`);
  });

  const pass = tests.filter(t => t.pass).length;
  const fail = tests.length - pass;

  console.log("\nResumen:");
  console.log(`Total: ${tests.length}`);
  console.log(`Pass: ${pass}`);
  console.log(`Fail: ${fail}`);

  if (fail === 0) {
    console.log("\n✅ MXN TIMELINE + OBJECTION SHIELD v0.1 PASS");
  }
}

main().catch(error => {
  console.error("\n❌ ERROR");
  console.error(error.message);
  process.exit(1);
});
