/*
|--------------------------------------------------------------------------
| MODULE: universal-filters-engine.js
|--------------------------------------------------------------------------
|
| Sistema universal de filtros.
|
|--------------------------------------------------------------------------
*/

export function filtrarColeccion({

    items = [],

    search = '',

    filters = {}

}) {

    return items.filter(

        item => {

            /*
            |--------------------------------------------------------------------------
            | Search global
            |--------------------------------------------------------------------------
            */

            const matchesSearch =

                JSON.stringify(item)

                .toLowerCase()

                .includes(

                    search.toLowerCase()
                );

            /*
            |--------------------------------------------------------------------------
            | Filtros dinámicos
            |--------------------------------------------------------------------------
            */

            const matchesFilters =

                Object.entries(filters)

                .every(

                    ([key, value]) => {

                        if (
                            !value
                        ) {

                            return true;
                        }

                        return (
                            item[key]
                            === value
                        );
                    }
                );

            return (

                matchesSearch

                &&

                matchesFilters
            );
        }
    );
}