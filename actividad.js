// actividad.js
// Enterprise Activity Module

import { DB } from './db.js';

import { AI } from './ai-service.js';

import { EventBus } from './event-system.js';

import { Memory } from './memory-manager.js';

import { showToast } from './utils.js';

const BAREMO = {

    referidos: 3,

    llamadas: 1,

    citas_agendadas: 3,

    citas_conectadas: 2,

    citas_cierre: 3,

    solicitudes: 5,

    pagadas: 10
};

const DEFAULT_STATE = {

    referidos: 0,

    llamadas: 0,

    citas_agendadas: 0,

    citas_conectadas: 0,

    citas_cierre: 0,

    solicitudes: 0,

    pagadas: 0
};

const ActivityState = {

    current: structuredClone(
        DEFAULT_STATE
    ),

    weekly: [],

    mounted: false,

    saving: false,

    aiRequestId: null
};

function getLocalDate() {

    const now = new Date();

    const offset =
        now.getTimezoneOffset();

    const local =
        new Date(
            now.getTime() -
            offset * 60000
        );

    return local
        .toISOString()
        .split('T')[0];
}

export function renderActividad() {

    return `
        <div id="actividad-root">

            <div
                class="glass-widget"
                style="
                    padding:20px;
                    margin-bottom:16px;
                "
            >

                <div
                    style="
                        display:flex;
                        justify-content:space-between;
                        align-items:center;
                    "
                >

                    <div>

                        <h2
                            style="
                                margin:0;
                                font-size:22px;
                                font-weight:800;
                            "
                        >
                            Dashboard Diario
                        </h2>

                        <p
                            style="
                                margin-top:6px;
                                color:var(--text-secondary);
                                font-size:13px;
                            "
                        >
                            Actividad comercial diaria
                        </p>

                    </div>

                    <button
                        id="btn-save-actividad"
                        class="btn-primary"
                    >
                        Sincronizar
                    </button>

                </div>

            </div>

            <div
                class="glass-widget"
                style="
                    padding:24px;
                    text-align:center;
                    margin-bottom:16px;
                    background:
                        linear-gradient(
                            135deg,
                            rgba(0,122,255,0.95),
                            rgba(0,86,179,0.95)
                        );
                    color:white;
                "
            >

                <div
                    style="
                        font-size:12px;
                        font-weight:700;
                        opacity:0.8;
                        text-transform:uppercase;
                        letter-spacing:1px;
                    "
                >
                    Puntos oficiales
                </div>

                <div
                    id="act-total-points"
                    style="
                        font-size:54px;
                        font-weight:900;
                        margin-top:10px;
                        line-height:1;
                    "
                >
                    0
                </div>

            </div>

            <div
                id="actividad-grid"
                style="
                    display:grid;
                    grid-template-columns:
                        repeat(2,1fr);
                    gap:12px;
                    margin-bottom:18px;
                "
            >

                ${Object.keys(BAREMO)
                    .map(key => {

                        return `
                            <div
                                class="glass-widget"
                                style="
                                    padding:14px;
                                "
                            >

                                <div
                                    style="
                                        display:flex;
                                        flex-direction:column;
                                        gap:12px;
                                    "
                                >

                                    <div>

                                        <div
                                            style="
                                                font-size:11px;
                                                text-transform:uppercase;
                                                color:var(--text-secondary);
                                                font-weight:700;
                                            "
                                        >
                                            ${key.replaceAll('_', ' ')}
                                        </div>

                                        <div
                                            style="
                                                margin-top:4px;
                                                font-size:11px;
                                                opacity:0.7;
                                            "
                                        >
                                            ${BAREMO[key]} pts
                                        </div>

                                    </div>

                                    <div
                                        style="
                                            display:flex;
                                            justify-content:space-between;
                                            align-items:center;
                                        "
                                    >

                                        <strong
                                            id="val-${key}"
                                            style="
                                                font-size:28px;
                                                font-weight:800;
                                            "
                                        >
                                            0
                                        </strong>

                                        <div
                                            style="
                                                display:flex;
                                                gap:6px;
                                            "
                                        >

                                            <button
                                                class="activity-btn"
                                                data-action="dec"
                                                data-key="${key}"
                                            >
                                                −
                                            </button>

                                            <button
                                                class="activity-btn"
                                                data-action="inc"
                                                data-key="${key}"
                                            >
                                                +
                                            </button>

                                        </div>

                                    </div>

                                </div>

                            </div>
                        `;
                    })
                    .join('')}

            </div>

            <div
                class="glass-widget"
                style="
                    padding:16px;
                    margin-bottom:16px;
                "
            >

                <div
                    style="
                        display:flex;
                        align-items:center;
                        gap:8px;
                        margin-bottom:10px;
                    "
                >

                    <span>🧠</span>

                    <strong>
                        Coach IA
                    </strong>

                </div>

                <div
                    id="ai-activity-tip"
                    style="
                        color:var(--text-secondary);
                        font-size:13px;
                        line-height:1.5;
                    "
                >
                    Sincroniza tu actividad para generar recomendaciones.
                </div>

            </div>

            <div
                class="glass-widget"
                style="
                    padding:16px;
                "
            >

                <h3
                    style="
                        margin-top:0;
                        margin-bottom:14px;
                    "
                >
                    Conversiones
                </h3>

                <div
                    id="actividad-kpis"
                ></div>

            </div>

        </div>
    `;
}

export async function bindActividadEvents() {

    ActivityState.mounted = true;

    await loadActivity();

    const root =
        document.getElementById(
            'actividad-root'
        );

    if (!root) {

        return;
    }

    const clickHandler =
        async e => {

            const btn =
                e.target.closest(
                    '.activity-btn'
                );

            if (btn) {

                const key =
                    btn.dataset.key;

                const action =
                    btn.dataset.action;

                updateMetric(
                    key,
                    action === 'inc'
                        ? 1
                        : -1
                );

                return;
            }

            if (
                e.target.id ===
                'btn-save-actividad'
            ) {

                await saveActivity();
            }
        };

    root.addEventListener(
        'click',
        clickHandler
    );

    Memory.add(() => {

        root.removeEventListener(
            'click',
            clickHandler
        );

        ActivityState.mounted =
            false;

        if (
            ActivityState.aiRequestId
        ) {

            AI.abort(
                ActivityState.aiRequestId
            );
        }
    });
}

async function loadActivity() {

    try {

        const today =
            getLocalDate();

        const data =
            await DB.obtenerTodos(
                'actividad_diaria'
            );

        const current =
            data.find(
                x => x.id === today
            );

        ActivityState.current =
            current
                ? {
                    ...DEFAULT_STATE,
                    ...current
                }
                : structuredClone(
                    DEFAULT_STATE
                );

        ActivityState.weekly =
            data;

        renderAll();

    } catch (err) {

        console.error(err);

        showToast(
            'Error cargando actividad',
            'danger'
        );
    }
}

function updateMetric(
    key,
    delta
) {

    if (!(key in BAREMO)) {

        return;
    }

    const current =
        ActivityState.current[key] || 0;

    ActivityState.current[key] =
        Math.max(
            0,
            current + delta
        );

    renderTotals();

    renderKPIs();

    EventBus.emit(
        'actividad:updated',
        {
            state:
                ActivityState.current
        }
    );
}

function renderAll() {

    renderTotals();

    renderKPIs();
}

function renderTotals() {

    let total = 0;

    Object.keys(BAREMO)
        .forEach(key => {

            total +=
                (
                    ActivityState
                        .current[key] || 0
                ) * BAREMO[key];

            const el =
                document.getElementById(
                    `val-${key}`
                );

            if (el) {

                el.textContent =
                    ActivityState
                        .current[key];
            }
        });

    const totalEl =
        document.getElementById(
            'act-total-points'
        );

    if (totalEl) {

        totalEl.textContent =
            total;
    }
}

function renderKPIs() {

    const weekly = {

        ...DEFAULT_STATE
    };

    ActivityState.weekly
        .forEach(item => {

            Object.keys(DEFAULT_STATE)
                .forEach(key => {

                    weekly[key] +=
                        item[key] || 0;
                });
        });

    const ratio =
        (a, b) => {

            if (!b) {

                return '0%';
            }

            return (
                (
                    a / b
                ) * 100
            ).toFixed(0) + '%';
        };

    const html = `
        <div
            class="kpi-row"
        >
            <span>
                Referidos → Llamadas
            </span>

            <strong>
                ${ratio(
                    weekly.llamadas,
                    weekly.referidos
                )}
            </strong>
        </div>

        <div
            class="kpi-row"
        >
            <span>
                Llamadas → Citas
            </span>

            <strong>
                ${ratio(
                    weekly.citas_agendadas,
                    weekly.llamadas
                )}
            </strong>
        </div>

        <div
            class="kpi-row"
        >
            <span>
                Solicitudes → Pagadas
            </span>

            <strong>
                ${ratio(
                    weekly.pagadas,
                    weekly.solicitudes
                )}
            </strong>
        </div>
    `;

    const container =
        document.getElementById(
            'actividad-kpis'
        );

    if (container) {

        container.innerHTML =
            html;
    }
}

async function saveActivity() {

    if (
        ActivityState.saving
    ) {

        return;
    }

    ActivityState.saving = true;

    const saveBtn =
        document.getElementById(
            'btn-save-actividad'
        );

    if (saveBtn) {

        saveBtn.disabled = true;

        saveBtn.textContent =
            'Sincronizando...';
    }

    try {

        const today =
            getLocalDate();

        const payload = {

            id: today,

            ...ActivityState.current,

            updatedAt:
                Date.now()
        };

        const existing =
            ActivityState.weekly.find(
                x => x.id === today
            );

        if (existing) {

            await DB.actualizar(
                'actividad_diaria',
                today,
                payload
            );

        } else {

            await DB.guardar(
                'actividad_diaria',
                payload
            );

            ActivityState.weekly.push(
                payload
            );
        }

        showToast(
            'Actividad sincronizada',
            'success'
        );

        EventBus.emit(
            'actividad:saved',
            payload
        );

        await generateAITip();

    } catch (err) {

        console.error(err);

        showToast(
            'Error sincronizando',
            'danger'
        );

    } finally {

        ActivityState.saving = false;

        if (saveBtn) {

            saveBtn.disabled = false;

            saveBtn.textContent =
                'Sincronizar';
        }
    }
}

async function generateAITip() {

    const target =
        document.getElementById(
            'ai-activity-tip'
        );

    if (!target) {

        return;
    }

    target.innerHTML =
        '⚙️ Analizando productividad...';

    const requestId =
        crypto.randomUUID();

    ActivityState.aiRequestId =
        requestId;

    const prompt = `
        Eres un coach comercial elite.

        Referidos:
        ${ActivityState.current.referidos}

        Llamadas:
        ${ActivityState.current.llamadas}

        Citas:
        ${ActivityState.current.citas_agendadas}

        Pagadas:
        ${ActivityState.current.pagadas}

        Da una recomendación:
        corta,
        profesional,
        accionable,
        máximo 14 palabras.
    `;

    const result =
        await AI.generate({

            prompt,

            requestId,

            cacheKey:
                JSON.stringify(
                    ActivityState.current
                )
        });

    if (
        !ActivityState.mounted
    ) {

        return;
    }

    target.textContent =
        result.text;
}