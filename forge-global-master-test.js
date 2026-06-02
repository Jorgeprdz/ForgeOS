const { execSync } = require("child_process");

const tests = [
  {
    name: "Smoke Test",
    command: "node tests/smoke-test.js"
  },
  {
    name: "Module Integrity",
    command: "node tests/module-integrity-test.js"
  },
  {
    name: "Shared AVE Library",
    command: "node forge-shared-ave-master-test.js"
  },
  {
    name: "Shared CLP Library",
    command: "node shared-clp-master-test.js"
  },
  {
    name: "Market Data Layer",
    command: "node market-data-master-test.js"
  },
  {
    name: "Decision Platform",
    command: "node decision-appendix-master-test.js"
  },
  {
    name: "Imagina Ser Core",
    command: 'node imagina-ser-master-test.js "/storage/emulated/0/Download/IS.PDF" "/storage/emulated/0/Download/Solucionline_20260601_21_10.PDF"'
  },
  {
    name: "Imagina Ser Fiscal",
    command: "node imagina-ser-fiscal-master-test.js"
  },
  {
    name: "Imagina Ser Variant Fiscal Router",
    command: "node imagina-ser-variant-fiscal-master-test.js"
  },
  {
    name: "Imagina Ser Client Presentation",
    command: 'node forge-imagina-ser-client-presentation-test.js "/storage/emulated/0/Download/IS.PDF" "/storage/emulated/0/Download/Solucionline_20260601_21_10.PDF"'
  },
  {
    name: "ORVI Core",
    command: 'node orvi-master-test.js "/storage/emulated/0/Download/Solucionline_20260601_22_42.PDF"'
  },
  {
    name: "ORVI MXN",
    command: 'node orvi-mxn-master-test.js "/storage/emulated/0/Download/Solucionline_20260601_22_42.PDF"'
  },
  {
    name: "ORVI Client Presentation",
    command: 'node orvi-client-report-test.js "/storage/emulated/0/Download/Solucionline_20260601_22_42.PDF"'
  },
  {
    name: "Vida Mujer Real",
    command: "node tests/vida-mujer-real-test.js"
  },
  {
    name: "Vida Mujer Survival",
    command: "node tests/vida-mujer-survival-schedule-test.js"
  },
  {
    name: "SeguBeca Master",
    command: "node segu-beca-master-test.js"
  }
];

console.log("\nFORGE GLOBAL MASTER TEST v1.0\n");

const results = [];

for (const test of tests) {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(test.name);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  try {
    const output = execSync(test.command, {
      encoding: "utf8",
      stdio: "pipe"
    });

    const failed =
      /FAIL|NEEDS REVIEW|ERROR|❌/i.test(output) &&
      !/Fail:\s*0/i.test(output);

    if (failed) {
      console.log(output);
      results.push({
        name: test.name,
        status: "FAIL"
      });
    } else {
      console.log("✅ PASS");
      results.push({
        name: test.name,
        status: "PASS"
      });
    }
  } catch (error) {
    console.log("❌ ERROR");
    console.log(error.stdout?.toString() || "");
    console.log(error.stderr?.toString() || error.message);

    results.push({
      name: test.name,
      status: "ERROR"
    });
  }

  console.log("");
}

const pass = results.filter(r => r.status === "PASS").length;
const fail = results.length - pass;

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("FORGE GLOBAL SUMMARY");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

results.forEach(result => {
  console.log(`${result.status === "PASS" ? "✅" : "❌"} ${result.name}: ${result.status}`);
});

console.log("\nResumen:");
console.log(`Total: ${results.length}`);
console.log(`Pass: ${pass}`);
console.log(`Fail/Error: ${fail}`);

if (fail === 0) {
  console.log("\n✅ FORGE GLOBAL MASTER TEST v1.0 CLOSED");
} else {
  console.log("\n❌ FORGE GLOBAL MASTER TEST NEEDS REVIEW");
}
