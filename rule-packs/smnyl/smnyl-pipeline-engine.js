/*
|--------------------------------------------------------------------------
| Pipeline Engine
|--------------------------------------------------------------------------
*/

const STAGES = {

    prospecto: 0.10,

    cita: 0.30,

    propuesta: 0.55,

    solicitud: 0.80,

    pagada: 1
};

export function construirPipeline(
    prospectos = []
) {

    const resumen = {

        prospecto: 0,

        cita: 0,

        propuesta: 0,

        solicitud: 0,

        pagada: 0,

        valorEsperado: 0
    };

    prospectos.forEach(item => {

        const etapa =
            item.etapa || 'prospecto';

        const prima =
            Number(item.prima || 0);

        resumen[etapa] += 1;

        resumen.valorEsperado +=
            prima *
            (
                STAGES[etapa] || 0
            );
    });

    return resumen;
}