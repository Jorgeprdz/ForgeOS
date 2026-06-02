/*
|--------------------------------------------------------------------------
| MODULE: policy-import-errors-engine.js
|--------------------------------------------------------------------------
|
| Manejo centralizado de errores.
|
|--------------------------------------------------------------------------
*/

export function crearImportError({

    type = '',

    message = '',

    fileName = ''

}) {

    return {

        id:
            crypto.randomUUID(),

        type,

        message,

        fileName,

        createdAt:
            Date.now()
    };
}

export function agruparErrores({

    errors = []

}) {

    return errors.reduce(

        (acc, error) => {

            if (

                !acc[
                    error.type
                ]
            ) {

                acc[
                    error.type
                ] = [];
            }

            acc[
                error.type
            ]

            .push(error);

            return acc;

        },

        {}
    );
}