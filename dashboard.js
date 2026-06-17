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
import { generarWhatsappLink } from './whatsapp-link-engine.js';

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
        const decisions = [
            this._buildActivityGapDecision(historial),
            this._buildReferralDecision(referidos),
            this._buildCarteraUrgencyDecision(cartera),
        ];

        // Add unique instanceId per render for outcome attribution
        decisions.forEach(d => {
            const salt = Math.random().toString(36).slice(2, 6);
            d.instanceId = `inst_${Date.now()}_${salt}`;
        });

        // Sort by priority score descending
        return decisions.sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));
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

        const confidence = 85;
        const impactWeight = 3; // High

        const title = (kpi && typeof kpi.puntos === 'number')
            ? (kpi.faltantes > 0
                ? `Llevas ${kpi.puntos} puntos esta semana. Aún estás a tiempo de alcanzar tu meta.`
                : `Llevas ${kpi.puntos} puntos esta semana. ¡Meta semanal cumplida!`)
            : 'Hoy aún puedes recuperar tu ritmo comercial';

        return {
            decisionType: 'activity_gap',
            title,
            status: kpi.faltantes > 0 ? 'Acción requerida' : 'En ritmo',
            why: kpi.faltantes > 0
                ? 'Forge detectó que tu actividad semanal puede mejorar con un pequeño impulso.'
                : 'Forge detectó que tu ritmo es excelente; conservas la meta cubierta.',
            note: 'Una pequeña acción hoy puede marcar la diferencia esta semana.',
            evidence: [
                `${kpi.puntos} de ${kpi.meta} puntos esta semana.`,
                paceText,
            ],
            action,
            ctaLabel: 'Abrir Actividad',
            ctaRoute: 'actividad',
            owner: 'Asesor',
            successMetric: 'Tu productividad semanal avanza hacia el objetivo.',
            priorityScore: impactWeight * confidence,
            quickActionTargetKey: this._mapActivityToKey(kpi) || null,
            metadata: {
                impact: 'Alto',
                confidence: `${confidence}%`,
                estimatedTime: '2 min'
            }
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
        const confidence = 70;
        const impactWeight = 2; // Medium

        const sinContactoCount = Array.isArray(referidos)
            ? referidos.filter(ref => !ref?.estado || ref.estado === 'Nuevo').length
            : 0;

        const title = sinContactoCount > 0
            ? `Tienes ${sinContactoCount} referido${sinContactoCount > 1 ? 's' : ''} sin contacto. Uno podría convertirse en tu próxima cita.`
            : 'Es buen momento para contactar a uno de tus referidos';

        if (!selected) {
            return {
                decisionType: 'referral_activation',
                title,
                status: 'Sin referido listo',
                why: 'Por ahora no hay referidos nuevos listos para ser activados.',
                note: 'Los referidos suelen avanzar más rápido que un prospecto frío.',
                evidence: [
                    `${Array.isArray(referidos) ? referidos.length : 0} referidos registrados.`,
                    'No hay candidato con información suficiente para contacto.',
                ],
                action: 'Actualiza un referido en seguimiento con teléfono y contexto para activarlo.',
                ctaLabel: 'Abrir Referidos',
                ctaRoute: 'referidos',
                owner: 'Asesor',
                successMetric: 'Un referido queda listo para iniciar su proceso.',
                priorityScore: impactWeight * confidence,
                quickActionPhone: null,
                metadata: {
                    impact: 'Medio',
                    confidence: `${confidence}%`,
                    estimatedTime: '5 min'
                }
            };
        }

        const name = selected.nombre || 'un referido';
        const source = selected.origen || 'sin COI registrado';
        const phone = selected.telefono ? 'con teléfono' : 'sin teléfono';

        return {
            decisionType: 'referral_activation',
            title,
            status: selected.estado || 'Nuevo',
            why: `Forge encontró una oportunidad para convertir a ${name} en prospecto hoy.`,
            note: 'Los referidos suelen avanzar más rápido que un prospecto frío.',
            evidence: [
                `${name} está en estado ${selected.estado || 'Nuevo'}.`,
                `Fuente: ${source}.`,
                `Contacto: ${phone}.`,
            ],
            action: `Contacta a ${name} y comienza a construir la relación.`,
            ctaLabel: 'Abrir Referidos',
            ctaRoute: 'referidos',
            owner: 'Asesor',
            successMetric: 'El referido avanza en su ciclo de prospección.',
            priorityScore: impactWeight * confidence,
            quickActionPhone: selected.telefono || null,
            metadata: {
                impact: 'Medio',
                confidence: `${confidence}%`,
                estimatedTime: '5 min'
            }
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
        const confidence = 90;
        const impactWeight = 3; // High

        if (!selected) {
            return {
                decisionType: 'cartera_urgency',
                title: 'Hay un cliente de tu cartera que requiere atención hoy',
                status: 'Sin alerta urgente',
                why: 'Tus clientes están al día; no hay eventos inmediatos que requieran atención.',
                note: 'Dar seguimiento a tiempo fortalece la relación con tus clientes.',
                evidence: [
                    `${Array.isArray(cartera) ? cartera.length : 0} pólizas revisadas.`,
                    'No hay señales de prioridad detectadas hoy.',
                ],
                action: 'Mantén tu cartera actualizada para no perder ninguna oportunidad.',
                ctaLabel: 'Abrir Cartera',
                ctaRoute: 'cartera',
                owner: 'Asesor',
                successMetric: 'La atención a clientes se mantiene en niveles óptimos.',
                priorityScore: impactWeight * confidence,
                quickActionClient: null,
                metadata: {
                    impact: 'Alto',
                    confidence: `${confidence}%`,
                    estimatedTime: '3 min'
                }
            };
        }

        const client = selected.policy?.cliente || 'este cliente';
        const policy = selected.policy?.poliza || selected.policy?.plan || 'póliza sin folio';

        let title = 'Hay un cliente de tu cartera que requiere atención hoy';
        const label = selected.urgency.label;
        if (label === 'Cumpleaños próximo') {
            const bDays = this._daysUntilAnnualDate(selected.policy?.nacimiento);
            const daysText = (bDays !== null && bDays <= 7) ? 'esta semana' : `en ${bDays} días`;
            title = `${client} cumple años ${daysText}. Un mensaje puede fortalecer la relación.`;
        } else if (label === 'Aniversario de póliza') {
            const aDays = this._daysUntilAnnualDate(selected.policy?.emision);
            const daysText = (aDays !== null && aDays <= 7) ? 'esta semana' : `en ${aDays} días`;
            title = `Póliza de ${client} cumple aniversario ${daysText}.`;
        } else if (label === 'Pago pendiente') {
            title = `Póliza de ${client} tiene un pago pendiente este mes.`;
        } else if (label === 'Edad actuarial') {
            title = `${client} entra en ventana de edad actuarial próximamente.`;
        }

        return {
            decisionType: 'cartera_urgency',
            title,
            status: selected.urgency.label,
            why: `Forge identificó que ${client} apreciará tu contacto en este momento.`,
            note: 'Dar seguimiento a tiempo fortalece la relación con tus clientes.',
            evidence: [
                `Cliente: ${client}.`,
                `Póliza: ${policy}.`,
                selected.urgency.reason,
            ],
            action: `Contacta a ${client} para dar seguimiento a su ${selected.urgency.actionReason}.`,
            ctaLabel: 'Abrir Cartera',
            ctaRoute: 'cartera',
            owner: 'Asesor',
            successMetric: 'El cliente recibe atención personalizada a tiempo.',
            priorityScore: impactWeight * confidence,
            quickActionClient: client,
            metadata: {
                impact: 'Alto',
                confidence: `${confidence}%`,
                estimatedTime: '3 min'
            }
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
     * @param {{ faltantes:number }} kpi
     * @returns {string|null}
     */
    _mapActivityToKey(kpi) {
        const faltantes = Number(kpi?.faltantes || 0);
        if (faltantes <= 0) return null;
        if (faltantes >= 15) return 'citas_agendadas';
        if (faltantes >= 10) return 'solicitudes';
        if (faltantes >= 5) return 'citas_conectadas';
        return 'referidos';
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

    /**
     * Calcula tiempo relativo (ej. "hace 2 días").
     * @param {string} timestamp
     * @returns {string}
     */
    relativeTime(timestamp) {
        const now = new Date();
        const past = new Date(timestamp);
        const diffMs = now - past;
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffDays === 0) return 'hoy';
        if (diffDays === 1) return 'ayer';
        return `hace ${diffDays} días`;
    },

    /**
     * Genera un resumen ejecutivo de una frase para el día.
     * @param {Array} decisions
     * @param {Array} outcomes
     * @param {Object} kpi
     * @returns {string}
     */
    generateDailyBrief(decisions, outcomes, kpi) {
        const highImpactCount = (decisions || []).filter(d => d.metadata?.impact === 'Alto').length;
        const recentOutcome = outcomes?.[0];
        const referralReady = (decisions || []).some(d => d.decisionType === 'referral_activation' && d.status !== 'Sin referido listo');

        if (highImpactCount > 0) {
            return `Hoy tienes ${highImpactCount} oportunidades de alto impacto que requieren tu atención inmediata.`;
        }

        if (recentOutcome && (new Date() - new Date(recentOutcome.timestamp)) < 86400000) {
            return 'Forge detectó avances recientes en tu negocio. Es un gran momento para mantener el ritmo.';
        }

        if (kpi && kpi.faltantes > 0 && kpi.faltantes < 25) {
            return 'Tu actividad semanal está muy cerca de la meta; un pequeño impulso hoy será clave.';
        }

        if (referralReady) {
            return 'Un referido detectado hoy tiene potencial para convertirse en tu próxima cita.';
        }

        return 'Tu negocio está al día. Revisa las recomendaciones de Forge para seguir construyendo tu cartera.';
    },

    /**
     * Calcula métricas de impacto de Forge basadas en logs de telemetría.
     * @param {Array} logs
     * @returns {Object}
     */
    calculateAnalytics(logs) {
        const telemetry = (logs || []).filter(l => l.type === 'decision_telemetry');

        // 1. Recomendaciones útiles
        const feedbackEvents = telemetry.filter(t => t.event === 'feedback');
        const usefulCount = feedbackEvents.filter(t => t.feedback === 'useful').length;
        const totalFeedback = feedbackEvents.length;
        const usefulPct = totalFeedback > 0 ? Math.round((usefulCount / totalFeedback) * 100) : null;

        // 2. Acciones realizadas
        const shownCount = telemetry.filter(t => t.event === 'shown').length;
        const clickedCount = telemetry.filter(t => t.event === 'clicked').length;
        const clickedPct = shownCount > 0 ? Math.round((clickedCount / shownCount) * 100) : null;

        // 3. Resultados detectados
        const outcomesCount = telemetry.filter(t => t.event === 'outcome_detected').length;

        return {
            usefulPct,
            clickedPct,
            outcomesCount,
            hasData: totalFeedback > 0 || shownCount > 0 || outcomesCount > 0
        };
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
     * Renderiza el resumen ejecutivo diario.
     * @param {string} text
     */
    renderDailyBrief(text) {
        const el = document.getElementById('dash-daily-brief');
        if (!el) return;
        el.innerHTML = `<p style="font-size:14px;margin:0;line-height:1.45;color:var(--text-primary);font-weight:500;">${Sanitizer.escape(text)}</p>`;
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
     * Renderiza la línea de tiempo de evidencia.
     * @param {Array} outcomes
     */
    renderEvidenceTimeline(outcomes) {
        const el = document.getElementById('dash-evidence-timeline');
        if (!el) return;

        if (!Array.isArray(outcomes) || outcomes.length === 0) {
            el.innerHTML = `<p style="font-size:12px;color:var(--text-tertiary);font-style:italic;">Esperando resultados para generar evidencia...</p>`;
            return;
        }

        el.innerHTML = outcomes
            .slice(0, 3)
            .map(out => {
                let msg = '';
                const time = DashboardCalculator.relativeTime(out.timestamp);
                const confidenceMap = { 'level_3': '✅ Alta', 'level_2': '👀 Observada', 'level_1': 'Temporal' };
                const conf = confidenceMap[out.confidence] || 'Observada';

                if (out.decisionType === 'activity_gap') {
                    msg = `✓ ${time.charAt(0).toUpperCase() + time.slice(1)} detectamos que recuperaste tu ritmo comercial.`;
                } else if (out.decisionType === 'referral_activation') {
                    msg = `✓ Un referido avanzó después de una recomendación ${time}.`;
                } else if (out.decisionType === 'cartera_urgency') {
                    msg = `✓ Un riesgo de cartera desapareció tras un seguimiento ${time}.`;
                } else {
                    msg = `✓ Forge detectó un resultado positivo ${time}.`;
                }

                return `
                    <div style="margin-bottom:10px;padding:8px;background:rgba(0,122,255,0.03);border-radius:8px;border-left:3px solid var(--color-success);">
                        <p style="font-size:13px;margin:0 0 4px 0;line-height:1.4;">${Sanitizer.escape(msg)}</p>
                        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-tertiary);">
                            <span>Confianza: ${Sanitizer.escape(conf)}</span>
                            <span style="text-transform:uppercase;">${Sanitizer.escape(out.decisionType.replace('_', ' '))}</span>
                        </div>
                    </div>
                `;
            })
            .join('');
    },

    /**
     * Renderiza las métricas de impacto de Forge.
     * @param {Object} analytics
     */
    renderAnalytics(analytics) {
        const el = document.getElementById('dash-analytics');
        if (!el) return;

        if (!analytics || !analytics.hasData) {
            el.innerHTML = `<p style="font-size:12px;color:var(--text-tertiary);font-style:italic;margin:0;">Forge sigue aprendiendo de tu actividad.</p>`;
            return;
        }

        const usefulText = analytics.usefulPct !== null ? `${analytics.usefulPct}% útiles` : 'Sin retroalimentación';
        const clickedText = analytics.clickedPct !== null ? `${analytics.clickedPct}% ejecutadas` : 'Sin interacción';

        el.innerHTML = `
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;text-align:center;">
                <div style="background:rgba(0,122,255,0.03);padding:10px;border-radius:8px;">
                    <div style="font-size:18px;margin-bottom:4px;">👍</div>
                    <div style="font-size:14px;font-weight:700;color:var(--text-primary);">${Sanitizer.escape(usefulText)}</div>
                    <div style="font-size:10px;color:var(--text-tertiary);margin-top:2px;">Utilidad</div>
                </div>
                <div style="background:rgba(255,149,0,0.03);padding:10px;border-radius:8px;">
                    <div style="font-size:18px;margin-bottom:4px;">⚡</div>
                    <div style="font-size:14px;font-weight:700;color:var(--text-primary);">${Sanitizer.escape(clickedText)}</div>
                    <div style="font-size:10px;color:var(--text-tertiary);margin-top:2px;">Ejecución</div>
                </div>
                <div style="background:rgba(52,199,89,0.03);padding:10px;border-radius:8px;">
                    <div style="font-size:18px;margin-bottom:4px;">🎯</div>
                    <div style="font-size:14px;font-weight:700;color:var(--text-primary);">${analytics.outcomesCount}</div>
                    <div style="font-size:10px;color:var(--text-tertiary);margin-top:2px;">Resultados</div>
                </div>
            </div>
        `;
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

        const meta = decision.metadata || {};

        // Impact Visual Mapping (Localized)
        const impactMap = {
            'Alto':   { color: '#FF3B30', icon: '🔴' }, // Red
            'Medio': { color: '#FF9500', icon: '🟠' }, // Orange
            'Bajo':    { color: '#34C759', icon: '🟢' }  // Green
        };
        const impact = impactMap[meta.impact] || impactMap['Bajo'];

        // Status Badge Styling
        let badgeStyle = 'background:rgba(0,122,255,0.1);color:var(--color-primary);'; // Default blue
        let statusIcon = '';

        const status = decision.status || '';
        if (status.includes('Acción requerida')) {
            badgeStyle = 'background:#FFE5E5;color:#D92D20;';
            statusIcon = '🔴 ';
        } else if (status.includes('Sin referido') || status.includes('Sin alerta')) {
            badgeStyle = 'background:#FFF3E0;color:#E65100;';
            statusIcon = '🟠 ';
        } else if (status.includes('En ritmo') || status.includes('Meta cumplida') || status.includes('Al día')) {
            badgeStyle = 'background:#E8F5E9;color:#2E7D32;';
            statusIcon = '🟢 ';
        }

        return `
            <div class="card" style="border-left:4px solid var(--color-primary) !important;">
                <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:10px;">
                    <h3 style="font-size:15px;margin:0;font-weight:800;">${Sanitizer.escape(decision.title)}</h3>
                    <span class="badge" style="${badgeStyle}">${statusIcon}${Sanitizer.escape(status)}</span>
                </div>
                <p style="font-size:13px;color:var(--text-secondary);line-height:1.45;margin:0 0 10px 0;">
                    ${Sanitizer.escape(decision.why)}
                </p>
                ${decision.note ? `<p style="font-size:12px;color:var(--text-tertiary);font-style:italic;margin:-5px 0 10px 0;">${Sanitizer.escape(decision.note)}</p>` : ''}
                <ul style="font-size:12px;color:var(--text-secondary);line-height:1.45;margin:0 0 10px 18px;padding:0;">
                    ${evidenceHtml}
                </ul>
                <p style="font-size:13px;margin:0 0 12px 0;">
                    <strong>Acción:</strong> ${Sanitizer.escape(decision.action)}
                </p>

                <!-- Decision Metadata Bar -->
                <div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:12px;font-size:11px;color:var(--text-tertiary);border-top:1px solid rgba(150,150,150,0.1);padding-top:10px;">
                    <span style="color:${impact.color};font-weight:700;">${impact.icon} Impacto esperado: ${Sanitizer.escape(meta.impact || 'Bajo')}</span>
                    <span style="background:rgba(0,122,255,0.05);padding:2px 6px;border-radius:4px;color:var(--color-primary);">Confianza Forge: ${Sanitizer.escape(meta.confidence || '0%')}</span>
                    <span>⏱ ${Sanitizer.escape(meta.estimatedTime || '-')}</span>
                </div>

                ${(() => {
                    const instanceId = Sanitizer.escape(decision.instanceId);
                    if (decision.decisionType === 'activity_gap') {
                        const targetKey = decision.quickActionTargetKey ? Sanitizer.escape(decision.quickActionTargetKey) : '';
                        return `
                            <div style="display:flex;gap:8px;margin-bottom:10px;width:100%;">
                                <button
                                    class="btn-primary btn-sm"
                                    data-action="decision-navigate"
                                    data-instance-id="${instanceId}"
                                    data-decision-type="${Sanitizer.escape(decision.decisionType)}"
                                    data-decision-title="${Sanitizer.escape(decision.title)}"
                                    data-route="${Sanitizer.escape(decision.ctaRoute)}"
                                    style="flex:1;"
                                >
                                    ${Sanitizer.escape(decision.ctaLabel)}
                                </button>
                                <button
                                    class="btn-secondary btn-sm"
                                    data-action="quick-action-activity"
                                    data-instance-id="${instanceId}"
                                    data-decision-type="${Sanitizer.escape(decision.decisionType)}"
                                    data-target-key="${targetKey}"
                                    style="flex:1;"
                                >
                                    Registrar actividad
                                </button>
                            </div>
                        `;
                    } else if (decision.decisionType === 'referral_activation') {
                        const phone = decision.quickActionPhone ? Sanitizer.escape(decision.quickActionPhone) : '';
                        return `
                            <div style="display:flex;gap:8px;margin-bottom:10px;width:100%;">
                                <button
                                    class="btn-secondary btn-sm"
                                    data-action="decision-navigate"
                                    data-instance-id="${instanceId}"
                                    data-decision-type="${Sanitizer.escape(decision.decisionType)}"
                                    data-decision-title="${Sanitizer.escape(decision.title)}"
                                    data-route="${Sanitizer.escape(decision.ctaRoute)}"
                                    style="flex:1;"
                                >
                                    ${Sanitizer.escape(decision.ctaLabel)}
                                </button>
                                <button
                                    class="btn-primary btn-sm"
                                    ${phone ? `data-action="quick-action-referral" data-phone="${phone}"` : `data-action="decision-navigate" data-route="referidos"`}
                                    data-instance-id="${instanceId}"
                                    data-decision-type="${Sanitizer.escape(decision.decisionType)}"
                                    style="flex:1;"
                                >
                                    Contactar ahora
                                </button>
                            </div>
                        `;
                    } else if (decision.decisionType === 'cartera_urgency') {
                        const client = decision.quickActionClient ? Sanitizer.escape(decision.quickActionClient) : '';
                        return `
                            <div style="display:flex;gap:8px;margin-bottom:10px;width:100%;">
                                <button
                                    class="btn-secondary btn-sm"
                                    data-action="decision-navigate"
                                    data-instance-id="${instanceId}"
                                    data-decision-type="${Sanitizer.escape(decision.decisionType)}"
                                    data-decision-title="${Sanitizer.escape(decision.title)}"
                                    data-route="${Sanitizer.escape(decision.ctaRoute)}"
                                    style="flex:1;"
                                >
                                    ${Sanitizer.escape(decision.ctaLabel)}
                                </button>
                                <button
                                    class="btn-primary btn-sm"
                                    data-action="quick-action-cartera"
                                    data-instance-id="${instanceId}"
                                    data-client="${client}"
                                    data-decision-type="${Sanitizer.escape(decision.decisionType)}"
                                    style="flex:1;"
                                >
                                    Dar seguimiento
                                </button>
                            </div>
                        `;
                    } else {
                        return `
                            <button
                                class="btn-primary btn-sm"
                                data-action="decision-navigate"
                                data-instance-id="${instanceId}"
                                data-decision-type="${Sanitizer.escape(decision.decisionType)}"
                                data-decision-title="${Sanitizer.escape(decision.title)}"
                                data-route="${Sanitizer.escape(decision.ctaRoute)}"
                                style="width:100%;margin-bottom:10px;"
                            >
                                ${Sanitizer.escape(decision.ctaLabel)}
                            </button>
                        `;
                    }
                })()}

                <!-- Feedback Loop -->
                <div class="feedback-container" style="margin-top:2px;margin-bottom:12px;display:flex;align-items:center;gap:12px;border-top:1px solid rgba(150,150,150,0.05);padding-top:8px;">
                    <span style="font-size:11px;color:var(--text-tertiary);">¿Te fue útil?</span>
                    <div style="display:flex;gap:4px;">
                        <button
                            class="btn-secondary btn-sm"
                            data-action="decision-feedback"
                            data-instance-id="${Sanitizer.escape(decision.instanceId)}"
                            data-feedback="useful"
                            data-decision-type="${Sanitizer.escape(decision.decisionType)}"
                            data-decision-title="${Sanitizer.escape(decision.title)}"
                            style="padding:2px 8px;font-size:11px;border-radius:6px;background:rgba(0,122,255,0.03);"
                        >
                            👍 Útil
                        </button>
                        <button
                            class="btn-secondary btn-sm"
                            data-action="decision-feedback"
                            data-instance-id="${Sanitizer.escape(decision.instanceId)}"
                            data-feedback="not_useful"
                            data-decision-type="${Sanitizer.escape(decision.decisionType)}"
                            data-decision-title="${Sanitizer.escape(decision.title)}"
                            style="padding:2px 8px;font-size:11px;border-radius:6px;background:rgba(255,59,48,0.03);"
                        >
                            👎 No útil
                        </button>
                    </div>
                </div>

                <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start;font-size:11px;color:var(--text-tertiary);">
                    <span><strong>Siguiente acción:</strong> ${Sanitizer.escape(decision.owner)}</span>
                    <span style="text-align:right;">${Sanitizer.escape(decision.successMetric)}</span>
                </div>
            </div>
        `;
    },

    /**
     * Muestra una micro-celebración por un logro detectado.
     * @param {Object} outcome
     */
    showCelebration(outcome) {
        const container = document.getElementById('dashboard-container');
        if (!container) return;

        // Evitar múltiples celebraciones simultáneas
        if (document.getElementById('forge-celebration-banner')) return;

        let msg = '';
        if (outcome.decisionType === 'activity_gap') {
            msg = '🎉 ¡Buen trabajo! Recuperaste tu ritmo comercial.';
        } else if (outcome.decisionType === 'referral_activation') {
            msg = '🎯 Un referido avanzó gracias a tu seguimiento.';
        } else if (outcome.decisionType === 'cartera_urgency') {
            msg = '🛡️ Lograste una mejora en tu cartera.';
        } else {
            msg = '✨ ¡Felicidades! Se detectó un avance positivo.';
        }

        const banner = document.createElement('div');
        banner.id = 'forge-celebration-banner';
        banner.style = `
            position: fixed;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            width: 90%;
            max-width: 400px;
            background: var(--color-success);
            color: white;
            padding: 12px 16px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 14px;
            font-weight: 600;
            animation: slideIn 0.3s ease-out;
        `;

        banner.innerHTML = `
            <span>${Sanitizer.escape(msg)}</span>
            <span style="cursor:pointer;margin-left:10px;opacity:0.8;" onclick="this.parentElement.remove()">✕</span>
        `;

        // Agregar animación simple si no existe en styles.css
        if (!document.getElementById('forge-anim-styles')) {
            const style = document.createElement('style');
            style.id = 'forge-anim-styles';
            style.textContent = `
                @keyframes slideIn { from { top: -60px; } to { top: 10px; } }
                @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(banner);

        // Auto-hide después de 5 segundos
        setTimeout(() => {
            if (banner.parentElement) {
                banner.style.animation = 'fadeOut 0.5s forwards';
                setTimeout(() => banner.remove(), 500);
            }
        }, 5000);
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

    /** Registro de decisiones votadas en esta sesión para evitar duplicados */
    _votedDecisions: new Set(),

    /**
     * Registra acciones del Decision Cockpit usando navegación existente.
     */
    _bindDecisionActions() {
        const root = document.getElementById('dashboard-container');
        if (!root) return;

        const clickHandler = event => {
            const btnNav = event.target.closest('[data-action="decision-navigate"]');
            if (btnNav) {
                const route = btnNav.dataset.route;
                this._recordDecisionTelemetry('clicked', {
                    instanceId: btnNav.dataset.instanceId,
                    decisionType: btnNav.dataset.decisionType,
                    title: btnNav.dataset.decisionTitle,
                    ctaRoute: route,
                });

                if (route) Navigation.navigate(route);
                return;
            }

            const btnActivity = event.target.closest('[data-action="quick-action-activity"]');
            if (btnActivity) {
                const targetKey = btnActivity.dataset.targetKey;
                this._recordDecisionTelemetry('clicked', {
                    instanceId: btnActivity.dataset.instanceId,
                    decisionType: 'activity_gap',
                    title: 'Registrar actividad',
                    ctaRoute: 'actividad',
                });

                Navigation.navigate('actividad');

                if (targetKey) {
                    let attempts = 0;
                    const interval = setInterval(() => {
                        const btn = document.querySelector(`.activity-btn[data-key="${targetKey}"][data-action="inc"]`);
                        if (btn) {
                            const card = btn.closest('.glass-widget');
                            if (card) {
                                card.style.border = '2px solid var(--color-primary)';
                                card.style.boxShadow = '0 0 15px rgba(0, 122, 255, 0.3)';
                                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                            clearInterval(interval);
                        }
                        attempts++;
                        if (attempts > 50) clearInterval(interval);
                    }, 50);
                }
                return;
            }

            const btnReferral = event.target.closest('[data-action="quick-action-referral"]');
            if (btnReferral) {
                const phone = btnReferral.dataset.phone;
                this._recordDecisionTelemetry('clicked', {
                    instanceId: btnReferral.dataset.instanceId,
                    decisionType: 'referral_activation',
                    title: 'Contactar ahora',
                    ctaRoute: 'whatsapp',
                });

                const link = generarWhatsappLink({
                    phone,
                    message: 'Hola, te contacto de parte de...'
                });
                window.open(link, '_blank');
                return;
            }

            const btnCartera = event.target.closest('[data-action="quick-action-cartera"]');
            if (btnCartera) {
                const client = btnCartera.dataset.client;
                this._recordDecisionTelemetry('clicked', {
                    instanceId: btnCartera.dataset.instanceId,
                    decisionType: 'cartera_urgency',
                    title: 'Dar seguimiento',
                    ctaRoute: 'cartera',
                });

                Navigation.navigate('cartera');

                if (client) {
                    let attempts = 0;
                    const interval = setInterval(() => {
                        const input = document.getElementById('cartera-search');
                        if (input) {
                            input.value = client;
                            input.dispatchEvent(new Event('input', { bubbles: true }));
                            clearInterval(interval);
                        }
                        attempts++;
                        if (attempts > 50) clearInterval(interval);
                    }, 50);
                }
                return;
            }

            const btnFeedback = event.target.closest('[data-action="decision-feedback"]');
            if (btnFeedback) {
                const type = btnFeedback.dataset.decisionType;
                const title = btnFeedback.dataset.decisionTitle;
                const feedback = btnFeedback.dataset.feedback;
                const instanceId = btnFeedback.dataset.instanceId;
                const voteId = instanceId || `${type}:${title}`;

                if (this._votedDecisions.has(voteId)) return;

                this._votedDecisions.add(voteId);
                this._recordDecisionTelemetry('feedback', {
                    instanceId: instanceId,
                    decisionType: type,
                    title: title,
                    feedback: feedback
                });

                const container = btnFeedback.closest('.feedback-container');
                if (container) {
                    container.innerHTML = `<span style="font-size:11px;color:var(--color-success);font-weight:600;display:flex;align-items:center;gap:4px;">✨ Gracias por tu retroalimentación.</span>`;
                }
                return;
            }
        };

        root.addEventListener('click', clickHandler);
        Memory.add(() => root.removeEventListener('click', clickHandler));
    },

    /**
     * Guarda evidencia local de uso del Decision Cockpit.
     * @param {'shown'|'clicked'|'feedback'|'outcome_detected'} eventName
     * @param {Object} decision
     */
    _recordDecisionTelemetry(eventName, decision = {}) {
        const eventId = `decision_${eventName}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

        DB.guardar('logs', {
            id: eventId,
            type: 'decision_telemetry',
            event: eventName,
            instanceId: decision.instanceId || 'unknown',
            decisionType: decision.decisionType || 'unknown',
            decisionTitle: decision.title || '',
            ctaRoute: decision.ctaRoute || '',
            feedback: decision.feedback || null,
            outcome: decision.outcome || null,
            confidence: decision.confidence || null,
            timestamp: new Date().toISOString(),
        }).catch(err => {
            Logger.warn('[Dashboard] decision telemetry failed:', err?.message || err);
        });
    },

    /**
     * Detecta resoluciones de decisiones previas basándose en datos actuales.
     * @param {{ historial:Array, referidos:Array, cartera:Array }} currentData
     */
    async _detectOutcomes({ historial, referidos, cartera }) {
        try {
            const logs = await DB.obtenerTodos('logs');
            const telemetry = logs.filter(l => l.type === 'decision_telemetry');

            const shown = telemetry
                .filter(t => t.event === 'shown')
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .slice(0, 30); // Analizar las últimas 30 recomendaciones

            const alreadyDetected = new Set(
                telemetry.filter(t => t.event === 'outcome_detected').map(t => t.instanceId)
            );

            const now = new Date();

            for (const dec of shown) {
                if (alreadyDetected.has(dec.instanceId) || dec.instanceId === 'unknown') continue;

                const ageMs = now - new Date(dec.timestamp);
                let resolved = false;
                let confidence = 'level_0';

                // 1. Activity Gap (24h)
                if (dec.decisionType === 'activity_gap' && ageMs <= 86400000) {
                    const kpi = DashboardCalculator.productividad(historial);
                    if (kpi.faltantes <= 0) {
                        resolved = true;
                        confidence = 'level_3'; // State transition: Gap closed
                    }
                }
                // 2. Referrals (7 days)
                else if (dec.decisionType === 'referral_activation' && ageMs <= 604800000) {
                    // Si el referido que disparó la recomendación ya no está en "Nuevo"
                    // o no es el candidato principal actual (inferencia ligera)
                    const candidates = (referidos || []).filter(ref => ['Nuevo', 'Seguimiento'].includes(ref?.estado));
                    const stillNuevo = candidates.some(ref => dec.decisionTitle.includes(ref.nombre) && ref.estado === 'Nuevo');
                    if (!stillNuevo && dec.decisionTitle.includes('referido')) {
                        resolved = true;
                        confidence = 'level_2'; // Behavioral: No longer in "new" state
                    }
                }
                // 3. Cartera (72h)
                else if (dec.decisionType === 'cartera_urgency' && ageMs <= 259200000) {
                    // Si el cliente ya no tiene la alerta que disparó la decisión
                    const urgencies = (cartera || []).map(p => DashboardCalculator._scoreCarteraUrgency(p));
                    const stillUrgent = urgencies.some(u => dec.decisionTitle.includes(u.label));
                    if (!stillUrgent) {
                        resolved = true;
                        confidence = 'level_2'; // Behavioral: Risk signal cleared
                    }
                }

                if (resolved) {
                    const outcomeData = {
                        instanceId: dec.instanceId,
                        decisionType: dec.decisionType,
                        title: dec.decisionTitle,
                        outcome: 'resolved',
                        confidence: confidence
                    };

                    this._recordDecisionTelemetry('outcome_detected', outcomeData);

                    // Trigger micro-celebration for newly detected outcome
                    RenderEngine.schedule(() => {
                        DashboardView.showCelebration(outcomeData);
                    });
                }
            }
        } catch (err) {
            Logger.warn('[Dashboard] Outcome detection skipped:', err?.message || err);
        }
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

            // — Detectar resoluciones de recomendaciones previas (outcome intelligence)
            await this._detectOutcomes({ historial, referidos, cartera });

            const decisions = DashboardCalculator.decisionCockpit({
                historial,
                referidos,
                cartera,
            });

            decisions.forEach(decision => {
                this._recordDecisionTelemetry('shown', decision);
            });

            // — Obtener evidencia reciente para el timeline
            const logs = await DB.obtenerTodos('logs');
            const outcomes = logs
                .filter(l => l.type === 'decision_telemetry' && l.event === 'outcome_detected')
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            const kpi = DashboardCalculator.productividad(historial);
            const brief = DashboardCalculator.generateDailyBrief(decisions, outcomes, kpi);
            const analytics = DashboardCalculator.calculateAnalytics(logs);

            // — Hidratar DOM via RenderEngine (batched, RAF-scheduled)
            RenderEngine.batch([
                () => DashboardView.renderSaludo(nombre),
                () => DashboardView.renderDailyBrief(brief),
                () => DashboardView.renderKpiPuntos(kpi.puntos),
                () => DashboardView.renderDecisionCockpit(decisions),
                () => DashboardView.renderEvidenceTimeline(outcomes),
                () => DashboardView.renderAnalytics(analytics),
            ]);

            // — Notificar al sistema que el dashboard cargó correctamente
            EventBus.emit('dashboard:loaded', {
                puntosSemanales: kpi.puntos,
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

            <!-- Resumen del día -->
            <div class="card" style="border-left:4px solid var(--color-primary) !important; padding: 16px !important;">
                <h2 style="font-size:11px; text-transform:uppercase; letter-spacing:0.5px; color:var(--text-tertiary); margin-bottom:8px;">Resumen del día</h2>
                <div id="dash-daily-brief">
                    <div class="skeleton-text skeleton-shimmer" style="width:95%;"></div>
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

            <!-- Evidencia Forge -->
            <div class="card" style="background:rgba(52,199,89,0.03);border:1px dashed var(--color-success);">
                <h2 style="font-size:15px;margin-bottom:10px;color:var(--color-success);">🛡️ Evidencia Forge</h2>
                <div id="dash-evidence-timeline">
                    <div class="skeleton-text skeleton-shimmer" style="width:70%;"></div>
                </div>
            </div>

            <!-- Impacto Forge -->
            <div class="card" style="background:rgba(0,122,255,0.02);border:1px solid rgba(0,122,255,0.1);">
                <h2 style="font-size:15px;margin-bottom:10px;color:var(--color-primary);">⚡ Impacto Forge</h2>
                <div id="dash-analytics">
                    <div class="skeleton-text skeleton-shimmer" style="width:50%;"></div>
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
