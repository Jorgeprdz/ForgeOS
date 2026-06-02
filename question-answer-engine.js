/*
|--------------------------------------------------------------------------
| MODULE: question-answer-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Registra respuestas dentro de la sesión.
|
|--------------------------------------------------------------------------
*/

export function registrarRespuestaPregunta({

    session,

    questionId,

    answer

}) {

    return {

        ...session,

        answers: [

            ...session.answers,

            {
                questionId,

                answer,

                createdAt:
                    Date.now()
            }
        ],

        updatedAt:
            Date.now()
    };
}