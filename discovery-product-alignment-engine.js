/*
|--------------------------------------------------------------------------
| MODULE:
| discovery-product-alignment-engine.js
|--------------------------------------------------------------------------
*/

export function sugerirEstrategias({

    primaryRisk

}) {

    const map = {

        INCOME_LOSS: [

            'LIFE_INSURANCE',

            'DISABILITY'
        ],

        MEDICAL_EVENT: [

            'MEDICAL_INSURANCE'
        ],

        RETIREMENT_GAP: [

            'RETIREMENT_PLAN'
        ],

        LIQUIDITY: [

            'EMERGENCY_FUND'
        ]
    };

    return map[
        primaryRisk?.type
    ] || [];
}