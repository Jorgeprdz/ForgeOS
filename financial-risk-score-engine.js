/*
|--------------------------------------------------------------------------
| MODULE: financial-risk-score-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Calcula score de riesgo financiero.
|
|--------------------------------------------------------------------------
*/

export function calcularRiskScore({

    risks = []

}) {

    const weights = {

        CRITICAL:
            40,

        HIGH:
            25,

        MEDIUM:
            15,

        LOW:
            5
    };

    return risks.reduce(

        (total, risk) =>
            total + (
                weights[risk.priority] || 0
            ),

        0
    );
}