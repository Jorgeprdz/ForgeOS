/*
|--------------------------------------------------------------------------
| MODULE: financial-pyramid-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Financial Pyramid Engine
|
|--------------------------------------------------------------------------
*/

export function evaluarPiramideFinanciera({

    emergencyFundMonths = 0,

    hasLifeInsurance = false,

    hasMedicalInsurance = false,

    retirementPlan = false,

    investmentPortfolio = false

}) {

    return {

        liquidity:

            emergencyFundMonths >= 6,

        protection:

            hasLifeInsurance
            &&
            hasMedicalInsurance,

        accumulation:

            retirementPlan,

        investment:

            investmentPortfolio,

        retirement:

            retirementPlan
    };
}