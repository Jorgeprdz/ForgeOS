/*
|--------------------------------------------------------------------------
| MODULE: referrals-engine.js
|--------------------------------------------------------------------------
|
| Motor principal de referidos.
|
|--------------------------------------------------------------------------
*/

export function crearReferido({

    nombre = '',

    telefono = '',

    referidoPor = '',

    notas = ''

}) {

    return {

        id:
            crypto.randomUUID(),

        nombre,

        telefono,

        referidoPor,

        notas,

        status:
            'nuevo',

        temperatura:
            'warm',

        createdAt:
            Date.now(),

        ultimaActividad:
            Date.now()
    };
}

export function actualizarStatusReferido({

    referral = {},

    status = ''

}) {

    referral.status =
        status;

    referral.updatedAt =
        Date.now();

    return referral;
}