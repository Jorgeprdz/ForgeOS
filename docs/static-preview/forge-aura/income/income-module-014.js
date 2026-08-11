import { createIncomeModule as createBaseIncomeModule } from './income-module.js?base=forge-aura-real-user-repair-014';

function text(value) {
  return String(value ?? '').trim();
}

function exact(root, selector, from, to) {
  root.querySelectorAll(selector).forEach(node => {
    if (text(node.textContent) === from) node.textContent = to;
  });
}

function hideInternalDiagnostics(root) {
  root.querySelectorAll('code').forEach(node => {
    const value = text(node.textContent);
    if (/HISTORY_LIMIT|CANONICAL_SOURCE_LIMIT|REASON=|RLS_|LEDGER|GENERATED_YTD|Rule Pack/i.test(value)) {
      node.remove();
    }
  });

  root.querySelectorAll('dl div').forEach(row => {
    const label = text(row.querySelector('dt')?.textContent);
    if (/^Rule Pack$/i.test(label)) row.remove();
  });
}

function humanizeStatePanels(root) {
  exact(root, '.income-eyebrow', 'EVIDENCIA ECONÓMICA', 'INGRESOS');

  root.querySelectorAll('.income-state p').forEach(node => {
    const current = text(node.textContent);
    if (/snapshot económico canónico/i.test(current)) {
      node.textContent = 'Estamos leyendo la información de ingresos disponible para este periodo.';
    } else if (/Falta evidencia suficiente o existe un conflicto/i.test(current)) {
      node.textContent = 'Falta información suficiente o hay datos que necesitan revisión. Forge no completará cifras por su cuenta.';
    } else if (/La fuente respondió con un error/i.test(current)) {
      node.textContent = 'No pudimos consultar la información de ingresos en este momento. No mostraremos datos anteriores como si fueran actuales.';
    } else if (/La autoridad productiva de compensación no está disponible/i.test(current)) {
      node.textContent = 'La información de ingresos no está disponible en este momento. Cartera y Pipeline seguirán separados de este cálculo.';
    }
  });
}

function humanizeComposition(root) {
  root.querySelectorAll('.income-honest-empty p,.income-composition__rows p').forEach(node => {
    const current = text(node.textContent);
    if (/movimientos devengados canónicos/i.test(current)) {
      node.textContent = 'Forge necesita movimientos de ingresos confirmados para separar nuevas ventas, renovaciones y bonos. Si falta un dato, no se convertirá en cero.';
    } else if (/requieren clasificación canónica/i.test(current)) {
      node.textContent = current.replace(/requieren clasificación canónica/i, 'requieren revisión');
    } else if (/sin autoridad/i.test(current)) {
      node.textContent = current.replace(/sin autoridad/gi, 'sin información suficiente');
    }
  });
}

function humanizeSmartCards(root) {
  root.querySelectorAll('.income-smart .income-eyebrow').forEach(node => {
    const current = text(node.textContent);
    if (/^EXPECTED/i.test(current)) node.textContent = 'ESPERADO · AÚN NO GENERADO';
    if (/^SCENARIO/i.test(current)) node.textContent = 'POSIBLE · NO GARANTIZADO';
  });

  root.querySelectorAll('.income-smart p').forEach(node => {
    const current = text(node.textContent);
    if (/señales económicas explícitas y reproducibles/i.test(current)) {
      node.textContent = 'Este escenario usa únicamente importes respaldados por la información disponible. No convierte una probabilidad del Pipeline en ingreso.';
    } else if (/fuente de señales futuras está desconectada/i.test(current)) {
      node.textContent = 'La información necesaria para estimar renovaciones futuras no está disponible en este momento.';
    } else if (/evidencia disponible/i.test(current)) {
      node.textContent = current.replace(/evidencia disponible/gi, 'información disponible');
    }
  });
}

function humanizeBonus(root) {
  root.querySelectorAll('.income-bonus p').forEach(node => {
    const current = text(node.textContent);
    if (/autoridad de carrera y Rule Snapshot/i.test(current)) {
      node.textContent = 'La etapa profesional y las condiciones aplicables se toman de la información vigente de tu esquema de bonos.';
    } else if (/snapshot gobernado de elegibilidad/i.test(current)) {
      node.textContent = 'Falta la información vigente necesaria para determinar qué esquema de bonos te corresponde.';
    }
  });
}

function humanizeAnnual(root) {
  root.querySelectorAll('.income-annual__grid small').forEach(node => {
    const current = text(node.textContent);
    if (current === 'GENERATED_YTD') node.textContent = 'Generado en el año';
    if (/^EXPECTED/i.test(current)) node.textContent = 'Esperado · separado';
    if (/^SCENARIO/i.test(current)) node.textContent = 'Posible · separado';
    if (/autoridad futura/i.test(current)) node.textContent = 'Sin información futura suficiente';
  });

  root.querySelectorAll('.income-honest-empty').forEach(block => {
    const strong = block.querySelector('strong');
    const paragraph = block.querySelector('p');
    if (!strong || !/Vista anual incompleta por límite de la fuente canónica/i.test(text(strong.textContent))) return;
    const match = text(paragraph?.textContent).match(/contiene\s+(\d+)\s+mes/i);
    const count = match ? Number(match[1]) : null;
    strong.textContent = count ? `Historial disponible: últimos ${count} meses.` : 'Historial anual disponible de forma parcial.';
    if (paragraph) {
      paragraph.textContent = count
        ? `Por ahora Forge cuenta con ${count} meses de información. Los meses que faltan se mantienen como no disponibles.`
        : 'Forge muestra únicamente los meses disponibles y no completa los periodos faltantes con supuestos.';
    }
  });
}

function humanizeHistory(root) {
  exact(root, '#income-history-title', 'Últimos periodos canónicos', 'Historial de ingresos');
  root.querySelectorAll('.income-history article small').forEach(node => {
    const current = text(node.textContent);
    if (current === 'EARNED') node.textContent = 'Generado';
    if (current === 'UNKNOWN') node.textContent = 'No disponible';
  });
}

function humanizeBanners(root) {
  root.querySelectorAll('.income-banner span,.income-honest-empty p').forEach(node => {
    const current = text(node.textContent);
    if (/autoridad suficiente/i.test(current)) {
      node.textContent = current.replace(/autoridad suficiente/gi, 'información suficiente');
    }
    if (/fuente canónica|periodos canónicos|canónica/i.test(text(node.textContent))) {
      node.textContent = text(node.textContent)
        .replace(/fuente canónica/gi, 'información disponible')
        .replace(/periodos canónicos/gi, 'periodos disponibles')
        .replace(/canónica/gi, 'confirmada');
    }
  });
}

function reconcile(root) {
  if (!root) return;
  humanizeStatePanels(root);
  humanizeComposition(root);
  humanizeSmartCards(root);
  humanizeBonus(root);
  humanizeAnnual(root);
  humanizeHistory(root);
  humanizeBanners(root);
  hideInternalDiagnostics(root);
}

export function createIncomeModule(options = {}) {
  const root = options.root;
  const base = createBaseIncomeModule(options);
  let observer = null;
  let scheduled = false;

  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => {
      scheduled = false;
      reconcile(root);
    });
  };

  function start() {
    const Observer = root?.ownerDocument?.defaultView?.MutationObserver || globalThis.MutationObserver;
    if (!Observer || !root) return;
    observer = new Observer(schedule);
    observer.observe(root, { childList: true, subtree: true, characterData: true });
    schedule();
  }

  function stop() {
    observer?.disconnect();
    observer = null;
  }

  return Object.freeze({
    ...base,
    async mount() {
      start();
      const result = await base.mount?.();
      schedule();
      return result;
    },
    async reload() {
      const result = await base.reload?.();
      schedule();
      return result;
    },
    async scrub() {
      stop();
      return base.scrub?.();
    },
    async unmount() {
      stop();
      return base.unmount?.();
    },
    async destroy() {
      stop();
      return base.destroy?.();
    },
  });
}
