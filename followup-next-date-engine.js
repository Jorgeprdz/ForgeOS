/*
|--------------------------------------------------------------------------
| MODULE: followup-next-date-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Suggests next followup date based on prospect response.
|
|--------------------------------------------------------------------------
*/

export function sugerirFechaSiguienteFollowup({

    responseType = 'UNKNOWN',

    baseDate = Date.now()

}) {

    const date =
        new Date(baseDate);

    switch (responseType) {

        case 'POSITIVE':

            date.setDate(
                date.getDate() + 1
            );

            break;

        case 'LATER':

            date.setDate(
                date.getDate() + 3
            );

            break;

        case 'NEGATIVE':

            date.setDate(
                date.getDate() + 30
            );

            break;

        default:

            date.setDate(
                date.getDate() + 2
            );
    }

    return date.toISOString();
}