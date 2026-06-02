/*
|--------------------------------------------------------------------------
| MODULE: adaptive-message-builder.js
|--------------------------------------------------------------------------
*/

import { resolverPerfilTono }
    from './tone-profile-engine';

import { adaptarCanal }
    from './channel-adaptation-engine';

export function construirPromptMensaje({

    prospect,

    advisor,

    tone,

    channel,

    objective

}) {

    const toneProfile =
        resolverPerfilTono({
            tone
        });

    const channelProfile =
        adaptarCanal({
            channel
        });

    return {

        task:
            'GENERATE_OUTREACH_MESSAGE',

        language:
            'es-MX',

        objective,

        prospect,

        advisor,

        tone,

        channel,

        toneProfile,

        channelProfile,

        instructions: [

            `Tono: ${toneProfile.style}`,

            `Evitar: ${toneProfile.avoid}`,

            `Máximo ${channelProfile.maxWords} palabras`,

            `Canal: ${channel}`,

            'No sonar vendedor',

            'Buscar conversación',

            'Cerrar con CTA ligero'
        ]
    };
}