/*
|--------------------------------------------------------------------------
| MODULE: followup-recommendation-engine.js
|--------------------------------------------------------------------------
|
| Smart followup recommendation engine.
|
|--------------------------------------------------------------------------
*/

export function recomendarFollowup({

    risk = 'LOW',

    daysWithoutContact = 0,

    renewalClose = false

}) {

    /*
    |--------------------------------------------------------------------------
    | Riesgo alto
    |--------------------------------------------------------------------------
    */

    if (risk === 'HIGH') {

        return {

            priority: 'HIGH',

            action:
                'Llamar inmediatamente al cliente',

            reason:
                'Riesgo alto de cancelación'
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Renovación próxima
    |--------------------------------------------------------------------------
    */

    if (renewalClose) {

        return {

            priority: 'MEDIUM',

            action:
                'Agendar revisión de renovación',

            reason:
                'Renovación próxima'
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Cliente frío
    |--------------------------------------------------------------------------
    */

    if (

        daysWithoutContact
        > 20
    ) {

        return {

            priority: 'NORMAL',

            action:
                'Enviar follow-up IA por WhatsApp',

            reason:
                'Cliente sin contacto reciente'
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Todo estable
    |--------------------------------------------------------------------------
    */

    return {

        priority: 'LOW',

        action:
            'Sin acción urgente',

        reason:
            'Póliza estable'
    };
}