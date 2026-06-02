/*
|--------------------------------------------------------------------------
| MODULE: opportunity-detector-engine.js
|--------------------------------------------------------------------------
|
| Detector inteligente de oportunidades.
|
|--------------------------------------------------------------------------
*/

export function detectarOportunidades(

    leads = []

) {

    return leads.filter(

        lead => {

            return (

                lead.temperatura === 'hot'

                &&

                lead.status !== 'pagada'
            );
        }
    );
}

export function calcularValorPipeline(

    leads = []

) {

    return leads.reduce(

        (total, lead) => {

            return total
            + (
                lead.valorPotencial
                || 0
            );
        },

        0
    );
}