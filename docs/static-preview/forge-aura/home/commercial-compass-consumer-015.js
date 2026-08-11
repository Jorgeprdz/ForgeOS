const PHASE = 'FORGE_COMMERCIAL_COMPASS_015';
const HANDOFF = Symbol.for('forge.aura.commercial-compass.015');
const STYLE_ID = 'forge-commercial-compass-consumer-015-style';
const DELAYS = Object.freeze([0, 80, 260, 700, 1600, 3200]);
const timers = new Set();

function text(value) {
  return String(value ?? '').trim();
}

function normalize(value) {
  return text(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es-MX')
    .replace(/[^a-z0-9$%]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function finite(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function money(value) {
  const number = finite(value);
  return number === null
    ? 'información no disponible'
    : new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(number);
}

function count(value) {
  const number = finite(value);
  return number === null ? 'información no disponible' : new Intl.NumberFormat('es-MX', { maximumFractionDigits: 0 }).format(number);
}

function rhythmLabel(value) {
  return ({ AHEAD: 'adelantado', ON_TRACK: 'en ritmo', BEHIND: 'por debajo del ritmo' })[value] || 'ritmo no disponible';
}

function installStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .commercial-compass-015__activity{display:grid;gap:10px;padding:14px 16px;border:1px solid #e1e4ea;border-radius:18px;background:#fbfcfe}
    .commercial-compass-015__activity header{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
    .commercial-compass-015__activity h3{margin:0;font-size:1rem;color:#20283b}
    .commercial-compass-015__activity p{margin:0;color:#5d6678;line-height:1.45}
    .commercial-compass-015__activity-list{display:flex;flex-wrap:wrap;gap:8px;margin:0;padding:0;list-style:none}
    .commercial-compass-015__activity-list li{padding:7px 10px;border-radius:999px;background:#f0f2f6;color:#2f384a;font-weight:750;font-size:.86rem}
    .commercial-compass-015__activity small{color:#737b8d}
  `;
  document.head.append(style);
}

function compassHandoff() {
  return globalThis[HANDOFF] || null;
}

function forecastReadModel() {
  try {
    return globalThis.ForgeAdvisorForecastRuntimeAcceptance?.getReadModel?.() || null;
  } catch {
    return null;
  }
}

function activityGuidance(snapshot) {
  const monthlyIncomeGap = finite(snapshot?.current?.monthlyIncome?.gap);
  const monthlyPolicyGap = finite(snapshot?.current?.monthlyPolicies?.gap);
  const noKnownGap = monthlyIncomeGap === 0 && monthlyPolicyGap === 0;
  if (noKnownGap) {
    return Object.freeze({
      state: 'NO_GAP',
      message: 'Con la información disponible, no aparece una brecha mensual pendiente. Mantén el ritmo y revisa cambios en Pipeline.',
      actions: Object.freeze([]),
      authority: 'COMMERCIAL_COMPASS_PRESENTATION',
    });
  }

  const readModel = forecastReadModel();
  const requirement = readModel?.activityRequirement || null;
  if (requirement?.status === 'READY' && Array.isArray(requirement.recommendedActions) && requirement.recommendedActions.length) {
    return Object.freeze({
      state: 'READY',
      message: 'Advisor Forecast convirtió la brecha residual en mínimos sugeridos usando tasas respaldadas por evidencia.',
      actions: Object.freeze(requirement.recommendedActions.map(action => Object.freeze({
        actionType: action.actionType,
        requiredCount: finite(action.requiredCount),
      })).filter(action => action.requiredCount !== null)),
      authority: 'ADVISOR_FORECAST_ACTIVITY_REQUIREMENT',
    });
  }

  return Object.freeze({
    state: 'INSUFFICIENT_DATA',
    message: 'Necesito más historial para estimar cuánta actividad necesitas.',
    actions: Object.freeze([]),
    authority: 'ADVISOR_FORECAST_ACTIVITY_REQUIREMENT',
  });
}

function actionLabel(type) {
  return ({
    PROSPECTING_CONTACTS: 'Contactos',
    APPOINTMENTS: 'Citas',
    PRESENTATIONS: 'Presentaciones',
    APPLICATIONS: 'Solicitudes',
    POLICIES: 'Pólizas',
  })[String(type || '').toUpperCase()] || 'Actividad';
}

function renderActivityGuidance() {
  const handoff = compassHandoff();
  const snapshot = handoff?.snapshot;
  const compass = document.querySelector('[data-commercial-compass-015]');
  if (!snapshot || !compass) return false;
  installStyles();

  const guidance = activityGuidance(snapshot);
  let section = compass.querySelector('[data-commercial-activity-guidance-015]');
  if (!section) {
    section = document.createElement('section');
    section.className = 'commercial-compass-015__activity';
    section.dataset.commercialActivityGuidance015 = 'true';
    const actions = compass.querySelector('.commercial-compass-015__actions');
    if (actions) actions.before(section);
    else compass.append(section);
  }

  section.dataset.activityState = guidance.state;
  const chips = guidance.actions.length
    ? `<ul class="commercial-compass-015__activity-list">${guidance.actions.map(action => `<li>${actionLabel(action.actionType)}: ${count(action.requiredCount)}</li>`).join('')}</ul>`
    : '';
  section.innerHTML = `<header><div><p class="commercial-compass-015__eyebrow">ACTIVIDAD</p><h3>¿Qué necesito hacer?</h3></div></header><p>${guidance.message}</p>${chips}<small>Fuente: ${guidance.authority}. Sugerencia de planeación; no crea tareas ni acciones automáticamente.</small>`;
  return true;
}

function commercialQuestion(raw) {
  const value = normalize(raw);
  if (!value) return null;
  if (/\b(cuantas|cuantos)\s+polizas\b/.test(value) || /\bpolizas\s+llevo\b/.test(value)) return 'POLICIES';
  const pipelineEconomic = /\bpipeline\b/.test(value) && /\b(ingreso|ingresar|ingresaria|ganar|ganaria|ganancia|economico|economica|escenario)\b/.test(value);
  if (pipelineEconomic) return 'PIPELINE';
  if (/\b(que debo hacer hoy|que hago hoy|actividad necesito|cuanta actividad|necesito hacer)\b/.test(value)) return 'ACTIVITY';
  if (/\b(ritmo|voy en ritmo|adelantado|atrasado)\b/.test(value)) return 'RHYTHM';
  if (/\b(que me falta|cuanto me falta|brecha|gap)\b/.test(value)) return 'GAP';
  if (/\b(como voy|como estoy|mi avance|avance comercial)\b/.test(value)) return 'STATUS';
  return null;
}

function periodMode(raw) {
  const value = normalize(raw);
  return /\b(anual|ano|year)\b/.test(value) ? 'annual' : 'monthly';
}

function answerCommercialQuestion(kind, raw, snapshot) {
  if (!snapshot || snapshot.goalState === 'MISSING') {
    return Object.freeze({ title: 'Primero define tus metas', answer: 'Todavía no tengo una meta confirmada contra la cual medir tu avance. Define tus metas en Inicio y después podré decirte cómo vas.' });
  }
  const annual = periodMode(raw) === 'annual';
  const policies = annual ? snapshot.current?.annualPolicies : snapshot.current?.monthlyPolicies;
  const income = annual ? snapshot.current?.annualIncome : snapshot.current?.monthlyIncome;
  const rhythm = annual ? snapshot.rhythm?.annualPolicies : snapshot.rhythm?.monthlyPolicies;
  const period = annual ? 'año' : 'mes';

  if (kind === 'POLICIES') {
    return Object.freeze({ title: `Pólizas del ${period}`, answer: `Llevas ${count(policies?.actual)} pólizas confirmadas de una meta de ${count(policies?.target)}. Te faltan ${count(policies?.gap)} para la meta del ${period}. Sólo cuento pólizas vendidas confirmadas.` });
  }
  if (kind === 'PIPELINE') {
    const scenario = snapshot.opportunity || {};
    return Object.freeze({ title: 'Escenario con Pipeline', answer: scenario.withPipelineIncomeMxn === null || scenario.withPipelineIncomeMxn === undefined
      ? 'No hay un escenario económico suficiente desde Pipeline. No voy a inventar un importe.'
      : `El ingreso generado disponible es ${money(snapshot.current?.monthlyIncome?.actual)}. Si se materializa el escenario actual de Pipeline, el escenario combinado sería ${money(scenario.withPipelineIncomeMxn)}. Es potencial, no ingreso confirmado ni garantizado.` });
  }
  if (kind === 'ACTIVITY') {
    const guidance = activityGuidance(snapshot);
    const details = guidance.actions.length ? ` ${guidance.actions.map(action => `${actionLabel(action.actionType)} ${count(action.requiredCount)}`).join(', ')}.` : '';
    return Object.freeze({ title: 'Actividad sugerida', answer: `${guidance.message}${details} No se crea ninguna tarea sin tu confirmación.` });
  }
  if (kind === 'RHYTHM') {
    return Object.freeze({ title: `Ritmo del ${period}`, answer: `Vas ${rhythmLabel(rhythm)} en pólizas. Llevas ${count(policies?.actual)} de ${count(policies?.target)}. El ritmo compara avance real contra el tiempo transcurrido; no convierte Pipeline en resultado.` });
  }
  if (kind === 'GAP') {
    return Object.freeze({ title: `Brecha del ${period}`, answer: `Te faltan ${count(policies?.gap)} pólizas y ${money(income?.gap)} de ingreso contra tus metas del ${period}. Los faltantes se calculan contra resultados disponibles, no contra cotizaciones ni solicitudes.` });
  }
  return Object.freeze({ title: `Cómo vas este ${period}`, answer: `Llevas ${count(policies?.actual)} de ${count(policies?.target)} pólizas y ${money(income?.actual)} de ${money(income?.target)} de ingreso. Te faltan ${count(policies?.gap)} pólizas y ${money(income?.gap)}. En pólizas vas ${rhythmLabel(rhythm)}.` });
}

function renderAlfredAnswer(payload) {
  const sheet = document.querySelector('[data-forge-alfred-sheet]');
  const inputLabel = sheet?.querySelector('.alfred-input');
  if (!sheet || !inputLabel) return false;
  let response = sheet.querySelector('[data-alfred-command-response]');
  if (!response) {
    response = document.createElement('section');
    response.className = 'alfred-command-response';
    response.dataset.alfredCommandResponse = 'true';
    response.setAttribute('aria-live', 'polite');
    sheet.querySelector('.sheet-panel')?.insertBefore(response, inputLabel);
  }
  response.hidden = false;
  response.dataset.state = 'commercial-compass';
  response.replaceChildren();
  const meta = document.createElement('p');
  meta.className = 'alfred-command-response__meta';
  meta.textContent = 'ALFRED · COMMERCIAL COMPASS';
  const title = document.createElement('h3');
  title.className = 'alfred-command-response__title';
  title.textContent = payload.title;
  const answer = document.createElement('p');
  answer.className = 'alfred-command-response__answer';
  answer.textContent = payload.answer;
  const boundary = document.createElement('p');
  boundary.className = 'alfred-command-response__boundary';
  boundary.textContent = 'Lectura desde metas, producción confirmada, Compensation Intelligence y Advisor Forecast. Sin escritura ni ejecución automática.';
  response.append(meta, title, answer, boundary);
  document.documentElement.dataset.alfredExecutionPath = 'COMMERCIAL_COMPASS_015_READ_ONLY';
  sheet.dataset.alfredExecutionPath = 'COMMERCIAL_COMPASS_015_READ_ONLY';
  window.dispatchEvent(new CustomEvent('forge:alfred-commercial-compass-answer', { detail: { phase: PHASE, title: payload.title } }));
  return true;
}

function interceptAlfred(event, input) {
  const kind = commercialQuestion(input?.value);
  if (!kind) return false;
  const snapshot = compassHandoff()?.snapshot;
  if (!snapshot) return false;
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  const payload = answerCommercialQuestion(kind, input.value, snapshot);
  renderAlfredAnswer(payload);
  return true;
}

document.addEventListener('click', event => {
  const button = event.target?.closest?.('[data-forge-alfred-sheet] .alfred-input button');
  const input = button?.closest('.alfred-input')?.querySelector('input');
  if (button && input && interceptAlfred(event, input)) return;
  schedule('click');
}, true);

document.addEventListener('keydown', event => {
  if (event.key !== 'Enter' || event.shiftKey || event.isComposing) return;
  const input = event.target?.closest?.('[data-forge-alfred-sheet] .alfred-input input');
  if (input) interceptAlfred(event, input);
}, true);

function schedule(reason = 'runtime') {
  for (const timer of timers) clearTimeout(timer);
  timers.clear();
  for (const delay of DELAYS) {
    const timer = setTimeout(() => {
      timers.delete(timer);
      if (renderActivityGuidance()) document.documentElement.dataset.commercialCompassConsumer015 = `${reason}:${delay}`;
    }, delay);
    timers.add(timer);
  }
}

window.addEventListener('forge:advisor-forecast-read-model-ready', () => schedule('forecast-ready'));
window.addEventListener('pageshow', () => schedule('pageshow'));
window.addEventListener('popstate', () => schedule('popstate'));
window.addEventListener('forge:alfred-navigation', () => schedule('alfred-navigation'));
queueMicrotask(() => schedule('boot'));

globalThis.ForgeCommercialCompassConsumer015 = Object.freeze({
  phase: PHASE,
  reconcile: renderActivityGuidance,
  classifyAlfredQuestion: commercialQuestion,
  answerAlfredQuestion(raw) {
    const kind = commercialQuestion(raw);
    const snapshot = compassHandoff()?.snapshot;
    return kind && snapshot ? answerCommercialQuestion(kind, raw, snapshot) : null;
  },
  diagnostics() {
    return Object.freeze({
      phase: PHASE,
      mutationObservers: 0,
      forecastAuthority: 'ADVISOR_FORECAST_ACTIVITY_REQUIREMENT',
      alfredMode: 'DETERMINISTIC_READ_ONLY',
      automaticExecutionAllowed: false,
    });
  },
});