/*
|--------------------------------------------------------------------------
| MODULE: mass-import-validation-engine.js
|--------------------------------------------------------------------------
|
| Validación masiva Excel/CSV.
|
|--------------------------------------------------------------------------
*/

export function validarRowsMasivas({

    rows = [],

    mapping = {}

}) {

    const errors = [];

    rows.forEach(

        (row, index) => {

            /*
            |--------------------------------------------------------------------------
            | Cliente requerido
            |--------------------------------------------------------------------------
            */

            if (

                !row[
                    mapping.cliente
                ]
            ) {

                errors.push({

                    row:
                        index + 1,

                    field:
                        'cliente',

                    error:
                        'Cliente requerido'
                });
            }

            /*
            |--------------------------------------------------------------------------
            | Prima requerida
            |--------------------------------------------------------------------------
            */

            if (

                !row[
                    mapping.prima
                ]
            ) {

                errors.push({

                    row:
                        index + 1,

                    field:
                        'prima',

                    error:
                        'Prima requerida'
                });
            }
        }
    );

    return errors;
}