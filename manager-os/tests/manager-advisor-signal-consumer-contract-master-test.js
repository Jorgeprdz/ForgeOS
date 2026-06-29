const assert = require("assert");
const fs = require("fs");
const path = require("path");

const {
  MANAGER_ADVISOR_SIGNAL_CONTRACT_STATUSES,
  mapAdvisorOsSignalsForManager
} = require("../advisor-signals/manager-advisor-signal-consumer-contract");

console.log("\nFORGE MANAGER ADVISOR SIGNAL CONSUMER CONTRACT MASTER TEST v1.0\n");

const strongInput = {
  advisor: {
    id: "ADVISOR_001",
    name: "Advisor One"
  },
  advisorPerformance: {
    score: 155,
    nivel: "alto"
  },
  advisorMonitor: {
    advisorId: "ADVISOR_001",
    pendingTasks: 2,
    activePolicies: 8,
    generatedAt: "2026-06-28T12:00:00.000Z"
  },
  advisorScore: 42,
  advisorAlerts: [
    { type: "TASKS", message: "Tienes tareas vencidas" }
  ],
  activityTimeline: [
    {
      advisorId: "ADVISOR_001",
      tipo: "CALL",
      timestamp: "2026-06-28T12:00:00.000Z"
    }
  ],
  prospectingSignals: {
    pipelineBuckets: {
      NEW: 3,
      CONTACTED: 4
    }
  },
  followupSignals: {
    priority: "HIGH",
    recommendation: "CALL"
  },
  referralSignals: {
    board: {
      nuevo: ["REF_001"]
    }
  },
  salesDnaSignals: {
    strongestStage: "FOLLOWUP",
    weakestStage: "CLOSING"
  },
  period: {
    periodId: "2026-06",
    startsAt: "2026-06-01",
    endsAt: "2026-06-30"
  },
  sourceEvidence: {
    evidenceRefs: ["advisor-signal-evidence-1", "shared-ref"],
    sourceEvidenceIds: ["advisor-signal-source-1", "shared-source"],
    sourceOwners: ["ADVISOR_OS"],
    freshness: {
      status: "FRESH",
      capturedAt: "2026-06-28T12:00:00.000Z"
    }
  },
  requestedUse: "MANAGER_REVIEW"
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function assertBoundaries(result) {
  assert.equal(result.automaticDecisionAllowed, false);
  assert.equal(result.createsManagerJudgmentTruth, false);
  assert.equal(result.createsHumanRankingTruth, false);
  assert.equal(result.createsPromotionDecisionTruth, false);
  assert.equal(result.createsAdvisorLifecycleTruth, false);
  assert.equal(result.createsCompensationTruth, false);
  assert.equal(result.createsRevenue, false);
  assert.equal(result.createsCompensation, false);
  assert.equal(result.createsPayoutTruth, false);
}

const tests = [
  {
    name: "Strong Advisor OS signals with evidence become manager review context",
    run() {
      const result = mapAdvisorOsSignalsForManager(strongInput);

      assert.equal(result.contractStatus, MANAGER_ADVISOR_SIGNAL_CONTRACT_STATUSES.READY_FOR_MANAGER_REVIEW);
      assert.equal(result.advisorId, "ADVISOR_001");
      assert.ok(result.managerVisibleSignals.length >= 8);
      assert.ok(result.allowedUses.includes("MANAGER_REVIEW"));
      assert.equal(result.blockedUses.length, 0);
      assertBoundaries(result);
    }
  },
  {
    name: "Missing evidence requires review",
    run() {
      const result = mapAdvisorOsSignalsForManager({
        ...strongInput,
        sourceEvidence: {
          sourceOwners: ["ADVISOR_OS"],
          freshness: { status: "FRESH" }
        }
      });

      assert.ok([
        MANAGER_ADVISOR_SIGNAL_CONTRACT_STATUSES.NEEDS_EVIDENCE,
        MANAGER_ADVISOR_SIGNAL_CONTRACT_STATUSES.NEEDS_HUMAN_REVIEW
      ].includes(result.contractStatus));
      assert.equal(result.managerReviewRequired, true);
      assert.equal(result.humanReviewRequired, true);
      assert.ok(result.confidenceLimitations.includes("missing_signal_evidence"));
      assertBoundaries(result);
    }
  },
  {
    name: "Missing source owner requires review",
    run() {
      const result = mapAdvisorOsSignalsForManager({
        ...strongInput,
        sourceEvidence: {
          evidenceRefs: ["evidence-1"],
          sourceEvidenceIds: ["source-1"],
          freshness: { status: "FRESH" }
        }
      });

      assert.ok([
        MANAGER_ADVISOR_SIGNAL_CONTRACT_STATUSES.NEEDS_SOURCE_OWNER,
        MANAGER_ADVISOR_SIGNAL_CONTRACT_STATUSES.NEEDS_HUMAN_REVIEW
      ].includes(result.contractStatus));
      assert.equal(result.managerReviewRequired, true);
      assert.equal(result.humanReviewRequired, true);
      assert.ok(result.confidenceLimitations.includes("missing_signal_source_owner"));
      assertBoundaries(result);
    }
  },
  {
    name: "Missing freshness is surfaced",
    run() {
      const result = mapAdvisorOsSignalsForManager({
        ...strongInput,
        advisorMonitor: {
          advisorId: "ADVISOR_001",
          pendingTasks: 2,
          activePolicies: 8
        },
        activityTimeline: [
          {
            advisorId: "ADVISOR_001",
            tipo: "CALL"
          }
        ],
        sourceEvidence: {
          evidenceRefs: ["evidence-1"],
          sourceEvidenceIds: ["source-1"],
          sourceOwners: ["ADVISOR_OS"]
        }
      });

      assert.equal(result.contractStatus, MANAGER_ADVISOR_SIGNAL_CONTRACT_STATUSES.NEEDS_FRESHNESS);
      assert.ok(result.staleSignals.includes("signal_freshness_missing"));
      assert.ok(result.warnings.some((warning) => warning.includes("freshness is missing")));
      assertBoundaries(result);
    }
  },
  {
    name: "Stale freshness is surfaced",
    run() {
      const result = mapAdvisorOsSignalsForManager({
        ...strongInput,
        sourceEvidence: {
          evidenceRefs: ["evidence-1"],
          sourceEvidenceIds: ["source-1"],
          sourceOwners: ["ADVISOR_OS"],
          freshness: { status: "STALE" }
        }
      });

      assert.equal(result.contractStatus, MANAGER_ADVISOR_SIGNAL_CONTRACT_STATUSES.NEEDS_FRESHNESS);
      assert.ok(result.staleSignals.includes("signal_freshness_stale"));
      assert.equal(result.humanReviewRequired, true);
      assertBoundaries(result);
    }
  },
  {
    name: "Default-zero legacy signal does not become truth",
    run() {
      const result = mapAdvisorOsSignalsForManager({
        ...strongInput,
        advisorPerformance: {
          score: 0,
          nivel: "bajo"
        },
        advisorScore: 0
      });

      assert.equal(result.managerReviewRequired, true);
      assert.equal(result.humanReviewRequired, true);
      assert.ok(result.warnings.some((warning) => warning.includes("legacy_zero")));
      assert.equal(result.createsManagerJudgmentTruth, false);
      assertBoundaries(result);
    }
  },
  {
    name: "Forbidden uses are blocked",
    run() {
      [
        "PUNISHMENT",
        "HUMAN_RANKING",
        "PROMOTION_DECISION",
        "TERMINATION",
        "COMPENSATION",
        "PAYOUT",
        "ADVISOR_LIFECYCLE_TRUTH",
        "REVENUE_TRUTH"
      ].forEach((requestedUse) => {
        const result = mapAdvisorOsSignalsForManager({
          ...strongInput,
          requestedUse
        });

        assert.equal(result.contractStatus, MANAGER_ADVISOR_SIGNAL_CONTRACT_STATUSES.BLOCKED);
        assert.ok(result.blockedUses.includes(requestedUse));
        assert.equal(result.automaticDecisionAllowed, false);
        assertBoundaries(result);
      });
    }
  },
  {
    name: "Allowed uses are allowed as context only",
    run() {
      [
        "MANAGER_REVIEW",
        "COACHING_CONTEXT",
        "TEAM_PATTERN_CONTEXT",
        "ONE_ON_ONE_PREP",
        "SUPPORT_SIGNAL_REVIEW"
      ].forEach((requestedUse) => {
        const result = mapAdvisorOsSignalsForManager({
          ...strongInput,
          requestedUse
        });

        assert.ok(result.allowedUses.includes(requestedUse));
        assert.equal(result.blockedUses.length, 0);
        assert.equal(result.createsManagerJudgmentTruth, false);
        assertBoundaries(result);
      });
    }
  },
  {
    name: "Inputs are not mutated",
    run() {
      const input = clone(strongInput);
      const before = clone(input);

      mapAdvisorOsSignalsForManager(input);

      assert.deepEqual(input, before);
    }
  },
  {
    name: "Evidence refs merge without duplicates",
    run() {
      const result = mapAdvisorOsSignalsForManager({
        ...strongInput,
        advisorPerformance: {
          score: 155,
          evidenceRefs: ["shared-ref", "performance-ref"],
          sourceEvidenceIds: ["shared-source", "performance-source"]
        }
      });

      assert.deepEqual(result.evidenceRefs.sort(), ["advisor-signal-evidence-1", "performance-ref", "shared-ref"].sort());
      assert.deepEqual(result.sourceEvidenceIds.sort(), ["advisor-signal-source-1", "performance-source", "shared-source"].sort());
      assert.equal(result.evidenceRefs.filter((ref) => ref === "shared-ref").length, 1);
      assert.equal(result.sourceEvidenceIds.filter((ref) => ref === "shared-source").length, 1);
      assertBoundaries(result);
    }
  },
  {
    name: "No imports from forbidden domains",
    run() {
      const contractPath = path.join(__dirname, "../advisor-signals/manager-advisor-signal-consumer-contract.js");
      const source = fs.readFileSync(contractPath, "utf8");

      assert.equal(/require\(["'][^"']*(advisor-os|compensation|revenue|advisor-lifecycle|product-intelligence|recruitment|rda-attribution)/.test(source), false);
      assert.equal(/from ["'][^"']*(advisor-os|compensation|revenue|advisor-lifecycle|product-intelligence|recruitment|rda-attribution)/.test(source), false);
    }
  }
];

let pass = 0;

tests.forEach((test) => {
  try {
    test.run();
    pass += 1;
    console.log(`PASS ${test.name}`);
  } catch (error) {
    console.log(`FAIL ${test.name}`);
    console.log(error);
  }
});

console.log("\nResumen:");
console.log(`Total: ${tests.length}`);
console.log(`Pass: ${pass}`);
console.log(`Fail: ${tests.length - pass}`);

if (pass !== tests.length) {
  process.exitCode = 1;
}
