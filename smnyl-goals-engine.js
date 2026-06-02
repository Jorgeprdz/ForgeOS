/*
|--------------------------------------------------------------------------
| Goals Engine
|--------------------------------------------------------------------------
*/

export function calcularMeta({

    actual = 0,

    meta = 1,

    diasRestantes = 30

}) {

    const cumplimiento =
        (
            actual /
            meta
        ) * 100;

    const faltante =
        Math.max(
            0,
            meta - actual
        );

    const ritmoNecesario =
        faltante /
        Math.max(
            diasRestantes,
            1
        );

    return {

        actual,

        meta,

        cumplimiento:
            Number(
                cumplimiento.toFixed(1)
            ),

        faltante,

        ritmoNecesario:
            Number(
                ritmoNecesario.toFixed(0)
            )
    };
}