/*
|--------------------------------------------------------------------------
| MODULE:
| objection-classifier-engine.js
|--------------------------------------------------------------------------
*/

export function clasificarObjecion({

    message = ''

}) {

    const text =
        message.toLowerCase();

    if (
        text.includes('tiempo')
    ) {

        return 'NO_TIME';
    }

    if (
        text.includes('información')
        ||
        text.includes('informacion')
    ) {

        return 'SEND_INFORMATION';
    }

    if (
        text.includes('después')
        ||
        text.includes('despues')
    ) {

        return 'CALL_ME_LATER';
    }

    if (
        text.includes('asesor')
    ) {

        return 'ALREADY_HAS_ADVISOR';
    }

    if (
        text.includes('seguro')
    ) {

        return 'ALREADY_HAS_INSURANCE';
    }

    if (
        text.includes('interesa')
    ) {

        return 'NOT_INTERESTED';
    }

    return 'UNKNOWN';
}