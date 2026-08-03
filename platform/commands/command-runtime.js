import {
    renderCommandPalette,
    abrirCommandPalette,
    cerrarCommandPalette,
} from './command-palette-ui.js';
import {
    initCommandShortcuts,
    destroyCommandShortcuts,
} from './command-shortcuts-engine.js';
import {
    bindCommandController,
    destroyCommandController,
} from './command-controller.js';
import {
    mountPersonFollowUpAuthority,
    unmountPersonFollowUpAuthority,
} from './person-follow-up-authority.js';
import {
    mountAdvisorExperience,
    unmountAdvisorExperience,
} from './advisor-experience-runtime.js';
import {
    mountContextualClippy,
    unmountContextualClippy,
} from './contextual-clippy-runtime.js';

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

function bindPaletteLifecycle(root) {
    const palette = root.querySelector('#command-palette');
    if (!palette) return;
    palette.setAttribute('role', 'dialog');
    palette.setAttribute('aria-modal', 'true');
    palette.setAttribute('aria-label', 'Command Bar');
    palette.addEventListener('click', event => {
        if (event.target === palette) cerrarCommandPalette();
    });
}

export function mountCommandRuntime() {
    if (mounted || document.getElementById(RUNTIME_ROOT_ID)) return;
    ensureStylesheet();
    mountPersonFollowUpAuthority();

    const root = document.createElement('div');
    root.id = RUNTIME_ROOT_ID;
    root.dataset.commandOsMounted = 'true';
    root.innerHTML = renderCommandPalette();
    root.appendChild(createMobileTrigger());
    document.body.appendChild(root);

    bindPaletteLifecycle(root);
    bindCommandController(root);
    mountAdvisorExperience(root);
    mountContextualClippy();
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
    unmountContextualClippy();
    unmountAdvisorExperience();
    destroyCommandController();
    destroyCommandShortcuts();
    void unmountPersonFollowUpAuthority();
    document.getElementById(RUNTIME_ROOT_ID)?.remove();
    document.getElementById(STYLE_ID)?.remove();
    mounted = false;
}
