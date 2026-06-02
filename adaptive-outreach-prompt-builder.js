/*
|--------------------------------------------------------------------------
| MODULE: adaptive-outreach-prompt-builder.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Construye prompt final para mensaje de acercamiento adaptativo.
|
|--------------------------------------------------------------------------
*/

import { detectarPersonalidadProspecto }
    from './prospect-personality-engine';

import { resolverEstiloComunicacion }
    from './communication-style-engine';

import { construirInstruccionesAdaptacion }
    from './script-adaptation-engine';

export function construirPromptAcercamientoAdaptativo({

    prospect = {},

    advisor = {},

    scriptType = 'COLD',

    objective = 'AGENDAR_CITA'

}) {

    const personality =
        detectarPersonalidadProspecto({

            profession:
                prospect.profession,

            role:
                prospect.role,

            relationship:
                prospect.relationship,

            knownBehavior:
                prospect.knownBehavior || []
        });

    const communicationStyle =
        resolverEstiloComunicacion({
            personality
        });

    return {

        task:
            'GENERATE_ADAPTIVE_OUTREACH_MESSAGE',

        language:
            'es-MX',

        scriptType,

        objective,

        prospect,

        advisor,

        detectedPersonality:
            personality,

        communicationStyle,

        instructions:
            construirInstruccionesAdaptacion({
                communicationStyle
            })
    };
}