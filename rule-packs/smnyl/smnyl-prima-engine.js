// smnyl-prima-engine.js

import { SMNYL_PRODUCTOS_VIDA } from './smnyl-productos-vida.js';
import { SMNYL_PRODUCTOS_GMM } from './smnyl-productos-gmm.js';

const ALL_PRODUCTS = {
    ...SMNYL_PRODUCTOS_VIDA,
    ...SMNYL_PRODUCTOS_GMM
};

function frecuenciaFactor(fp) {

    switch(fp) {

        case 'Mensual':
            return 12;

        case 'Trimestral':
            return 4;

        case 'Semestral':
            return 2;

        case 'Anual':
            return 1;

        case 'Prima Única':
            return 1;

        default:
            return 1;
    }
}

export function obtenerProducto(plan) {

    return ALL_PRODUCTS[plan] || null;
}

export function calcularPrimaAnualizada(poliza) {

    const producto = obtenerProducto(poliza.plan);

    if (!producto) return 0;

    const prima = Number(poliza.prima || 0);

    if (!producto.anualizable) {
        return prima;
    }

    return prima * frecuenciaFactor(poliza.formaPago);
}

export function calcularPrimaMeta(poliza) {

    const producto = obtenerProducto(poliza.plan);

    if (!producto) return 0;

    if (!producto.participaMeta) {
        return 0;
    }

    const anualizada = calcularPrimaAnualizada(poliza);

    return anualizada * producto.ponderacion;
}

export function calcularPrimaPago(poliza) {

    const producto = obtenerProducto(poliza.plan);

    if (!producto) return 0;

    if (!producto.participaPago) {
        return 0;
    }

    return calcularPrimaAnualizada(poliza);
}

export function calcularConteo(poliza) {

    const producto = obtenerProducto(poliza.plan);

    if (!producto) return 0;

    if (!producto.participaConteo) {
        return 0;
    }

    return producto.conteoBase || 1;
}