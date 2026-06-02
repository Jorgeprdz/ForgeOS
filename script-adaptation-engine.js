/*
|--------------------------------------------------------------------------
| MODULE: script-adaptation-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Construye instrucciones de adaptación para IA.
|
|--------------------------------------------------------------------------
*/

export function construirInstruccionesAdaptacion({

    communicationStyle

}) {

    return [

        `Usar tono: ${communicationStyle.tone}.`,

        `Evitar: ${communicationStyle.avoid}.`,

        `Apoyarse en: ${communicationStyle.use}.`,

        'Mantener el mensaje breve.',

        'No sonar vendedor.',

        'Cerrar con una pregunta sencilla.'
    ];
}