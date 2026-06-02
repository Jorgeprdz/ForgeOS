/*
|--------------------------------------------------------------------------
| Time Block Engine
|--------------------------------------------------------------------------
*/

export function construirAgendaIA({

    followups = [],

    renovaciones = [],

    leads = []

}) {

    return [

        {
            hora: '08:00',

            bloque:
                'Prospección',

            tareas:
                leads.slice(0, 5)
        },

        {
            hora: '10:00',

            bloque:
                'Seguimientos',

            tareas:
                followups.slice(0, 5)
        },

        {
            hora: '12:00',

            bloque:
                'Renovaciones',

            tareas:
                renovaciones.slice(0, 5)
        }
    ];
}