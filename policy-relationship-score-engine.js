/*
|--------------------------------------------------------------------------
| MODULE: policy-relationship-score-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Relationship score foundation.
|
|--------------------------------------------------------------------------
*/

export function calcularRelationshipScore({

    timeline = []

}) {

    let score = 0;

    timeline.forEach((event) => {

        switch (
            event.type
        ) {

            case 'CALL':

                score += 5;
                break;

            case 'WHATSAPP':

                score += 2;
                break;

            case 'APPOINTMENT':

                score += 10;
                break;

            case 'FOLLOWUP':

                score += 3;
                break;

            default:

                break;
        }
    });

    return score;
}