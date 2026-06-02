/*
|--------------------------------------------------------------------------
| MODULE: referral-score-engine.js
|--------------------------------------------------------------------------
*/

export function calcularReferralScore({

    relationshipStrength = 0,

    satisfactionScore = 0,

    referralsPast = 0

}) {

    return (

        relationshipStrength * 0.4

        +

        satisfactionScore * 0.4

        +

        referralsPast * 0.2
    );
}