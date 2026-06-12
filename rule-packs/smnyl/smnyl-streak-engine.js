/*
|--------------------------------------------------------------------------
| Streak Engine
|--------------------------------------------------------------------------
*/

function ordenarPorFecha(
    registros = []
) {

    return [...registros].sort(
        (a, b) =>
            new Date(a.id) -
            new Date(b.id)
    );
}

function diferenciaDias(
    a,
    b
) {

    const d1 =
        new Date(a);

    const d2 =
        new Date(b);

    return Math.floor(
        (d2 - d1) /
        (1000 * 60 * 60 * 24)
    );
}

export function calcularStreakActividad(
    actividad = []
) {

    const ordenados =
        ordenarPorFecha(actividad);

    let streak = 0;

    for (
        let i = ordenados.length - 1;
        i >= 0;
        i--
    ) {

        const actual =
            ordenados[i];

        const previo =
            ordenados[i - 1];

        if (!previo) {
            streak++;
            break;
        }

        const dias =
            diferenciaDias(
                previo.id,
                actual.id
            );

        if (dias <= 1) {
            streak++;
        } else {
            break;
        }
    }

    return {

        streak,

        estado:
            streak >= 30
                ? 'Legendario'
                : streak >= 15
                ? 'Consistente'
                : streak >= 7
                ? 'En Ritmo'
                : 'Iniciando'
    };
}