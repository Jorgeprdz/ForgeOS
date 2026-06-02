const { execSync } = require("child_process");
const fs = require("fs");

function runCheck({ name, cmd, required }) {
  try {
    const output = execSync(cmd, { encoding: "utf8", stdio: "pipe" });

    const hasFail =
      /❌|FAIL|NEEDS REVIEW|ERROR/i.test(output) &&
      !/Fail:\s*0/i.test(output);

    if (hasFail) {
      console.log(`${required ? "❌" : "⚠️"} ${name}: ${required ? "FAIL" : "NON_BLOCKING_REVIEW"}`);
      if (required) console.log(output);
      return { name, status: required ? "FAIL" : "NON_BLOCKING_REVIEW", required };
    }

    console.log(`✅ ${name}: PASS`);
    return { name, status: "PASS", required };
  } catch (error) {
    console.log(`${required ? "❌" : "⚠️"} ${name}: ${required ? "ERROR" : "NON_BLOCKING_ERROR"}`);
    if (required) {
      console.log(error.stdout?.toString() || "");
      console.log(error.stderr?.toString() || error.message);
    }
    return { name, status: required ? "ERROR" : "NON_BLOCKING_ERROR", required };
  }
}

function findVidaMujerPdf() {
  const candidates = [
    "/storage/emulated/0/Download/Vm1.pdf",
    "/storage/emulated/0/Download/VM1.pdf",
    "/storage/emulated/0/Download/VidaMujer.pdf",
    "/storage/emulated/0/Download/vida-mujer.pdf"
  ];

  for (const file of candidates) {
    if (fs.existsSync(file)) return file;
  }

  return null;
}

const vidaPdf = process.argv[2] || findVidaMujerPdf();

console.log("\nFORGE VIDA MUJER MASTER TEST v1.2\n");
console.log(`PDF usado: ${vidaPdf || "NO ENCONTRADO"}`);
console.log("");

const requiredChecks = [
  ["Vida Mujer Real", "node tests/vida-mujer-real-test.js"],
  ["Survival Schedule", "node tests/vida-mujer-survival-schedule-test.js"],
  ["Coverage Status", "node vida-mujer-coverage-status-report.js"],
  ["Protected Diseases", "node vida-mujer-protected-diseases-report.js"],
  ["Client Explanation", vidaPdf ? `node vida-mujer-client-explanation-report.js "${vidaPdf}"` : null]
];

const nonBlockingChecks = [
  ["Rule Consistency", vidaPdf ? `node vida-mujer-rule-consistency-report.js "${vidaPdf}"` : null],
  ["PDF Intake", vidaPdf ? `node vida-mujer-pdf-intake-report.js "${vidaPdf}"` : null],
  ["AVE Integration", vidaPdf ? `node vida-mujer-pdf-ave-integration-report.js "${vidaPdf}"` : null]
];

const results = [];

console.log("Core obligatorio\n");

for (const [name, cmd] of requiredChecks) {
  if (!cmd) {
    console.log(`⚠️ ${name}: SKIPPED (PDF not found)`);
    results.push({ name, status: "SKIPPED", required: false });
    continue;
  }
  results.push(runCheck({ name, cmd, required: true }));
}

console.log("\nExperimental / no bloqueante\n");

for (const [name, cmd] of nonBlockingChecks) {
  if (!cmd) {
    console.log(`⚠️ ${name}: SKIPPED`);
    results.push({ name, status: "SKIPPED", required: false });
    continue;
  }
  results.push(runCheck({ name, cmd, required: false }));
}

const required = results.filter(r => r.required);
const requiredPass = required.filter(r => r.status === "PASS").length;
const requiredFail = required.filter(r => ["FAIL", "ERROR"].includes(r.status)).length;

const nonBlocking = results.filter(r => !r.required);
const nonBlockingReview = nonBlocking.filter(r => r.status !== "PASS").length;

console.log("\nResumen:");
console.log(`Core obligatorio: ${requiredPass}/${required.length}`);
console.log(`Core Fail/Error: ${requiredFail}`);
console.log(`No bloqueantes en review: ${nonBlockingReview}`);

if (requiredFail === 0 && requiredPass === required.length) {
  console.log("\n✅ VIDA MUJER MASTER v1.2 CLOSED");
} else {
  console.log("\n❌ VIDA MUJER CORE NEEDS REVIEW");
}
