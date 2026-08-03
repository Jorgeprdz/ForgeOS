import {
    renderCommandPalette,
    abrirCommandPalette,
    cerrarCommandPalette,
} from './command-palette-ui.js';
import { initCommandShortcuts } from './command-shortcuts-engine.js';

const RUNTIME_ROOT_ID = 'command-os-runtime-root';
const MOBILE_BUTTON_ID = 'command-os-mobile-trigger';
const STYLE_ID = 'command-os-runtime-style';

let mounted = false;

function ensureStylesheet() {
    if (document.getElementById(STYLE_ID)) return;

    const link = document.createElement('link');
    link.id = STYLE_ID;
    link.rel = 'stylesheet';
    link.href = './platform/commands/command-palette.css';
    document.head.appendChild(link);
}

function createMobileTrigger() {
    const button = document.createElement('button');
    button.id = MOBILE_BUTTON_ID;
    button.type = 'button';
    button.className = 'command-os-mobile-trigger';
    button.setAttribute('aria-label', 'Abrir Command Bar');
    button.setAttribute('title', 'Abrir Command Bar');
    button.innerHTML = '<span aria-hidden="true">⌘</span>';
    button.addEventListener('click', abrirCommandPalette);
    return button;
}

export function mountCommandRuntime() {
    if (mounted || document.getElementById(RUNTIME_ROOT_ID)) return;

    ensureStylesheet();

    const root = document.createElement('div');
    root.id = RUNTIME_ROOT_ID;
    root.dataset.commandOsMounted = 'true';
    root.innerHTML = renderCommandPalette();
    root.appendChild(createMobileTrigger());
    document.body.appendChild(root);

    initCommandShortcuts();
    mounted = true;
}

export function scrubCommandRuntime() {
    cerrarCommandPalette();

    const input = document.getElementById('universal-command-input');
    if (input) input.value = '';

    const results = document.getElementById('command-results');
    if (results) results.replaceChildren();
}

export function unmountCommandRuntime() {
    scrubCommandRuntime();
    document.getElementById(RUNTIME_ROOT_ID)?.remove();
    document.getElementById(STYLE_ID)?.remove();
    mounted = false;
}
