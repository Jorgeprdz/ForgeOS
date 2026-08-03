import { COMMANDS, getCommandById } from './command-registry.js';
import { buscarComandos } from './command-search-engine.js';
import { cerrarCommandPalette } from './command-palette-ui.js';
import {
  cancelarComandoEscritura,
  confirmarComandoEscritura,
  ejecutarComando,
} from './command-execution-engine.js';
import { parsearComando } from './command-parser-engine.js';
import {
  buildEntityNavigation,
  getCurrentCommandContext,
  resolveEntities,
} from './entity-context-runtime.js';
import { Navigation } from '../navigation-runtime.js';

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

function renderCommands(resultsElement, commands) {
  if (!commands.length) {
    resultsElement.innerHTML = '<div class="command-empty">No encontré un comando.</div>';
    return;
  }

  resultsElement.innerHTML = commands.map((command, index) => `
    <button type="button" class="command-item${index === activeIndex ? ' is-active' : ''}"
      data-command-id="${escapeHtml(command.id)}" role="option" aria-selected="${index === activeIndex}">
      <span>${escapeHtml(command.label)}</span><small>${escapeHtml(command.command)}</small>
    </button>
  `).join('');
}

function renderEntities(resultsElement, resolution) {
  if (resolution.status === 'NOT_FOUND') {
    resultsElement.innerHTML = '<div class="command-empty">No encontré esa persona, póliza o cotización.</div>';
    return;
  }
  if (resolution.status === 'EMPTY_QUERY') {
    resultsElement.innerHTML = '<div class="command-empty">Escribe un nombre, póliza o cotización.</div>';
    return;
  }

  resultsElement.innerHTML = resolution.candidates.map((entity, index) => `
    <button type="button" class="command-item${index === activeIndex ? ' is-active' : ''}"
      data-entity-index="${index}" role="option" aria-selected="${index === activeIndex}">
      <span>${escapeHtml(entity.label)}</span>
      <small>${escapeHtml(entity.type)}${entity.secondaryLabel ? ` · ${escapeHtml(entity.secondaryLabel)}` : ''}</small>
    </button>
  `).join('');
}

function renderWritePreview(resultsElement, preview) {
  const changes = Object.entries(preview.changes || {})
    .map(([key, value]) => `<li><strong>${escapeHtml(key)}</strong>: ${escapeHtml(value)}</li>`)
    .join('');
  resultsElement.innerHTML = `
    <section class="command-write-preview" data-write-preview-id="${escapeHtml(preview.previewId)}">
      <p><strong>${escapeHtml(preview.summary)}</strong></p>
      ${changes ? `<ul>${changes}</ul>` : ''}
      <p><small>Nada se guardará hasta confirmar.</small></p>
      <div class="command-write-actions">
        <button type="button" data-write-confirm>Confirmar</button>
        <button type="button" data-write-cancel>Cancelar</button>
      </div>
    </section>
  `;
}

function renderWriteResult(resultsElement, result) {
  resultsElement.innerHTML = result.ok
    ? `<div class="command-empty" data-write-receipt="${escapeHtml(result.receiptId)}">Guardado y confirmado.</div>`
    : `<div class="command-empty">No se pudo guardar: ${escapeHtml(result.reason)}</div>`;
}

async function executeEntity(entity) {
  const target = buildEntityNavigation(entity);
  if (!target.ok) return false;
  cerrarCommandPalette();
  await Navigation.navigate(target.route, target.params);
  return true;
}

export function bindCommandController(root) {
  const input = root.querySelector('#universal-command-input');
  const resultsElement = root.querySelector('#command-results');
  if (!input || !resultsElement) return () => {};

  let mode = 'COMMANDS';
  let visibleCommands = [...COMMANDS];
  let visibleEntities = [];
  let pendingPreview = null;
  let queryRevision = 0;

  const refresh = () => {
    const length = mode === 'ENTITIES' ? visibleEntities.length : visibleCommands.length;
    activeIndex = Math.min(activeIndex, Math.max(length - 1, 0));
    if (mode === 'ENTITIES') {
      renderEntities(resultsElement, {
        status: visibleEntities.length ? (visibleEntities.length === 1 ? 'RESOLVED' : 'AMBIGUOUS') : 'NOT_FOUND',
        candidates: visibleEntities,
      });
    } else {
      renderCommands(resultsElement, visibleCommands);
    }
  };

  const executeCommand = async (command) => {
    if (!command) return false;
    const result = await ejecutarComando({ command, context: getCurrentCommandContext() });
    if (result.status === 'PREVIEW_REQUIRED') {
      pendingPreview = result;
      mode = 'WRITE_PREVIEW';
      renderWritePreview(resultsElement, result);
      return true;
    }
    if (!result.ok) {
      renderWriteResult(resultsElement, result);
      return false;
    }
    cerrarCommandPalette();
    return true;
  };

  const onInput = async () => {
    const revision = ++queryRevision;
    pendingPreview = null;
    const parsed = parsearComando({ input: input.value });
    activeIndex = 0;

    if (parsed.type === 'ENTITY_HINT') {
      mode = 'ENTITIES';
      resultsElement.innerHTML = '<div class="command-empty">Buscando…</div>';
      const resolution = await resolveEntities({ query: parsed.value, context: getCurrentCommandContext() });
      if (revision !== queryRevision) return;
      visibleEntities = [...resolution.candidates];
      if (!visibleEntities.length) renderEntities(resultsElement, resolution);
      else refresh();
      return;
    }

    mode = 'COMMANDS';
    visibleEntities = [];
    visibleCommands = buscarComandos({ query: input.value, commands: COMMANDS });
    refresh();
  };

  const onKeydown = async (event) => {
    if (mode === 'WRITE_PREVIEW') return;
    const visible = mode === 'ENTITIES' ? visibleEntities : visibleCommands;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      activeIndex = Math.min(activeIndex + 1, Math.max(visible.length - 1, 0));
      refresh();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      refresh();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (mode === 'ENTITIES') await executeEntity(visibleEntities[activeIndex]);
      else await executeCommand(visibleCommands[activeIndex]);
    }
  };

  const onClick = async (event) => {
    if (event.target.closest('[data-write-confirm]') && pendingPreview) {
      const result = await confirmarComandoEscritura({
        previewId: pendingPreview.previewId,
        confirmationToken: pendingPreview.confirmationToken,
      });
      pendingPreview = null;
      renderWriteResult(resultsElement, result);
      return;
    }
    if (event.target.closest('[data-write-cancel]') && pendingPreview) {
      cancelarComandoEscritura({ previewId: pendingPreview.previewId });
      pendingPreview = null;
      mode = 'COMMANDS';
      refresh();
      return;
    }
    const entityButton = event.target.closest('[data-entity-index]');
    if (entityButton) {
      await executeEntity(visibleEntities[Number(entityButton.dataset.entityIndex)]);
      return;
    }
    const commandButton = event.target.closest('[data-command-id]');
    if (commandButton) await executeCommand(getCommandById(commandButton.dataset.commandId));
  };

  input.addEventListener('input', onInput);
  input.addEventListener('keydown', onKeydown);
  resultsElement.addEventListener('click', onClick);
  refresh();

  cleanup = () => {
    queryRevision += 1;
    if (pendingPreview) cancelarComandoEscritura({ previewId: pendingPreview.previewId });
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
