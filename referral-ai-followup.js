/*
|--------------------------------------------------------------------------
| MODULE: referral-ai-followup.js
|--------------------------------------------------------------------------
|
| Followups inteligentes IA.
|
|--------------------------------------------------------------------------
*/

export function generarPromptFollowup({

    referral = {}

}) {

    return `
Eres un asesor profesional.

Genera un mensaje de seguimiento
natural y humano para este referido.

Nombre:
${referral.nombre}

Temperatura:
${referral.temperatura}

Status:
${referral.status}

Objetivo:
Retomar conversación.
    `;
}