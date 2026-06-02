/*
|--------------------------------------------------------------------------
| MODULE: hot-market-engine.js
|--------------------------------------------------------------------------
*/

export function detectarMercadoCaliente({

    contacts = []

}) {

    return contacts.filter(

        contact =>

            contact.hasChildren ||

            contact.recentPromotion ||

            contact.newBusiness ||

            contact.recentMarriage ||

            contact.newHome
    );
}