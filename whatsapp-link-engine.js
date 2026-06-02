/*
|--------------------------------------------------------------------------
| MODULE: whatsapp-link-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Genera link de WhatsApp con código México por default.
|
|--------------------------------------------------------------------------
*/

export function generarWhatsappLink({

    phone,

    message = '',

    countryCode = '52'

}) {

    const cleanPhone =
        String(phone)
            .replace(/\D/g, '');

    const phoneWithCountry =

        cleanPhone.startsWith(countryCode)

            ? cleanPhone

            : `${countryCode}${cleanPhone}`;

    return `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`;
}