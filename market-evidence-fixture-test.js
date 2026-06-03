const fs = require("fs");
const path = require("path");

console.log("\nFORGE MARKET EVIDENCE FIXTURE TEST v1.0\n");

const fixtureDir = path.join(__dirname, "fixtures", "recruitment", "evidence");
const validStrength = ["HIGH", "MEDIUM", "LOW", "UNKNOWN"];
const validContactStatus = ["NOT_CONTACTED", "CONTACTED", "UNREACHABLE", "DECLINED", "UNKNOWN"];
const validAppointmentStatus = ["NOT_SCHEDULED", "SCHEDULED", "COMPLETED", "NO_SHOW", "CANCELLED", "UNKNOWN"];

const fixtures = [
  "rda-strong-market.json",
  "rda-weak-market.json",
  "project200-strong-market.json",
  "project200-weak-market.json",
  "market-evidence-strong.json",
  "market-evidence-weak.json"
];

function readFixture(fileName) {
  return JSON.parse(fs.readFileSync(path.join(fixtureDir, fileName), "utf8"));
}

function isIsoDate(value) {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function validateRda(data) {
  return (
    typeof data.rdaId === "string" &&
    typeof data.candidateId === "string" &&
    typeof data.name === "string" &&
    typeof data.relationship === "string" &&
    validContactStatus.includes(data.contactStatus) &&
    validAppointmentStatus.includes(data.appointmentStatus) &&
    isIsoDate(data.createdAt)
  );
}

function validateProject200(data) {
  return (
    typeof data.projectId === "string" &&
    typeof data.candidateId === "string" &&
    Array.isArray(data.prospects) &&
    data.prospects.length > 0 &&
    data.prospects.every(prospect =>
      typeof prospect.name === "string" &&
      typeof prospect.relationship === "string" &&
      prospect.nasat &&
      Object.prototype.hasOwnProperty.call(prospect.nasat, "need") &&
      Object.prototype.hasOwnProperty.call(prospect.nasat, "assurability") &&
      Object.prototype.hasOwnProperty.call(prospect.nasat, "solvency") &&
      Object.prototype.hasOwnProperty.call(prospect.nasat, "accessibility") &&
      Object.prototype.hasOwnProperty.call(prospect.nasat, "takesDecision")
    ) &&
    isIsoDate(data.createdAt)
  );
}

function validateMarketEvidence(data) {
  return (
    typeof data.marketEvidenceId === "string" &&
    typeof data.candidateId === "string" &&
    typeof data.project200Size === "number" &&
    typeof data.project30Size === "number" &&
    typeof data.rdaCount === "number" &&
    validStrength.includes(data.marketStrength) &&
    validStrength.includes(data.marketAccessibility) &&
    (data.responseRate === null || typeof data.responseRate === "number") &&
    isIsoDate(data.capturedAt)
  );
}

let pass = 0;

fixtures.forEach(fileName => {
  const data = readFixture(fileName);
  let ok = false;

  if (fileName.startsWith("rda-")) ok = validateRda(data);
  if (fileName.startsWith("project200-")) ok = validateProject200(data);
  if (fileName.startsWith("market-evidence-")) ok = validateMarketEvidence(data);

  console.log(`${ok ? "PASS" : "FAIL"} ${fileName}`);
  if (ok) pass++;
});

const strong = readFixture("market-evidence-strong.json");
const weak = readFixture("market-evidence-weak.json");
const scenarioOk =
  strong.scenario === "market_strong" &&
  weak.scenario === "market_weak" &&
  strong.project200Size > weak.project200Size &&
  strong.rdaCount > weak.rdaCount &&
  strong.marketAccessibility === "HIGH" &&
  weak.marketAccessibility === "LOW";

console.log(`${scenarioOk ? "PASS" : "FAIL"} scenario coverage: strong and weak market`);
if (scenarioOk) pass++;

const total = fixtures.length + 1;

console.log("\nResumen:");
console.log(`Total: ${total}`);
console.log(`Pass: ${pass}`);
console.log(`Fail: ${total - pass}`);

if (pass !== total) {
  console.log("\nMARKET EVIDENCE FIXTURE TEST NEEDS REVIEW");
  process.exit(1);
}

console.log("\nMARKET EVIDENCE FIXTURE TEST PASS");
