/*
|--------------------------------------------------------------------------
| Dashboard Executive UI
|--------------------------------------------------------------------------
|
| Renderiza:
| - KPIs
| - Forecast
| - Health Score
| - IA
| - Pipeline
|
|--------------------------------------------------------------------------
*/

import {
    ejecutarSistemaOperativo
} from './smnyl-operating-system-engine.js';

let dashboardData = null;

export async function renderDashboardExecutive({

    cartera = [],

    prospectos = [],

    concursos = {},

    produccionActual = 0,

    produccionAnterior = 0

}) {

    dashboardData =
        ejecutarSistemaOperativo({

            cartera,

            prospectos,

            concursos,

            produccionActual,

            produccionAnterior
        });

    return `

        <div
            id="executive-dashboard"
            class="executive-dashboard"
        >

            ${renderHero()}

            ${renderKPIs()}

            ${renderHealth()}

            ${renderForecast()}

            ${renderAgenda()}

        </div>
    `;
}

function renderHero() {

    return `
        <div
            class="hero-glow-card"
        >

            <div
                class="hero-glow"
            ></div>

            <h1>
                Operating System
            </h1>

            <p>
                Inteligencia comercial activa
            </p>

        </div>
    `;
}

function renderKPIs() {

    const kpis =
        dashboardData.dashboard.kpis;

    return `
        <div class="kpi-grid">

            <div class="kpi-card">
                <span>Persistencia</span>
                <strong>
                    ${kpis.persistencia}%
                </strong>
            </div>

            <div class="kpi-card">
                <span>Retención</span>
                <strong>
                    ${kpis.retencion}%
                </strong>
            </div>

        </div>
    `;
}

function renderHealth() {

    const health =
        dashboardData
        .dashboard
        .health;

    return `
        <div class="health-card">

            <span>
                Health Score
            </span>

            <strong>
                ${health.score}
            </strong>

            <small>
                ${health.estado}
            </small>

        </div>
    `;
}

function renderForecast() {

    const forecast =
        dashboardData
        .dashboard
        .forecast;

    return `
        <div class="forecast-card">

            <span>
                Forecast Mensual
            </span>

            <strong>
                $${forecast.forecast}
            </strong>

        </div>
    `;
}

function renderAgenda() {

    const agenda =
        dashboardData.agenda;

    return `
        <div class="agenda-card">

            <h3>
                Agenda IA
            </h3>

            ${
                agenda.map(item => `

                    <div
                        class="agenda-item"
                    >

                        <strong>
                            ${item.hora}
                        </strong>

                        <span>
                            ${item.bloque}
                        </span>

                    </div>

                `).join('')
            }

        </div>
    `;
}