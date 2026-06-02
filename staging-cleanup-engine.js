/*
|--------------------------------------------------------------------------
| MODULE: staging-cleanup-engine.js
|--------------------------------------------------------------------------
|
| Limpieza automática de staging cache.
|
|--------------------------------------------------------------------------
*/

export function limpiarImportsViejos({

    cache = [],

    maxHours = 24

}) {

    const now = Date.now();

    return cache.filter(

        item => {

            const diffHours =

                (
                    now
                    - item.createdAt
                )

                / 3600000;

            return diffHours < maxHours;
        }
    );
}