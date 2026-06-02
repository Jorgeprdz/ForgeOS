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

<div id="command-palette">

    <div class="command-wrapper">

        <input

            id="universal-command-input"

            type="text"

            placeholder="Buscar o ejecutar comando..."

            autocomplete="off"
        />

        <div
            id="command-results"
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
    }
}