/*
|--------------------------------------------------------------------------
| MODULE:
| sales-dna-recommendation-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Recomienda cómo debe comunicarse el asesor según su ADN.
|
|--------------------------------------------------------------------------
*/

export function recomendarEstiloPorSalesDNA({

    salesDNA = {}

}) {

    const trait =
        salesDNA.primaryTrait || 'CONSULTIVE';

    const recommendations = {

        ANALYTICAL: {

            use:
                'datos, escenarios, comparativos y claridad financiera',

            avoid:
                'historias demasiado largas sin números',

            bestFor:
                [
                    'clientes analíticos',
                    'directores',
                    'profesionistas técnicos'
                ]
        },

        STORYTELLER: {

            use:
                'historias, ejemplos reales y consecuencias humanas',

            avoid:
                'llenar la conversación de tablas desde el inicio',

            bestFor:
                [
                    'clientes emocionales',
                    'familias',
                    'personas con preocupaciones patrimoniales'
                ]
        },

        RELATIONAL: {

            use:
                'confianza, cercanía y relación previa',

            avoid:
                'sonar demasiado institucional',

            bestFor:
                [
                    'mercado caliente',
                    'referidos',
                    'clientes existentes'
                ]
        },

        DIRECT: {

            use:
                'mensajes breves, CTA claro y propuesta concreta',

            avoid:
                'rodeos',

            bestFor:
                [
                    'ejecutivos ocupados',
                    'prospectos fríos',
                    'seguimientos rápidos'
                ]
        },

        CONSULTIVE: {

            use:
                'preguntas, escucha y diagnóstico',

            avoid:
                'presentar producto demasiado rápido',

            bestFor:
                [
                    'needs discovery',
                    'primeras citas',
                    'clientes indecisos'
                ]
        },

        PERSISTENT: {

            use:
                'seguimiento ordenado y recuperación de oportunidades',

            avoid:
                'insistir sin cambiar el ángulo',

            bestFor:
                [
                    'ghosting',
                    'reactivación',
                    'prospectos tibios'
                ]
        },

        EDUCATOR: {

            use:
                'explicaciones simples y educación financiera',

            avoid:
                'tecnicismos innecesarios',

            bestFor:
                [
                    'clientes nuevos',
                    'personas sin cultura financiera',
                    'productos complejos'
                ]
        }
    };

    return recommendations[
        trait
    ] || recommendations.CONSULTIVE;
}