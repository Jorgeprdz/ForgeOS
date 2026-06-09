/**
 * ============================================================
 * PROCESS ADVANCEMENT ENGINE TESTS
 * ADR-0019 — Process Advancement Intelligence
 * ============================================================
 *
 * Canonical behavior tests for Process Advancement v0.1.
 *
 * These tests validate rules, not channels.
 * No WhatsApp.
 * No email.
 * No CRM execution.
 */

const assert = require("assert");

const {
  EVALUATED_ACTORS,
  DEPENDENCY_TYPES,
  DEPENDENCY_STATUS,
  CONFIDENCE_LEVELS,
  COMMITMENT_STATES,
  COMMITMENT_QUALITY,
  PERMISSION_SIGNALS,
  RISK_LEVELS,
  PROCESS_MOVES
} = require("../process/process-advancement-types");

const {
  resolveProcessMove
} = require("../process/process-advancement-rules");

function baseExternalConstraints(overrides = {}) {
  return {
    permissionSignal: PERMISSION_SIGNALS.ALLOWED,
    relationshipRisk: RISK_LEVELS.LOW,
    authorityRisk: RISK_LEVELS.LOW,
    clientFirstRisk: RISK_LEVELS.LOW,
    ...overrides
  };
}

function baseCommitment(overrides = {}) {
  return {
    state: COMMITMENT_STATES.NONE,
    owner: EVALUATED_ACTORS.PROSPECT,
    dueDate: null,
    source: "test",
    explicitness: "explicit",
    quality: COMMITMENT_QUALITY.SPECIFIC,
    ...overrides
  };
}

function baseDependency(overrides = {}) {
  return {
    type: DEPENDENCY_TYPES.DECISION,
    owner: EVALUATED_ACTORS.PROSPECT,
    status: DEPENDENCY_STATUS.ACTIVE,
    dueDate: null,
    sla: null,
    internalExternal: "external",
    confidence: CONFIDENCE_LEVELS.HIGH,
    ...overrides
  };
}

function makeInput(overrides = {}) {
  return {
    evaluatedActor: EVALUATED_ACTORS.ADVISOR,
    activeDependency: baseDependency(),
    governingCommitment: baseCommitment(),
    externalConstraints: baseExternalConstraints(),
    ...overrides
  };
}

const tests = [
  {
    name: "Canonical 001 — Adrian referrer completed obligation",
    input: makeInput({
      evaluatedActor: EVALUATED_ACTORS.REFERRER,
      activeDependency: baseDependency({
        type: DEPENDENCY_TYPES.REFERRAL_CONTACT,
        owner: EVALUATED_ACTORS.PROSPECT,
        status: DEPENDENCY_STATUS.ACTIVE
      }),
      governingCommitment: baseCommitment({
        state: COMMITMENT_STATES.COMPLETED,
        owner: EVALUATED_ACTORS.REFERRER,
        quality: COMMITMENT_QUALITY.SPECIFIC
      })
    }),
    expected: PROCESS_MOVES.NO_ACTION_REQUIRED
  },
  {
    name: "Canonical 002 — Lariza active agreement",
    input: makeInput({
      evaluatedActor: EVALUATED_ACTORS.ADVISOR,
      activeDependency: baseDependency({
        type: DEPENDENCY_TYPES.DECISION,
        owner: EVALUATED_ACTORS.PROSPECT,
        status: DEPENDENCY_STATUS.ACTIVE
      }),
      governingCommitment: baseCommitment({
        state: COMMITMENT_STATES.ACTIVE,
        owner: EVALUATED_ACTORS.PROSPECT,
        quality: COMMITMENT_QUALITY.MUTUAL
      })
    }),
    expected: PROCESS_MOVES.WAIT_ON_DEPENDENCY
  },
  {
    name: "Canonical 003 — Lariza missed agreement",
    input: makeInput({
      activeDependency: baseDependency({
        type: DEPENDENCY_TYPES.DECISION,
        owner: EVALUATED_ACTORS.PROSPECT,
        status: DEPENDENCY_STATUS.ACTIVE
      }),
      governingCommitment: baseCommitment({
        state: COMMITMENT_STATES.MISSED,
        owner: EVALUATED_ACTORS.PROSPECT,
        quality: COMMITMENT_QUALITY.MUTUAL
      })
    }),
    expected: PROCESS_MOVES.HONOR_COMMITMENT
  },
  {
    name: "Canonical 004 — Doris interested but no agreement",
    input: makeInput({
      activeDependency: baseDependency({
        type: DEPENDENCY_TYPES.AVAILABILITY,
        owner: EVALUATED_ACTORS.PROSPECT,
        status: DEPENDENCY_STATUS.ACTIVE
      }),
      governingCommitment: baseCommitment({
        state: COMMITMENT_STATES.NONE,
        owner: EVALUATED_ACTORS.PROSPECT,
        quality: COMMITMENT_QUALITY.UNKNOWN
      })
    }),
    expected: PROCESS_MOVES.GENERATE_AGREEMENT
  },
  {
    name: "Canonical 005 — Underwriter reviewing",
    input: makeInput({
      activeDependency: baseDependency({
        type: DEPENDENCY_TYPES.UNDERWRITING,
        owner: EVALUATED_ACTORS.UNDERWRITER,
        status: DEPENDENCY_STATUS.ACTIVE
      }),
      governingCommitment: baseCommitment({
        state: COMMITMENT_STATES.NONE,
        owner: EVALUATED_ACTORS.UNDERWRITER,
        quality: COMMITMENT_QUALITY.UNKNOWN
      })
    }),
    expected: PROCESS_MOVES.WAIT_ON_DEPENDENCY
  },
  {
    name: "Canonical 006 — Underwriter SLA missed",
    input: makeInput({
      activeDependency: baseDependency({
        type: DEPENDENCY_TYPES.UNDERWRITING,
        owner: EVALUATED_ACTORS.UNDERWRITER,
        status: DEPENDENCY_STATUS.MISSED
      }),
      governingCommitment: baseCommitment({
        state: COMMITMENT_STATES.NONE,
        owner: EVALUATED_ACTORS.UNDERWRITER,
        quality: COMMITMENT_QUALITY.UNKNOWN
      })
    }),
    expected: PROCESS_MOVES.UNBLOCK_DEPENDENCY
  },
  {
    name: "Canonical 007 — Advisor owes proposal",
    input: makeInput({
      activeDependency: baseDependency({
        type: DEPENDENCY_TYPES.PROPOSAL_DELIVERY,
        owner: EVALUATED_ACTORS.ADVISOR,
        status: DEPENDENCY_STATUS.ACTIVE
      }),
      governingCommitment: baseCommitment({
        state: COMMITMENT_STATES.ACTIVE,
        owner: EVALUATED_ACTORS.ADVISOR,
        quality: COMMITMENT_QUALITY.SPECIFIC
      })
    }),
    expected: PROCESS_MOVES.HONOR_COMMITMENT
  },
  {
    name: "Canonical 008 — Advisor-owned blocked objection",
    input: makeInput({
      activeDependency: baseDependency({
        type: DEPENDENCY_TYPES.OBJECTION,
        owner: EVALUATED_ACTORS.ADVISOR,
        status: DEPENDENCY_STATUS.BLOCKED
      }),
      governingCommitment: baseCommitment({
        state: COMMITMENT_STATES.NONE,
        owner: EVALUATED_ACTORS.ADVISOR,
        quality: COMMITMENT_QUALITY.UNKNOWN
      })
    }),
    expected: PROCESS_MOVES.RESOLVE_BLOCKER
  },
  {
    name: "Canonical 009 — Permission temporarily denied",
    input: makeInput({
      externalConstraints: baseExternalConstraints({
        permissionSignal: PERMISSION_SIGNALS.DENIED_TEMPORARILY
      })
    }),
    expected: PROCESS_MOVES.WAIT_ON_DEPENDENCY
  },
  {
    name: "Canonical 010 — High Client First risk",
    input: makeInput({
      externalConstraints: baseExternalConstraints({
        clientFirstRisk: RISK_LEVELS.HIGH
      })
    }),
    expected: PROCESS_MOVES.HUMAN_REVIEW
  },
  {
    name: "Canonical 011 — Center of Influence network discovery",
    input: makeInput({
      evaluatedActor: EVALUATED_ACTORS.ADVISOR,
      activeDependency: baseDependency({
        type: DEPENDENCY_TYPES.NETWORK_DISCOVERY,
        owner: EVALUATED_ACTORS.ADVISOR,
        status: DEPENDENCY_STATUS.BLOCKED
      }),
      governingCommitment: baseCommitment({
        state: COMMITMENT_STATES.NONE,
        owner: EVALUATED_ACTORS.ADVISOR,
        quality: COMMITMENT_QUALITY.UNKNOWN
      })
    }),
    expected: PROCESS_MOVES.RESOLVE_BLOCKER
  },
  {
    name: "Canonical 012 — Future date dependency",
    input: makeInput({
      evaluatedActor: EVALUATED_ACTORS.ADVISOR,
      activeDependency: baseDependency({
        type: DEPENDENCY_TYPES.TIMING,
        owner: EVALUATED_ACTORS.EXTERNAL_EVENT,
        status: DEPENDENCY_STATUS.ACTIVE
      }),
      governingCommitment: baseCommitment({
        state: COMMITMENT_STATES.NONE,
        owner: EVALUATED_ACTORS.EXTERNAL_EVENT,
        quality: COMMITMENT_QUALITY.SPECIFIC
      })
    }),
    expected: PROCESS_MOVES.WAIT_ON_DEPENDENCY
  }
];

let passed = 0;

for (const test of tests) {
  const actual = resolveProcessMove(test.input);

  assert.strictEqual(
    actual,
    test.expected,
    `${test.name}\nExpected: ${test.expected}\nActual: ${actual}`
  );

  passed += 1;
  console.log(`✅ ${test.name}: ${actual}`);
}

console.log("");
console.log(`=========================================`);
console.log(`PROCESS ADVANCEMENT TESTS PASSED: ${passed}/${tests.length}`);
console.log(`=========================================`);
