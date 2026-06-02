/*
|--------------------------------------------------------------------------
| MODULE: followup-priority-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Resolves followup operational priority.
|
|--------------------------------------------------------------------------
*/

export function resolverPrioridadFollowup({

    prospectScore = 0,

    daysWithoutContact = 0,

    hasAppointment = false,

    closeProbability = 0

}) {

    if (
        hasAppointment
        ||
        closeProbability >= 70
    ) {

        return 'HIGH';
    }

    if (
        prospectScore >= 70
        ||
        daysWithoutContact >= 7
    ) {

        return 'MEDIUM';
    }

    return 'LOW';
}