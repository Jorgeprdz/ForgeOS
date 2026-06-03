const fs = require("fs");
const path = require("path");

const FIXTURE_DIR = path.join(__dirname, "fixtures", "recruitment");

const files = [
  "organization-profile-demo.json",
  "office-rules-config-standard.json",
  "office-rules-config-light.json",
  "office-rules-config-strict.json"
];

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isIsoDate(value) {
  if (typeof value !== "string") return false;
  const parsed = Date.parse(value);
  return !Number.isNaN(parsed) && new Date(parsed).toISOString() === value;
}

function add(errors, message) {
  errors.push(message);
}

function validatePrefix(errors, label, value, prefix) {
  if (typeof value !== "string" || !value.startsWith(prefix)) {
    add(errors, `${label} must start with ${prefix}`);
  }
}

function validateOrganizationProfile(data) {
  const errors = [];

  validatePrefix(errors, "organizationId", data.organizationId, "ORG_");
  validatePrefix(errors, "organizationProfileId", data.organizationProfileId, "ORG_PROFILE_");
  validatePrefix(errors, "officeId", data.officeId, "OFFICE_");
  validatePrefix(errors, "managerId", data.managerId, "MANAGER_");
  validatePrefix(errors, "activeRulesConfigId", data.activeRulesConfigId, "OFFICE_RULES_");

  if (!data.channel) add(errors, "channel is required");
  if (!data.country) add(errors, "country is required");
  if (!data.currency) add(errors, "currency is required");
  if (data.effectiveFrom && !isIsoDate(data.effectiveFrom)) add(errors, "effectiveFrom must be ISO");
  if (data.effectiveTo && !isIsoDate(data.effectiveTo)) add(errors, "effectiveTo must be ISO");

  return errors;
}

function validateRulesConfig(data) {
  const errors = [];

  validatePrefix(errors, "rulesConfigId", data.rulesConfigId, "OFFICE_RULES_");
  validatePrefix(errors, "officeRulesConfigId", data.officeRulesConfigId, "OFFICE_RULES_");
  validatePrefix(errors, "organizationId", data.organizationId, "ORG_");
  validatePrefix(errors, "officeId", data.officeId, "OFFICE_");

  if (data.rulesConfigId !== data.officeRulesConfigId) {
    add(errors, "rulesConfigId and officeRulesConfigId must match");
  }

  if (!data.currency) add(errors, "currency is required");
  if (!isIsoDate(data.effectiveFrom)) add(errors, "effectiveFrom must be ISO");
  if (data.effectiveTo && !isIsoDate(data.effectiveTo)) add(errors, "effectiveTo must be ISO");
  if (!isIsoDate(data.capturedAt)) add(errors, "capturedAt must be ISO");

  ["officialWindowDays", "minimumPolicies", "minimumCommissions"].forEach(field => {
    if (typeof data[field] !== "number") add(errors, `${field} must be present and numeric`);
  });

  if (!isObject(data.reactivationRules)) add(errors, "reactivationRules is required");
  if (!isObject(data.scoringWeights)) add(errors, "scoringWeights is required");

  if (!isObject(data.precontractRules)) {
    add(errors, "precontractRules is required");
  } else {
    if (data.precontractRules.officialWindowDays !== data.officialWindowDays) {
      add(errors, "precontractRules.officialWindowDays must match top-level officialWindowDays");
    }
    if (data.precontractRules.minimumPolicies !== data.minimumPolicies) {
      add(errors, "precontractRules.minimumPolicies must match top-level minimumPolicies");
    }
    if (data.precontractRules.minimumCommissionAmount !== data.minimumCommissions) {
      add(errors, "precontractRules.minimumCommissionAmount must match top-level minimumCommissions");
    }
  }

  return errors;
}

function run() {
  console.log("\nFORGE ORGANIZATION RULES FIXTURE VALIDATION TEST v1.0\n");

  const parsed = {};
  const results = files.map(file => {
    const filePath = path.join(FIXTURE_DIR, file);
    const result = { file, pass: false, errors: [] };

    if (!fs.existsSync(filePath)) {
      result.errors.push("Fixture file is missing");
      return result;
    }

    let data;
    try {
      data = JSON.parse(fs.readFileSync(filePath, "utf8"));
      parsed[file] = data;
    } catch (error) {
      result.errors.push(`Invalid JSON: ${error.message}`);
      return result;
    }

    result.errors =
      file === "organization-profile-demo.json"
        ? validateOrganizationProfile(data)
        : validateRulesConfig(data);

    result.pass = result.errors.length === 0;
    return result;
  });

  const rules = [
    parsed["office-rules-config-standard.json"],
    parsed["office-rules-config-light.json"],
    parsed["office-rules-config-strict.json"]
  ].filter(Boolean);

  if (rules.length === 3) {
    const variants = new Set(rules.map(rule => `${rule.officialWindowDays}:${rule.minimumPolicies}:${rule.minimumCommissions}`));
    if (variants.size < 3) {
      results.push({
        file: "rules-variation",
        pass: false,
        errors: ["standard/light/strict rules must vary"]
      });
    }
  }

  results.forEach(result => {
    console.log(`${result.pass ? "PASS" : "FAIL"} ${result.file}`);
    result.errors.forEach(error => console.log(`  - ${error}`));
  });

  const pass = results.filter(result => result.pass).length;
  const fail = results.length - pass;

  console.log("\nResumen:");
  console.log(`Total: ${results.length}`);
  console.log(`Pass: ${pass}`);
  console.log(`Fail: ${fail}`);

  if (fail > 0) {
    console.log("\nFORGE ORGANIZATION RULES FIXTURE FOUNDATION v1.0 NEEDS REVIEW");
    process.exit(1);
  }

  console.log("\nFORGE ORGANIZATION RULES FIXTURE FOUNDATION v1.0 PASS");
}

run();
