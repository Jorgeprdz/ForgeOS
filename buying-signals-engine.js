/*
|--------------------------------------------------------------------------
| MODULE: buying-signals-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Detecta señales de compra en mensajes, notas o conversaciones.
|
|--------------------------------------------------------------------------
*/

export function detectarBuyingSignals({

    messages = []

}) {

    const signals = [

        {
            type:
                'PRICE',

            keywords: [
                'cuánto cuesta',
                'cuanto cuesta',
                'precio',
                'costo',
                'prima'
            ]
        },

        {
            type:
                'PAYMENT_MODE',

            keywords: [
                'pago anual',
                'mensual',
                'trimestral',
                'semestral',
                'forma de pago',
                'tarjeta',
                'domiciliado'
            ]
        },

        {
            type:
                'START_DATE',

            keywords: [
                'cuándo empieza',
                'cuando empieza',
                'desde cuándo',
                'desde cuando',
                'vigencia',
                'fecha de inicio'
            ]
        },

        {
            type:
                'COVERAGE',

            keywords: [
                'qué incluye',
                'que incluye',
                'cobertura',
                'beneficios',
                'suma asegurada'
            ]
        },

        {
            type:
                'DOCUMENTS',

            keywords: [
                'documentos',
                'qué necesito',
                'que necesito',
                'requisitos',
                'firmar'
            ]
        },

        {
            type:
                'BENEFICIARIES',

            keywords: [
                'beneficiario',
                'beneficiarios',
                'mi esposa',
                'mis hijos',
                'familia'
            ]
        }
    ];

    return messages.flatMap((message) => {

        const text =
            String(message)
                .toLowerCase();

        return signals
            .filter((signal) =>

                signal.keywords.some((keyword) =>
                    text.includes(keyword)
                )
            )
            .map((signal) => ({

                type:
                    signal.type,

                message,

                detectedAt:
                    Date.now()
            }));
    });
}