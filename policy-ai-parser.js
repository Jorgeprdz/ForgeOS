/*
|--------------------------------------------------------------------------
| MODULE: policy-ai-parser.js
|--------------------------------------------------------------------------
|
| Parser inteligente de pólizas.
|
|--------------------------------------------------------------------------
*/

export function parsearTextoPoliza({

    text = ''

}) {

    return {

        cliente:
            detectarCliente(text),

        producto:
            detectarProducto(text),

        prima:
            detectarPrima(text),

        numeroPoliza:
            detectarNumeroPoliza(text)
    };
}

function detectarCliente(

    text

) {

    const match =

        text.match(
            /ASEGURADO[:\s]+([A-Z\s]+)/i
        );

    return match

        ? match[1].trim()

        : '';
}

function detectarProducto(

    text

) {

    const productos = [

        'VIDA',

        'GMM',

        'ALFA MEDICAL'
    ];

    return productos.find(

        producto =>

            text
            .toUpperCase()
            .includes(producto)
    ) || '';
}

function detectarPrima(

    text

) {

    const match =

        text.match(
            /\$[\d,]+(\.\d{2})?/g
        );

    return match

        ? match[0]

        : '';
}

function detectarNumeroPoliza(

    text

) {

    const match =

        text.match(
            /POLIZA[:\s]+([\w\d-]+)/i
        );

    return match

        ? match[1]

        : '';
}