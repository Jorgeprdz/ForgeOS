/*
|--------------------------------------------------------------------------
| MODULE: prospect-pipeline-engine.js
|--------------------------------------------------------------------------
*/

export function construirPipelineProspectos({

    prospects = []

}) {

    return {

        new:

            prospects.filter(

                p =>
                    p.status === 'NEW'
            ),

        contacted:

            prospects.filter(

                p =>
                    p.status === 'CONTACTED'
            ),

        appointments:

            prospects.filter(

                p =>
                    p.status === 'APPOINTMENT_SCHEDULED'
            ),

        presentation:

            prospects.filter(

                p =>
                    p.status === 'PRESENTATION_DONE'
            ),

        negotiation:

            prospects.filter(

                p =>
                    p.status === 'NEGOTIATION'
            ),

        won:

            prospects.filter(

                p =>
                    p.status === 'CLOSED_WON'
            )
    };
}