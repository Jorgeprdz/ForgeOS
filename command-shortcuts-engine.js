/*
|--------------------------------------------------------------------------
| MODULE: command-shortcuts-engine.js
|--------------------------------------------------------------------------
|
| Shortcuts globales del sistema.
|
|--------------------------------------------------------------------------
*/

import {

    abrirCommandPalette,

    cerrarCommandPalette

} from './command-palette-ui.js';

export function initCommandShortcuts() {

    document.addEventListener(

        'keydown',

        (e) => {

            /*
            |--------------------------------------------------------------------------
            | CMD + K
            |--------------------------------------------------------------------------
            */

            if (

                (
                    e.metaKey
                    || e.ctrlKey
                )

                &&

                e.key.toLowerCase()
                === 'k'
            ) {

                e.preventDefault();

                abrirCommandPalette();
            }

            /*
            |--------------------------------------------------------------------------
            | ESC
            |--------------------------------------------------------------------------
            */

            if (
                e.key === 'Escape'
            ) {

                cerrarCommandPalette();
            }
        }
    );
}