/*
|--------------------------------------------------------------------------
| AI Coach Engine
|--------------------------------------------------------------------------
*/

export function generarCoaching({

    produccion = 0,

    persistencia = 0,

    actividad = 0

}) {

    const tips = [];

    if (produccion < 100000) {

        tips.push(
            'Incrementa prospección diaria'
        );
    }

    if (persistencia < 85) {

        tips.push(
            'Revisar cartera en riesgo'
        );
    }

    if (actividad < 40) {

        tips.push(
            'Subir llamadas y citas'
        );
    }

    if (tips.length === 0) {

        tips.push(
            'Excelente ritmo comercial'
        );
    }

    return tips;
}