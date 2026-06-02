/*
|--------------------------------------------------------------------------
| MODULE: referrals-board-engine.js
|--------------------------------------------------------------------------
|
| Pipeline visual de referidos.
|
|--------------------------------------------------------------------------
*/

export const REFERRAL_COLUMNS = [

    'nuevo',

    'contactado',

    'cita',

    'seguimiento',

    'cerrado'
];

export function agruparReferidosBoard({

    referrals = []

}) {

    const board = {};

    REFERRAL_COLUMNS.forEach(

        column => {

            board[column] = [];
        }
    );

    referrals.forEach(

        referral => {

            if (

                board[
                    referral.status
                ]
            ) {

                board[
                    referral.status
                ]

                .push(referral);
            }
        }
    );

    return board;
}