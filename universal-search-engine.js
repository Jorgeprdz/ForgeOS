/*
|--------------------------------------------------------------------------
| MODULE: universal-search-engine.js
|--------------------------------------------------------------------------
|
| Universal search engine.
|
|--------------------------------------------------------------------------
*/

export function buscarUniversal({

    query = '',

    datasets = []

}) {

    const normalized =
        query.toLowerCase();

    const results = [];

    for (

        const dataset
        of datasets
    ) {

        for (

            const item
            of dataset.items
        ) {

            const searchable =

                JSON.stringify(item)
                .toLowerCase();

            if (

                searchable.includes(
                    normalized
                )
            ) {

                results.push({

                    type:
                        dataset.type,

                    item
                });
            }
        }
    }

    return results;
}