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

let initialized = false;

const handleCommandShortcut = (e) => {
    if (
        (e.metaKey || e.ctrlKey)
        && e.key.toLowerCase() === 'k'
    ) {
        e.preventDefault();
        abrirCommandPalette();
        return;
    }

    if (e.key === 'Escape') {
        cerrarCommandPalette();
    }
};

export function initCommandShortcuts() {
    if (initialized) return;

    document.addEventListener('keydown', handleCommandShortcut);
    initialized = true;
}

export function destroyCommandShortcuts() {
    if (!initialized) return;

    document.removeEventListener('keydown', handleCommandShortcut);
    initialized = false;
}
