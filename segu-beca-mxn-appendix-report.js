const fs = require("fs");
const { execSync } = require("child_process");

const {
  getCachedRates
} = require("./exchange-rate-cache-engine");

const {
  getProjectionScenario
} = require("./shared-projection-scenarios-engine");

const {
  buildMxnFinancialTimeline
} = require("./shared-mxn-timeline-engine");

const pdfPath = process.argv[2];

if (!pdfPath) {
  console.log("Uso:");
  console.log("node segu-beca-mxn-appendix-report.js archivo.pdf");
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

    const childAge = number(match[2]);

    rows.push({
      year: rows.length + 1,
      childAge,
      basicPremium: number(match[3]),
      accumulatedPremium: number(match[4]),
      avePremium: 0,
      aveRescueValue: number(match[5]),
      cashValue: number(match[6]),
      recovery: number(match[7]),
      sumAssured: number(match[8])
    });
  });

  return rows;
}

async function main() {
  const txtPath = "segu-beca-quote-ocr.txt";

  execSync(`pdftotext -layout "${pdfPath}" "${txtPath}"`);

  const text = fs.readFileSync(txtPath, "utf8");

  const guaranteedRows = parseGuaranteedRows(text);

  const cache = await getCachedRates();
  const currentUdi = cache.rates.UDI_MXN.value;

  const scenario = getProjectionScenario({
    mode: "ADVISOR_45"
  });

  const timeline = buildMxnFinancialTimeline({
    policyCurrency: "UDI",
    currentRate: currentUdi,
    annualGrowthRate: scenario.annualGrowthRate,
    rows: guaranteedRows
  });

  console.log("\nFORGE SEGU_BECA MXN FINANCIAL APPENDIX v0.1\n");

  console.log("Supuestos\n");
  console.log(`UDI actual Banxico: $${format(currentUdi)} MXN`);
  console.log(`Escenario usado: ${scenario.mode}`);
  console.log(`Crecimiento anual supuesto: ${(scenario.annualGrowthRate * 100).toFixed(2)}%`);
  console.log(`Fuente escenario: ${scenario.source}`);
  console.log("Nota: valores futuros en MXN son estimados, no garantizados.\n");

  console.log("Tabla anual estimada en MXN\n");

  console.log(
    "Año | Edad | Prima básica MXN | Prima acumulada MXN | AVE rescate MXN | Valor efectivo MXN | Recuperación MXN | % recuperación | SA básica MXN"
  );

  timeline.forEach((row) => {
    console.log(
      `${row.year} | ${row.childAge} | $${format(row.basicPremiumMXN)} | $${format(row.accumulatedPremiumMXN)} | $${format(row.aveRescueValue * row.projectedRate)} | $${format(row.cashValue * row.projectedRate)} | $${format(row.recoveryMXN)} | ${format(row.recoveryPercent)}% | $${format(row.sumAssuredMXN)}`
    );
  });

  const finalRow = timeline[timeline.length - 1];

  console.log("\nResumen final\n");
  console.log(`Aportación acumulada estimada: $${format(finalRow.accumulatedPremiumMXN)} MXN`);
  console.log(`Recuperación estimada: $${format(finalRow.recoveryMXN)} MXN`);
  console.log(`Porcentaje de recuperación estimado: ${format(finalRow.recoveryPercent)}%`);
  console.log(`Capital educativo estimado en pesos: $${format(finalRow.sumAssuredMXN)} MXN`);

  const tests = [
    {
      name: "Obtiene UDI Banxico",
      pass: currentUdi > 0
    },
    {
      name: "Usa escenario asesor 4.5%",
      pass: scenario.annualGrowthRate === 0.045
    },
    {
      name: "Genera timeline",
      pass: timeline.length > 0
    },
    {
      name: "Calcula MXN para prima",
      pass: timeline[0].basicPremiumMXN > 0
    },
    {
      name: "Calcula recuperación en MXN",
      pass: finalRow.recoveryMXN > 0
    },
    {
      name: "Marca cálculo como no garantizado",
      pass: finalRow.calculationMode.includes("NOT_GUARANTEED")
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
    console.log("\n✅ MXN FINANCIAL APPENDIX v0.1 PASS");
  }
}

main().catch(error => {
  console.error("\n❌ MXN FINANCIAL APPENDIX ERROR");
  console.error(error.message);
  process.exit(1);
});
