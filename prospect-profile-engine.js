/*
|--------------------------------------------------------------------------
| MODULE: prospect-profile-engine.js
|--------------------------------------------------------------------------
*/

export function construirPerfilProspecto({

    name,

    relationship,

    profession,

    age,

    source

}) {

    return {

        name,

        relationship,

        profession,

        age,

        source,

        createdAt:
            Date.now()
    };
}