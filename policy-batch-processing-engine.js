/*
|--------------------------------------------------------------------------
| MODULE: policy-batch-processing-engine.js
|--------------------------------------------------------------------------
|
| Procesamiento masivo de documentos.
|
|--------------------------------------------------------------------------
*/

export async function procesarBatch({

    files = [],

    processor

}) {

    const results = [];

    for (const file of files) {

        try {

            const result =

                await processor({

                    file
                });

            results.push({

                fileName:
                    file.name,

                success:
                    true,

                result
            });

        } catch (error) {

            results.push({

                fileName:
                    file.name,

                success:
                    false,

                error:
                    error.message
            });
        }
    }

    return results;
}