/*
|--------------------------------------------------------------------------
| MODULE: search-ranking-engine.js
|--------------------------------------------------------------------------
|
| Search ranking engine.
|
|--------------------------------------------------------------------------
*/

export function rankearResultados({

    results = []

}) {

    return results.sort(

        (
            a,
            b
        ) => (

            (
                b.item.priority
                || 0
            )

            -

            (
                a.item.priority
                || 0
            )
        )
    );
}