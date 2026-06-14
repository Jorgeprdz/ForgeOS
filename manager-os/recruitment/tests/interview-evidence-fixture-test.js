const fs = require("fs");
const path = require("path");

console.log("\nFORGE INTERVIEW EVIDENCE FIXTURE TEST v1.0\n");

const fixtureDir = path.join(__dirname, "fixtures", "recruitment", "evidence");
const validPhases = ["INITIAL_INTERVIEW", "SELECTION_INTERVIEW", "CAREER_INTERVIEW", "ADDITIONAL_INTERVIEW"];
const validRecommendations = ["ADVANCE", "WATCH", "COACH", "REJECT", "RESCHEDULE", "NEEDS_MORE_DATA"];

const fixtures = [
  "question-evidence-strong-candidate.json",
  "question-evidence-weak-candidate.json",
  "interview-evidence-strong-candidate.json",
  "interview-evidence-weak-candidate.json"
];

function readFixture(fileName) {
  const fullPath = path.join(fixtureDir, fileName);
  return JSON.parse(fs.readFileSync(fullPath, "utf8"));
}

function isIsoDate(value) {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function validateQuestionEvidence(data) {
  return (
    typeof data.questionEvidenceId === "string" &&
    typeof data.candidateId === "string" &&
    typeof data.question === "string" &&
    typeof data.evidence === "string" &&
    typeof data.detectedSignal === "string" &&
    typeof data.category === "string" &&
    typeof data.confidence === "number" &&
    data.confidence >= 0 &&
    data.confidence <= 100 &&
    isIsoDate(data.capturedAt)
  );
}

function validateInterviewEvidence(data) {
  return (
    typeof data.interviewEvidenceId === "string" &&
    typeof data.interviewId === "string" &&
    typeof data.candidateId === "string" &&
    validPhases.includes(data.phase) &&
    isIsoDate(data.date) &&
    data.interviewer &&
    typeof data.interviewer.interviewerId === "string" &&
    Array.isArray(data.questionEvidence) &&
    data.questionEvidence.length > 0 &&
    data.questionEvidence.every(item =>
      typeof item.question === "string" &&
      typeof item.evidence === "string" &&
      typeof item.detectedSignal === "string" &&
      typeof item.category === "string" &&
      typeof item.confidence === "number"
    ) &&
    Array.isArray(data.strengths) &&
    Array.isArray(data.risks) &&
    validRecommendations.includes(data.recommendation)
  );
}

let pass = 0;

fixtures.forEach(fileName => {
  const data = readFixture(fileName);
  const ok = fileName.startsWith("question-")
    ? validateQuestionEvidence(data)
    : validateInterviewEvidence(data);

  console.log(`${ok ? "PASS" : "FAIL"} ${fileName}`);
  if (ok) pass++;
});

const strong = readFixture("interview-evidence-strong-candidate.json");
const weak = readFixture("interview-evidence-weak-candidate.json");
const scenarioOk =
  strong.scenario === "strong_candidate" &&
  weak.scenario === "weak_candidate" &&
  strong.strengths.length > weak.strengths.length &&
  weak.risks.length > 0;

console.log(`${scenarioOk ? "PASS" : "FAIL"} scenario coverage: strong and weak candidates`);
if (scenarioOk) pass++;

const total = fixtures.length + 1;

console.log("\nResumen:");
console.log(`Total: ${total}`);
console.log(`Pass: ${pass}`);
console.log(`Fail: ${total - pass}`);

if (pass !== total) {
  console.log("\nINTERVIEW EVIDENCE FIXTURE TEST NEEDS REVIEW");
  process.exit(1);
}

console.log("\nINTERVIEW EVIDENCE FIXTURE TEST PASS");
