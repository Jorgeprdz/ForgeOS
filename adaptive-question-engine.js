/*
|--------------------------------------------------------------------------
| MODULE: adaptive-question-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Genera preguntas adaptativas según riesgos detectados.
|
|--------------------------------------------------------------------------
*/

import { ADAPTIVE_QUESTION_BANK }
    from './adaptive-question-bank';

import { filtrarPreguntasPorEstilo }
    from './question-style-match-engine';

export function generarPreguntasAdaptativas({

    risks = [],

    advisorStyle = 'CONSULTIVE',

    limit = 5

}) {

    const questions = [];

    risks.forEach((risk) => {

        const bankQuestions =
            ADAPTIVE_QUESTION_BANK[
                risk.type
            ] || [];

        const matchedQuestions =
            filtrarPreguntasPorEstilo({

                questions:
                    bankQuestions,

                advisorStyle
            });

        matchedQuestions.forEach((question) => {

            questions.push({

                ...question,

                riskType:
                    risk.type,

                riskPriority:
                    risk.priority
            });
        });
    });

    return questions.slice(
        0,
        limit
    );
}