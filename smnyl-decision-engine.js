/*
|--------------------------------------------------------------------------
| Decision Engine
|--------------------------------------------------------------------------
*/

function calcularPrioridad(
    item
) {

    let score = 0;

    score +=
        Number(item.prima || 0) / 1000;

    if (
        item.etapa === 'solicitud'
    ) {
        score += 40;
    }

    if (
        item.etapa === 'propuesta'
    ) {
        score += 25;
    }

    if (
        item.urgente
    ) {
        score += 30;
    }

    return score;
}

export function priorizarLeads(
    prospectos = []
) {

    return prospectos

        .map(lead => ({

            ...lead,

            prioridad:
                calcularPrioridad(
                    lead
                )
        }))

        .sort(
            (a, b) =>
                b.prioridad -
                a.prioridad
        );
}