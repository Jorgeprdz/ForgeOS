/*
|--------------------------------------------------------------------------
| MODULE: smart-priority-engine.js
|--------------------------------------------------------------------------
|
| Motor inteligente de prioridades.
|
|--------------------------------------------------------------------------
*/

export function generarPrioridades({

    leads = [],

    puntos = 0

}) {

    const prioridades = [];

    /*
    |--------------------------------------------------------------------------
    | Leads calientes
    |--------------------------------------------------------------------------
    */

    const hotLeads =

        leads.filter(

            lead =>

                lead.temperatura
                === 'hot'
        );

    hotLeads.forEach(

        lead => {

            prioridades.push({

                tipo:
                    'followup',

                prioridad:
                    'alta',

                mensaje:
`
Haz seguimiento con ${lead.nombre}
                `.trim()
            });
        }
    );

    /*
    |--------------------------------------------------------------------------
    | Momentum bajo
    |--------------------------------------------------------------------------
    */

    if (puntos < 10) {

        prioridades.push({

            tipo:
                'prospeccion',

            prioridad:
                'critica',

            mensaje:
`
Necesitas generar más actividad hoy.
            `.trim()
        });
    }

    return prioridades;
}