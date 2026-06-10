/**
 * ============================================================
 * PROCESS ADVANCEMENT STRESS TEST
 * ADR-0019 — Process Advancement Intelligence
 * ============================================================
 */

const assert = require("assert");

const {
  EVALUATED_ACTORS,
  DEPENDENCY_TYPES,
  DEPENDENCY_STATUS,
  COMMITMENT_STATES,
  COMMITMENT_QUALITY,
  PERMISSION_SIGNALS,
  RISK_LEVELS,
  PROCESS_MOVES
} = require("../process/process-advancement-types");

const {
  resolveProcessMove
} = require("../process/process-advancement-rules");

const actors = Object.values(EVALUATED_ACTORS);
const dependencyTypes = Object.values(DEPENDENCY_TYPES);
const dependencyStatuses = Object.values(DEPENDENCY_STATUS);
const commitmentStates = Object.values(COMMITMENT_STATES);
const commitmentQualities = Object.values(COMMITMENT_QUALITY);
const permissionSignals = Object.values(PERMISSION_SIGNALS);
const riskLevels = Object.values(RISK_LEVELS);
const validMoves = Object.values(PROCESS_MOVES);

function pick(list, index) {
  return list[index % list.length];
}

function buildCase(index) {
  const evaluatedActor = pick(actors, index);
  const dependencyOwner = pick(actors, index * 3);
  const commitmentOwner = pick(actors, index * 5);

  return {
    evaluatedActor,
    activeDependency: {
      type: pick(dependencyTypes, index * 7),
      owner: dependencyOwner,
      status: pick(dependencyStatuses, index * 11),
      dueDate: null,
      sla: null,
      internalExternal: "stress",
      confidence: "high"
    },
    governingCommitment: {
      state: pick(commitmentStates, index * 13),
      owner: commitmentOwner,
      dueDate: null,
      source: "stress-test",
      explicitness: "synthetic",
      quality: pick(commitmentQualities, index * 17)
    },
    externalConstraints: {
      permissionSignal: pick(permissionSignals, index * 19),
      relationshipRisk: pick(riskLevels, index * 23),
      authorityRisk: pick(riskLevels, index * 29),
      clientFirstRisk: pick(riskLevels, index * 31)
    }
  };
}

const TOTAL_CASES = 1000;

const moveCounts = {};
const failures = [];

for (let i = 0; i < TOTAL_CASES; i += 1) {
  const input = buildCase(i);

  try {
    const move = resolveProcessMove(input);

    assert(
      validMoves.includes(move),
      `Invalid move returned: ${move}`
    );

    moveCounts[move] = (moveCounts[move] || 0) + 1;
  } catch (error) {
    failures.push({
      index: i,
      message: error.message,
      input
    });
  }
}

console.log("");
console.log("=========================================");
console.log("PROCESS ADVANCEMENT STRESS TEST");
console.log("=========================================");
console.log(`Total cases: ${TOTAL_CASES}`);
console.log(`Failures: ${failures.length}`);
console.log("");
console.log("Move distribution:");
console.log(JSON.stringify(moveCounts, null, 2));

if (failures.length > 0) {
  console.log("");
  console.log("Failures:");
  console.log(JSON.stringify(failures.slice(0, 5), null, 2));
  process.exit(1);
}

console.log("");
console.log(`✅ STRESS TEST PASSED: ${TOTAL_CASES}/${TOTAL_CASES}`);
console.log("=========================================");
