import { calcularPrimaPoliza } from './smnyl-prima-engine.js';

function crearBaseProduccion() {
    return {
        vidaInicial: 0,
        vidaRenovacion: 0,

        gmmInicial: 0,
        gmmRenovacion: 0,

        totalInicial: 0,
        totalRenovacion: 0,

        primaMeta: 0,
        primaPago: 0,

        conteoVida: 0,
        conteoGmm: 0,

        polizas: 0
    };
}

function obtenerPeriodoKey(fecha) {
    if (!fecha) return 'sin-fecha';

    const f = new Date(fecha + 'T12:00:00');

    const year = f.getFullYear();
    const month = String(f.getMonth() + 1).padStart(2, '0');

    return `${year}-${month}`;
}

export function construirProduccionMensual(cartera = []) {
    const output = {};

    cartera.forEach(poliza => {

        const periodo = obtenerPeriodoKey(poliza.emision);

        if (!output[periodo]) {
            output[periodo] = crearBaseProduccion();
        }

        const p = calcularPrimaPoliza(poliza);

        const bucket = output[periodo];

        const esGMM =
            poliza.plan?.toLowerCase().includes('medical');

        const esRenovacion =
            Number(poliza.antiguedad || 0) >= 2;

        if (esGMM) {
            if (esRenovacion) {
                bucket.gmmRenovacion += p.primaMeta;
            } else {
                bucket.gmmInicial += p.primaMeta;
                bucket.conteoGmm += 1;
            }
        } else {
            if (esRenovacion) {
                bucket.vidaRenovacion += p.primaMeta;
            } else {
                bucket.vidaInicial += p.primaMeta;
                bucket.conteoVida += 1;
            }
        }

        bucket.primaMeta += p.primaMeta;
        bucket.primaPago += p.primaPago;

        bucket.totalInicial =
            bucket.vidaInicial +
            bucket.gmmInicial;

        bucket.totalRenovacion =
            bucket.vidaRenovacion +
            bucket.gmmRenovacion;

        bucket.polizas += 1;
    });

    return output;
}

export function obtenerProduccionYTD(
    produccionMensual,
    year = new Date().getFullYear()
) {
    const total = crearBaseProduccion();

    Object.entries(produccionMensual).forEach(([periodo, data]) => {

        if (!periodo.startsWith(String(year))) return;

        Object.keys(total).forEach(k => {
            total[k] += data[k] || 0;
        });
    });

    return total;
}