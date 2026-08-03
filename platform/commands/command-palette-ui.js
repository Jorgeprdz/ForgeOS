/*
|--------------------------------------------------------------------------
| MODULE: command-palette-ui.js
|--------------------------------------------------------------------------
|
| UI principal tipo Alfred/Raycast.
|
|--------------------------------------------------------------------------
*/

export function renderCommandPalette() {

    return `

<div id="command-palette" style="display:none" aria-hidden="true">

    <div class="command-wrapper">

        <input

            id="universal-command-input"

            type="text"

            placeholder="Buscar o ejecutar comando..."

            autocomplete="off"

            aria-label="Buscar o ejecutar comando"
        />

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

    const palette =
        document.getElementById(
            'command-palette'
        );

    if (palette) {

        palette.style.display =
            'flex';

        palette.setAttribute(
            'aria-hidden',
            'false'
        );

        document
        .getElementById(
            'universal-command-input'
        )
        ?.focus();
    }
}

export function cerrarCommandPalette() {

    const palette =
        document.getElementById(
            'command-palette'
        );

    if (palette) {

        palette.style.display =
            'none';

        palette.setAttribute(
            'aria-hidden',
            'true'
        );
    }
}
