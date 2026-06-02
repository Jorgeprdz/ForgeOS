/*
|--------------------------------------------------------------------------
| MODULE: prospect-next-action-engine.js
|--------------------------------------------------------------------------
*/

export function sugerirSiguienteAccion({

    status

}) {

    switch (status) {

        case 'NEW':

            return 'CONTACT';

        case 'CONTACTED':

            return 'BOOK_APPOINTMENT';

        case 'APPOINTMENT_SCHEDULED':

            return 'PREPARE_PRESENTATION';

        case 'PRESENTATION_DONE':

            return 'FOLLOWUP';

        case 'NEGOTIATION':

            return 'CLOSING';

        default:

            return 'REVIEW';
    }
}