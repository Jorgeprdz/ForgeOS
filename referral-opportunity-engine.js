/*
|--------------------------------------------------------------------------
| MODULE: referral-opportunity-engine.js
|--------------------------------------------------------------------------
*/

export function detectarMomentoReferido({

    policyIssued = false,

    claimPaid = false,

    reviewCompleted = false,

    clientSatisfaction = 0

}) {

    if (

        claimPaid

        ||

        clientSatisfaction >= 9

    ) {

        return 'HIGH';
    }

    if (

        policyIssued

        ||

        reviewCompleted

    ) {

        return 'MEDIUM';
    }

    return 'LOW';
}