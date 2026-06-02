/*
|--------------------------------------------------------------------------
| MODULE: presentation-input-pipeline.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.2.0
|
|--------------------------------------------------------------------------
|
| Pipeline inicial para preparar una cotización hacia presentación.
|
|--------------------------------------------------------------------------
*/

import { normalizarCamposCotizacion }
    from './quotation-field-normalizer.js';

import { normalizarCotizacionAMXN }
    from './quotation-currency-bridge.js';

import { detectarProductoCotizacion }
    from './product-detection-engine.js';

import { vincularProductKnowledge }
    from './product-knowledge-link-engine.js';

import { proyectarValoresRescateDinamicos }
    from './dynamic-cash-value-projection-engine.js';

export function prepararInputPresentacion({

    extractedFields = {},

    rates = {},

    productLibrary = [],

    currentUdiValue = 0,

    projectionRates = {},

    maxMilestones = 5

}) {

    const quotation =
        normalizarCamposCotizacion({
            fields:
                extractedFields
        });

    const normalizedQuotation =
        normalizarCotizacionAMXN({

            quotation,

            rates
        });

    const productDetection =
        detectarProductoCotizacion({

            productName:
                normalizedQuotation.productName,

            carrierName:
                normalizedQuotation.carrierName,

            productLibrary
        });

    const linkedQuotation =
        vincularProductKnowledge({

            quotation:
                normalizedQuotation,

            detection:
                productDetection
        });

    const projections =
        extractedFields.cashValueRows

            ? proyectarValoresRescateDinamicos({

                currentUdiValue,

                currentAge:
                    Number(
                        extractedFields.currentAge || 0
                    ),

                extractedCashValueRows:
                    extractedFields.cashValueRows,

                rates:
                    projectionRates,

                maxMilestones
            })

            : null;

    return {

        quotation:
            linkedQuotation,

        productDetection,

        projections,

        readyForPresentation:
            productDetection.status !== 'UNKNOWN_PRODUCT'
    };
}