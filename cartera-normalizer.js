// cartera-normalizer.js

import {
    sanitizeMoney
} from './financial-utils.js';

export function sanitizeText(value) {

    return String(value || '')
        .replace(/[<>]/g, '')
        .trim();
}

export function normalizePoliza(payload) {

    return {

        id:
            payload.id ||
            crypto.randomUUID(),

        cliente:
            sanitizeText(payload.cliente),

        nacimiento:
            payload.nacimiento || '',

        emision:
            payload.emision || '',

        poliza:
            sanitizeText(payload.poliza),

        plan:
            sanitizeText(payload.plan),

        variante:
            sanitizeText(payload.variante),

        edadGmm:
            sanitizeText(payload.edadGmm),

        moneda:
            payload.moneda || 'MXN',

        formaPago:
            sanitizeText(payload.formaPago),

        conductoCobro:
            sanitizeText(payload.conductoCobro),

        prima:
            sanitizeMoney(payload.prima),

        suma:
            sanitizeMoney(payload.suma),

        esPersonal:
            Boolean(payload.esPersonal),

        fechaPago:
            payload.fechaPago || '',

        status:
            payload.status || 'vigente',

        createdAt:
            payload.createdAt ||
            new Date().toISOString(),

        updatedAt:
            new Date().toISOString()
    };
}