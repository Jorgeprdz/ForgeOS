/*
|--------------------------------------------------------------------------
| MODULE: prospect-score-engine.js
|--------------------------------------------------------------------------
*/

export function calcularProspectScore({

    hasPhone,

    hasEmail,

    hasReferral,

    hasAppointment

}) {

    let score = 0;

    if (hasPhone)
        score += 20;

    if (hasEmail)
        score += 10;

    if (hasReferral)
        score += 30;

    if (hasAppointment)
        score += 40;

    return score;
}