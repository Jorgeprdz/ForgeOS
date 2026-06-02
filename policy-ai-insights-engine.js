/*
|--------------------------------------------------------------------------
| MODULE: policy-ai-insights-engine.js
|--------------------------------------------------------------------------
|
| AI operational insights engine.
|
|--------------------------------------------------------------------------
*/

export function generarInsightsIA({

    riskLevel = 'LOW',

    daysWithoutContact = 0,

    renewalClose = false

}) {

    const insights = [];

    /*
    |--------------------------------------------------------------------------
    | High risk
    |--------------------------------------------------------------------------
    */

    if (riskLevel === 'HIGH') {

        insights.push(

            'Alto riesgo de cancelación'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | No recent contact
    |--------------------------------------------------------------------------
    */

    if (daysWithoutContact > 30) {

        insights.push(

            'Cliente sin contacto reciente'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Renewal
    |--------------------------------------------------------------------------
    */

    if (renewalClose) {

        insights.push(

            'Renovación próxima'
        );
    }

    return insights;
}