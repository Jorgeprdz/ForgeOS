/*
|--------------------------------------------------------------------------
| MODULE: presentation-input-context-builder.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.2.0
|
|--------------------------------------------------------------------------
|
| Prepara contexto final para Presentation Builder.
|
|--------------------------------------------------------------------------
*/

export function construirContextoPresentacionDesdeCotizacion({

    prospect = {},

    advisor = {},

    quotation = {},

    discovery = {},

    productKnowledge = null,

    projections = null

}) {

    return {

        task:
            'BUILD_PRESENTATION_FROM_QUOTATION',

        language:
            'es-MX',

        prospect,

        advisor,

        quotation,

        discovery,

        productKnowledge,

        projections,

        instructions: [

            'No inventar datos.',

            'Separar datos de cotización de inferencias.',

            'Usar la cotización como base.',

            'Usar discovery para narrativa financiera.',

            'Usar product knowledge para explicar producto.',

            'Usar proyecciones solo como escenarios, no como promesas.',

            'No mostrar tablas largas.',

            'Seleccionar hitos significativos.',

            'Preparar estructura para presentación.'
        ]
    };
}