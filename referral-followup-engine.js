/*
|--------------------------------------------------------------------------
| MODULE: referral-followup-engine.js
|--------------------------------------------------------------------------
|
| Followups automáticos de referidos.
|
|--------------------------------------------------------------------------
*/

export function detectarReferidosPendientes({

    referrals = []

}) {

    const ahora = Date.now();

    return referrals.filter(

        referral => {

            const ultimaActividad =

                referral.ultimaActividad
                || 0;

            const diasSinActividad =

                (
                    ahora
                    - ultimaActividad
                )

                / 86400000;

            return (

                diasSinActividad >= 3

                &&

                referral.status
                !== 'cerrado'
            );
        }
    );
}