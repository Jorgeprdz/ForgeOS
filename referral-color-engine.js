/*
|--------------------------------------------------------------------------
| MODULE: referral-color-engine.js
|--------------------------------------------------------------------------
|
| Colores dinámicos de temperatura.
|
|--------------------------------------------------------------------------
*/

export function obtenerColorTemperatura(

    temperatura = ''

) {

    switch (temperatura) {

        case 'hot':

            return '#ff4d4f';

        case 'warm':

            return '#faad14';

        case 'cold':

            return '#52c41a';

        default:

            return '#d9d9d9';
    }
}