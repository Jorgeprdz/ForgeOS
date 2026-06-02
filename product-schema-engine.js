/*
|--------------------------------------------------------------------------
| MODULE: product-schema-engine.js
|--------------------------------------------------------------------------
|
| Dynamic product schema system.
|
|--------------------------------------------------------------------------
*/

export function crearSchemaProducto({

    carrier,

    lineOfBusiness,

    product,

    fields = []

}) {

    return {

        id:
            crypto.randomUUID(),

        carrier,

        lineOfBusiness,

        product,

        fields,

        createdAt:
            Date.now()
    };
}