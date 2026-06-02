/*
|--------------------------------------------------------------------------
| MODULE: smart-referrals-engine.js
|--------------------------------------------------------------------------
|
| Sistema inteligente de referidos.
|
|--------------------------------------------------------------------------
*/

const REFERRAL_SCORES = {

    familiar: 90,

    amigo: 75,

    cliente: 95,

    cold: 30
};

export function crearReferido({

    nombre = '',

    telefono = '',

    origen = 'amigo',

    notas = ''

}) {

    return {

        id:
            crypto.randomUUID(),

        nombre,

        telefono,

        origen,

        notas,

        status:
            'nuevo',

        temperatura:
            calcularTemperatura(origen),

        score:
            REFERRAL_SCORES[origen]
            || 50,

        createdAt:
            Date.now()
    };
}

function calcularTemperatura(origen) {

    if (
        origen === 'cliente'
        || origen === 'familiar'
    ) {

        return 'hot';
    }

    if (
        origen === 'amigo'
    ) {

        return 'warm';
    }

    return 'cold';
}