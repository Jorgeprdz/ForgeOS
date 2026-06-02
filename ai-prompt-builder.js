/*
|--------------------------------------------------------------------------
| MODULE: ai-prompt-builder.js
|--------------------------------------------------------------------------
|
| Constructor dinámico de prompts.
|
|--------------------------------------------------------------------------
*/

export function construirPromptOutreach({

    lead = {},

    tono = 'profesional'

}) {

    return `
Eres un asesor experto en seguros.

Genera un mensaje de acercamiento
para el siguiente prospecto:

Nombre:
${lead.nombre}

Producto:
${lead.productoInteres}

Temperatura:
${lead.temperatura}

Tono:
${tono}

Objetivo:
Generar conversación natural.
    `;
}

export function construirPromptObjecion({

    objecion = '',

    perfil = ''

}) {

    return `
Responde la siguiente objeción
de manera profesional y persuasiva.

Objeción:
${objecion}

Perfil cliente:
${perfil}

Objetivo:
Mantener conversación abierta.
    `;
}