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

import { showToast }    from './utils.js';
import { getSupabase } from './supabase-runtime.js';

import { renderProspeccion, bindProspeccionEvents  } from './prospeccion.js';
import { renderReferidos,   bindReferidosEvents    } from './referidos.js';
import { renderActividad,   bindActividadEvents    } from './actividad.js';
import { renderCartera,     bindCarteraEvents      } from './cartera.js';
import { renderComisiones,  bindComisionesEvents   } from './comisiones.js';

import { AppState }     from './state-manager.js';
import { EventBus }     from './event-system.js';
import { SyncEngine }   from './platform/sync/sync-orchestrator.js';
import { bootstrapApp } from './platform/app/bootstrap.js';
import { ForgeAppShell } from './platform/app/forge-app-shell.js';
import { AuthService } from './platform/auth/auth-service.js';
import { EnterpriseRouter } from './platform/routing/enterprise-router.js';
import { createRouteRegistry } from './platform/routing/route-registry.js';
import { ErrorHandler } from './error-boundary.js';
import { Logger }       from './logger.js';
import { bindCrmAddlifeChatShell } from './legacy/crmaddlife/chat-shell.js';
import {
    showCrmAddlifeApp,
    renderCrmAddlifeLogin,
    renderCrmAddlifeFatalError,
} from './legacy/crmaddlife/ui-shell.js';

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
                renderProspeccion,
                bindProspeccionEvents,
                renderReferidos,
                bindReferidosEvents,
                renderActividad,
                bindActividadEvents,
                renderCartera,
                bindCarteraEvents,
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

    // ─────────────────────────────────────────────────────────
    // INIT — Bootstrap principal
    // ─────────────────────────────────────────────────────────

    async init() {
        return this.shell.init();
    }

    // ─────────────────────────────────────────────────────────
    // _showApp — Revela la UI tras autenticación exitosa
    // ─────────────────────────────────────────────────────────

    _showApp(user) {
        showCrmAddlifeApp(user);
    }

    // ─────────────────────────────────────────────────────────
    // _showLogin — Pantalla de bienvenida para usuarios no auth
    // ─────────────────────────────────────────────────────────

    _showLogin() {
        renderCrmAddlifeLogin({
            onLogin: () => this.auth.login(),
        });
    }

    // ─────────────────────────────────────────────────────────
    // _showFatalError — Bootstrap falló, mostrar error recuperable
    // ─────────────────────────────────────────────────────────

    _showFatalError(err) {
        renderCrmAddlifeFatalError(err);
    }

    // ─────────────────────────────────────────────────────────
    // _bindGlobalListeners
    // Registrado UNA SOLA VEZ después de auth exitosa.
    // Delegación de eventos en nav para evitar re-registro
    // en cada navegación de ruta.
    // ─────────────────────────────────────────────────────────

    _bindGlobalListeners() {

        // ── Navegación inferior — delegación sobre el contenedor nav
        const nav = document.getElementById('main-sidebar');
        if (nav) {
            nav.addEventListener('click', (e) => {
                const btn = e.target.closest('.nav-btn[data-target]');
                if (!btn) return;
                const target = btn.dataset.target;
                if (target) this.router.navigate(target);
            });
        }

        // ── Logout
        const btnLogout = document.getElementById('btn-cerrar-sesion');
        if (btnLogout) {
            btnLogout.addEventListener('click', () => {
                this.auth.logout();
            });
        }

        // ── Toggle tema dark/light
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {

            // Restaurar preferencia guardada en localStorage
            const savedTheme = localStorage.getItem('crm-theme');
            if (savedTheme === 'dark') {
                document.documentElement.setAttribute('data-theme', 'dark');
                themeToggle.checked = true;
            }

            themeToggle.addEventListener('change', (e) => {
                const isDark = e.target.checked;
                document.documentElement.setAttribute(
                    'data-theme',
                    isDark ? 'dark' : 'light'
                );
                localStorage.setItem('crm-theme', isDark ? 'dark' : 'light');
                EventBus.emit('theme:changed', { dark: isDark });
            });
        }

        bindCrmAddlifeChatShell();

        // ── Online / Offline
        window.addEventListener('online', () => {
            AppState.set('online', true);
            EventBus.emit('network:online');
            Logger.info('[NETWORK] Online');
            showToast('Conexión restaurada', 'success');
            if (typeof SyncEngine?.sync === 'function') {
                SyncEngine.sync().catch(err => {
                    Logger.warn('[SYNC] Error al sincronizar tras reconexión:', err);
                });
            }
        });

        window.addEventListener('offline', () => {
            AppState.set('online', false);
            EventBus.emit('network:offline');
            Logger.warn('[NETWORK] Offline');
            showToast('Sin conexión — modo offline', 'warning');
        });

        // ── Errores globales no capturados
        window.addEventListener('unhandledrejection', (e) => {
            Logger.error('[UNHANDLED REJECTION]', e.reason);
            ErrorHandler.capture(e.reason || new Error('Unhandled Promise rejection'));
        });

        window.addEventListener('error', (e) => {
            Logger.error('[GLOBAL ERROR]', e.error);
            ErrorHandler.capture(e.error || new Error(e.message));
        });

        Logger.info('[APP] Global listeners registrados');
    }

}

// ═══════════════════════════════════════════════════════════════
// EXPORT getSupabase
// Compatibilidad con módulos legacy pendientes de migración.
// Los módulos ya migrados leen el usuario desde AppState.get('user').
// TODO: eliminar cuando todos los módulos estén migrados.
// ═══════════════════════════════════════════════════════════════

export { getSupabase };

// ═══════════════════════════════════════════════════════════════
// BOOTSTRAP
// DOMContentLoaded garantiza que el HTML está completamente
// parseado antes de acceder a cualquier elemento del DOM.
// ═══════════════════════════════════════════════════════════════

const _appInstance = new AppManager();

bootstrapApp(() => {
    _appInstance.init();
});
