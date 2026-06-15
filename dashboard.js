// dashboard.js
// Dashboard Ejecutivo — Enterprise Architecture
// ─────────────────────────────────────────────────────────────────────────────
// ARQUITECTURA:
//   UI Template (renderDashboard)
//     → Controller (DashboardController.init)
//       → DB Layer (DB.obtenerTodos)
//         → State (AppState.get / AppState.set)
//           → EventBus (EventBus.emit)
//             → RenderEngine (RenderEngine.schedule)
//
// GARANTÍAS:
//   - Sin dependencia circular (NO importa de app.js)
//   - Usuario leído de AppState (puesto por AuthService antes del navigate)
//   - AbortController: cancela async si el módulo se destruye antes de resolver
//   - Cleanup registrado en Memory: el router destruye limpiamente
//   - Sanitización de todos los datos externos antes de inyectar al DOM
//   - Logger en lugar de console.* directo
//   - EventBus para comunicación desacoplada con otros módulos
//   - RenderEngine.schedule() para todas las mutaciones DOM
// ─────────────────────────────────────────────────────────────────────────────

import { DB }           from './db.js';
import { AppState }     from './state-manager.js';
import { EventBus }     from './event-system.js';
import { Logger }       from './logger.js';
import { Memory }       from './memory-manager.js';
import { RenderEngine } from './ui-render-engine.js';
import { Navigation }   from './platform/navigation-runtime.js';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES DE NEGOCIO
// ─────────────────────────────────────────────────────────────────────────────

const DASHBOARD_CONFIG = Object.freeze({
    META_SEMANAL:        125,
    VENTANA_FIDELIZACION: 30,    // días
    MS_POR_DIA:          86_400_000,

    PUNTOS: Object.freeze({
        referidos:        1,
        llamadas:         0.5,
        citas_agendadas:  2,
        citas_conectadas: 5,
        citas_cierre:     5,
        solicitudes:      10,
        pagadas:          15,
    }),
});

// ─────────────────────────────────────────────────────────────────────────────
// SANITIZADOR — Prevención XSS
// Todos los datos externos (DB, user_metadata) pasan por aquí antes del DOM
// ─────────────────────────────────────────────────────────────────────────────

const Sanitizer = {
    /**
     * Escapa caracteres HTML peligrosos en un string.
     * Nunca usar .innerHTML con datos sin pasar por aquí primero.
     * @param {unknown} value
     * @returns {string}
     */
    escape(value) {
        if (value === null || value === undefined) return '';
        return String(value)
            .replace(/&/g,  '&amp;')
            .replace(/</g,  '&lt;')
            .replace(/>/g,  '&gt;')
            .replace(/"/g,  '&quot;')
            .replace(/'/g,  '&#x27;');
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// CALCULADORAS DE NEGOCIO — Pure functions, sin efectos secundarios
// ─────────────────────────────────────────────────────────────────────────────

const DashboardCalculator = {

    /**
     * Calcula puntos acumulados en la semana actual (lunes–viernes).
     * @param {Array} historial — registros de actividad_diaria
     * @returns {{ puntos: number, meta: number, faltantes: number, badge: string }}
     */
    productividad(historial) {

        const hoy   = new Date();
        hoy.setHours(0, 0, 0, 0);

        const diaSemana = hoy.getDay(); // 0=Dom … 6=Sab
        const diasDesLunes = diaSemana === 0 ? 6 : diaSemana - 1;

        const lunes = new Date(hoy);
        lunes.setDate(hoy.getDate() - diasDesLunes);

        const viernes = new Date(lunes);
        viernes.setDate(lunes.getDate() + 4);
        viernes.setHours(23, 59, 59, 999);

        let puntos = 0;

        if (Array.isArray(historial)) {
            historial.forEach(reg => {
                // reg.id se usa como fecha YYYY-MM-DD
                const fechaReg = new Date(reg.id + 'T12:00:00');
                if (fechaReg >= lunes && fechaReg <= viernes) {
                    const p = DASHBOARD_CONFIG.PUNTOS;
                    puntos +=
                        ((reg.referidos          || 0) * p.referidos)        +
                        ((reg.llamadas            || 0) * p.llamadas)         +
                        ((reg.citas_agendadas     || 0) * p.citas_agendadas)  +
                        ((reg.citas_conectadas    || 0) * p.citas_conectadas) +
                        ((reg.citas_cierre        || 0) * p.citas_cierre)     +
                        ((reg.solicitudes         || 0) * p.solicitudes)      +
                        ((reg.pagadas             || 0) * p.pagadas);
                }
            });
        }

        const meta       = DASHBOARD_CONFIG.META_SEMANAL;
        const faltantes  = Math.max(0, meta - puntos);
        const numDia     = hoy.getDay();
        const diasRest   = (numDia >= 1 && numDia <= 5) ? (6 - numDia) : 0;

        let badge = '';
        if (faltantes <= 0) {
            badge = `<span class="badge badge-green">🎉 Meta cumplida</span>`;
        } else if (diasRest > 0) {
            const ptsDia = Math.ceil(faltantes / diasRest);
            badge = `<span class="badge badge-red">~${ptsDia} pts/día</span>`;
        } else {
            badge = `<span class="badge badge-orange">Sem. terminada</span>`;
        }

        return { puntos, meta, faltantes, badge };
    },

    /**
     * Calcula alertas de fidelización (cumpleaños, edad actuarial, aniversario póliza)
     * en los próximos N días.
     * @param {Array} cartera
     * @returns {string[]} — array de strings HTML ya sanitizados
     */
    fidelizacion(cartera) {

        const hoy    = new Date();
        const alertas = [];
        const ventana = DASHBOARD_CONFIG.VENTANA_FIDELIZACION;
        const msDay   = DASHBOARD_CONFIG.MS_POR_DIA;

        if (!Array.isArray(cartera)) return alertas;

        cartera.forEach(p => {
            const cliente = Sanitizer.escape(p.cliente);
            const poliza  = Sanitizer.escape(p.poliza);

            // — Cumpleaños
            if (p.nacimiento) {
                const fNac = new Date(p.nacimiento + 'T12:00:00');
                let proxCumple = new Date(
                    hoy.getFullYear(),
                    fNac.getMonth(),
                    fNac.getDate()
                );
                if (proxCumple < hoy) proxCumple.setFullYear(hoy.getFullYear() + 1);
                const diasCumple = Math.ceil((proxCumple - hoy) / msDay);

                if (diasCumple <= ventana) {
                    alertas.push(
                        `<div class="fidelization-row">` +
                            `<span>🎂 <strong>${cliente}</strong></span>` +
                            `<span class="badge badge-blue">en ${diasCumple}d</span>` +
                        `</div>`
                    );
                }

                // — Edad actuarial (6 meses antes del cumpleaños)
                let proxAct = new Date(proxCumple);
                proxAct.setMonth(proxAct.getMonth() - 6);
                if (proxAct < hoy) proxAct.setFullYear(proxAct.getFullYear() + 1);
                const diasAct = Math.ceil((proxAct - hoy) / msDay);

                if (diasAct <= ventana) {
                    alertas.push(
                        `<div class="fidelization-row">` +
                            `<span>📈 <strong>${cliente}</strong> ` +
                            `<span style="color:var(--text-tertiary);">edad actuarial</span></span>` +
                            `<span class="badge badge-orange">en ${diasAct}d</span>` +
                        `</div>`
                    );
                }
            }

            // — Aniversario de póliza
            if (p.emision) {
                const fEmi = new Date(p.emision + 'T12:00:00');
                let proxAniv = new Date(
                    hoy.getFullYear(),
                    fEmi.getMonth(),
                    fEmi.getDate()
                );
                if (proxAniv < hoy) proxAniv.setFullYear(hoy.getFullYear() + 1);
                const diasAniv = Math.ceil((proxAniv - hoy) / msDay);

                if (diasAniv <= ventana) {
                    alertas.push(
                        `<div class="fidelization-row">` +
                            `<span>🛡️ <strong>${poliza}</strong> ` +
                            `<span style="color:var(--text-tertiary);">aniversario</span></span>` +
                            `<span class="badge badge-purple">en ${diasAniv}d</span>` +
                        `</div>`
                    );
                }
            }
        });

        return alertas;
    },

    /**
     * Calcula pólizas con cobro pendiente en el mes actual.
     * @param {Array} cartera
     * @returns {string} — HTML ya sanitizado
     */
    cobranza(cartera) {

        const hoy = new Date();

        if (!Array.isArray(cartera)) {
            return `<p style="color:var(--color-success);font-size:14px;font-weight:600;">✅ Sin pólizas pendientes este mes.</p>`;
        }

        const pendientes = cartera.filter(p => {
            if (!p.fechaPago) return false;
            const f = new Date(p.fechaPago + 'T12:00:00');
            return (
                f.getMonth()    === hoy.getMonth() &&
                f.getFullYear() === hoy.getFullYear()
            );
        });

        if (pendientes.length === 0) {
            return `<p style="color:var(--color-success);font-size:14px;font-weight:600;">✅ Sin pólizas pendientes este mes.</p>`;
        }

        const nombres = pendientes
            .map(p => `<strong>${Sanitizer.escape(p.cliente)}</strong>`)
            .join(', ');

        return `<p style="color:var(--color-danger);font-size:14px;">⚠️ Pólizas de ${nombres} pendientes de cobro.</p>`;
    },

    /**
     * Produce las tres decisiones del Decision Cockpit v0.
     * @param {{ historial:Array, referidos:Array, cartera:Array }} data
     * @returns {Array}
     */
    decisionCockpit({ historial, referidos, cartera } = {}) {
        return [
            this._buildActivityGapDecision(historial),
            this._buildReferralDecision(referidos),
            this._buildCarteraUrgencyDecision(cartera),
        ];
    },

    /**
     * @param {Array} historial
     * @returns {Object}
     */
    _buildActivityGapDecision(historial) {
        const kpi = this.productividad(historial);
        const action = this._selectHighestLeverageActivity(kpi);
        const paceText = kpi.faltantes > 0
            ? `Faltan ${kpi.faltantes} puntos para llegar a ${kpi.meta}.`
            : `La meta semanal de ${kpi.meta} puntos ya está cubierta.`;

        return {
            decisionType: 'activity_gap',
            title: 'Repair today\'s activity gap',
            status: kpi.faltantes > 0 ? 'Acción requerida' : 'En ritmo',
            why: kpi.faltantes > 0
                ? 'Forge detectó que la productividad semanal todavía está por debajo de la meta.'
                : 'Forge detectó que la meta semanal ya está cubierta; conserva el ritmo.',
            evidence: [
                `${kpi.puntos} de ${kpi.meta} puntos esta semana.`,
                paceText,
            ],
            action,
            ctaLabel: 'Open Activity',
            ctaRoute: 'actividad',
            owner: 'Asesor',
            successMetric: 'La productividad semanal avanza hacia la meta de 125 puntos.',
        };
    },

    /**
     * @param {Array} referidos
     * @returns {Object}
     */
    _buildReferralDecision(referidos) {
        const candidates = Array.isArray(referidos)
            ? referidos.filter(ref => ['Nuevo', 'Seguimiento'].includes(ref?.estado))
            : [];

        const score = ref => {
            const phoneScore = ref?.telefono ? 100 : 0;
            const sourceScore = ref?.origen ? 50 : 0;
            const idTime = Number(String(ref?.id || '').match(/\d{10,}/)?.[0] || 0);
            return phoneScore + sourceScore + Math.min(idTime / 1_000_000_000_000, 10);
        };

        const selected = [...candidates].sort((a, b) => score(b) - score(a))[0];

        if (!selected) {
            return {
                decisionType: 'referral_activation',
                title: 'Turn one referred person into an active prospect',
                status: 'Sin referido listo',
                why: 'Forge no encontró referidos nuevos o en seguimiento con evidencia suficiente para activar hoy.',
                evidence: [
                    `${Array.isArray(referidos) ? referidos.length : 0} referidos registrados.`,
                    'No hay candidato con estado Nuevo o Seguimiento.',
                ],
                action: 'Registra un referido nuevo o actualiza un referido en seguimiento con teléfono y contexto.',
                ctaLabel: 'Open Referrals',
                ctaRoute: 'referidos',
                owner: 'Asesor',
                successMetric: 'Un referido queda listo para contacto o pasa al flujo de prospección.',
            };
        }

        const name = selected.nombre || 'un referido';
        const source = selected.origen || 'sin COI registrado';
        const phone = selected.telefono ? 'con teléfono' : 'sin teléfono';

        return {
            decisionType: 'referral_activation',
            title: 'Turn one referred person into an active prospect',
            status: selected.estado || 'Nuevo',
            why: 'Forge encontró un referido accionable que puede convertirse en prospecto hoy.',
            evidence: [
                `${name} está en estado ${selected.estado || 'Nuevo'}.`,
                `COI / fuente: ${source}.`,
                `Disponibilidad de contacto: ${phone}.`,
            ],
            action: `Contacta a ${name} por WhatsApp y muévelo al flujo de prospección.`,
            ctaLabel: 'Open Referrals',
            ctaRoute: 'referidos',
            owner: 'Asesor',
            successMetric: 'El referido avanza de Nuevo o Seguimiento a Contactado, Cita o prospecto activo.',
        };
    },

    /**
     * @param {Array} cartera
     * @returns {Object}
     */
    _buildCarteraUrgencyDecision(cartera) {
        const scored = Array.isArray(cartera)
            ? cartera
                .map(policy => ({
                    policy,
                    urgency: this._scoreCarteraUrgency(policy),
                }))
                .filter(item => item.urgency.score > 0)
                .sort((a, b) => b.urgency.score - a.urgency.score)
            : [];

        const selected = scored[0];

        if (!selected) {
            return {
                decisionType: 'cartera_urgency',
                title: 'Contact the highest-urgency client in cartera',
                status: 'Sin alerta urgente',
                why: 'Forge no encontró pagos, aniversarios, cumpleaños o hitos de edad actuarial próximos.',
                evidence: [
                    `${Array.isArray(cartera) ? cartera.length : 0} pólizas revisadas.`,
                    'No hay señal de urgencia dentro de las ventanas actuales.',
                ],
                action: 'Mantén cartera actualizada para que Forge detecte el próximo evento accionable.',
                ctaLabel: 'Open Cartera',
                ctaRoute: 'cartera',
                owner: 'Asesor',
                successMetric: 'La siguiente alerta de cartera queda lista para contacto.',
            };
        }

        const client = selected.policy?.cliente || 'este cliente';
        const policy = selected.policy?.poliza || selected.policy?.plan || 'póliza sin folio';

        return {
            decisionType: 'cartera_urgency',
            title: 'Contact the highest-urgency client in cartera',
            status: selected.urgency.label,
            why: 'Forge detectó una señal de cartera que pierde valor si se atiende tarde.',
            evidence: [
                `Cliente: ${client}.`,
                `Póliza: ${policy}.`,
                selected.urgency.reason,
            ],
            action: `Contacta hoy a ${client} para atender: ${selected.urgency.actionReason}.`,
            ctaLabel: 'Open Cartera',
            ctaRoute: 'cartera',
            owner: 'Asesor',
            successMetric: 'La alerta de cartera se resuelve o el contacto queda registrado.',
        };
    },

    /**
     * @param {{ faltantes:number }} kpi
     * @returns {string}
     */
    _selectHighestLeverageActivity(kpi) {
        const faltantes = Number(kpi?.faltantes || 0);

        if (faltantes <= 0) {
            return 'Mantén el ritmo: registra cualquier actividad real adicional de hoy.';
        }

        if (faltantes >= 15) {
            return 'Agenda 1 cita o registra una póliza pagada si ya ocurrió.';
        }

        if (faltantes >= 10) {
            return 'Registra 1 solicitud o genera 2 citas conectadas.';
        }

        if (faltantes >= 5) {
            return 'Conecta 1 cita o realiza 10 llamadas.';
        }

        return 'Pide 2 referidos o realiza 5 llamadas.';
    },

    /**
     * @param {Object} policy
     * @returns {{ score:number, label:string, reason:string, actionReason:string }}
     */
    _scoreCarteraUrgency(policy) {
        const signals = [];

        if (this._isCurrentMonth(policy?.fechaPago)) {
            signals.push({
                score: 100,
                label: 'Pago pendiente',
                reason: 'Tiene pago programado este mes.',
                actionReason: 'prima pendiente del mes',
            });
        }

        const birthdayDays = this._daysUntilAnnualDate(policy?.nacimiento);
        if (birthdayDays !== null && birthdayDays <= 14) {
            signals.push({
                score: 70 - birthdayDays,
                label: 'Cumpleaños próximo',
                reason: `Cumpleaños en ${birthdayDays} días.`,
                actionReason: 'cumpleaños próximo',
            });
        }

        const anniversaryDays = this._daysUntilAnnualDate(policy?.emision);
        if (anniversaryDays !== null && anniversaryDays <= 30) {
            signals.push({
                score: 85 - anniversaryDays,
                label: 'Aniversario de póliza',
                reason: `Aniversario de póliza en ${anniversaryDays} días.`,
                actionReason: 'revisión por aniversario de póliza',
            });
        }

        if (birthdayDays !== null) {
            const actuarialDays = birthdayDays > 182 ? birthdayDays - 182 : birthdayDays + 183;
            if (actuarialDays <= 30) {
                signals.push({
                    score: 60 - actuarialDays,
                    label: 'Edad actuarial',
                    reason: `Ventana de edad actuarial en ${actuarialDays} días.`,
                    actionReason: 'oportunidad por edad actuarial',
                });
            }
        }

        return signals.sort((a, b) => b.score - a.score)[0] || {
            score: 0,
            label: 'Sin urgencia',
            reason: 'Sin señal accionable.',
            actionReason: 'sin señal accionable',
        };
    },

    /**
     * @param {string} dateString
     * @returns {number|null}
     */
    _daysUntilAnnualDate(dateString) {
        if (!dateString) return null;

        const base = new Date(dateString + 'T12:00:00');
        if (Number.isNaN(base.getTime())) return null;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let next = new Date(today.getFullYear(), base.getMonth(), base.getDate());
        if (next < today) {
            next.setFullYear(today.getFullYear() + 1);
        }

        return Math.ceil((next - today) / DASHBOARD_CONFIG.MS_POR_DIA);
    },

    /**
     * @param {string} dateString
     * @returns {boolean}
     */
    _isCurrentMonth(dateString) {
        if (!dateString) return false;

        const date = new Date(dateString + 'T12:00:00');
        if (Number.isNaN(date.getTime())) return false;

        const today = new Date();
        return (
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// DOM WRITER — Aísla todas las mutaciones DOM
// Cada método es idempotente y defensivo (verifica que el elemento existe)
// ─────────────────────────────────────────────────────────────────────────────

const DashboardView = {

    /**
     * Escribe el saludo personalizado en #dash-saludo.
     * @param {string} nombre — ya sanitizado antes de llamar
     */
    renderSaludo(nombre) {
        const el = document.getElementById('dash-saludo');
        if (!el) return;
        const hora   = new Date().getHours();
        const saludo =
            hora >= 5  && hora < 12 ? 'Buenos días'   :
            hora >= 12 && hora < 19 ? 'Buenas tardes' :
                                      'Buenas noches';
        // nombre ya viene sanitizado desde el controller
        el.innerHTML = `${saludo}, ${nombre} 👋`;
    },

    /**
     * Actualiza el KPI tile de puntos (#dash-pts-kpi).
     * @param {number} puntos
     */
    renderKpiPuntos(puntos) {
        const el = document.getElementById('dash-pts-kpi');
        if (!el) return;
        const valueEl = el.querySelector('.widget-value');
        if (valueEl) valueEl.textContent = puntos;
    },

    /**
     * Renderiza el Decision Cockpit v0.
     * @param {Array} decisions
     */
    renderDecisionCockpit(decisions) {
        const el = document.getElementById('dash-decision-cockpit');
        if (!el) return;

        const safeDecisions = Array.isArray(decisions) ? decisions.slice(0, 3) : [];
        el.innerHTML = safeDecisions
            .map(decision => this.renderDecisionCard(decision))
            .join('');
    },

    /**
     * @param {Object} decision
     * @returns {string}
     */
    renderDecisionCard(decision = {}) {
        const evidence = Array.isArray(decision.evidence) ? decision.evidence : [];
        const evidenceHtml = evidence
            .map(item => `<li>${Sanitizer.escape(item)}</li>`)
            .join('');

        return `
            <div class="card" style="border-left:4px solid var(--color-primary) !important;">
                <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:10px;">
                    <h3 style="font-size:15px;margin:0;font-weight:800;">${Sanitizer.escape(decision.title)}</h3>
                    <span class="badge badge-blue">${Sanitizer.escape(decision.status)}</span>
                </div>
                <p style="font-size:13px;color:var(--text-secondary);line-height:1.45;margin:0 0 10px 0;">
                    ${Sanitizer.escape(decision.why)}
                </p>
                <ul style="font-size:12px;color:var(--text-secondary);line-height:1.45;margin:0 0 10px 18px;padding:0;">
                    ${evidenceHtml}
                </ul>
                <p style="font-size:13px;margin:0 0 8px 0;">
                    <strong>Acción:</strong> ${Sanitizer.escape(decision.action)}
                </p>
                <button
                    class="btn-primary btn-sm"
                    data-action="decision-navigate"
                    data-decision-type="${Sanitizer.escape(decision.decisionType)}"
                    data-decision-title="${Sanitizer.escape(decision.title)}"
                    data-route="${Sanitizer.escape(decision.ctaRoute)}"
                    style="width:100%;margin-bottom:10px;"
                >
                    ${Sanitizer.escape(decision.ctaLabel)}
                </button>
                <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start;font-size:11px;color:var(--text-tertiary);">
                    <span><strong>Owner:</strong> ${Sanitizer.escape(decision.owner)}</span>
                    <span style="text-align:right;">${Sanitizer.escape(decision.successMetric)}</span>
                </div>
            </div>
        `;
    },

    /**
     * Renderiza la sección de productividad semanal.
     * @param {{ puntos, meta, faltantes, badge }} kpi
     */
    renderProductividad(kpi) {
        const el = document.getElementById('dash-productividad');
        if (!el) return;
        const pct = Math.min(100, Math.round((kpi.puntos / kpi.meta) * 100));
        el.innerHTML =
            `<p style="font-size:14px;margin-bottom:10px;">` +
                `Esta semana llevas <strong>${kpi.puntos}</strong> de ${kpi.meta} puntos. ` +
                `Faltan <strong style="color:var(--color-danger);">${kpi.faltantes}</strong>.` +
            `</p>` +
            `<div class="progress-bar-track">` +
                `<div class="progress-bar-fill" style="width:${pct}%;"></div>` +
            `</div>` +
            `<div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;">` +
                `<span style="font-size:12px;color:var(--text-secondary);font-weight:600;">${pct}% completado</span>` +
                `${kpi.badge}` +
            `</div>`;
    },

    /**
     * Renderiza el radar de fidelización.
     * @param {string[]} alertas — HTML pre-sanitizado
     */
    renderFidelizacion(alertas) {
        const el = document.getElementById('dash-fidelizacion');
        if (!el) return;
        el.innerHTML = alertas.length > 0
            ? alertas.join('')
            : `<p style="font-size:13px;color:var(--text-secondary);">Sin eventos próximos en los siguientes 30 días. ✅</p>`;
    },

    /**
     * Renderiza la sección de control de cartera / cobranza.
     * @param {string} html — HTML pre-sanitizado
     */
    renderCobranza(html) {
        const el = document.getElementById('dash-cartera');
        if (!el) return;
        el.innerHTML = html;
    },

    /**
     * Renderiza estado de error en el dashboard.
     * @param {string} mensaje — texto plano, NO HTML
     */
    renderError(mensaje) {
        const el = document.getElementById('dash-productividad');
        if (!el) return;
        el.innerHTML =
            `<p style="color:var(--color-danger);font-size:13px;">` +
                `⚠️ ${Sanitizer.escape(mensaje)}` +
            `</p>`;
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// CONTROLLER — Orquesta datos, estado y renderizado
// ─────────────────────────────────────────────────────────────────────────────

const DashboardController = {

    /** AbortController activo para la carga de datos en curso */
    _abortController: null,

    /**
     * Registra acciones del Decision Cockpit usando navegación existente.
     */
    _bindDecisionActions() {
        const root = document.getElementById('dashboard-container');
        if (!root) return;

        const clickHandler = event => {
            const btn = event.target.closest('[data-action="decision-navigate"]');
            if (!btn) return;

            const route = btn.dataset.route;
            this._recordDecisionTelemetry('clicked', {
                decisionType: btn.dataset.decisionType,
                title: btn.dataset.decisionTitle,
                ctaRoute: route,
            });

            if (route) Navigation.navigate(route);
        };

        root.addEventListener('click', clickHandler);
        Memory.add(() => root.removeEventListener('click', clickHandler));
    },

    /**
     * Guarda evidencia local de uso del Decision Cockpit.
     * @param {'shown'|'clicked'} eventName
     * @param {Object} decision
     */
    _recordDecisionTelemetry(eventName, decision = {}) {
        const eventId = `decision_${eventName}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

        DB.guardar('logs', {
            id: eventId,
            type: 'decision_telemetry',
            event: eventName,
            decisionType: decision.decisionType || 'unknown',
            decisionTitle: decision.title || '',
            ctaRoute: decision.ctaRoute || '',
            timestamp: new Date().toISOString(),
        }).catch(err => {
            Logger.warn('[Dashboard] decision telemetry failed:', err?.message || err);
        });
    },

    /**
     * Punto de entrada. Llamado por bindDashboardEvents() desde el router.
     * Lee usuario de AppState (puesto por AuthService), carga datos de DB,
     * hidrata el DOM via RenderEngine, registra cleanup en Memory.
     */
    async init() {

        Logger.info('[Dashboard] init');

        // — Cancela cualquier carga previa que pudiera estar en vuelo
        this._abort();

        const controller = new AbortController();
        this._abortController = controller;

        // — Registrar cleanup en MemoryManager
        // El router llama a Memory.cleanup() en destroyAll() antes de cada navigate
        Memory.add(() => this._abort());
        this._bindDecisionActions();

        // — Suscripción reactiva: si AppState.cartera cambia (sync en background),
        //   refrescar automáticamente la sección relevante sin recargar todo
        const unsubscribe = AppState.subscribe((key, value) => {
            if (key === 'cartera' && Array.isArray(value)) {
                Logger.info('[Dashboard] cartera actualizada via AppState, refrescando secciones');
                this._refreshCarteraSections(value);
            }
        });
        Memory.add(unsubscribe);

        try {

            // — Leer usuario desde AppState (AuthService ya lo puso ahí)
            // NUNCA llamar a supabase.auth.getUser() desde una vista
            const userRaw   = AppState.get('user');
            const nombre    = Sanitizer.escape(
                userRaw?.user_metadata?.full_name?.split(' ')[0] || 'Asesor'
            );

            // — Cargar datos en paralelo con soporte de cancelación
            const [historial, cartera, referidos] = await Promise.all([
                this._fetchWithAbort(
                    () => DB.obtenerTodos('actividad_diaria'),
                    controller.signal
                ),
                this._fetchWithAbort(
                    () => DB.obtenerTodos('cartera'),
                    controller.signal
                ),
                this._fetchWithAbort(
                    () => DB.obtenerTodos('referidos'),
                    controller.signal
                ),
            ]);

            // — Guardar en AppState para que otros módulos (ej. cartera.js) lo reusen
            AppState.set('dashboard', { historial, cartera, referidos, loadedAt: Date.now() });

            const decisions = DashboardCalculator.decisionCockpit({
                historial,
                referidos,
                cartera,
            });

            decisions.forEach(decision => {
                this._recordDecisionTelemetry('shown', decision);
            });

            // — Hidratar DOM via RenderEngine (batched, RAF-scheduled)
            RenderEngine.batch([
                () => DashboardView.renderSaludo(nombre),
                () => {
                    const kpi = DashboardCalculator.productividad(historial);
                    DashboardView.renderKpiPuntos(kpi.puntos);
                    DashboardView.renderProductividad(kpi);
                },
                () => DashboardView.renderDecisionCockpit(decisions),
                () => {
                    const alertas = DashboardCalculator.fidelizacion(cartera);
                    DashboardView.renderFidelizacion(alertas);
                },
                () => {
                    const cobranza = DashboardCalculator.cobranza(cartera);
                    DashboardView.renderCobranza(cobranza);
                },
            ]);

            // — Notificar al sistema que el dashboard cargó correctamente
            EventBus.emit('dashboard:loaded', {
                puntosSemanales: DashboardCalculator.productividad(historial).puntos,
                totalCartera:    Array.isArray(cartera) ? cartera.length : 0,
            });

            Logger.info('[Dashboard] carga completada');

        } catch (err) {

            // — Si fue cancelación intencional, no loggear como error
            if (err?.name === 'AbortError') {
                Logger.info('[Dashboard] carga cancelada (navigate)');
                return;
            }

            Logger.error('[Dashboard] error al cargar datos:', err);

            RenderEngine.schedule(() => {
                DashboardView.renderError('Error al cargar el dashboard. Intenta de nuevo.');
            });

            EventBus.emit('dashboard:error', { message: err?.message });
        }
    },

    /**
     * Refresca solo las secciones de cartera cuando AppState.cartera cambia.
     * Evita recargar historial innecesariamente.
     * @param {Array} cartera
     */
    _refreshCarteraSections(cartera) {
        RenderEngine.batch([
            () => {
                const alertas = DashboardCalculator.fidelizacion(cartera);
                DashboardView.renderFidelizacion(alertas);
            },
            () => {
                const cobranza = DashboardCalculator.cobranza(cartera);
                DashboardView.renderCobranza(cobranza);
            },
        ]);
    },

    /**
     * Ejecuta un fetcher solo si la señal no fue abortada.
     * Permite cancelar fetches de IndexedDB cuando el usuario navega.
     * @param {() => Promise<any>} fetcher
     * @param {AbortSignal} signal
     * @returns {Promise<any>}
     */
    async _fetchWithAbort(fetcher, signal) {
        if (signal.aborted) {
            const err  = new Error('Aborted before fetch');
            err.name   = 'AbortError';
            throw err;
        }
        const result = await fetcher();
        if (signal.aborted) {
            const err  = new Error('Aborted after fetch');
            err.name   = 'AbortError';
            throw err;
        }
        return result;
    },

    /**
     * Aborta la carga en curso y limpia la referencia.
     */
    _abort() {
        if (this._abortController) {
            this._abortController.abort();
            this._abortController = null;
        }
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE — Solo HTML estático. Cero lógica de negocio aquí.
// Los IDs deben coincidir exactamente con los usados en DashboardView.*
// ─────────────────────────────────────────────────────────────────────────────

export function renderDashboard() {
    return `
        <div id="dashboard-container" style="display:flex;flex-direction:column;gap:14px;">

            <!-- Hero Greeting Widget -->
            <div class="card widget-accent" style="padding:24px !important;">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                    <div>
                        <p style="font-size:12px;font-weight:600;opacity:0.75;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:6px;">CRM Addlife</p>
                        <h1 id="dash-saludo" style="font-size:24px;color:white;font-weight:800;letter-spacing:-0.5px;margin:0;">
                            <div class="skeleton-text skeleton-shimmer" style="width:200px;height:28px;background:rgba(255,255,255,0.20);"></div>
                        </h1>
                        <p style="margin:6px 0 0 0;opacity:0.80;font-size:13px;color:white;font-weight:400;">Estatus de tu negocio hoy.</p>
                    </div>
                    <div style="width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,0.18);display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;">📊</div>
                </div>
            </div>

            <!-- 2-col KPI Grid -->
            <div class="widget-grid">
                <div id="dash-pts-kpi" class="widget">
                    <span class="widget-title">Puntos semana</span>
                    <span class="widget-value" style="color:var(--color-primary);">—</span>
                </div>
                <div id="dash-meta-kpi" class="widget">
                    <span class="widget-title">Meta semanal</span>
                    <span class="widget-value">${DASHBOARD_CONFIG.META_SEMANAL}</span>
                </div>
            </div>

            <!-- Decision Cockpit v0 -->
            <div>
                <h2 style="font-size:16px;margin-bottom:12px;">Decision Cockpit v0</h2>
                <div id="dash-decision-cockpit" style="display:flex;flex-direction:column;gap:12px;">
                    <div class="skeleton-text skeleton-shimmer" style="width:92%;"></div>
                    <div class="skeleton-text skeleton-shimmer" style="width:86%;"></div>
                    <div class="skeleton-text skeleton-shimmer" style="width:80%;"></div>
                </div>
            </div>

            <!-- Productividad -->
            <div class="card" style="border-left:4px solid var(--color-primary) !important;">
                <h2 style="font-size:16px;margin-bottom:14px;">📊 Productividad Semanal</h2>
                <div id="dash-productividad">
                    <div class="skeleton-text skeleton-shimmer" style="width:88%;"></div>
                    <div class="skeleton-text skeleton-shimmer" style="width:55%;height:20px;border-radius:10px;margin-top:10px;"></div>
                </div>
            </div>

            <!-- Radar de Fidelización -->
            <div class="card" style="border-left:4px solid var(--color-warning) !important;">
                <h2 style="font-size:16px;margin-bottom:14px;">🎯 Radar de Fidelización</h2>
                <div id="dash-fidelizacion" style="display:flex;flex-direction:column;gap:0;">
                    <div class="skeleton-text skeleton-shimmer" style="width:85%;"></div>
                    <div class="skeleton-text skeleton-shimmer" style="width:70%;"></div>
                </div>
            </div>

            <!-- Control de Cartera -->
            <div class="card" style="border-left:4px solid var(--color-danger) !important;">
                <h2 style="font-size:16px;margin-bottom:14px;">💼 Control de Cartera</h2>
                <div id="dash-cartera">
                    <div class="skeleton-text skeleton-shimmer" style="width:92%;"></div>
                </div>
            </div>

        </div>
    `;
}

// ─────────────────────────────────────────────────────────────────────────────
// BIND — Entry point llamado por el router tras renderDashboard()
// ─────────────────────────────────────────────────────────────────────────────

export async function bindDashboardEvents() {
    await DashboardController.init();
}
