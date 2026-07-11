import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import path from "node:path";
const mod=await import(pathToFileURL(path.resolve("retirement-presentation-scenario-engine.js")).href);
assert.equal(mod.calculateTotalContributed({totalAnnualPremium:1200,premiumPayingYears:10}),12000);
assert.throws(()=>mod.calculateTotalContributed({totalAnnualPremium:-1,premiumPayingYears:10}),/totalAnnualPremium/);
console.log("PASS total contributed helper");
