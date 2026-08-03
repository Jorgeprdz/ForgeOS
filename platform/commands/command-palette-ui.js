/*
|--------------------------------------------------------------------------
| MODULE: command-palette-ui.js
|--------------------------------------------------------------------------
|
| Canonical Command Bar UI.
|
|--------------------------------------------------------------------------
*/

export function renderCommandPalette() {
    return `
<div id="command-palette" style="display:none" aria-hidden="true">
    <div class="command-wrapper">
        <div class="command-input-row">
            <input
                id="universal-command-input"
                type="text"
                placeholder="Escribe lo que necesitas hacer..."
                autocomplete="off"
                aria-label="Escribe lo que necesitas hacer"
            />
            <button
                id="command-voice-draft"
                type="button"
                aria-label="Dictar un borrador"
                aria-pressed="false"
                title="Dictar un borrador"
            >🎙️</button>
        </div>
        <p id="command-input-status" class="command-input-status" aria-live="polite">
            La voz y el lenguaje natural crean borradores; tú confirmas cualquier escritura.
        </p>
        <div
            id="command-results"
            role="listbox"
            aria-label="Resultados de Command Bar"
        ></div>
    </div>
</div>
    `;
}

export function abrirCommandPalette() {
    const palette = document.getElementById('command-palette');
    if (palette) {
        palette.style.display = 'flex';
        palette.setAttribute('aria-hidden', 'false');
        document.getElementById('universal-command-input')?.focus();
    }
}

export function cerrarCommandPalette() {
    const palette = document.getElementById('command-palette');
    if (palette) {
        palette.style.display = 'none';
        palette.setAttribute('aria-hidden', 'true');
    }
}
