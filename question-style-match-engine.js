/*
|--------------------------------------------------------------------------
| MODULE: question-style-match-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Selecciona preguntas alineadas al estilo del asesor.
|
|--------------------------------------------------------------------------
*/

export function filtrarPreguntasPorEstilo({

    questions = [],

    advisorStyle = 'CONSULTIVE'

}) {

    const directMatches =
        questions.filter(
            (question) =>
                question.style === advisorStyle
        );

    if (directMatches.length > 0) {

        return directMatches;
    }

    return questions;
}