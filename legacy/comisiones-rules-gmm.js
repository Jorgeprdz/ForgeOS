// smnyl-comisiones-gmm.js
// MATRIZ GMM SMNYL

export const SMNYL_GMM_RULES = {

    'Alfa Medical': {
        categoria: 'gmm',
        tipo: 'gmm',
        internacional: false,
        inicial: {
            default: 0.15
        },
        renovacion: {
            default: 0.10
        }
    },

    'Alfa Medical Flex': {
        categoria: 'gmm',
        tipo: 'gmm',
        internacional: false,
        inicial: {
            default: 0.16
        },
        renovacion: {
            default: 0.11
        }
    },

    'Alfa Medical Internacional': {
        categoria: 'gmm',
        tipo: 'gmm',
        internacional: true,
        inicial: {
            default: 0.18
        },
        renovacion: {
            default: 0.12
        }
    }
};