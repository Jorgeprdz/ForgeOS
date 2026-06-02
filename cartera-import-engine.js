// cartera-import-engine.js

import {
    carteraService
} from './cartera-service.js';

function normalizeExcelHeaders(
    row = {}
) {

    const clean = {};

    Object.keys(row).forEach(
        key => {

            const normalized =
                String(key)
                    .toLowerCase()
                    .trim()
                    .replace(
                        /[\s_]+/g,
                        ''
                    )
                    .normalize('NFD')
                    .replace(
                        /[\u0300-\u036f]/g,
                        ''
                    );

            clean[normalized] =
                row[key];
        }
    );

    return clean;
}

function transformRow(row) {

    const r =
        normalizeExcelHeaders(
            row
        );

    return {

        cliente:
            r.cliente ||
            r.nombre ||
            '',

        poliza:
            r.poliza ||
            r.numeropoliza ||
            '',

        plan:
            r.plan ||
            r.producto ||
            '',

        prima:
            r.prima ||
            r.primaneta ||
            0,

        suma:
            r.suma ||
            r.sumaasegurada ||
            0,

        emision:
            r.emision ||
            r.fechaemision ||
            '',

        formaPago:
            r.formapago ||
            r.frecuencia ||
            'Anual',

        moneda:
            r.moneda ||
            'MXN',

        conductoCobro:
            r.conducto ||
            '',

        variante:
            r.variante ||
            '',

        nacimiento:
            r.nacimiento ||
            '',

        edadGmm:
            r.edadgmm ||
            '',

        esPersonal:
            String(
                r.espersonal || ''
            )
                .toUpperCase()
                .trim() === 'SI'
    };
}

export async function importExcelRows(
    rows = []
) {

    const transformed =
        rows.map(
            transformRow
        );

    return carteraService
        .importarMasivo(
            transformed
        );
}