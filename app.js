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
import { Lifecycle }    from './module-lifecycle.js';
import { RenderEngine } from './ui-render-engine.js';
import { SyncEngine }   from './platform/sync/sync-orchestrator.js';
import { bootstrapApp } from './platform/app/bootstrap.js';
import { ForgeAppShell } from './platform/app/forge-app-shell.js';
import { AuthService } from './platform/auth/auth-service.js';
import { Analytics }    from './analytics-engine.js';
import { ErrorHandler } from './error-boundary.js';
import { Logger }       from './logger.js';

// ═══════════════════════════════════════════════════════════════
// SANITIZADOR LOCAL
// Protege cualquier dato externo antes de inyectarlo al DOM.
// Usado en renderError, _showFatalError y _handleChatSend.
// ═══════════════════════════════════════════════════════════════

const _escapeHtml = (value) => {
    if (value === null || value === undefined) return '';
    return String(value)
        .replace(/&/g,  '&amp;')
        .replace(/</g,  '&lt;')
        .replace(/>/g,  '&gt;')
        .replace(/"/g,  '&quot;')
        .replace(/'/g,  '&#x27;');
};

// ═══════════════════════════════════════════════════════════════
// ENTERPRISE ROUTER
// ═══════════════════════════════════════════════════════════════

class EnterpriseRouter {

    constructor() {

        this.currentRoute = null;

        this.routes = {
            dashboard: {
                load:       () => import('./dashboard.js'),
                renderName: 'renderDashboard',
                bindName:   'bindDashboardEvents',
            },
            prospeccion: { render: renderProspeccion,  bind: bindProspeccionEvents  },
            referidos:   { render: renderReferidos,    bind: bindReferidosEvents    },
            actividad:   { render: renderActividad,    bind: bindActividadEvents    },
            cartera:     { render: renderCartera,      bind: bindCarteraEvents      },
            comisiones:  { render: renderComisiones,   bind: bindComisionesEvents   },
        };
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

    async navigate(route) {

        try {

            // Evitar re-navegación a la ruta activa
            if (this.currentRoute === route) return;

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
            RenderEngine.schedule(() => {
                appEl.innerHTML = module.render();
            });

            // 3. Montar nuevo módulo — bind events, cargar datos async
            await Lifecycle.mount(route, {
                mount: async () => {
                    await module.bind();
                },
            });

            this.currentRoute = route;

            AppState.set('route', route);

            this.updateNav(route);

            history.replaceState({}, '', '#' + route);

            Analytics.track('route_change', { route });

            EventBus.emit('route:changed', { route });

        } catch (err) {

            ErrorHandler.capture(err);
            this._renderError(err);

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

// ═══════════════════════════════════════════════════════════════
// APP MANAGER
// Orquesta el ciclo de vida completo de la aplicación.
// ═══════════════════════════════════════════════════════════════

class AppManager {

    constructor() {
        this.auth   = new AuthService();
        this.router = new EnterpriseRouter();
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

        const nav    = document.getElementById('main-sidebar');
        const bubble = document.getElementById('ai-chat-bubble');

        if (nav)    nav.style.display    = '';
        if (bubble) bubble.style.display = '';

        this._hydrateHeader(user);
    }

    // ─────────────────────────────────────────────────────────
    // _hydrateHeader — Rellena nombre y avatar en el header
    // Usa textContent y src — nunca innerHTML con datos de usuario
    // ─────────────────────────────────────────────────────────

    _hydrateHeader(user) {

        const nombre = user?.user_metadata?.full_name?.split(' ')[0] || 'Asesor';
        const avatar = user?.user_metadata?.avatar_url || '';

        const greetingEl = document.getElementById('header-greeting');
        const nameEl     = document.getElementById('header-name');
        const avatarEl   = document.getElementById('header-avatar');

        if (greetingEl) {
            const hora   = new Date().getHours();
            const saludo =
                hora >= 5  && hora < 12 ? 'Buenos días'   :
                hora >= 12 && hora < 19 ? 'Buenas tardes' :
                                          'Buenas noches';
            greetingEl.textContent = saludo;
        }

        if (nameEl) {
            nameEl.textContent = nombre;
        }

        if (avatarEl && avatar) {
            avatarEl.src           = avatar;
            avatarEl.style.display = 'block';
        }
    }

    // ─────────────────────────────────────────────────────────
    // _showLogin — Pantalla de bienvenida para usuarios no auth
    // ─────────────────────────────────────────────────────────

    _showLogin() {

        const appEl = document.getElementById('app-content');
        if (!appEl) return;

        appEl.innerHTML =
            `<div style="display:flex;flex-direction:column;align-items:center;` +
                        `justify-content:center;min-height:80vh;padding:32px;` +
                        `text-align:center;gap:20px;">` +
                `<div style="font-size:56px;">📊</div>` +
                `<h1 style="font-size:22px;font-weight:800;letter-spacing:-0.5px;">` +
                    `CRM Addlife` +
                `</h1>` +
                `<p style="font-size:14px;color:var(--text-secondary);max-width:280px;">` +
                    `Tu plataforma comercial para agentes de seguros` +
                `</p>` +
                `<button id="btn-login" ` +
                    `style="display:flex;align-items:center;gap:10px;` +
                           `padding:14px 28px;border-radius:12px;` +
                           `background:var(--color-primary);color:white;` +
                           `border:none;font-size:15px;font-weight:600;` +
                           `cursor:pointer;box-shadow:0 4px 16px rgba(0,122,255,0.3);">` +
                    `<span>Entrar con Google</span>` +
                `</button>` +
            `</div>`;

        // { once: true } — el listener se auto-elimina tras el primer click
        const btnLogin = document.getElementById('btn-login');
        if (btnLogin) {
            btnLogin.addEventListener('click', () => {
                this.auth.login();
            }, { once: true });
        }
    }

    // ─────────────────────────────────────────────────────────
    // _showFatalError — Bootstrap falló, mostrar error recuperable
    // ─────────────────────────────────────────────────────────

    _showFatalError(err) {

        const appEl = document.getElementById('app-content');
        if (!appEl) return;

        appEl.innerHTML =
            `<div style="padding:32px;text-align:center;">` +
                `<div style="font-size:48px;margin-bottom:16px;">🚨</div>` +
                `<h2 style="margin-bottom:8px;">Error de arranque</h2>` +
                `<p style="color:var(--danger);font-size:13px;margin-bottom:20px;">` +
                    `${_escapeHtml(err?.message || 'Error desconocido')}` +
                `</p>` +
                `<button ` +
                    `onclick="location.reload()" ` +
                    `style="padding:10px 24px;border-radius:8px;` +
                           `background:var(--color-primary);color:white;` +
                           `border:none;font-size:14px;font-weight:600;cursor:pointer;"` +
                `>Reintentar</button>` +
            `</div>`;
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

        // ── Chat bubble — abrir ventana
        const chatBubble = document.getElementById('ai-chat-bubble');
        const chatWindow = document.getElementById('ai-chat-window');

        if (chatBubble && chatWindow) {
            chatBubble.addEventListener('click', () => {
                chatWindow.classList.add('chat-window-open');
                chatBubble.style.display = 'none';
                const input = document.getElementById('ai-chat-input');
                if (input) input.focus();
            });
        }

        // ── Chat — cerrar ventana
        const closeChat = document.getElementById('close-chat');
        if (closeChat && chatWindow && chatBubble) {
            closeChat.addEventListener('click', () => {
                chatWindow.classList.remove('chat-window-open');
                chatBubble.style.display = '';
            });
        }

        // ── Chat — enviar (botón)
        const sendBtn = document.getElementById('ai-chat-send');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => {
                this._handleChatSend();
            });
        }

        // ── Chat — enviar (Enter)
        const chatInput = document.getElementById('ai-chat-input');
        if (chatInput) {
            chatInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this._handleChatSend();
                }
            });
        }

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

    // ─────────────────────────────────────────────────────────
    // _handleChatSend
    // UI básica del chat. La integración real con el modelo AI
    // se implementará en Phase 3 (ai-engine.js).
    // ─────────────────────────────────────────────────────────

    _handleChatSend() {

        const input    = document.getElementById('ai-chat-input');
        const messages = document.getElementById('ai-chat-messages');

        if (!input || !messages) return;

        const text = input.value.trim();
        if (!text) return;

        // Mensaje del usuario — sanitizado antes de ir al DOM
        const userRow = document.createElement('div');
        userRow.className = 'msg-row user-row';
        userRow.innerHTML =
            `<div class="chat-bubble user-bubble">${_escapeHtml(text)}</div>`;
        messages.appendChild(userRow);

        input.value = '';
        messages.scrollTop = messages.scrollHeight;

        Analytics.track('chat_message_sent');

        // Placeholder hasta Phase 3
        setTimeout(() => {
            const iaRow = document.createElement('div');
            iaRow.className = 'msg-row ia-row';
            iaRow.innerHTML =
                `<div class="chat-bubble ia-bubble">` +
                    `Procesando tu consulta... (AI engine Phase 3)` +
                `</div>`;
            messages.appendChild(iaRow);
            messages.scrollTop = messages.scrollHeight;
        }, 600);
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
