/*
|--------------------------------------------------------------------------
| MODULE: smart-field-detection-engine.js
|--------------------------------------------------------------------------
|
| Detección inteligente de columnas.
|
|--------------------------------------------------------------------------
*/

const FIELD_PATTERNS = {

    cliente: [

        'cliente',

        'nombre',

        'asegurado'
    ],

    prima: [

        'prima',

        'premium',

        'pma'
    ],

    producto: [

        'producto',

        'ramo',

        'plan'
    ],

    renovacion: [

        'renovacion',

        'vigencia',

        'fecha_renovacion'
    ]
};

export function detectarCampos(

    headers = []

) {

    const resultado = {};

    headers.forEach(

        header => {

            const normalized =

                header

                .toLowerCase()

                .trim();

            Object.entries(
                FIELD_PATTERNS
            )

            .forEach(

                ([field, patterns]) => {

                    const match =

                        patterns.some(

                            pattern =>

                                normalized.includes(
                                    pattern
                                )
                        );

                    if (match) {

                        resultado[field] =
                            header;
                    }
                }
            );
        }
    );

    return resultado;
}