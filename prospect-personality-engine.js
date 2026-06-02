/*
|--------------------------------------------------------------------------
| MODULE: prospect-personality-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Detecta personalidad comercial probable del prospecto.
|
|--------------------------------------------------------------------------
*/

export function detectarPersonalidadProspecto({

    profession = '',

    role = '',

    relationship = '',

    knownBehavior = []

}) {

    const text =
        `${profession} ${role} ${relationship}`
            .toLowerCase();

    if (
        text.includes('director')
        ||
        text.includes('ceo')
        ||
        text.includes('dueño')
        ||
        text.includes('empresario')
    ) {

        return 'EXECUTIVE';
    }

    if (
        text.includes('ingeniero')
        ||
        text.includes('doctor')
        ||
        text.includes('finanzas')
        ||
        text.includes('contador')
    ) {

        return 'ANALYTICAL';
    }

    if (
        relationship === 'AMIGO'
        ||
        relationship === 'FAMILIAR'
    ) {

        return 'RELATIONAL';
    }

    if (
        knownBehavior.includes('ASKS_NUMBERS')
    ) {

        return 'ANALYTICAL';
    }

    if (
        knownBehavior.includes('FAMILY_ORIENTED')
    ) {

        return 'EMOTIONAL';
    }

    return 'UNKNOWN';
}