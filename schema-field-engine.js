/*
|--------------------------------------------------------------------------
| MODULE: schema-field-engine.js
|--------------------------------------------------------------------------
|
| Dynamic schema field builder.
|
|--------------------------------------------------------------------------
*/

export function crearCampoSchema({

    key,

    label,

    type = 'text',

    required = false

}) {

    return {

        key,

        label,

        type,

        required
    };
}