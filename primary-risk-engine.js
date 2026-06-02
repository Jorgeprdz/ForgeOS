/*
|--------------------------------------------------------------------------
| MODULE: primary-risk-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Selecciona el riesgo principal para storytelling.
|
|--------------------------------------------------------------------------
*/

export function seleccionarRiesgoPrincipal({

    risks = []

}) {

    const order = {

        CRITICAL:
            4,

        HIGH:
            3,

        MEDIUM:
            2,

        LOW:
            1
    };

    return risks.sort(

        (a, b) =>
            (order[b.priority] || 0)
            -
            (order[a.priority] || 0)

    )[0] || null;
}