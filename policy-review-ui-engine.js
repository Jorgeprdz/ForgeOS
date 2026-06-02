/*
|--------------------------------------------------------------------------
| MODULE: policy-review-ui-engine.js
|--------------------------------------------------------------------------
|
| Preview editable importación.
|
|--------------------------------------------------------------------------
*/

export function generarPreviewPoliza({

    parsed = {},

    confidence = {}

}) {

    return {

        fields: [

            {

                label:
                    'Cliente',

                value:
                    parsed.cliente,

                confidence:
                    confidence.cliente
            },

            {

                label:
                    'Producto',

                value:
                    parsed.producto,

                confidence:
                    confidence.producto
            },

            {

                label:
                    'Prima',

                value:
                    parsed.prima,

                confidence:
                    confidence.prima
            },

            {

                label:
                    'Número póliza',

                value:
                    parsed.numeroPoliza,

                confidence:
                    confidence.numeroPoliza
            }
        ]
    };
}