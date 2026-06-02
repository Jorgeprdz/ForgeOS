/*
|--------------------------------------------------------------------------
| MODULE: warm-market-segmentation-engine.js
|--------------------------------------------------------------------------
*/

export function segmentarMercadoCaliente({

    contacts = []

}) {

    return {

        family:

            contacts.filter(
                (c) =>
                    c.relationship === 'FAMILY'
            ),

        friends:

            contacts.filter(
                (c) =>
                    c.relationship === 'FRIEND'
            ),

        clients:

            contacts.filter(
                (c) =>
                    c.relationship === 'CLIENT'
            ),

        influence:

            contacts.filter(
                (c) =>
                    c.relationship === 'CENTER_OF_INFLUENCE'
            )
    };
}