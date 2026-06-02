/*
|--------------------------------------------------------------------------
| MODULE:
| sales-dna-stage-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Detecta fortalezas y debilidades por etapa comercial.
|
|--------------------------------------------------------------------------
*/

export function analizarEtapasVentaAsesor({

    metrics = {}

}) {

    const stages = {

        PROSPECTING:
            metrics.prospectingRate || 0,

        FIRST_CONTACT:
            metrics.firstContactResponseRate || 0,

        FOLLOWUP:
            metrics.followupCompletionRate || 0,

        APPOINTMENT:
            metrics.appointmentRate || 0,

        PRESENTATION:
            metrics.presentationRate || 0,

        CLOSING:
            metrics.closingRate || 0
    };

    const sorted =
        Object.entries(stages)
            .sort(
                (a, b) =>
                    b[1] - a[1]
            );

    return {

        strongestStage:
            sorted[0]?.[0] || 'UNKNOWN',

        weakestStage:
            sorted[sorted.length - 1]?.[0] || 'UNKNOWN',

        stages
    };
}