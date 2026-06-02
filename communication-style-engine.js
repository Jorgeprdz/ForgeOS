/*
|--------------------------------------------------------------------------
| MODULE: communication-style-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Traduce personalidad del prospecto a estilo de comunicación.
|
|--------------------------------------------------------------------------
*/

export function resolverEstiloComunicacion({

    personality = 'UNKNOWN'

}) {

    const map = {

        ANALYTICAL: {
            tone:
                'CLARO_Y_CON_NUMEROS',

            avoid:
                'emocionalidad excesiva',

            use:
                'datos, escenarios, comparativos'
        },

        EMOTIONAL: {
            tone:
                'HUMANO_Y_CERCANO',

            avoid:
                'frialdad técnica',

            use:
                'familia, tranquilidad, historias'
        },

        DIRECT: {
            tone:
                'BREVE_Y_DIRECTO',

            avoid:
                'rodeos',

            use:
                'beneficio concreto y CTA claro'
        },

        RELATIONAL: {
            tone:
                'CASUAL_Y_CONFIABLE',

            avoid:
                'sonar vendedor',

            use:
                'relación previa y naturalidad'
        },

        TECHNICAL: {
            tone:
                'PRECISO_Y_ESTRUCTURADO',

            avoid:
                'promesas vagas',

            use:
                'lógica, estructura, evidencia'
        },

        EXECUTIVE: {
            tone:
                'EJECUTIVO_Y_RESPETUOSO',

            avoid:
                'mensajes largos',

            use:
                'valor, eficiencia, agenda concreta'
        },

        UNKNOWN: {
            tone:
                'PROFESIONAL_CERCANO',

            avoid:
                'presionar',

            use:
                'curiosidad y conversación ligera'
        }
    };

    return map[
        personality
    ] || map.UNKNOWN;
}