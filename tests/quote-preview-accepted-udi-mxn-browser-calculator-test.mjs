import assert from "node:assert/strict";
import fs from "node:fs";
import { pathToFileURL } from "node:url";
import path from "node:path";

const calculators = await import(
  pathToFileURL(path.resolve("docs/quote-preview-live/forge-quote-calculators.mjs")).href
);

const verifiedRate = {
  ...JSON.parse(fs.readFileSync("forge-rate-cache.json", "utf8")),
  cacheStatus: "CACHE_HIT"
};

const metadata = await calculators.getVerifiedUdiRateMetadata({
  rateProvider: async () => verifiedRate
});

assert.equal(metadata.status, "VERIFIED_UDI_RATE_AVAILABLE");
assert.equal(metadata.currentUdiValue, verifiedRate.rates.UDI_MXN.value);
assert.equal(metadata.source, "BANXICO_SIE_API");
assert.equal(metadata.sourceDate, verifiedRate.rates.UDI_MXN.date);
assert.equal(metadata.sourceMode, "CACHE");

const parsedQuote = {
  productName: "IMAGINA SER TEST",
  currency: "UDI",
  currentAge: 40,
  retirementAge: 65,
  coverageYears: 25,
  sumAssuredUdi: 50000,
  savingsUdiGrowthRate: 0.04,
  retirementUdiGrowthRate: 0.045,
  premiumStructure: {
    basicAnnualPremium: 1000,
    plannedAnnualContribution: 250,
    totalAnnualPremium: 1250,
    premiumPayingYears: 12,
    paidUntilAge: 52
  },
  scenarios: {
    base: {
      lumpSum: 22000,
      monthlyIncome: 500
    }
  }
};

const scenario = calculators.buildRetirementPresentationScenario({
  parsedQuote,
  udiRateMetadata: metadata
});

assert.equal(scenario.status, "READY");
assert.equal(scenario.summary.totalContributedUDI, 15000);
const expectedContributed = Array.from({ length: 12 }).reduce(
  (sum, _, index) => sum + 1250 * metadata.currentUdiValue * Math.pow(1.04, index),
  0
);
assert.equal(scenario.summary.totalContributedMXN, expectedContributed);
assert.notEqual(scenario.summary.totalContributedMXN, 15000 * metadata.currentUdiValue);
assert.equal(scenario.summary.lumpSumUDI, 22000);
assert.equal(
  scenario.summary.lumpSumMXN,
  22000 * scenario.summary.projectedUdiAtRetirement
);
assert.notEqual(scenario.summary.lumpSumMXN, 22000 * metadata.currentUdiValue);
assert.equal(scenario.summary.currencySource.source, "BANXICO_SIE_API");
assert.equal(scenario.summary.currencySource.sourceDate, verifiedRate.rates.UDI_MXN.date);

const missingMetadata = await calculators.getVerifiedUdiRateMetadata({
  rateProvider: async () => ({ cacheStatus: "CACHE_HIT", rates: {} })
});

assert.equal(missingMetadata.status, "BLOCKED_NO_VERIFIED_UDI_RATE");
assert.equal(missingMetadata.currentUdiValue, null);

const blockedScenario = calculators.buildRetirementPresentationScenario({
  parsedQuote,
  udiRateMetadata: missingMetadata
});

assert.equal(blockedScenario.status, "BLOCKED_NO_VERIFIED_UDI_RATE");
assert.equal(blockedScenario.currentUdiValue, null);
assert.ok(!("summary" in blockedScenario));

const hostHtml = fs.readFileSync(
  "docs/static-preview/forge-alive/nueva-cotizacion/index.html",
  "utf8"
);

assert.match(hostHtml, /formatUdiWithMxn/);
assert.match(hostHtml, /Valor UDI:/);
assert.match(hostHtml, /Fuente: \$\{sourceLabel \|\| "motor verificado"\}/);
assert.match(hostHtml, /MXN pendiente: falta valor UDI verificado\./);
assert.match(hostHtml, /getVerifiedUdiRateMetadata\(\{ rateProvider: browserUdiRateProvider \}\)/);
assert.match(hostHtml, /buildRetirementPresentationScenario/);

console.log("PASS quote preview accepted UDI MXN browser calculator");
