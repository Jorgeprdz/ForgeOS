/*
|--------------------------------------------------------------------------
| MODULE: renewal-intelligence-engine.js
|--------------------------------------------------------------------------
|
| Renewal intelligence engine.
|
|--------------------------------------------------------------------------
*/

export function analizarRenovacion({

    renewalDate,

    lastContactDays = 0,

    pendingPayments = 0

}) {

    const now =
        new Date();

    const renewal =
        new Date(renewalDate);

    const diffDays =

        Math.ceil(

            (
                renewal - now
            )

            /

            (
                1000
                * 60
                * 60
                * 24
            )
        );

    /*
    |--------------------------------------------------------------------------
    | Risk score
    |--------------------------------------------------------------------------
    */

    let risk = 0;

    if (diffDays <= 30) {

        risk += 30;
    }

    if (lastContactDays > 20) {

        risk += 30;
    }

    risk += (
        pendingPayments
        * 20
    );

    /*
    |--------------------------------------------------------------------------
    | Result
    |--------------------------------------------------------------------------
    */

    return {

        renewalClose:
            diffDays <= 30,

        daysRemaining:
            diffDays,

        riskScore:
            risk
    };
}