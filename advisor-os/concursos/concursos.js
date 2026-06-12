import {
    calcularEstadoConcursos
} from '../../rule-packs/smnyl/smnyl-concursos-engine.js';

const state = {
    data: null
};

export function renderConcursos() {

    return `
        <div id="concursos-root">

            <div
                class="glass-widget"
                style="
                    padding:20px;
                    margin-bottom:20px;
                "
            >

                <h2
                    style="
                        margin:0 0 18px 0;
                        font-size:22px;
                        font-weight:800;
                    "
                >
                    🏆 Concursos SMNYL
                </h2>

                <div id="concursos-loading">
                    Calculando métricas...
                </div>

                <div id="concursos-dashboard"></div>

            </div>

        </div>
    `;
}

export async function bindConcursosEvents() {

    state.data =
        await calcularEstadoConcursos();

    renderDashboard();
}

function money(n = 0) {

    return new Intl.NumberFormat(
        'es-MX',
        {
            style: 'currency',
            currency: 'MXN',
            maximumFractionDigits: 0
        }
    ).format(n);
}

function card(
    title,
    value,
    color = '#007AFF'
) {

    return `
        <div
            class="glass-widget"
            style="
                padding:16px;
                border:1px solid ${color}25;
            "
        >

            <div
                style="
                    font-size:11px;
                    text-transform:uppercase;
                    color:var(--text-secondary);
                    margin-bottom:8px;
                "
            >
                ${title}
            </div>

            <div
                style="
                    font-size:26px;
                    font-weight:800;
                    color:${color};
                "
            >
                ${value}
            </div>

        </div>
    `;
}

function renderDashboard() {

    const root =
        document.getElementById(
            'concursos-dashboard'
        );

    if (!root || !state.data) return;

    document.getElementById(
        'concursos-loading'
    ).style.display = 'none';

    const d = state.data;

    root.innerHTML = `

        <div
            style="
                display:grid;
                grid-template-columns:1fr 1fr;
                gap:12px;
                margin-bottom:20px;
            "
        >

            ${card(
                'Producción Vida',
                money(d.resumen.produccionVida),
                '#007AFF'
            )}

            ${card(
                'Producción GMM',
                money(d.resumen.produccionGMM),
                '#34C759'
            )}

            ${card(
                'Renovación',
                money(d.resumen.renovacion),
                '#FF9500'
            )}

            ${card(
                'Bonos Totales',
                money(
                    d.resumen.bonos +
                    d.resumen.trainingAllowance
                ),
                '#AF52DE'
            )}

        </div>

        ${renderTrainingAllowance()}

        ${renderBonos()}

    `;
}

function renderTrainingAllowance() {

    const ta =
        state.data.trainingAllowance;

    return `
        <div
            class="glass-widget"
            style="
                padding:18px;
                margin-bottom:18px;
            "
        >

            <div
                style="
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    margin-bottom:16px;
                "
            >

                <h3
                    style="
                        margin:0;
                        font-size:17px;
                    "
                >
                    🎯 Training Allowance
                </h3>

                <div
                    class="status-badge"
                    style="
                        background:
                        ${
                            ta.elegible
                                ? 'rgba(52,199,89,0.15)'
                                : 'rgba(255,149,0,0.15)'
                        };

                        color:
                        ${
                            ta.elegible
                                ? '#34C759'
                                : '#FF9500'
                        };
                    "
                >
                    ${
                        ta.elegible
                            ? `Nivel ${ta.nivel}`
                            : 'Sin Elegibilidad'
                    }
                </div>

            </div>

            <div
                style="
                    display:grid;
                    grid-template-columns:1fr 1fr;
                    gap:12px;
                    margin-bottom:16px;
                "
            >

                ${miniMetric(
                    'Bono Base',
                    money(ta.bonoBase)
                )}

                ${miniMetric(
                    'Excedente',
                    money(ta.bonoExcedente)
                )}

                ${miniMetric(
                    'Cap',
                    money(ta.cap || 0)
                )}

                ${miniMetric(
                    'Total Estimado',
                    money(ta.total),
                    '#34C759'
                )}

            </div>

            ${
                !ta.elegible
                    ? `
                        <div
                            style="
                                font-size:13px;
                                color:var(--text-secondary);
                                line-height:1.6;
                            "
                        >

                            • Faltan
                            <strong>
                                ${money(
                                    ta.faltanteComision
                                )}
                            </strong>
                            de comisión acumulada

                            <br>

                            • Faltan
                            <strong>
                                ${ta.faltantePolizas}
                            </strong>
                            pólizas

                        </div>
                    `
                    : ''
            }

        </div>
    `;
}

function renderBonos() {

    const b =
        state.data.bonos;

    return `
        <div
            class="glass-widget"
            style="padding:18px;"
        >

            <h3
                style="
                    margin-top:0;
                    margin-bottom:18px;
                "
            >
                💰 Bonos Nuevos Profesionales
            </h3>

            ${bonusRow(
                'Bono Vida',
                b.vida
            )}

            ${bonusRow(
                'Bono GMM',
                b.gmm
            )}

            ${bonusRow(
                'Bono Renovación',
                b.renovacion
            )}

        </div>
    `;
}

function bonusRow(
    titulo,
    bono
) {

    return `
        <div
            style="
                padding:14px 0;
                border-bottom:
                1px solid rgba(255,255,255,0.08);
            "
        >

            <div
                style="
                    display:flex;
                    justify-content:space-between;
                    margin-bottom:6px;
                "
            >

                <strong>
                    ${titulo}
                </strong>

                <strong
                    style="
                        color:#34C759;
                    "
                >
                    ${money(bono.bono)}
                </strong>

            </div>

            <div
                style="
                    font-size:12px;
                    color:var(--text-secondary);
                "
            >

                ${
                    bono.alcanzado
                        ? 'Meta alcanzada'
                        : `Faltan ${money(bono.faltante)}`
                }

            </div>

        </div>
    `;
}

function mini