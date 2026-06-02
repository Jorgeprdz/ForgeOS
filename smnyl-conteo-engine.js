// smnyl-conteo-engine.js

import { calcularConteo } from './smnyl-prima-engine.js';

export function calcularConteoTotal(polizas = []) {

    return polizas.reduce((acc, poliza) => {

        return acc + calcularConteo(poliza);

    }, 0);
}

export function calcularConteoVida(polizas = []) {

    return polizas
        .filter(x => !x.plan?.includes('Alfa'))
        .reduce((acc, poliza) => {

            return acc + calcularConteo(poliza);

        }, 0);
}

export function calcularConteoGMM(polizas = []) {

    return polizas
        .filter(x => x.plan?.includes('Alfa'))
        .reduce((acc, poliza) => {

            return acc + calcularConteo(poliza);

        }, 0);
}