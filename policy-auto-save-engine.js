/*
|--------------------------------------------------------------------------
| MODULE: policy-auto-save-engine.js
|--------------------------------------------------------------------------
|
| Auto-save staging imports.
|
|--------------------------------------------------------------------------
*/

export function autoGuardarImport({

    key = '',

    data = {}

}) {

    localStorage.setItem(

        key,

        JSON.stringify({

            data,

            updatedAt:
                Date.now()
        })
    );
}

export function obtenerAutoSave(

    key = ''

) {

    const raw =

        localStorage.getItem(
            key
        );

    if (!raw) {

        return null;
    }

    return JSON.parse(raw);
}