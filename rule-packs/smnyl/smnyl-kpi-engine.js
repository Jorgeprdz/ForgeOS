/*
|--------------------------------------------------------------------------
| KPI Engine
|--------------------------------------------------------------------------
*/

import {
    calcularPersistencia
} from './smnyl-persistencia-engine.js';

import {
    calcularRetencionClientes
} from './smnyl-retencion-engine.js';

import {
    calcularCancelaciones
} from './smnyl-cancelaciones-engine.js';

export function construirKPIs(
    cartera = []
) {

    const persistencia =
        calcularPersistencia(
            cartera
        );

    const retencion =
        calcularRetencionClientes(
            cartera
        );

    const cancelaciones =
        calcularCancelaciones(
            cartera
        );

    return {

        persistencia:
            persistencia.persistencia,

        retencion:
            retencion.retencion,

        cancelaciones:
            cancelaciones.canceladas,

        primaPerdida:
            cancelaciones.primaPerdida
    };
}