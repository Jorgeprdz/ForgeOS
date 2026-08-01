// app.js
// ENTERPRISE APPLICATION CORE
// Production Ready PWA/WPA Architecture
// ─────────────────────────────────────────────────────────────────────────────
// RESPONSABILIDADES:
//   - Inicialización de Supabase (AuthService)
//   - Autenticación Google OAuth
//   - Enrutamiento SPA (EnterpriseRouter)
//   - Bootstrap del ciclo de vida de la app (AppManager)
//   - Hidratación del header tras auth
//   - Listeners globales: navegación, logout, tema, chat
//
// FLUJO DE ARRANQUE:
//   DOMContentLoaded
//     → AppManager.init()
//       → AppShell.showLoader()        (spinner mientras arranca)
//       → AuthService.init()           (crea cliente Supabase)
//       → DB.init()                    (inicializa IndexedDB)
//       → Core.init()                  (infraestructura enterprise)
//       → AuthService.getUser()        (pone user en AppState)
//         → SI usuario: _showApp() → router.navigate('dashboard')
//         → SI no:      _showLogin()
//       → AppShell.hideLoader()        (oculta spinner siempre)
// ─────────────────────────────────────────────────────────────────────────────

console.log(
    '%cAPP V7 ENTERPRISE',
    'color:#007AFF;font-weight:bold;font-size:12px;'
);

// ═══════════════════════════════════════════════════════════════
// IMPORTS
// ═══════════════════════════════════════════════════════════════

import { getSupabase } from './supabase-runtime.js';

import { renderProspeccion, bindProspeccionEvents  } from './prospeccion.js';
import { renderReferidos,   bindReferidosEvents    } from './referidos.js';
import { renderActividad,   bindActividadEvents    } from './actividad.js';
import { renderCartera,     bindCarteraEvents      } from './cartera.js';
import { bindCartera030dPolicyPaymentCalendar } from './advisor-os/cartera/cartera-030d-policy-payment-calendar-enhancement.js';
import { bindCartera040RelationshipMemory } from './advisor-os/cartera/cartera-040d-relationship-memory-enhancement.js';
import { bindCartera050FutureRadar } from './advisor-os/cartera/cartera-050d-future-radar-enhancement.js';
import { bindCartera060RelationshipGrowth } from './advisor-os/cartera/cartera-060d-relationship-growth-enhancement.js';
import { renderComisiones,  bindComisionesEvents   } from './comisiones.js';

import { EventBus }     from './event-system.js';
import { bootstrapApp } from './platform/app/bootstrap.js';
import { ForgeAppShell } from './platform/app/forge-app-shell.js';
import { AuthService } from './platform/auth/auth-service.js';
import { EnterpriseRouter } from './platform/routing/enterprise-router.js';
import { createRouteRegistry } from './platform/routing/route-registry.js';
import { Navigation } from './platform/navigation-runtime.js';
import { Logger }       from './logger.js';
import { bindPlatformRuntimeListeners } from './platform/app/runtime-listeners.js';
import { bindCrmAddlifeChatShell } from './legacy/crmaddlife/chat-shell.js';
import { bindCrmAddlifeThemeToggle } from './legacy/crmaddlife/ui-listeners.js';
import {
    showCrmAddlifeApp,
    renderCrmAddlifeLogin,
    renderCrmAddlifeFatalError,
} from './legacy/crmaddlife/ui-shell.js';

function bindCarteraProductEvents() {
    bindCartera030dPolicyPaymentCalendar();
    bindCartera040RelationshipMemory();
    bindCartera050FutureRadar();
    bindCartera060RelationshipGrowth();
    return bindCarteraEvents();
}

// ═══════════════════════════════════════════════════════════════
// APP MANAGER
// Orquesta el ciclo de vida completo de la aplicación.
// ═══════════════════════════════════════════════════════════════

class AppManager {

    constructor() {
        this.auth   = new AuthService();
        this.router = new EnterpriseRouter({
            routes: createRouteRegistry({
                dashboardLoader: () => import('./dashboard.js'),
                pipelineLoader: () => import('./advisor-os/sales-pipeline/pipeline-live-route.js'),
                renderProspeccion,
                bindProspeccionEvents,
                renderReferidos,
                bindReferidosEvents,
                renderActividad,
                bindActividadEvents,
                renderCartera,
                bindCarteraEvents: bindCarteraProductEvents,
                renderComisiones,
                bindComisionesEvents,
            }),
        });
        this.shell = new ForgeAppShell({
            auth: this.auth,
            router: this.router,
            ui: {
                showApp: user => this._showApp(user),
                showLogin: () => this._showLogin(),
                showFatalError: err => this._showFatalError(err),
                bindGlobalListeners: () => this._bindGlobalListeners()
            }
        });
    }

    async init() {
        return this.shell.init();
    }

    _showApp(user) {
        showCrmAddlifeApp(user);
    }

    _showLogin() {
        renderCrmAddlifeLogin({
            onLogin: () => this.auth.login(),
        });
    }

    _showFatalError(err) {
        renderCrmAddlifeFatalError(err);
    }

    _bindGlobalListeners() {
        const nav = document.getElementById('main-sidebar');
        if (nav) {
            nav.addEventListener('click', (e) => {
                const btn = e.target.closest('.nav-btn[data-target]');
                if (!btn) return;
                const target = btn.dataset.target;
                if (target) Navigation.navigate(target);
            });
        }

        const btnLogout = document.getElementById('btn-cerrar-sesion');
        if (btnLogout) {
            btnLogout.addEventListener('click', () => {
                this.auth.logout();
            });
        }

        bindCrmAddlifeThemeToggle({
            onThemeChanged: payload => EventBus.emit('theme:changed', payload),
        });

        bindCrmAddlifeChatShell();
        bindPlatformRuntimeListeners();
        Logger.info('[APP] Global listeners registrados');
    }

}

export { getSupabase };

const _appInstance = new AppManager();

bootstrapApp(() => {
    _appInstance.init();
});
