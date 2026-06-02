/*
|--------------------------------------------------------------------------
| MODULE:
| seen-but-no-reply-engine.js
|--------------------------------------------------------------------------
*/

export function detectarVistoSinRespuesta({

    messageOpened,

    replies

}) {

    return (

        messageOpened

        &&

        replies === 0
    );
}