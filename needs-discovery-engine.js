/*
|--------------------------------------------------------------------------
| MODULE: needs-discovery-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Financial Needs Discovery Engine
|
|--------------------------------------------------------------------------
*/

export function analizarNecesidades({

    age,

    maritalStatus,

    dependents = 0,

    monthlyIncome = 0,

    emergencyFundMonths = 0,

    hasLifeInsurance = false,

    hasMedicalInsurance = false,

    retirementPlan = false

}) {

    const priorities = [];

    /*
    |--------------------------------------------------------------------------
    | Protection
    |--------------------------------------------------------------------------
    */

    if (!hasLifeInsurance && dependents > 0) {

        priorities.push({

            type:
                'PROTECTION',

            priority:
                'HIGH',

            reason:
                'Dependents without protection'
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Medical
    |--------------------------------------------------------------------------
    */

    if (!hasMedicalInsurance) {

        priorities.push({

            type:
                'MEDICAL',

            priority:
                'HIGH',

            reason:
                'No medical coverage'
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Emergency Fund
    |--------------------------------------------------------------------------
    */

    if (emergencyFundMonths < 6) {

        priorities.push({

            type:
                'EMERGENCY_FUND',

            priority:
                'MEDIUM',

            reason:
                'Low emergency reserve'
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Retirement
    |--------------------------------------------------------------------------
    */

    if (!retirementPlan && age >= 30) {

        priorities.push({

            type:
                'RETIREMENT',

            priority:
                'HIGH',

            reason:
                'No retirement strategy'
        });
    }

    return {

        age,

        monthlyIncome,

        priorities,

        generatedAt:
            Date.now()
    };
}