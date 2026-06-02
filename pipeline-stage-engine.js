/*
|--------------------------------------------------------------------------
| MODULE: pipeline-stage-engine.js
|--------------------------------------------------------------------------
|
| Manejo de etapas comerciales.
|
|--------------------------------------------------------------------------
*/

export const PIPELINE_STAGES = [

    'nuevo',

    'contactado',

    'seguimiento',

    'cita',

    'cierre',

    'pagada'
];

export function avanzarPipeline(

    lead = {}

) {

    const currentIndex =
        PIPELINE_STAGES.indexOf(
            lead.status
        );

    if (
        currentIndex === -1
    ) {

        return lead;
    }

    const nextStage =
        PIPELINE_STAGES[
            currentIndex + 1
        ];

    return {

        ...lead,

        status:
            nextStage
            || lead.status,

        updatedAt:
            Date.now()
    };
}