// smnyl-comisiones-engine.js

import {
    obtenerProducto,
    calcularPrimaPago,
    calcularPrimaMeta,
    calcularPrimaAnualizada
} from './smnyl-prima-engine.js';

function calcularAntiguedad(emision) {

    if (!emision) return 1;

    const inicio = new Date(emision + 'T12:00:00');

    const hoy = new Date();

    let years = hoy.getFullYear() - inicio.getFullYear();

    const monthDiff = hoy.getMonth() - inicio.getMonth();

    if (
        monthDiff < 0 ||
        (
            monthDiff === 0 &&
            hoy.getDate() < inicio.getDate()
        )
    ) {
        years--;
    }

    return Math.max(1, years + 1);
}

export function calcularComision(poliza) {

    const producto = obtenerProducto(poliza.plan);

    if (!producto) {

        return {
            error: true,
            producto: poliza.plan
        };
    }

    const primaAnualizada = calcularPrimaAnualizada(poliza);

    const primaMeta = calcularPrimaMeta(poliza);

    const primaPago = calcularPrimaPago(poliza);

    const antiguedad = calcularAntiguedad(poliza.emision);

    const porcentaje = antiguedad > 1
        ? producto.renovacion
        : producto.comisionInicial;

    const monto = primaPago * porcentaje;

    return {

        producto: poliza.plan,

        categoria: producto.categoria,

        primaOriginal: Number(poliza.prima || 0),

        primaAnualizada,

        primaMeta,

        primaPago,

        porcentaje,

        monto,

        antiguedad,

        esRenovacion: antiguedad > 1
    };
}

export function calcularComisionesLote(polizas = []) {

    return polizas.map(calcularComision);
}

export function calcularTotalComisiones(polizas = []) {

    return calcularComisionesLote(polizas)
        .reduce((acc, item) => {

            return acc + (item.monto || 0);

        }, 0);
}