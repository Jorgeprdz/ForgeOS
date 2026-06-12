/*
|--------------------------------------------------------------------------
| Executive Dashboard Engine
|--------------------------------------------------------------------------
*/

import {
    construirKPIs
} from './smnyl-kpi-engine.js';

import {
    calcularHealthScore
} from './smnyl-health-score-engine.js';

import {
    calcularForecastMensual
} from './smnyl-forecast-engine.js';

export function construirDashboardEjecutivo({

    cartera = [],

    produccion = 0

}) {

    const kpis =
        construirKPIs(
            cartera
        );

    const health =
        calcularHealthScore({

            persistencia:
                kpis.persistencia,

            retencion:
                kpis.retencion,

            cancelaciones:
                kpis.cancelaciones
        });

    const forecast =
        calcularForecastMensual({

            produccionActual:
                produccion
        });

    return {

        kpis,

        health,

        forecast
    };
}