"use strict";

const crypto = require("crypto");

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (!value || typeof value !== "object") return value;
  return Object.keys(value).sort().reduce((output, key) => {
    if (value[key] !== undefined) output[key] = stable(value[key]);
    return output;
  }, {});
}

function calculateAdvisorCompensationCalculationDigest(payload) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(stable(payload)))
    .digest("hex");
}

module.exports = {
  stable,
  calculateAdvisorCompensationCalculationDigest
};
