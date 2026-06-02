/*
|--------------------------------------------------------------------------
| MODULE: policy-duplicate-engine.js
|--------------------------------------------------------------------------
|
| Detección de duplicados.
|
|--------------------------------------------------------------------------
*/

export function detectarDuplicados({

    polizas = []

}) {

    const seen = new Set();

    return polizas.filter(

        poliza => {

            const key =
`
${poliza.cliente}
-${poliza.producto}
-${poliza.prima}
            `.trim();

            if (

                seen.has(key)
            ) {

                return true;
            }

            seen.add(key);

            return false;
        }
    );
}