/*
|--------------------------------------------------------------------------
| MODULE: advisor-style-engine.js
|--------------------------------------------------------------------------
*/

export function detectarEstiloAsesor({

    advisorProfile

}) {

    return (

        advisorProfile?.salesStyle

        ||

        'CONSULTIVE'
    );
}