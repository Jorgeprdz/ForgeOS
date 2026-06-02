/*
|--------------------------------------------------------------------------
| MODULE: contact-response-engine.js
|--------------------------------------------------------------------------
*/

export function clasificarRespuesta({

    response

}) {

    const text =
        response.toLowerCase();

    if (

        text.includes('si')

        ||

        text.includes('claro')

    ) {

        return 'POSITIVE';
    }

    if (

        text.includes('después')

        ||

        text.includes('luego')

    ) {

        return 'LATER';
    }

    if (

        text.includes('no')

    ) {

        return 'NEGATIVE';
    }

    return 'UNKNOWN';
}