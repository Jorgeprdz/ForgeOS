const fs = require("fs");
const path = require("path");

const FIXTURE_DIR = path.join(__dirname, "fixtures", "recruitment");

const APPLICATION_STATES = new Set([
  "NEW",
  "SCREENING",
  "INTERVIEWING",
  "ASSESSED",
  "SELECTED",
  "PRECONTRACT",
  "ON_HOLD",
  "REJECTED",
  "WITHDRAWN",
  "CONVERTED",
  "ARCHIVED"
]);

const CYCLE_STATES = new Set([
  "INFORMAL",
  "KEY_ACTIVE",
  "OFFICIAL_WINDOW",
  "AT_RISK",
  "READY",
  "KEY_EXPIRED",
  "REACTIVATED",
  "CLOSED",
  "UNKNOWN"
]);

const KEY_STATUSES = new Set(["NOT_ACTIVATED", "ACTIVE", "EXPIRED", "REACTIVATED", "CLOSED", "UNKNOWN"]);
const ASSIGNMENT_STATES = new Set(["ACTIVE", "ENDED", "TRANSFER_PENDING", "CANCELLED"]);
const ID_PREFIXES = {
  recruitIdentityId: "RECRUIT_IDENTITY_",
  applicationId: "APPLICATION_",
  candidateId: "CANDIDATE_",
  cycleId: "PRECONTRACT_CYCLE_",
  managerId: "MANAGER_",
  previousManagerId: "MANAGER_",
  officeId: "OFFICE_",
  previousOfficeId: "OFFICE_",
  advisorId: "ADVISOR_",
  advisorConversionId: "ADVISOR_CONVERSION_",
  organizationProfileId: "ORG_PROFILE_",
  officeRulesConfigId: "OFFICE_RULES_"
};

const expectedFiles = [
  "recruit-identity-demo.json",
  "recruitment-application-first-attempt.json",
  "recruitment-application-reentry.json",
  "recruitment-application-manager-change.json",
  "recruitment-application-office-change.json",
  "precontract-cycle-active.json",
  "precontract-cycle-expired.json",
  "precontract-cycle-reactivated.json",
  "advisor-conversion-success.json",
  "recruitment-lifecycle-full-demo.json"
];

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isIsoDate(value) {
  if (typeof value !== "string") return false;
  const parsed = Date.parse(value);
  return !Number.isNaN(parsed) && new Date(parsed).toISOString() === value;
}

function addError(errors, message) {
  errors.push(message);
}

function validateId(errors, field, value, context) {
  if (value === null || value === undefined || value === "") return;
  const prefix = ID_PREFIXES[field];
  if (!prefix) return;
  if (typeof value !== "string" || !value.startsWith(prefix)) {
    addError(errors, `${context}.${field} must start with ${prefix}`);
  }
}

function validateEventHistory(errors, events, context) {
  if (!Array.isArray(events) || events.length === 0) {
    addError(errors, `${context}.eventHistory must be a non-empty array`);
    return;
  }

  events.forEach((event, index) => {
    if (!event.eventType) addError(errors, `${context}.eventHistory[${index}].eventType is required`);
    if (!isIsoDate(event.occurredAt)) {
      addError(errors, `${context}.eventHistory[${index}].occurredAt must be ISO`);
    }
  });
}

function validateScenario(errors, data, context) {
  if (!isObject(data.positiveScenario)) addError(errors, `${context}.positiveScenario is required`);
  if (!isObject(data.riskScenario)) addError(errors, `${context}.riskScenario is required`);
}

function validateApplication(errors, data, context) {
  ["applicationId", "recruitIdentityId", "candidateId"].forEach(field => {
    validateId(errors, field, data[field], context);
  });

  if (!APPLICATION_STATES.has(data.applicationStatus)) {
    addError(errors, `${context}.applicationStatus is invalid`);
  }

  if (!isIsoDate(data.createdAt)) addError(errors, `${context}.createdAt must be ISO`);
  if (data.updatedAt && !isIsoDate(data.updatedAt)) addError(errors, `${context}.updatedAt must be ISO`);
  validateEventHistory(errors, data.eventHistory, context);
}

function validateRuleSnapshot(errors, snapshot, context) {
  if (!isObject(snapshot)) {
    addError(errors, `${context}.ruleSnapshot is required`);
    return;
  }

  ["organizationProfileId", "officeRulesConfigId"].forEach(field => {
    validateId(errors, field, snapshot[field], `${context}.ruleSnapshot`);
  });

  if (!isIsoDate(snapshot.capturedAt)) {
    addError(errors, `${context}.ruleSnapshot.capturedAt must be ISO`);
  }

  ["officialWindowDays", "minimumPolicies", "minimumCommissionsMxn"].forEach(field => {
    if (snapshot[field] !== null && snapshot[field] !== undefined && typeof snapshot[field] !== "number") {
      addError(errors, `${context}.ruleSnapshot.${field} must be numeric when present`);
    }
  });
}

function validateCycle(errors, data, context) {
  ["cycleId", "applicationId", "candidateId", "managerId", "officeId"].forEach(field => {
    validateId(errors, field, data[field], context);
  });

  if (!CYCLE_STATES.has(data.cycleStatus)) addError(errors, `${context}.cycleStatus is invalid`);
  if (data.keyStatus && !KEY_STATUSES.has(data.keyStatus)) addError(errors, `${context}.keyStatus is invalid`);
  validateRuleSnapshot(errors, data.ruleSnapshot, context);
  validateEventHistory(errors, data.eventHistory, context);

  if (isObject(data.lifecycle)) {
    Object.keys(data.lifecycle).forEach(key => {
      const value = data.lifecycle[key];
      if (value && key.endsWith("Date") && !isIsoDate(value)) {
        addError(errors, `${context}.lifecycle.${key} must be ISO`);
      }
      if (value && key.endsWith("At") && !isIsoDate(value)) {
        addError(errors, `${context}.lifecycle.${key} must be ISO`);
      }
      if (value && key === "closedAt" && !isIsoDate(value)) {
        addError(errors, `${context}.lifecycle.${key} must be ISO`);
      }
    });
  }

  if (isObject(data.derivedMetrics)) {
    if (data.derivedMetrics.calculatedAt && !isIsoDate(data.derivedMetrics.calculatedAt)) {
      addError(errors, `${context}.derivedMetrics.calculatedAt must be ISO`);
    }
    ["daysWithActiveKey", "daysRemainingInOfficialWindow", "officialWindowProgressPercent"].forEach(field => {
      const value = data.derivedMetrics[field];
      if (value !== null && value !== undefined && typeof value !== "number") {
        addError(errors, `${context}.derivedMetrics.${field} must be numeric when present`);
      }
    });
  }
}

function validateAssignmentHistory(errors, assignments, type, context) {
  if (!Array.isArray(assignments) || assignments.length < 2) {
    addError(errors, `${context}.${type} must contain at least two assignments`);
    return;
  }

  assignments.forEach((assignment, index) => {
    if (!ASSIGNMENT_STATES.has(assignment.assignmentStatus)) {
      addError(errors, `${context}.${type}[${index}].assignmentStatus is invalid`);
    }
    if (!isIsoDate(assignment.startedAt)) {
      addError(errors, `${context}.${type}[${index}].startedAt must be ISO`);
    }
    if (assignment.endedAt && !isIsoDate(assignment.endedAt)) {
      addError(errors, `${context}.${type}[${index}].endedAt must be ISO`);
    }
  });
}

function validateAssignmentList(errors, assignments, type, context) {
  if (!Array.isArray(assignments) || assignments.length === 0) {
    addError(errors, `${context}.${type} must be a non-empty array`);
    return;
  }

  assignments.forEach((assignment, index) => {
    if (!ASSIGNMENT_STATES.has(assignment.assignmentStatus)) {
      addError(errors, `${context}.${type}[${index}].assignmentStatus is invalid`);
    }
    if (!isIsoDate(assignment.startedAt)) {
      addError(errors, `${context}.${type}[${index}].startedAt must be ISO`);
    }
    if (assignment.endedAt && !isIsoDate(assignment.endedAt)) {
      addError(errors, `${context}.${type}[${index}].endedAt must be ISO`);
    }
  });
}

function validateRecruitIdentity(errors, data) {
  validateId(errors, "recruitIdentityId", data.recruitIdentityId, "recruitIdentity");
  if (!data.displayName) addError(errors, "recruitIdentity.displayName is required");
  if (!["ACTIVE", "DUPLICATE_REVIEW", "MERGED_DUPLICATE", "DO_NOT_RECRUIT", "ARCHIVED"].includes(data.identityStatus)) {
    addError(errors, "recruitIdentity.identityStatus is invalid");
  }
  if (!isIsoDate(data.createdAt)) addError(errors, "recruitIdentity.createdAt must be ISO");
  if (!isIsoDate(data.updatedAt)) addError(errors, "recruitIdentity.updatedAt must be ISO");
  validateEventHistory(errors, data.eventHistory, "recruitIdentity");
  validateScenario(errors, data, "recruitIdentity");
}

function validateConversion(errors, data, context) {
  ["advisorConversionId", "applicationId", "recruitIdentityId", "candidateId", "cycleId", "advisorId", "managerId", "officeId"].forEach(field => {
    validateId(errors, field, data[field], context);
  });

  if (!["PENDING", "COMPLETED", "REVERSED"].includes(data.conversionStatus)) {
    addError(errors, `${context}.conversionStatus is invalid`);
  }
  if (!isIsoDate(data.convertedAt)) addError(errors, `${context}.convertedAt must be ISO`);
  if (data.contractSignedAt && !isIsoDate(data.contractSignedAt)) {
    addError(errors, `${context}.contractSignedAt must be ISO`);
  }
  validateEventHistory(errors, data.eventHistory, context);
}

function validateFullLifecycle(errors, data) {
  validateRecruitIdentity(errors, {
    ...data.recruitIdentity,
    eventHistory: [
      {
        eventType: "RECRUIT_IDENTITY_CREATED",
        occurredAt: data.recruitIdentity.createdAt,
        actorId: "SYSTEM"
      }
    ],
    positiveScenario: data.positiveScenario,
    riskScenario: data.riskScenario
  });
  validateApplication(errors, data.application, "fullLifecycle.application");

  if (!Array.isArray(data.candidateAssessments) || data.candidateAssessments.length === 0) {
    addError(errors, "fullLifecycle.candidateAssessments must be non-empty");
  }
  if (!Array.isArray(data.interviews) || data.interviews.length === 0) {
    addError(errors, "fullLifecycle.interviews must be non-empty");
  }
  validateAssignmentList(errors, data.managerAssignments, "managerAssignments", "fullLifecycle");
  validateAssignmentList(errors, data.officeAssignments, "officeAssignments", "fullLifecycle");

  if (!Array.isArray(data.precontractCycles) || data.precontractCycles.length === 0) {
    addError(errors, "fullLifecycle.precontractCycles must be non-empty");
  } else {
    data.precontractCycles.forEach((cycle, index) => validateCycle(errors, cycle, `fullLifecycle.precontractCycles[${index}]`));
  }

  validateConversion(errors, data.advisorConversion, "fullLifecycle.advisorConversion");
  validateScenario(errors, data, "fullLifecycle");
}

function validateFile(fileName, data) {
  const errors = [];

  if (fileName === "recruit-identity-demo.json") validateRecruitIdentity(errors, data);
  if (fileName.startsWith("recruitment-application-")) validateApplication(errors, data, fileName);
  if (fileName.startsWith("precontract-cycle-")) validateCycle(errors, data, fileName);
  if (fileName === "advisor-conversion-success.json") {
    validateConversion(errors, data, fileName);
    validateScenario(errors, data, fileName);
  }
  if (fileName === "recruitment-lifecycle-full-demo.json") validateFullLifecycle(errors, data);

  if (fileName === "recruitment-application-manager-change.json") {
    validateAssignmentHistory(errors, data.managerAssignments, "managerAssignments", fileName);
  }

  if (fileName === "recruitment-application-office-change.json") {
    validateAssignmentHistory(errors, data.officeAssignments, "officeAssignments", fileName);
  }

  if (fileName === "precontract-cycle-reactivated.json") {
    if (!Array.isArray(data.previousCycleIds) || data.previousCycleIds.length < 2) {
      addError(errors, "precontract-cycle-reactivated.json.previousCycleIds must contain multiple cycles");
    }
    if (!Array.isArray(data.cycleHistory) || data.cycleHistory.length < 2) {
      addError(errors, "precontract-cycle-reactivated.json.cycleHistory must contain multiple cycles");
    }
  }

  if (fileName !== "recruitment-lifecycle-full-demo.json" && fileName !== "recruit-identity-demo.json") {
    validateScenario(errors, data, fileName);
  }

  return errors;
}

function run() {
  console.log("\nFORGE RECRUITMENT FIXTURE VALIDATION TEST v1.0\n");

  const results = expectedFiles.map(fileName => {
    const filePath = path.join(FIXTURE_DIR, fileName);
    const result = { fileName, pass: false, errors: [] };

    if (!fs.existsSync(filePath)) {
      result.errors.push("Fixture file is missing");
      return result;
    }

    let data;
    try {
      data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch (error) {
      result.errors.push(`Invalid JSON: ${error.message}`);
      return result;
    }

    result.errors = validateFile(fileName, data);
    result.pass = result.errors.length === 0;
    return result;
  });

  results.forEach(result => {
    console.log(`${result.pass ? "PASS" : "FAIL"} ${result.fileName}`);
    result.errors.forEach(error => console.log(`  - ${error}`));
  });

  const pass = results.filter(result => result.pass).length;
  const fail = results.length - pass;

  console.log("\nResumen:");
  console.log(`Total: ${results.length}`);
  console.log(`Pass: ${pass}`);
  console.log(`Fail: ${fail}`);

  if (fail > 0) {
    console.log("\nFORGE RECRUITMENT FIXTURE FOUNDATION v1.0 NEEDS REVIEW");
    process.exit(1);
  }

  console.log("\nFORGE RECRUITMENT FIXTURE FOUNDATION v1.0 PASS");
}

run();
