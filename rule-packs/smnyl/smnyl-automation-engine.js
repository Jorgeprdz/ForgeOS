/*
|--------------------------------------------------------------------------
| Automation Engine
|--------------------------------------------------------------------------
*/

import {
    generarRecordatorios
} from './smnyl-reminders-engine.js';

import {
    generarFollowups
} from './smnyl-followup-engine.js';

import {
    generarAlertasConcursos
} from './smnyl-alerts-engine.js';

export function ejecutarAutomations({

    cartera = [],

    prospectos = [],

    concursos = {}

}) {

    const reminders =
        generarRecordatorios(
            cartera
        );

    const followups =
        generarFollowups(
            prospectos
        );

    const alerts =
        generarAlertasConcursos(
            concursos
        );

    return {

        reminders,

        followups,

        alerts,

        totalAutomations:

            reminders.length +

            followups.length +

            alerts.length
    };
}