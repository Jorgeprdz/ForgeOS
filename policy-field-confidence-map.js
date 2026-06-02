/*
|--------------------------------------------------------------------------
| MODULE: policy-field-confidence-map.js
|--------------------------------------------------------------------------
|
| Confidence individual por campo.
|
|--------------------------------------------------------------------------
*/

import {

    calcularConfidence

} from './field-confidence-engine.js';

export function generarConfidenceMap({

    parsed = {}

}) {

    return {

        cliente:

            calcularConfidence({

                value:
                    parsed.cliente,

                field:
                    'cliente'
            }),

        prima:

            calcularConfidence({

                value:
                    parsed.prima,

                field:
                    'prima'
            }),

        numeroPoliza:

            calcularConfidence({

                value:
                    parsed.numeroPoliza,

                field:
                    'numeroPoliza'
            })
    };
}