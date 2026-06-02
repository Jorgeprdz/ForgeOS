/*
|--------------------------------------------------------------------------
| MODULE: policy-import-dashboard-engine.js
|--------------------------------------------------------------------------
|
| Dashboard imports.
|
|--------------------------------------------------------------------------
*/

export function generarDashboardImports({

    queue = []

}) {

    return {

        total:
            queue.length,

        processing:

            queue.filter(

                item =>

                    item.status
                    === 'processing'
            ).length,

        completed:

            queue.filter(

                item =>

                    item.status
                    === 'saved'
            ).length,

        errors:

            queue.filter(

                item =>

                    item.status
                    === 'error'
            ).length
    };
}