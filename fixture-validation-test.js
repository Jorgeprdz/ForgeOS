const fs = require("fs");
const path = require("path");

const FIXTURE_DIR = path.join(__dirname, "fixtures");

const expectedFixtures = {
  "advisor-demo.json": {
    required: ["advisorId", "name", "status"],
    canonicalIds: ["advisorId"],
    isoDates: ["createdAt", "updatedAt"]
  },
  "candidate-demo.json": {
    required: ["candidateId", "name", "status"],
    canonicalIds: ["candidateId"],
    isoDates: ["createdAt", "updatedAt"]
  },
  "prospect-demo.json": {
    required: ["prospectId", "name", "status"],
    canonicalIds: ["prospectId", "advisorId"],
    isoDates: ["createdAt"]
  },
  "client-demo.json": {
    required: ["clientId", "name", "relationshipStatus"],
    canonicalIds: ["clientId", "advisorId"],
    isoDates: ["clientSince", "createdAt", "updatedAt"]
  },
  "policy-demo.json": {
    required: ["policyId", "clientId", "policyNumber", "productName"],
    canonicalIds: ["policyId", "clientId"],
    isoDates: ["renewalDate", "nextReviewDate", "nextPaymentDate", "metadata.createdAt", "metadata.updatedAt"]
  },
  "relationship-demo.json": {
    required: ["clientId", "name", "relationshipStatus", "relationshipHistory"],
    canonicalIds: ["clientId", "advisorId"],
    isoDates: ["clientSince", "relationshipHistory[].date", "events[].date"]
  },
  "nash-decision-demo.json": {
    required: ["engine", "version", "advisor", "prospect", "intent", "nextBestAction", "confidence"],
    canonicalIds: ["advisor.advisorId", "prospect.prospectId"],
    isoDates: []
  },
  "relationship-report-demo.json": {
    required: ["engine", "version", "clientId", "nextAction", "opportunities", "confidence"],
    canonicalIds: ["clientId"],
    isoDates: ["lifeEvents.detectedEvents[].date", "engagement.lastInteraction"]
  },
  "manager-report-demo.json": {
    required: ["managerId", "reportType", "generatedAt", "summary", "recommendedActions"],
    canonicalIds: ["managerId", "teamId", "advisorIds[]"],
    isoDates: ["generatedAt", "recommendedActions[].dueDate"]
  },
  "precontract-demo.json": {
    required: ["precontractId", "candidateId", "managerId", "startDate", "deadlineDate", "progress", "contractReadiness"],
    canonicalIds: ["precontractId", "candidateId", "advisorId", "managerId"],
    isoDates: ["startDate", "deadlineDate"]
  }
};

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isIsoDate(value) {
  if (typeof value !== "string") return false;
  const parsed = Date.parse(value);
  return !Number.isNaN(parsed) && new Date(parsed).toISOString() === value;
}

function getValuesByPath(object, fieldPath) {
  const parts = fieldPath.split(".");

  function walk(value, index) {
    if (index >= parts.length) return [value];

    const part = parts[index];

    if (part.endsWith("[]")) {
      const key = part.slice(0, -2);
      const arrayValue = value ? value[key] : undefined;
      if (!Array.isArray(arrayValue)) return [undefined];
      return arrayValue.flatMap(item => walk(item, index + 1));
    }

    return walk(value ? value[part] : undefined, index + 1);
  }

  return walk(object, 0);
}

function hasValue(value) {
  if (Array.isArray(value)) return value.length > 0;
  return value !== undefined && value !== null && value !== "";
}

function validateCanonicalId(fieldPath, value) {
  const fieldName = fieldPath.replace("[]", "").split(".").pop();

  if (!hasValue(value)) return `${fieldPath} is missing`;
  if (typeof value !== "string") return `${fieldPath} must be a string`;
  if (!value.includes("_")) return `${fieldPath} should use a canonical underscore ID`;

  const prefixByField = {
    advisorId: "ADVISOR_",
    candidateId: "CANDIDATE_",
    prospectId: "PROSPECT_",
    clientId: "CLIENT_",
    policyId: "POLICY_",
    precontractId: "PRECONTRACT_",
    managerId: "MANAGER_",
    teamId: "TEAM_"
  };

  const expectedPrefix = prefixByField[fieldName];
  if (expectedPrefix && !value.startsWith(expectedPrefix)) {
    return `${fieldPath} should start with ${expectedPrefix}`;
  }

  return null;
}

function validateFixture(fileName, data) {
  const spec = expectedFixtures[fileName];
  const errors = [];

  spec.required.forEach(field => {
    if (!hasValue(data[field])) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  spec.canonicalIds.forEach(fieldPath => {
    getValuesByPath(data, fieldPath).forEach(value => {
      const error = validateCanonicalId(fieldPath, value);
      if (error) errors.push(error);
    });
  });

  spec.isoDates.forEach(fieldPath => {
    getValuesByPath(data, fieldPath).forEach(value => {
      if (hasValue(value) && !isIsoDate(value)) {
        errors.push(`${fieldPath} must be an ISO date string`);
      }
    });
  });

  if (!isObject(data.positiveScenario)) {
    errors.push("Missing positiveScenario object");
  }

  if (!isObject(data.riskScenario)) {
    errors.push("Missing riskScenario object");
  }

  return errors;
}

function run() {
  console.log("\nFORGE FIXTURE VALIDATION TEST v1.0\n");

  const results = [];

  Object.keys(expectedFixtures).forEach(fileName => {
    const filePath = path.join(FIXTURE_DIR, fileName);
    const result = {
      fileName,
      pass: false,
      errors: []
    };

    if (!fs.existsSync(filePath)) {
      result.errors.push("Fixture file is missing");
      results.push(result);
      return;
    }

    let data;
    try {
      data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch (error) {
      result.errors.push(`Invalid JSON: ${error.message}`);
      results.push(result);
      return;
    }

    result.errors = validateFixture(fileName, data);
    result.pass = result.errors.length === 0;
    results.push(result);
  });

  results.forEach(result => {
    console.log(`${result.pass ? "PASS" : "FAIL"} ${result.fileName}`);
    result.errors.forEach(error => {
      console.log(`  - ${error}`);
    });
  });

  const pass = results.filter(result => result.pass).length;
  const fail = results.length - pass;

  console.log("\nResumen:");
  console.log(`Total: ${results.length}`);
  console.log(`Pass: ${pass}`);
  console.log(`Fail: ${fail}`);

  if (fail > 0) {
    console.log("\nFORGE FIXTURE FOUNDATION v1.0 NEEDS REVIEW");
    process.exit(1);
  }

  console.log("\nFORGE FIXTURE FOUNDATION v1.0 PASS");
}

run();
