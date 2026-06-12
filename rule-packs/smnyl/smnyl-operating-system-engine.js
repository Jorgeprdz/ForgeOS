/*
|--------------------------------------------------------------------------
| Operating System Engine
|--------------------------------------------------------------------------
*/

import {
    construirDashboardEjecutivo
} from './smnyl-executive-dashboard-engine.js';

import {
    ejecutarAutomations
} from './smnyl-automation-engine.js';

import {
    detectarAnomalias
} from './smnyl-anomaly-engine.js';

import {
    construirAgendaIA
} from './smnyl-time-block-engine.js';

export function ejecutarSistemaOperativo({

    cartera = [],

    prospectos = [],

    concursos = {},

    produccionActual = 0,

    produccionAnterior = 0

}) {

    const dashboard =
        construirDashboardEjecutivo({

            cartera,

            produccion:
                produccionActual
        });

    const automations =
        ejecutarAutomations({

            cartera,

            prospectos,

            concursos
        });

    const anomalies =
        detectarAnomalias({

            produccionActual,

            produccionAnterior,

            persistencia:
                dashboard
                    .kpis
                    .persistencia
        });

    const agenda =
        construirAgendaIA({

            followups:
                automations.followups,

            renovaciones:
                [],

            leads:
                prospectos
        });

    return {

        dashboard,

        automations,

        anomalies,

        agenda
    };
}