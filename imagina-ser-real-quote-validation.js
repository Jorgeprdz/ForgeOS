const { execSync } = require("child_process");
const { extractClientScenario } = require("./imagina-ser-ocr-extractor");

const PDF_PATH = "/storage/emulated/0/Download/Solucionline_20260602_18_10.PDF";

function assertEqual(actual, expected, label, results) {
  const pass = actual === expected;

  results.push({
    label,
    expected,
    actual,
    status: pass ? "PASS" : "FAIL"
  });
}

function main() {
  const text = execSync(`pdftotext -layout "${PDF_PATH}" -`, {
    encoding: "utf8"
  });

  const extracted = extractClientScenario(text);
  const results = [];

  assertEqual(
    extracted.clientName,
    "Edwin Marquez",
    "Client name",
    results
  );
  assertEqual(
    extracted.annualBasicPremium,
    3222,
    "Premium extraction",
    results
  );
  assertEqual(
    extracted.annualTotalPremium,
    3222,
    "Total annual premium extraction",
    results
  );
  assertEqual(
    extracted.coverageYears,
    42,
    "Coverage period",
    results
  );
  assertEqual(
    extracted.accumulationYears,
    42,
    "Accumulation years mirrors coverage period",
    results
  );
  assertEqual(
    extracted.scenarios.BASE.singlePaymentUDI,
    82829,
    "Base scenario one-time payout",
    results
  );
  assertEqual(
    extracted.scenarios.FAVORABLE.singlePaymentUDI,
    128697,
    "Favorable scenario one-time payout",
    results
  );
  assertEqual(
    extracted.scenarios.DESFAVORABLE.singlePaymentUDI,
    57228,
    "Unfavorable scenario one-time payout",
    results
  );
  assertEqual(
    extracted.scenarios.BASE.monthlyIncomeUDI,
    390,
    "Base scenario monthly income",
    results
  );
  assertEqual(
    extracted.retirementAge,
    65,
    "Retirement age",
    results
  );
  assertEqual(
    extracted.paymentYears,
    15,
    "Payment period",
    results
  );

  console.log("\nFORGE IMAGINA SER REAL QUOTE VALIDATION\n");
  console.log(`Source: ${PDF_PATH}`);
  console.log(`Client: ${extracted.clientName}`);
  console.log(`Product: ${extracted.productName}`);
  console.log("");

  for (const result of results) {
    console.log(
      `${result.status === "PASS" ? "✅" : "❌"} ${result.label}: expected ${result.expected}, got ${result.actual}`
    );
  }

  const failed = results.filter(result => result.status === "FAIL");

  console.log("\nSummary:");
  console.log(`Status: ${failed.length === 0 ? "PASS" : "FAIL"}`);
  console.log(`Total: ${results.length}`);
  console.log(`Pass: ${results.length - failed.length}`);
  console.log(`Fail: ${failed.length}`);

  if (failed.length > 0) {
    process.exit(1);
  }
}

main();
