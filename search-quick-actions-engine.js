/*
|--------------------------------------------------------------------------
| MODULE: search-quick-actions-engine.js
|--------------------------------------------------------------------------
|
| Quick action parser.
|
|--------------------------------------------------------------------------
*/

export function detectarQuickAction({

    query = ''

}) {

    if (

        !query.startsWith('/')
    ) {

        return null;
    }

    return query

        .replace('/', '')
        .trim()
        .toLowerCase();
}