import { COMMANDS, getCommandById } from './command-registry.js';
import { buscarComandos } from './command-search-engine.js';
import { cerrarCommandPalette } from './command-palette-ui.js';
import { ejecutarComando } from './command-execution-engine.js';

let activeIndex = 0;
let cleanup = null;

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}

function render(resultsElement, commands) {
    if (!commands.length) {
        resultsElement.innerHTML = '<div class="command-empty">No encontré un comando.</div>';
        return;
    }

    resultsElement.innerHTML = commands.map((command, index) => `
        <button
            type="button"
            class="command-item${index === activeIndex ? ' is-active' : ''}"
            data-command-id="${escapeHtml(command.id)}"
            role="option"
            aria-selected="${index === activeIndex}"
        >
            <span>${escapeHtml(command.label)}</span>
            <small>${escapeHtml(command.command)}</small>
        </button>
    `).join('');
}

async function execute(command) {
    if (!command) return false;
    const result = await ejecutarComando({ command });
    if (!result.ok) return false;
    cerrarCommandPalette();
    return true;
}

export function bindCommandController(root) {
    const input = root.querySelector('#universal-command-input');
    const resultsElement = root.querySelector('#command-results');
    if (!input || !resultsElement) return () => {};

    let visibleCommands = [...COMMANDS];

    const refresh = () => {
        activeIndex = Math.min(activeIndex, Math.max(visibleCommands.length - 1, 0));
        render(resultsElement, visibleCommands);
    };

    const onInput = () => {
        visibleCommands = buscarComandos({ query: input.value, commands: COMMANDS });
        activeIndex = 0;
        refresh();
    };

    const onKeydown = async (event) => {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            activeIndex = Math.min(activeIndex + 1, Math.max(visibleCommands.length - 1, 0));
            refresh();
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            activeIndex = Math.max(activeIndex - 1, 0);
            refresh();
        } else if (event.key === 'Enter') {
            event.preventDefault();
            await execute(visibleCommands[activeIndex]);
        }
    };

    const onClick = async (event) => {
        const button = event.target.closest('[data-command-id]');
        if (!button) return;
        await execute(getCommandById(button.dataset.commandId));
    };

    input.addEventListener('input', onInput);
    input.addEventListener('keydown', onKeydown);
    resultsElement.addEventListener('click', onClick);
    refresh();

    cleanup = () => {
        input.removeEventListener('input', onInput);
        input.removeEventListener('keydown', onKeydown);
        resultsElement.removeEventListener('click', onClick);
        cleanup = null;
    };

    return cleanup;
}

export function destroyCommandController() {
    cleanup?.();
}
