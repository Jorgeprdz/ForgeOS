// smnyl-comisiones-vida.js
// MATRIZ REAL VIDA INDIVIDUAL SMNYL
// Todas las comisiones son porcentajes base estimados iniciales.
// El engine posteriormente aplicará persistencia, bonos válidos y renovaciones.

export const SMNYL_VIDA_RULES = {

    // =========================
    // TEMPORALES
    // =========================

    'Star Temporal': {
        categoria: 'temporal',
        tipo: 'vida',
        monedaPermitida: ['MXN', 'USD'],
        inicial: {
            1: 0.45,
            2: 0.10,
            3: 0.05
        },
        renovacion: {
            default: 0.03
        }
    },

    // =========================
    // ORVI
    // =========================

    'Orvi 99': {
        categoria: 'orvi',
        tipo: 'vida',
        monedaPermitida: ['MXN', 'USD', 'UDIS'],
        inicial: {
            1: 0.50,
            2: 0.12,
            3: 0.08
        },
        renovacion: {
            default: 0.04
        }
    },

    // =========================
    // VIDA MUJER
    // =========================

    'Vida Mujer': {
        categoria: 'proteccion',
        tipo: 'vida',
        monedaPermitida: ['MXN'],
        inicial: {
            1: 0.48,
            2: 0.10,
            3: 0.06
        },
        renovacion: {
            default: 0.03
        }
    },

    // =========================
    // MIO
    // =========================

    'Mio': {
        categoria: 'ahorro',
        tipo: 'vida',
        monedaPermitida: ['MXN', 'USD'],
        inicial: {
            1: 0.55,
            2: 0.15,
            3: 0.10
        },
        renovacion: {
            default: 0.05
        }
    },

    // =========================
    // IMAGINA SER
    // =========================

    'Imagina Ser': {
        categoria: 'ahorro',
        tipo: 'vida',
        monedaPermitida: ['MXN'],
        inicial: {
            1: 0.52,
            2: 0.14,
            3: 0.08
        },
        renovacion: {
            default: 0.04
        }
    },

    // =========================
    // OBJETIVO VIDA
    // =========================

    'Objetivo Vida': {
        categoria: 'ahorro',
        tipo: 'vida',
        monedaPermitida: ['MXN', 'USD'],
        inicial: {
            1: 0.58,
            2: 0.18,
            3: 0.10
        },
        renovacion: {
            default: 0.05
        }
    },

    // =========================
    // NUEVO PLENITUD
    // =========================

    'Nuevo Plenitud': {
        categoria: 'retiro',
        tipo: 'vida',
        monedaPermitida: ['MXN', 'USD', 'UDIS'],
        inicial: {
            1: 0.60,
            2: 0.20,
            3: 0.10
        },
        renovacion: {
            default: 0.06
        }
    },

    // =========================
    // RESPALDO EDUCATIVO
    // =========================

    'Respaldo Educativo': {
        categoria: 'educativo',
        tipo: 'vida',
        monedaPermitida: ['MXN', 'USD'],
        inicial: {
            1: 0.56,
            2: 0.15,
            3: 0.09
        },
        renovacion: {
            default: 0.05
        }
    },

    // =========================
    // SEGUBECA
    // =========================

    'Segubeca': {
        categoria: 'educativo',
        tipo: 'vida',
        monedaPermitida: ['MXN'],
        inicial: {
            1: 0.54,
            2: 0.14,
            3: 0.08
        },
        renovacion: {
            default: 0.05
        }
    },

    // =========================
    // RESPALDO NEGOCIO
    // =========================

    'Respaldo Negocio': {
        categoria: 'empresarial',
        tipo: 'vida',
        monedaPermitida: ['MXN', 'USD'],
        inicial: {
            1: 0.50,
            2: 0.12,
            3: 0.06
        },
        renovacion: {
            default: 0.04
        }
    }
};