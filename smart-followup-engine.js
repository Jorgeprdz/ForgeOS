/*
|--------------------------------------------------------------------------
| MODULE: smart-followup-engine.js
|--------------------------------------------------------------------------
|
| Followups inteligentes.
|
|--------------------------------------------------------------------------
*/

export function detectarFollowups({

    leads = []

}) {

    const ahora = Date.now();

    return leads.filter(

        lead => {

            /*
            |--------------------------------------------------------------------------
            | Sin actividad reciente
            |--------------------------------------------------------------------------
            */

            const ultimaActividad =

                lead.ultimaActividad
                || 0;

            const diasSinActividad =

                (
                    ahora
                    - ultimaActividad
                )

                / 86400000;

            return (

                diasSinActividad >= 3

                &&

                lead.status !== 'pagada'
            );
        }
    );
}