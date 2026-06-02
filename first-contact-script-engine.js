/*
|--------------------------------------------------------------------------
| MODULE: first-contact-script-engine.js
|--------------------------------------------------------------------------
*/

export function generarScriptPrimerContacto({

    prospectName,

    source

}) {

    if (
        source === 'REFERRAL'
    ) {

        return `
Hola ${prospectName},

Me compartieron tu contacto.

Quería saludarte y conocer si actualmente cuentas con algún plan de protección financiera o patrimonial.

¿Tienes 5 minutos esta semana?
`;
    }

    return `
Hola ${prospectName},

Mucho gusto.

Vi que podríamos tener temas en común relacionados con protección financiera y planeación patrimonial.

¿Te parece si platicamos unos minutos?
`;
}