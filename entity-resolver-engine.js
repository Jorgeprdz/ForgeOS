/*
|--------------------------------------------------------------------------
| MODULE: entity-resolver-engine.js
|--------------------------------------------------------------------------
|
| Entity resolution engine.
|
|--------------------------------------------------------------------------
*/

export function resolverEntidad({

    query = '',

    entities = []

}) {

    const normalized =
        query.toLowerCase();

    return entities.find(

        entity => (

            entity.name
            .toLowerCase()

            .includes(
                normalized
            )
        )
    );
}