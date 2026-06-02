/*
|--------------------------------------------------------------------------
| MODULE:
| discovery-to-presentation-engine.js
|--------------------------------------------------------------------------
*/

export function prepararPresentacion({

    client,

    insights,

    strategies

}) {

    return {

        task:
            'BUILD_PRESENTATION',

        client,

        insights,

        strategies,

        sections: [

            'Situación Actual',

            'Riesgos Detectados',

            'Impacto Financiero',

            'Estrategias Recomendadas',

            'Próximos Pasos'
        ]
    };
}