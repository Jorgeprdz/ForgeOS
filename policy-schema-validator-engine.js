/*
|--------------------------------------------------------------------------
| MODULE: policy-schema-validator-engine.js
|--------------------------------------------------------------------------
|
| Dynamic schema validator.
|
|--------------------------------------------------------------------------
*/

export function validarMetadata({

    schema = [],

    metadata = {}

}) {

    const errors = [];

    for (

        const field
        of schema
    ) {

        /*
        |--------------------------------------------------------------------------
        | Required
        |--------------------------------------------------------------------------
        */

        if (

            field.required
            &&

            metadata[
                field.key
            ] === undefined
        ) {

            errors.push({

                field:
                    field.key,

                error:
                    'REQUIRED'
            });
        }
    }

    return {

        valid:
            errors.length === 0,

        errors
    };
}