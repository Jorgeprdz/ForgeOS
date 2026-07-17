// platform/routing/enterprise-router.js
// Forge route lifecycle coordinator.

import { AppState } from '../../state-manager.js';
import { EventBus } from '../../event-system.js';
import { Lifecycle } from '../../module-lifecycle.js';
import { RenderEngine } from '../../ui-render-engine.js';
import { Analytics } from '../../analytics-engine.js';
import { ErrorHandler } from '../../error-boundary.js';

const _escapeHtml = (value) => {
    if (value === null || value === undefined) return '';
    return String(value)
        .replace(/&/g,  '&amp;')
        .replace(/</g,  '&lt;')
        .replace(/>/g,  '&gt;')
        .replace(/"/g,  '&quot;')
        .replace(/'/g,  '&#x27;');
};

export class EnterpriseRouter {
    constructor({ routes } = {}) {
        this.currentRoute = null;
        this.routes = routes || {};
    }

    async _resolveRouteModule(route, descriptor) {

        if (
            typeof descriptor?.render === 'function' &&
            typeof descriptor?.bind   === 'function'
        ) {
            return descriptor;
        }

        if (typeof descriptor?.load !== 'function') {
            throw new Error(`Ruta inválida: ${_escapeHtml(route)}`);
        }

        const loaded = await descriptor.load();
        const render = loaded?.[descriptor.renderName];
        const bind   = loaded?.[descriptor.bindName];

        if (typeof render !== 'function' || typeof bind !== 'function') {
            throw new Error(`Contrato de ruta inválido: ${_escapeHtml(route)}`);
        }

        return { render, bind };
    }

    async navigate(route, params = {}, options = {}) {

        try {

            // Evitar re-navegación a la ruta activa
            if (this.currentRoute === route && !params.contextType && !params.contextId) return true;

            const descriptor = this.routes[route];

            if (!descriptor) {
                throw new Error(`Ruta inválida: ${_escapeHtml(route)}`);
            }

            const appEl = document.getElementById('app-content');

            if (!appEl) {
                throw new Error('#app-content missing');
            }

            AppState.set('loading', true);

            // 1. Destruir módulo anterior — limpia Memory, AbortControllers,
            //    suscripciones a AppState, timers
            await Lifecycle.destroyAll();

            const module = await this._resolveRouteModule(route, descriptor);

            // 2. Renderizar template HTML estático del nuevo módulo
            //    Via RAF-scheduled para evitar layout thrashing
            await new Promise(resolve => {
                RenderEngine.schedule(() => {
                    appEl.innerHTML = module.render(params);
                    resolve();
                });
            });

            // 3. Montar nuevo módulo — bind events, cargar datos async
            await Lifecycle.mount(route, {
                mount: async () => {
                    await module.bind(params);
                },
            });

            this.currentRoute = route;

            AppState.set('route', route);

            this.updateNav(route);

            if (options.history === 'replace') {
                history.replaceState({ route }, '', '#' + route);
            } else if (options.history !== 'none') {
                history.pushState({ route }, '', '#' + route);
            }

            Analytics.track('route_change', { route });

            EventBus.emit('route:changed', { route });

            return true;

        } catch (err) {

            ErrorHandler.capture(err);
            this._renderError(err);
            return false;

        } finally {

            AppState.set('loading', false);
        }
    }

    updateNav(route) {

        document.querySelectorAll('.nav-btn').forEach(btn => {

            btn.classList.remove('active');

            if (btn.dataset.target === route) {
                btn.classList.add('active');
            }
        });
    }

    _renderError(err) {

        const appEl = document.getElementById('app-content');
        if (!appEl) return;

        // err.message sanitizado — puede contener HTML si viene de Supabase o red
        appEl.innerHTML =
            `<div style="padding:32px;text-align:center;">` +
                `<div style="font-size:62px;margin-bottom:12px;">⚠️</div>` +
                `<h2>Error crítico</h2>` +
                `<p style="color:var(--danger);margin-top:8px;">` +
                    `${_escapeHtml(err?.message || 'Error desconocido')}` +
                `</p>` +
                `<button ` +
                    `onclick="location.reload()" ` +
                    `style="margin-top:20px;padding:10px 24px;border-radius:8px;` +
                           `background:var(--color-primary);color:white;border:none;` +
                           `font-size:14px;font-weight:600;cursor:pointer;"` +
                `>Reintentar</button>` +
            `</div>`;
    }
}
