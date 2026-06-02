/*
|--------------------------------------------------------------------------
| MODULE: followup-reminder-engine.js
|--------------------------------------------------------------------------
|
| Sistema automático de recordatorios.
|
|--------------------------------------------------------------------------
*/

export function calcularProximoFollowup({

    temperatura = 'warm',

    ultimoContacto = Date.now()

}) {

    const dias =
        obtenerDiasFollowup(
            temperatura
        );

    return {

        nextFollowup:
            ultimoContacto
            + (
                dias
                * 86400000
            ),

        dias
    };
}

function obtenerDiasFollowup(

    temperatura

) {

    switch (temperatura) {

        case 'hot':
            return 1;

        case 'warm':
            return 3;

        case 'cold':
            return 7;

        default:
            return 5;
    }
}