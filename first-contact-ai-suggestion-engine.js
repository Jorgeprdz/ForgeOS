/*
|--------------------------------------------------------------------------
| MODULE: first-contact-ai-suggestion-engine.js
|--------------------------------------------------------------------------
*/

export function sugerirSiguienteMovimiento({

    responseType

}) {

    switch (
        responseType
    ) {

        case 'POSITIVE':

            return 'AGENDAR_CITA';

        case 'LATER':

            return 'PROGRAMAR_SEGUIMIENTO';

        case 'NEGATIVE':

            return 'ARCHIVAR';

        default:

            return 'OBTENER_MAS_INFORMACION';
    }
}