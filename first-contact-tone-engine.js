/*
|--------------------------------------------------------------------------
| MODULE: first-contact-tone-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Sugiere tono de acercamiento según relación con el prospecto.
|
|--------------------------------------------------------------------------
*/

export function sugerirTonoAcercamiento({

    relationshipType = 'UNKNOWN'

}) {

    switch (relationshipType) {

        case 'DIRECTOR':

            return 'FORMAL';

        case 'CLIENTE_REFERIDO':

            return 'PROFESIONAL_CERCANO';

        case 'AMIGO':

            return 'CASUAL';

        case 'FAMILIAR':

            return 'AMIGABLE';

        case 'AMIGA_ESPOSA':

            return 'AMIGABLE_RESPETUOSO';

        case 'CONOCIDO':

            return 'CERCANO_LIGERO';

        default:

            return 'PROFESIONAL_CERCANO';
    }
}