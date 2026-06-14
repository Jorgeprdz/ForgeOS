// platform/app/forge-app-shell.js
// Forge runtime shell coordinator.

import { DB } from '../../db.js';
import { Core } from '../../core-app-engine.js';
import { Navigation } from '../navigation-runtime.js';
import { SyncEngine } from '../sync/sync-orchestrator.js';
import { Analytics } from '../../analytics-engine.js';
import { ErrorHandler } from '../../error-boundary.js';
import { Logger } from '../../logger.js';
import { AppShell } from '../../app-shell-manager.js';

export class ForgeAppShell {
    constructor({
        auth,
        router,
        ui
    }) {
        this.auth = auth;
        this.router = router;
        this.ui = ui;

        Navigation.setNavigator((route, params) => this.router.navigate(route));
        Navigation.bindLegacyWindow();
    }

    async init() {
        AppShell.showLoader('Iniciando CRM...');

        try {
            Logger.info('[APP] Bootstrap iniciado');

            this.auth.init();

            await DB.init();

            if (typeof Core?.init === 'function') {
                await Core.init();
            }

            Analytics.init();
            ErrorHandler.init();

            AppShell.showLoader('Verificando sesión...');

            const user = await this.auth.getUser();

            if (user) {
                Logger.info('[APP] Usuario autenticado:', user.email);
                Analytics.track('session_restored', { userId: user.id });

                this.ui.showApp(user);
                this.ui.bindGlobalListeners();

                const hashRoute = window.location.hash.replace('#', '').trim();
                const initialRoute = this.router.routes[hashRoute]
                    ? hashRoute
                    : 'dashboard';

                AppShell.showLoader('Cargando...');

                await this.router.navigate(initialRoute);

                if (typeof SyncEngine?.start === 'function') {
                    SyncEngine.start().catch(err => {
                        Logger.warn('[SYNC] Error al arrancar:', err);
                    });
                }

                Logger.info('[APP] Bootstrap completo');
            } else {
                Logger.info('[APP] Sin sesión — mostrando login');
                this.ui.showLogin();
            }
        } catch (err) {
            Logger.error('[APP INIT ERROR]', err);
            ErrorHandler.capture(err);
            this.ui.showFatalError(err);
        } finally {
            AppShell.hideLoader();
        }
    }
}
