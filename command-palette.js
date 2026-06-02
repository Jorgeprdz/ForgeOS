/*
|--------------------------------------------------------------------------
| Command Palette UI
|--------------------------------------------------------------------------
*/

import {
    buscarComandos
} from './smnyl-command-palette-engine.js';

export function initCommandPalette() {

    document.addEventListener(
        'keydown',
        e => {

            if (
                (e.metaKey || e.ctrlKey)
                &&
                e.key === 'k'
            ) {

                e.preventDefault();

                abrirPalette();
            }
        }
    );
}

function abrirPalette() {

    const modal =
        document.createElement('div');

    modal.className =
        'command-palette-modal';

    modal.innerHTML = `

        <div
            class="command-palette"
        >

            <input
                id="command-input"
                placeholder="Buscar..."
            />

            <div
                id="command-results"
            ></div>

        </div>

    `;

    document.body.appendChild(modal);

    const input =
        modal.querySelector(
            '#command-input'
        );

    input.focus();

    input.addEventListener(
        'input',
        e => {

            renderResults(
                e.target.value
            );
        }
    );
}

function renderResults(
    query
) {

    const results =
        buscarComandos(query);

    document.getElementById(
        'command-results'
    ).innerHTML =

        results.map(cmd => `

            <div
                class="command-item"
            >

                ${cmd.label}

            </div>

        `).join('');
}