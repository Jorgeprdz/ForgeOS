/*
|--------------------------------------------------------------------------
| MODULE: sales-context-engine.js
|--------------------------------------------------------------------------
*/

export function construirContextoVenta({

    prospect,

    advisorStyle,

    scriptType

}) {

    return {

        task:
            'GENERATE_OUTREACH_MESSAGE',

        language:
            'es-MX',

        advisorStyle,

        scriptType,

        prospect
    };
}