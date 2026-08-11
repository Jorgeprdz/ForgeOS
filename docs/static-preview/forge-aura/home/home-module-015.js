import { createHomeModule as createBaseHomeModule } from './home-module-008.js?v=forge-commercial-compass-015-base';

const HANDOFF = Symbol.for('forge.aura.commercial-compass.015');
const STYLE_ID = 'forge-commercial-compass-015-home-style';
const COMPASS_ATTR = 'data-commercial-compass-015';
const PHASE = 'FORGE_COMMERCIAL_COMPASS_015';
const RECONCILE_DELAYS = Object.freeze([0, 80, 320, 900, 1800]);

function text(value) {
  return String(value ?? '').trim();
}

function finite(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);
}

function money(value) {
  const number = finite(value);
  return number === null
    ? 'Falta información'
    : new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(number);
}

function numberLabel(value) {
  const number = finite(value);
  return number === null ? 'Falta información' : new Intl.NumberFormat('es-MX', { maximumFractionDigits: 0 }).format(number);
}

function percent(value) {
  const number = finite(value);
  return number === null ? '—' : `${Math.round(number)}%`;
}

function rhythmLabel(value) {
  return ({
    AHEAD: 'Adelantado',
    ON_TRACK: 'En ritmo',
    BEHIND: 'Por debajo del ritmo',
    UNKNOWN: 'Falta información',
  })[value] || 'Falta información';
}

function rhythmTone(value) {
  return ({ AHEAD: 'ahead', ON_TRACK: 'track', BEHIND: 'behind' })[value] || 'unknown';
}

function installStyles(doc) {
  if (doc.getElementById(STYLE_ID)) return;
  const style = doc.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .commercial-compass-015{margin:22px 0 0;border:1px solid var(--aura-border);border-radius:var(--aura-radius-lg);background:var(--aura-surface)}
    .commercial-compass-015>summary{display:flex;align-items:center;min-height:52px;padding:10px clamp(16px,2.3vw,26px);color:var(--aura-brand-hover);font-weight:800;cursor:pointer}
    .commercial-compass-015>summary::marker{color:var(--aura-brand)}
    .commercial-compass-015__detail{display:grid;gap:16px;padding:0 clamp(16px,2.3vw,26px) clamp(16px,2.3vw,26px)}
    .commercial-compass-015 *{box-sizing:border-box}
    .commercial-compass-015__head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px}
    .commercial-compass-015__eyebrow{margin:0 0 5px;font-size:.76rem;font-weight:850;letter-spacing:.08em;color:var(--aura-text-muted)}
    .commercial-compass-015 h2{margin:0;font-size:clamp(1.3rem,3vw,2rem);line-height:1.08;color:var(--aura-text)}
    .commercial-compass-015__intro{margin:7px 0 0;color:var(--aura-text-muted);max-width:64ch}
    .commercial-compass-015__tabs{display:flex;gap:6px;padding:4px;border-radius:14px;background:var(--aura-surface-subtle)}
    .commercial-compass-015__tabs button{min-height:38px;border:0;border-radius:10px;padding:7px 14px;background:transparent;color:var(--aura-text-muted);font:inherit;font-weight:750;cursor:pointer}
    .commercial-compass-015__tabs button[aria-pressed="true"]{background:var(--aura-surface);color:var(--aura-brand-hover);box-shadow:var(--aura-shadow-sm)}
    .commercial-compass-015__sequence{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
    .commercial-compass-015__step{display:grid;gap:7px;min-width:0;padding:14px;border:1px solid var(--aura-border);border-radius:18px;background:var(--aura-surface-subtle)}
    .commercial-compass-015__step small{font-size:.73rem;font-weight:850;letter-spacing:.06em;color:var(--aura-text-muted)}
    .commercial-compass-015__step strong{font-size:1.05rem;color:var(--aura-text);overflow-wrap:anywhere}
    .commercial-compass-015__step p{margin:0;color:var(--aura-text-muted);font-size:.88rem;line-height:1.4}
    .commercial-compass-015__metric-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
    .commercial-compass-015__metric{padding:16px;border-radius:18px;background:var(--aura-surface-subtle);min-width:0}
    .commercial-compass-015__metric header{display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:10px}
    .commercial-compass-015__metric header strong{font-size:.95rem}
    .commercial-compass-015__metric header span{font-size:.8rem;font-weight:800;padding:4px 8px;border-radius:999px;background:var(--aura-info-soft);color:var(--aura-info)}
    .commercial-compass-015__metric header span[data-tone="ahead"],.commercial-compass-015__metric header span[data-tone="track"]{background:var(--aura-success-soft);color:var(--aura-success)}
    .commercial-compass-015__metric header span[data-tone="behind"]{background:var(--aura-warning-soft);color:var(--aura-warning)}
    .commercial-compass-015__numbers{display:flex;align-items:baseline;gap:7px;flex-wrap:wrap}
    .commercial-compass-015__numbers b{font-size:clamp(1.3rem,4vw,2.15rem);line-height:1}
    .commercial-compass-015__numbers span{color:var(--aura-text-muted)}
    .commercial-compass-015__bar{height:8px;border-radius:999px;background:var(--aura-border);overflow:hidden;margin-top:12px}
    .commercial-compass-015__bar i{display:block;height:100%;max-width:100%;border-radius:inherit;background:currentColor}
    .commercial-compass-015__opportunity{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;padding:14px;border:1px solid var(--aura-border);border-radius:18px}
    .commercial-compass-015__opportunity article{min-width:0;padding:8px}
    .commercial-compass-015__opportunity small{display:block;color:var(--aura-text-muted);margin-bottom:4px}
    .commercial-compass-015__opportunity strong{font-size:1.12rem;overflow-wrap:anywhere}
    .commercial-compass-015__scenario{margin:0;color:var(--aura-text-muted);font-size:.83rem}
    .commercial-compass-015__actions{display:flex;gap:10px;justify-content:space-between;align-items:center;flex-wrap:wrap}
    .commercial-compass-015__primary,.commercial-compass-015__secondary{min-height:44px;border-radius:13px;padding:10px 15px;font:inherit;font-weight:800;cursor:pointer}
    .commercial-compass-015__primary{border:0;background:var(--aura-brand);color:var(--aura-surface)}
    .commercial-compass-015__secondary{border:1px solid var(--aura-border);background:var(--aura-surface);color:var(--aura-text)}
    .commercial-compass-015__empty{display:grid;gap:12px;padding:8px 0 2px}
    .commercial-compass-015__empty p{margin:0;color:var(--aura-text-muted);max-width:62ch}
    .commercial-compass-015__partial{padding:10px 12px;border-radius:12px;background:var(--aura-warning-soft);color:var(--aura-warning);font-size:.88rem}
    .commercial-goal-layer-015{position:fixed;inset:0;z-index:10030;display:grid;place-items:center;padding:16px;background:rgba(20,27,42,.42)}
    .commercial-goal-layer-015__scrim{position:absolute;inset:0;border:0;background:transparent}
    .commercial-goal-dialog-015{position:relative;z-index:1;display:grid;grid-template-rows:auto minmax(0,1fr) auto;width:min(560px,100%);max-height:min(90dvh,760px);overflow:hidden;border-radius:24px;background:#fff;box-shadow:0 28px 70px rgba(16,24,40,.24)}
    .commercial-goal-dialog-015>header{display:flex;justify-content:space-between;gap:12px;padding:20px 20px 12px;border-bottom:1px solid #eceef2}
    .commercial-goal-dialog-015>header h2{margin:0;font-size:1.35rem}
    .commercial-goal-dialog-015__close{width:40px;height:40px;border:0;border-radius:12px;background:#f4f5f7;font-size:1.4rem;cursor:pointer}
    .commercial-goal-dialog-015__body{min-height:0;overflow-y:auto;padding:20px}
    .commercial-goal-dialog-015__step{display:grid;gap:14px}
    .commercial-goal-dialog-015__step p{margin:0;color:#626b7e}
    .commercial-goal-dialog-015 label{display:grid;gap:7px;font-weight:750;color:#313a4d}
    .commercial-goal-dialog-015 input{width:100%;min-height:48px;border:1px solid #cfd4de;border-radius:13px;padding:10px 12px;font:inherit;font-size:1rem}
    .commercial-goal-dialog-015__hint{font-size:.83rem;color:#70798c}
    .commercial-goal-dialog-015__review{display:grid;gap:8px;padding:13px;border-radius:14px;background:#f7f8fa}
    .commercial-goal-dialog-015__error{padding:10px 12px;border-radius:12px;background:#fff0ee;color:#8a2e24}
    .commercial-goal-dialog-015>footer{display:flex;justify-content:space-between;gap:9px;padding:12px 20px max(12px,env(safe-area-inset-bottom));border-top:1px solid #eceef2;background:#fff}
    .commercial-goal-dialog-015>footer>div{display:flex;gap:8px}
    .commercial-goal-dialog-015 button{font:inherit}
    @media(max-width:760px){
      .commercial-compass-015{border-radius:20px;padding:15px}
      .commercial-compass-015__head{display:grid}
      .commercial-compass-015__tabs{width:max-content}
      .commercial-compass-015__sequence{grid-template-columns:1fr 1fr}
      .commercial-compass-015__metric-grid{grid-template-columns:1fr}
      .commercial-compass-015__opportunity{grid-template-columns:1fr}
      .commercial-goal-layer-015{padding:0;place-items:end center}
      .commercial-goal-dialog-015{width:100%;max-height:94dvh;border-radius:24px 24px 0 0}
    }
    @media(max-width:420px){.commercial-compass-015__sequence{grid-template-columns:1fr}}
  `;
  doc.head.append(style);
}

function barWidth(progress) {
  const ratio = finite(progress?.ratio);
  return ratio === null ? 0 : Math.max(0, Math.min(100, Math.round(ratio * 100)));
}

function metricHtml({ title, progress, rhythm }) {
  const actual = progress?.actual;
  const target = progress?.target;
  return `<article class="commercial-compass-015__metric">
    <header><strong>${escapeHtml(title)}</strong><span data-tone="${rhythmTone(rhythm)}">${escapeHtml(rhythmLabel(rhythm))}</span></header>
    <div class="commercial-compass-015__numbers"><b>${escapeHtml(numberLabel(actual))}</b><span>/ ${escapeHtml(numberLabel(target))} · ${escapeHtml(percent(progress?.percent))}</span></div>
    <div class="commercial-compass-015__bar" aria-hidden="true"><i style="width:${barWidth(progress)}%"></i></div>
  </article>`;
}

function incomeMetricHtml({ title, progress, rhythm }) {
  return `<article class="commercial-compass-015__metric">
    <header><strong>${escapeHtml(title)}</strong><span data-tone="${rhythmTone(rhythm)}">${escapeHtml(rhythmLabel(rhythm))}</span></header>
    <div class="commercial-compass-015__numbers"><b>${escapeHtml(money(progress?.actual))}</b><span>/ ${escapeHtml(money(progress?.target))} · ${escapeHtml(percent(progress?.percent))}</span></div>
    <div class="commercial-compass-015__bar" aria-hidden="true"><i style="width:${barWidth(progress)}%"></i></div>
  </article>`;
}

function missingGoalsHtml() {
  return `<details class="commercial-compass-015" ${COMPASS_ATTR} data-compass-state="missing">
    <summary>Progreso y metas</summary>
    <div class="commercial-compass-015__detail">
    <div class="commercial-compass-015__empty">
      <p class="commercial-compass-015__eyebrow">TU NORTE COMERCIAL</p>
      <h2>Primero, dime a dónde quieres llegar.</h2>
      <p>Para poder decirte cómo vas, primero necesito saber qué quieres lograr.</p>
      <div><button type="button" class="commercial-compass-015__primary" data-commercial-goals-open>Definir mis metas</button></div>
    </div></div>
  </details>`;
}

function sequenceHtml(snapshot, mode) {
  const annual = mode === 'annual';
  const income = annual ? snapshot.current.annualIncome : snapshot.current.monthlyIncome;
  const policies = annual ? snapshot.current.annualPolicies : snapshot.current.monthlyPolicies;
  const incomeGap = finite(income?.gap);
  const policyGap = finite(policies?.gap);
  const pipeline = annual ? null : snapshot.opportunity;
  const opportunityText = annual
    ? (snapshot.current.annualIncome.actual === null ? 'Falta historial suficiente para estimar el ingreso anual.' : 'El avance anual usa sólo ingreso disponible hasta hoy.')
    : pipeline?.withPipelineIncomeMxn === null
      ? 'Todavía no hay un escenario económico disponible desde Pipeline.'
      : `${money(pipeline.withPipelineIncomeMxn)} si se materializa el escenario actual de Pipeline.`;
  const action = snapshot.action || {};
  return `<div class="commercial-compass-015__sequence" aria-label="Meta, brecha, oportunidad y acción">
    <article class="commercial-compass-015__step"><small>1 · META</small><strong>${money(income?.target)} · ${numberLabel(policies?.target)} pólizas</strong><p>${annual ? 'Objetivo anual' : 'Objetivo del mes'}.</p></article>
    <article class="commercial-compass-015__step"><small>2 · GAP</small><strong>${incomeGap === null ? 'Falta información' : money(incomeGap)} · ${policyGap === null ? '—' : `${numberLabel(policyGap)} pólizas`}</strong><p>Lo que falta contra la meta, sin convertir desconocidos en cero.</p></article>
    <article class="commercial-compass-015__step"><small>3 · OPORTUNIDAD</small><strong>${annual ? 'Avance del año' : 'Pipeline'}</strong><p>${escapeHtml(opportunityText)}</p></article>
    <article class="commercial-compass-015__step"><small>4 · ACCIÓN</small><strong>${escapeHtml(action.label || 'Revisar mi avance')}</strong><p>Forge sugiere el siguiente paso; tú decides.</p></article>
  </div>`;
}

function readyCompassHtml(snapshot, mode = 'monthly') {
  const annual = mode === 'annual';
  const current = snapshot.current || {};
  const rhythm = snapshot.rhythm || {};
  const goals = snapshot.goals || {};
  const incomeProgress = annual ? current.annualIncome : current.monthlyIncome;
  const policyProgress = annual ? current.annualPolicies : current.monthlyPolicies;
  const incomeRhythm = annual ? rhythm.annualIncome : rhythm.monthlyIncome;
  const policyRhythm = annual ? rhythm.annualPolicies : rhythm.monthlyPolicies;
  const pipeline = snapshot.opportunity || {};
  const partial = snapshot.goalState === 'PARTIAL'
    ? '<div class="commercial-compass-015__partial">Algunas metas todavía no están definidas. Puedes editarlas sin perder las anteriores.</div>'
    : '';
  const annualNote = annual && goals.annualPolicyCountDerived
    ? '<p class="commercial-compass-015__scenario">Meta anual de pólizas calculada desde tu meta mensual. Puedes editarla cuando quieras.</p>'
    : '';
  const annualHistory = annual && incomeProgress?.actual === null
    ? '<p class="commercial-compass-015__scenario">Todavía no hay suficiente historial confirmado para mostrar el ingreso anual. Forge no lo sustituirá con una proyección inventada.</p>'
    : '';
  const opportunity = annual
    ? ''
    : `<div class="commercial-compass-015__opportunity" aria-label="Ingreso actual, escenario con Pipeline y meta">
        <article><small>Ingreso estimado actual</small><strong>${money(incomeProgress?.actual)}</strong></article>
        <article><small>Escenario con Pipeline</small><strong>${money(pipeline.withPipelineIncomeMxn)}</strong></article>
        <article><small>Meta del mes</small><strong>${money(incomeProgress?.target)}</strong></article>
      </div>
      <p class="commercial-compass-015__scenario">Escenario, no ingreso confirmado. Pipeline se mantiene separado del ingreso estimado actual.</p>`;

  return `<details class="commercial-compass-015" ${COMPASS_ATTR} data-compass-state="${escapeHtml(snapshot.goalState || 'ready')}" data-compass-mode="${annual ? 'annual' : 'monthly'}">
    <summary>Progreso y metas</summary>
    <div class="commercial-compass-015__detail">
    <div class="commercial-compass-015__head">
      <div><p class="commercial-compass-015__eyebrow">TU NORTE COMERCIAL</p><h2>¿Cómo vas contra lo que quieres lograr?</h2><p class="commercial-compass-015__intro">Meta, brecha, oportunidad y siguiente acción en una sola lectura.</p></div>
      <div class="commercial-compass-015__tabs" role="group" aria-label="Periodo del avance"><button type="button" data-compass-mode="monthly" aria-pressed="${String(!annual)}">Mes</button><button type="button" data-compass-mode="annual" aria-pressed="${String(annual)}">Año</button></div>
    </div>
    ${partial}
    ${sequenceHtml(snapshot, annual ? 'annual' : 'monthly')}
    <div class="commercial-compass-015__metric-grid">
      ${incomeMetricHtml({ title: annual ? 'Ingreso estimado del año' : 'Ingreso estimado del mes', progress: incomeProgress, rhythm: incomeRhythm })}
      ${metricHtml({ title: annual ? 'Pólizas confirmadas del año' : 'Pólizas confirmadas del mes', progress: policyProgress, rhythm: policyRhythm })}
    </div>
    ${opportunity}
    ${annualHistory}
    ${annualNote}
    <div class="commercial-compass-015__actions">
      <button type="button" class="commercial-compass-015__secondary" data-commercial-goals-open>Editar metas</button>
      <button type="button" class="commercial-compass-015__primary" data-compass-action data-nav="${escapeHtml(snapshot.action?.nav || '')}">${escapeHtml(snapshot.action?.label || 'Revisar mi avance')}</button>
    </div></div>
  </details>`;
}

function currentHandoff() {
  const handoff = globalThis[HANDOFF];
  return handoff?.phase === PHASE ? handoff : null;
}

function createNode(doc, html) {
  const holder = doc.createElement('div');
  holder.innerHTML = html.trim();
  return holder.firstElementChild;
}

function defaultAnnualIncome(monthly) {
  const value = finite(monthly);
  return value && value > 0 ? Math.round(value * 12) : '';
}

function createGoalDialog(doc, snapshot, onSaved) {
  const existing = doc.querySelector('[data-commercial-goal-layer-015]');
  existing?.remove();
  const goals = snapshot?.goals || {};
  const monthlyIncome = goals.targetMonthlyIncomeMxn || '';
  const monthlyPolicies = goals.targetMonthlyPolicyCount || '';
  const annualIncome = goals.targetAnnualIncomeMxn || defaultAnnualIncome(monthlyIncome);
  const annualPolicies = goals.targetAnnualPolicyCount || (monthlyPolicies ? Number(monthlyPolicies) * 12 : '');
  const layer = doc.createElement('div');
  layer.className = 'commercial-goal-layer-015';
  layer.dataset.commercialGoalLayer015 = 'true';
  layer.innerHTML = `<button type="button" class="commercial-goal-layer-015__scrim" data-goal-close aria-label="Cerrar metas"></button>
    <section class="commercial-goal-dialog-015" role="dialog" aria-modal="true" aria-labelledby="commercial-goal-title-015">
      <header><div><p class="commercial-compass-015__eyebrow">DEFINIR MIS METAS</p><h2 id="commercial-goal-title-015">Tu norte comercial</h2></div><button type="button" class="commercial-goal-dialog-015__close" data-goal-close aria-label="Cerrar">×</button></header>
      <div class="commercial-goal-dialog-015__body">
        <form data-goal-form-015 novalidate>
          <div class="commercial-goal-dialog-015__step" data-goal-step="1">
            <p><strong>1 de 4 · Ingreso del mes</strong></p><p>¿Cuánto quieres generar este mes?</p>
            <label>Meta mensual de ingreso<input type="number" min="1" max="100000000" step="1" inputmode="decimal" name="targetMonthlyIncomeMxn" value="${escapeHtml(monthlyIncome)}" required></label>
          </div>
          <div class="commercial-goal-dialog-015__step" data-goal-step="2" hidden>
            <p><strong>2 de 4 · Pólizas del mes</strong></p><p>¿Cuántas pólizas confirmadas quieres lograr este mes?</p>
            <label>Meta mensual de pólizas<input type="number" min="1" max="1000" step="1" inputmode="numeric" name="targetMonthlyPolicyCount" value="${escapeHtml(monthlyPolicies)}" required></label>
          </div>
          <div class="commercial-goal-dialog-015__step" data-goal-step="3" hidden>
            <p><strong>3 de 4 · Ingreso del año</strong></p><p>¿Cuánto quieres generar en el año?</p>
            <label>Meta anual de ingreso<input type="number" min="1" max="1200000000" step="1" inputmode="decimal" name="targetAnnualIncomeMxn" value="${escapeHtml(annualIncome)}" required></label>
            <span class="commercial-goal-dialog-015__hint">Puedes usar 12 veces tu meta mensual como punto de partida y editarla.</span>
          </div>
          <div class="commercial-goal-dialog-015__step" data-goal-step="4" hidden>
            <p><strong>4 de 4 · Confirma tu plan</strong></p><p>La meta anual de pólizas parte de tu meta mensual × 12, pero puedes cambiarla.</p>
            <label>Meta anual de pólizas<input type="number" min="1" max="12000" step="1" inputmode="numeric" name="targetAnnualPolicyCount" value="${escapeHtml(annualPolicies)}" required></label>
            <span class="commercial-goal-dialog-015__hint" data-annual-policy-hint>Calculada desde tu meta mensual. Puedes editarla.</span>
            <div class="commercial-goal-dialog-015__review" data-goal-review></div>
          </div>
          <div class="commercial-goal-dialog-015__error" data-goal-error hidden></div>
        </form>
      </div>
      <footer><button type="button" class="commercial-compass-015__secondary" data-goal-skip>Omitir por ahora</button><div><button type="button" class="commercial-compass-015__secondary" data-goal-back hidden>Atrás</button><button type="button" class="commercial-compass-015__primary" data-goal-next>Siguiente</button><button type="button" class="commercial-compass-015__primary" data-goal-save hidden>Guardar metas</button></div></footer>
    </section>`;
  doc.body.append(layer);

  const form = layer.querySelector('[data-goal-form-015]');
  const next = layer.querySelector('[data-goal-next]');
  const back = layer.querySelector('[data-goal-back]');
  const save = layer.querySelector('[data-goal-save]');
  const errorNode = layer.querySelector('[data-goal-error]');
  const annualPolicyInput = form.elements.targetAnnualPolicyCount;
  let step = 1;
  let annualPoliciesDerived = goals.annualPolicyCountDerived !== false;

  function close() {
    layer.remove();
  }

  function value(name) {
    return Number(form.elements[name]?.value);
  }

  function validStep() {
    const fieldByStep = { 1: 'targetMonthlyIncomeMxn', 2: 'targetMonthlyPolicyCount', 3: 'targetAnnualIncomeMxn', 4: 'targetAnnualPolicyCount' };
    const input = form.elements[fieldByStep[step]];
    if (!input?.checkValidity()) {
      input?.reportValidity?.();
      input?.focus?.({ preventScroll: true });
      return false;
    }
    return true;
  }

  function review() {
    const node = layer.querySelector('[data-goal-review]');
    if (!node) return;
    node.innerHTML = `<strong>${escapeHtml(money(value('targetMonthlyIncomeMxn')))} al mes · ${escapeHtml(numberLabel(value('targetMonthlyPolicyCount')))} pólizas al mes</strong><span>${escapeHtml(money(value('targetAnnualIncomeMxn')))} al año · ${escapeHtml(numberLabel(value('targetAnnualPolicyCount')))} pólizas al año</span>`;
  }

  function renderStep() {
    layer.querySelectorAll('[data-goal-step]').forEach(node => { node.hidden = Number(node.dataset.goalStep) !== step; });
    back.hidden = step === 1;
    next.hidden = step === 4;
    save.hidden = step !== 4;
    errorNode.hidden = true;
    if (step === 2 && !form.elements.targetMonthlyPolicyCount.value) form.elements.targetMonthlyPolicyCount.value = '10';
    if (step === 3 && !form.elements.targetAnnualIncomeMxn.value) form.elements.targetAnnualIncomeMxn.value = String(defaultAnnualIncome(value('targetMonthlyIncomeMxn')) || '');
    if (step === 4 && annualPoliciesDerived) {
      const monthly = value('targetMonthlyPolicyCount');
      if (Number.isInteger(monthly) && monthly > 0) annualPolicyInput.value = String(monthly * 12);
    }
    if (step === 4) review();
    layer.querySelector(`[data-goal-step="${step}"] input`)?.focus?.({ preventScroll: true });
  }

  next.addEventListener('click', () => {
    if (!validStep()) return;
    step = Math.min(4, step + 1);
    renderStep();
  });
  back.addEventListener('click', () => {
    step = Math.max(1, step - 1);
    renderStep();
  });
  annualPolicyInput.addEventListener('input', () => {
    if (step === 4) {
      annualPoliciesDerived = false;
      layer.querySelector('[data-annual-policy-hint]').textContent = 'Meta anual personalizada.';
      review();
    }
  });
  form.addEventListener('input', () => { if (step === 4) review(); });
  layer.querySelectorAll('[data-goal-close],[data-goal-skip]').forEach(button => button.addEventListener('click', close));
  save.addEventListener('click', async () => {
    if (!validStep()) return;
    const handoff = currentHandoff();
    if (typeof handoff?.saveGoals !== 'function') {
      errorNode.textContent = 'No pudimos conectar el guardado de metas. Vuelve a intentarlo.';
      errorNode.hidden = false;
      return;
    }
    save.disabled = true;
    save.textContent = 'Guardando…';
    try {
      await handoff.saveGoals({
        targetMonthlyIncomeMxn: value('targetMonthlyIncomeMxn'),
        targetMonthlyPolicyCount: value('targetMonthlyPolicyCount'),
        targetAnnualIncomeMxn: value('targetAnnualIncomeMxn'),
        targetAnnualPolicyCount: value('targetAnnualPolicyCount'),
        annualPolicyCountDerived: annualPoliciesDerived,
      });
      close();
      await onSaved?.();
    } catch (error) {
      errorNode.textContent = text(error?.message) || 'No pudimos guardar las metas. Las anteriores permanecen intactas.';
      errorNode.hidden = false;
      save.disabled = false;
      save.textContent = 'Guardar metas';
    }
  });

  renderStep();
  return { close };
}

export function createHomeModule(options = {}) {
  const { root, onNavigate } = options;
  if (!root) throw new Error('AURA_HOME_ROOT_REQUIRED');
  const doc = root.ownerDocument;
  const windowRef = doc.defaultView || window;
  installStyles(doc);
  const base = createBaseHomeModule(options);
  const events = new AbortController();
  const timers = new Set();
  let mode = 'monthly';
  let destroyed = false;

  function insertionPoint() {
    return root.querySelector('[data-home-attention-contract]') || root.firstElementChild || null;
  }

  function renderCompass(reason = 'direct') {
    if (destroyed || !root.isConnected) return;
    const handoff = currentHandoff();
    const snapshot = handoff?.snapshot;
    const existing = root.querySelector(`[${COMPASS_ATTR}]`);
    const html = !snapshot || snapshot.goalState === 'MISSING'
      ? missingGoalsHtml()
      : readyCompassHtml(snapshot, mode);
    const node = createNode(doc, html);
    if (existing) existing.replaceWith(node);
    else {
      const point = insertionPoint();
      if (point) point.insertAdjacentElement('afterend', node);
      else root.prepend(node);
    }
    root.dataset.commercialCompass015 = PHASE;
    root.dataset.commercialCompass015Reason = reason;
    windowRef.dispatchEvent(new CustomEvent('forge:commercial-compass-rendered', { detail: { phase: PHASE, reason, mode } }));
  }

  function scheduleBurst(reason = 'interaction') {
    for (const timer of timers) windowRef.clearTimeout(timer);
    timers.clear();
    for (const delay of RECONCILE_DELAYS) {
      const timer = windowRef.setTimeout(() => {
        timers.delete(timer);
        renderCompass(`${reason}:${delay}`);
      }, delay);
      timers.add(timer);
    }
  }

  async function reloadAndRender() {
    await base.reload?.();
    renderCompass('goal-save');
    scheduleBurst('goal-save');
  }

  root.addEventListener('click', event => {
    const goals = event.target?.closest?.('[data-commercial-goals-open]');
    if (goals) {
      event.preventDefault();
      createGoalDialog(doc, currentHandoff()?.snapshot, reloadAndRender);
      return;
    }
    const modeButton = event.target?.closest?.('[data-compass-mode]');
    if (modeButton && modeButton.closest(`[${COMPASS_ATTR}]`)) {
      event.preventDefault();
      mode = modeButton.dataset.compassMode === 'annual' ? 'annual' : 'monthly';
      renderCompass('mode-change');
      return;
    }
    const action = event.target?.closest?.('[data-compass-action]');
    if (action && action.closest(`[${COMPASS_ATTR}]`)) {
      event.preventDefault();
      const nav = text(action.dataset.nav);
      if (nav) onNavigate?.(nav, { source: PHASE, action: currentHandoff()?.snapshot?.action?.kind || null });
      else createGoalDialog(doc, currentHandoff()?.snapshot, reloadAndRender);
      return;
    }
    scheduleBurst('home-click');
  }, { capture: true, signal: events.signal });

  function stop() {
    for (const timer of timers) windowRef.clearTimeout(timer);
    timers.clear();
    doc.querySelector('[data-commercial-goal-layer-015]')?.remove();
  }

  return Object.freeze({
    async mount() {
      destroyed = false;
      await base.mount?.();
      renderCompass('mount');
      scheduleBurst('mount');
    },
    async reload() {
      const result = await base.reload?.();
      renderCompass('reload');
      scheduleBurst('reload');
      return result;
    },
    async scrub(reason = 'session-scrub') {
      stop();
      return base.scrub?.(reason);
    },
    async unmount() {
      stop();
      return base.unmount?.();
    },
    async destroy() {
      destroyed = true;
      stop();
      events.abort();
      return base.destroy?.();
    },
    diagnostics() {
      return Object.freeze({
        phase: PHASE,
        visibleCompass: Boolean(root.querySelector(`[${COMPASS_ATTR}]`)),
        mode,
        newMutationObservers: 0,
        hierarchy: 'META_GAP_OPORTUNIDAD_ACCION',
        base: base.diagnostics?.() || null,
      });
    },
  });
}

export { HANDOFF, PHASE };
