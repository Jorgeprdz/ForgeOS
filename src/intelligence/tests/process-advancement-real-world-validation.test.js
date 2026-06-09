/**
 * ============================================================
 * PROCESS ADVANCEMENT REAL WORLD VALIDATION PACK V0.1
 * ADR-0019 — Process Advancement Intelligence
 * ============================================================
 *
 * Purpose:
 * Validate if Process Advancement Intelligence behaves correctly
 * against realistic Forge scenarios.
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

function constraints(overrides = {}) {
  return {
    permissionSignal: PERMISSION_SIGNALS.ALLOWED,
    relationshipRisk: RISK_LEVELS.LOW,
    authorityRisk: RISK_LEVELS.LOW,
    clientFirstRisk: RISK_LEVELS.LOW,
    ...overrides
  };
}

function dependency(overrides = {}) {
  return {
    type: DEPENDENCY_TYPES.DECISION,
    owner: EVALUATED_ACTORS.PROSPECT,
    status: DEPENDENCY_STATUS.ACTIVE,
    dueDate: null,
    sla: null,
    internalExternal: "real_world",
    confidence: CONFIDENCE_LEVELS.HIGH,
    ...overrides
  };
}

function commitment(overrides = {}) {
  return {
    state: COMMITMENT_STATES.NONE,
    owner: EVALUATED_ACTORS.PROSPECT,
    dueDate: null,
    source: "real-world-validation",
    explicitness: "explicit",
    quality: COMMITMENT_QUALITY.SPECIFIC,
    ...overrides
  };
}

function input({
  evaluatedActor = EVALUATED_ACTORS.ADVISOR,
  activeDependency = dependency(),
  governingCommitment = commitment(),
  externalConstraints = constraints()
} = {}) {
  return {
    evaluatedActor,
    activeDependency,
    governingCommitment,
    externalConstraints
  };
}

const cases = [
  {
    name: "RW001 — Prospect interested but says 'I will let you know'",
    expected: PROCESS_MOVES.GENERATE_AGREEMENT,
    input: input({
      activeDependency: dependency({
        type: DEPENDENCY_TYPES.DECISION,
        owner: EVALUATED_ACTORS.PROSPECT,
        status: DEPENDENCY_STATUS.ACTIVE
      }),
      governingCommitment: commitment({
        state: COMMITMENT_STATES.NONE,
        owner: EVALUATED_ACTORS.PROSPECT,
        quality: COMMITMENT_QUALITY.OPEN_LOOP
      })
    })
  },
  {
    name: "RW002 — Prospect asked advisor to write next Friday",
    expected: PROCESS_MOVES.WAIT_ON_DEPENDENCY,
    input: input({
      activeDependency: dependency({
        type: DEPENDENCY_TYPES.TIMING,
        owner: EVALUATED_ACTORS.EXTERNAL_EVENT,
        status: DEPENDENCY_STATUS.ACTIVE
      }),
      governingCommitment: commitment({
        state: COMMITMENT_STATES.ACTIVE,
        owner: EVALUATED_ACTORS.ADVISOR,
        quality: COMMITMENT_QUALITY.SPECIFIC,
        isDueNow: false
      })
    })
  },
  {
    name: "RW003 — Friday arrived and advisor owes follow-up",
    expected: PROCESS_MOVES.HONOR_COMMITMENT,
    input: input({
      activeDependency: dependency({
        type: DEPENDENCY_TYPES.TIMING,
        owner: EVALUATED_ACTORS.ADVISOR,
        status: DEPENDENCY_STATUS.ACTIVE
      }),
      governingCommitment: commitment({
        state: COMMITMENT_STATES.ACTIVE,
        owner: EVALUATED_ACTORS.ADVISOR,
        quality: COMMITMENT_QUALITY.SPECIFIC,
        isDueNow: true
      })
    })
  },
  {
    name: "RW004 — Client must send documents and due date has not arrived",
    expected: PROCESS_MOVES.WAIT_ON_DEPENDENCY,
    input: input({
      activeDependency: dependency({
        type: DEPENDENCY_TYPES.DOCUMENTS,
        owner: EVALUATED_ACTORS.CLIENT,
        status: DEPENDENCY_STATUS.ACTIVE
      }),
      governingCommitment: commitment({
        state: COMMITMENT_STATES.ACTIVE,
        owner: EVALUATED_ACTORS.CLIENT,
        quality: COMMITMENT_QUALITY.SPECIFIC
      })
    })
  },
  {
    name: "RW005 — Client missed document commitment",
    expected: PROCESS_MOVES.HONOR_COMMITMENT,
    input: input({
      activeDependency: dependency({
        type: DEPENDENCY_TYPES.DOCUMENTS,
        owner: EVALUATED_ACTORS.CLIENT,
        status: DEPENDENCY_STATUS.ACTIVE
      }),
      governingCommitment: commitment({
        state: COMMITMENT_STATES.MISSED,
        owner: EVALUATED_ACTORS.CLIENT,
        quality: COMMITMENT_QUALITY.SPECIFIC
      })
    })
  },
  {
    name: "RW006 — Prospect has price objection",
    expected: PROCESS_MOVES.RESOLVE_BLOCKER,
    input: input({
      activeDependency: dependency({
        type: DEPENDENCY_TYPES.OBJECTION,
        owner: EVALUATED_ACTORS.ADVISOR,
        status: DEPENDENCY_STATUS.BLOCKED
      }),
      governingCommitment: commitment({
        state: COMMITMENT_STATES.NONE,
        owner: EVALUATED_ACTORS.ADVISOR,
        quality: COMMITMENT_QUALITY.UNKNOWN
      })
    })
  },
  {
    name: "RW007 — Carrier underwriting active",
    expected: PROCESS_MOVES.WAIT_ON_DEPENDENCY,
    input: input({
      activeDependency: dependency({
        type: DEPENDENCY_TYPES.UNDERWRITING,
        owner: EVALUATED_ACTORS.UNDERWRITER,
        status: DEPENDENCY_STATUS.ACTIVE
      }),
      governingCommitment: commitment({
        state: COMMITMENT_STATES.NONE,
        owner: EVALUATED_ACTORS.UNDERWRITER,
        quality: COMMITMENT_QUALITY.UNKNOWN
      })
    })
  },
  {
    name: "RW008 — Carrier underwriting SLA missed",
    expected: PROCESS_MOVES.UNBLOCK_DEPENDENCY,
    input: input({
      activeDependency: dependency({
        type: DEPENDENCY_TYPES.UNDERWRITING,
        owner: EVALUATED_ACTORS.UNDERWRITER,
        status: DEPENDENCY_STATUS.MISSED
      }),
      governingCommitment: commitment({
        state: COMMITMENT_STATES.NONE,
        owner: EVALUATED_ACTORS.UNDERWRITER,
        quality: COMMITMENT_QUALITY.UNKNOWN
      })
    })
  },
  {
    name: "RW009 — Center of influence mentions mother knows people",
    expected: PROCESS_MOVES.RESOLVE_BLOCKER,
    input: input({
      activeDependency: dependency({
        type: DEPENDENCY_TYPES.NETWORK_DISCOVERY,
        owner: EVALUATED_ACTORS.ADVISOR,
        status: DEPENDENCY_STATUS.BLOCKED
      }),
      governingCommitment: commitment({
        state: COMMITMENT_STATES.NONE,
        owner: EVALUATED_ACTORS.ADVISOR,
        quality: COMMITMENT_QUALITY.UNKNOWN
      })
    })
  },
  {
    name: "RW010 — Referrer already introduced and has no further obligation",
    expected: PROCESS_MOVES.NO_ACTION_REQUIRED,
    input: input({
      evaluatedActor: EVALUATED_ACTORS.REFERRER,
      activeDependency: dependency({
        type: DEPENDENCY_TYPES.REFERRAL_CONTACT,
        owner: EVALUATED_ACTORS.PROSPECT,
        status: DEPENDENCY_STATUS.ACTIVE
      }),
      governingCommitment: commitment({
        state: COMMITMENT_STATES.COMPLETED,
        owner: EVALUATED_ACTORS.REFERRER,
        quality: COMMITMENT_QUALITY.SPECIFIC
      })
    })
  },
  {
    name: "RW011 — Prospect says do not contact this week",
    expected: PROCESS_MOVES.WAIT_ON_DEPENDENCY,
    input: input({
      externalConstraints: constraints({
        permissionSignal: PERMISSION_SIGNALS.DENIED_TEMPORARILY
      }),
      governingCommitment: commitment({
        state: COMMITMENT_STATES.ACTIVE,
        owner: EVALUATED_ACTORS.EXTERNAL_EVENT,
        quality: COMMITMENT_QUALITY.NEGATIVE
      })
    })
  },
  {
    name: "RW012 — Prospect says do not contact me again",
    expected: PROCESS_MOVES.HUMAN_REVIEW,
    input: input({
      externalConstraints: constraints({
        permissionSignal: PERMISSION_SIGNALS.DENIED_PERMANENTLY
      }),
      governingCommitment: commitment({
        state: COMMITMENT_STATES.ACTIVE,
        owner: EVALUATED_ACTORS.PROSPECT,
        quality: COMMITMENT_QUALITY.NEGATIVE
      })
    })
  },
  {
    name: "RW013 — High relationship risk after pressure",
    expected: PROCESS_MOVES.REVALIDATE_PERMISSION,
    input: input({
      externalConstraints: constraints({
        relationshipRisk: RISK_LEVELS.HIGH
      }),
      activeDependency: dependency({
        type: DEPENDENCY_TYPES.DECISION,
        owner: EVALUATED_ACTORS.PROSPECT,
        status: DEPENDENCY_STATUS.ACTIVE
      }),
      governingCommitment: commitment({
        state: COMMITMENT_STATES.NONE,
        owner: EVALUATED_ACTORS.PROSPECT,
        quality: COMMITMENT_QUALITY.UNKNOWN
      })
    })
  },
  {
    name: "RW014 — High authority risk",
    expected: PROCESS_MOVES.HUMAN_REVIEW,
    input: input({
      externalConstraints: constraints({
        authorityRisk: RISK_LEVELS.HIGH
      })
    })
  },
  {
    name: "RW015 — High Client First risk",
    expected: PROCESS_MOVES.HUMAN_REVIEW,
    input: input({
      externalConstraints: constraints({
        clientFirstRisk: RISK_LEVELS.HIGH
      })
    })
  },
  {
    name: "RW016 — Advisor owes proposal delivery",
    expected: PROCESS_MOVES.HONOR_COMMITMENT,
    input: input({
      activeDependency: dependency({
        type: DEPENDENCY_TYPES.PROPOSAL_DELIVERY,
        owner: EVALUATED_ACTORS.ADVISOR,
        status: DEPENDENCY_STATUS.ACTIVE
      }),
      governingCommitment: commitment({
        state: COMMITMENT_STATES.ACTIVE,
        owner: EVALUATED_ACTORS.ADVISOR,
        quality: COMMITMENT_QUALITY.SPECIFIC,
        isDueNow: true
      })
    })
  },
  {
    name: "RW017 — Payment pending from client with active agreement",
    expected: PROCESS_MOVES.WAIT_ON_DEPENDENCY,
    input: input({
      activeDependency: dependency({
        type: DEPENDENCY_TYPES.PAYMENT,
        owner: EVALUATED_ACTORS.CLIENT,
        status: DEPENDENCY_STATUS.ACTIVE
      }),
      governingCommitment: commitment({
        state: COMMITMENT_STATES.ACTIVE,
        owner: EVALUATED_ACTORS.CLIENT,
        quality: COMMITMENT_QUALITY.SPECIFIC
      })
    })
  },
  {
    name: "RW018 — Payment commitment missed",
    expected: PROCESS_MOVES.HONOR_COMMITMENT,
    input: input({
      activeDependency: dependency({
        type: DEPENDENCY_TYPES.PAYMENT,
        owner: EVALUATED_ACTORS.CLIENT,
        status: DEPENDENCY_STATUS.ACTIVE
      }),
      governingCommitment: commitment({
        state: COMMITMENT_STATES.MISSED,
        owner: EVALUATED_ACTORS.CLIENT,
        quality: COMMITMENT_QUALITY.SPECIFIC
      })
    })
  },
  {
    name: "RW019 — System OCR still processing",
    expected: PROCESS_MOVES.WAIT_ON_DEPENDENCY,
    input: input({
      activeDependency: dependency({
        type: DEPENDENCY_TYPES.EVIDENCE_VALIDATION,
        owner: EVALUATED_ACTORS.SYSTEM,
        status: DEPENDENCY_STATUS.ACTIVE
      }),
      governingCommitment: commitment({
        state: COMMITMENT_STATES.NONE,
        owner: EVALUATED_ACTORS.SYSTEM,
        quality: COMMITMENT_QUALITY.UNKNOWN
      })
    })
  },
  {
    name: "RW020 — System OCR failed and blocks evidence validation",
    expected: PROCESS_MOVES.UNBLOCK_DEPENDENCY,
    input: input({
      activeDependency: dependency({
        type: DEPENDENCY_TYPES.EVIDENCE_VALIDATION,
        owner: EVALUATED_ACTORS.SYSTEM,
        status: DEPENDENCY_STATUS.BLOCKED
      }),
      governingCommitment: commitment({
        state: COMMITMENT_STATES.NONE,
        owner: EVALUATED_ACTORS.SYSTEM,
        quality: COMMITMENT_QUALITY.UNKNOWN
      })
    })
  }
];

let passed = 0;
const failures = [];

for (const testCase of cases) {
  const actual = resolveProcessMove(testCase.input);

  try {
    assert.strictEqual(
      actual,
      testCase.expected,
      `${testCase.name}\nExpected: ${testCase.expected}\nActual: ${actual}`
    );

    passed += 1;
    console.log(`✅ ${testCase.name}: ${actual}`);
  } catch (error) {
    failures.push({
      name: testCase.name,
      expected: testCase.expected,
      actual,
      message: error.message
    });

    console.log(`❌ ${testCase.name}`);
    console.log(`   Expected: ${testCase.expected}`);
    console.log(`   Actual:   ${actual}`);
  }
}

console.log("");
console.log("=========================================");
console.log("REAL WORLD VALIDATION PACK RESULTS");
console.log("=========================================");
console.log(`Passed: ${passed}/${cases.length}`);
console.log(`Failed: ${failures.length}/${cases.length}`);

if (failures.length > 0) {
  console.log("");
  console.log("Failures:");
  console.log(JSON.stringify(failures, null, 2));
  process.exit(1);
}

console.log("");
console.log(`✅ REAL WORLD VALIDATION PASSED: ${passed}/${cases.length}`);
console.log("=========================================");
