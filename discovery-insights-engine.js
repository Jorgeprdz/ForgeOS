/*
|--------------------------------------------------------------------------
| MODULE: discovery-insights-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
*/

export function generarInsightsDescubrimiento({

    primaryRisk,

    risks = [],

    pyramid,

    answers = []

}) {

    return {

        primaryConcern:
            primaryRisk?.title || null,

        totalRisks:
            risks.length,

        pyramidWeakness:

            Object.keys(
                pyramid
            ).find(

                (key) =>
                    pyramid[key] === false
            ) || null,

        answerCount:
            answers.length
    };
}