const {
  projectCurrencyValue
} = require("./future-currency-value-engine");

function calculateProtectedDiseases({
  sumAssured,
  currency,
  diseaseDefinitions,
  currentExchangeRate,
  annualProjectionRate = null,
  yearsFromNow = 0
}) {
  if (!sumAssured) {
    throw new Error("Missing sumAssured");
  }

  if (!currency) {
    throw new Error("Missing currency");
  }

  if (!Array.isArray(diseaseDefinitions)) {
    throw new Error(
      "Disease definitions must be an array"
    );
  }

  return diseaseDefinitions.map((disease) => {
    const coveredAmount =
      sumAssured *
      disease.coveragePercentage;

    const conversion =
      projectCurrencyValue({
        amount: coveredAmount,
        currency,
        yearsFromNow,
        currentExchangeRate,
        annualProjectionRate
      });

    return {
      event: disease.event,
      coverageName:
        disease.coverageName,
      coveragePercentage:
        disease.coveragePercentage,
      coveredAmount,
      currency,
      mxn: conversion.mxn,
      projectedRate:
        conversion.projectedRate,
      conversionStatus:
        conversion.conversionStatus
    };
  });
}

module.exports = {
  calculateProtectedDiseases
};
