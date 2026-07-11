// Generated from retirement-presentation-scenario-engine.js. Do not hand-edit.
export function calculateTotalContributed({
  totalAnnualPremium = 0,
  premiumPayingYears = 0,
} = {}) {
  const annualPremium = Number(totalAnnualPremium);
  const payingYears = Number(premiumPayingYears);
  if (!Number.isFinite(annualPremium) || annualPremium < 0) {
    throw new TypeError("totalAnnualPremium must be a finite non-negative number");
  }
  if (!Number.isFinite(payingYears) || payingYears < 0) {
    throw new TypeError("premiumPayingYears must be a finite non-negative number");
  }
  return annualPremium * payingYears;
}

const api=Object.freeze({calculateTotalContributed});
globalThis.ForgeQuoteCalculators=api;
if(typeof globalThis.dispatchEvent==="function"&&typeof globalThis.CustomEvent==="function"){globalThis.dispatchEvent(new CustomEvent("forge:quote-calculators-ready",{detail:api}));}
