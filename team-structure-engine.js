/*
|--------------------------------------------------------------------------
| MODULE: team-structure-engine.js
|--------------------------------------------------------------------------
|
| Estructura organizacional de equipos.
|
|--------------------------------------------------------------------------
*/

export function crearEquipo({

    nombre = '',

    managerId = ''

}) {

    return {

        id:
            crypto.randomUUID(),

        nombre,

        managerId,

        advisors: [],

        createdAt:
            Date.now()
    };
}

export function agregarAsesorEquipo({

    equipo = {},

    advisorId = ''

}) {

    if (
        !equipo.advisors.includes(
            advisorId
        )
    ) {

        equipo.advisors.push(
            advisorId
        );
    }

    return equipo;
}