// platform/navigation-runtime.js
// Forge-owned navigation adapter.

let navigatorFn = null;
let currentRouteValue = null;
let legacyShim = null;

const listeners = new Set();

function notify(route, previousRoute, params) {
    listeners.forEach(listener => {
        try {
            listener({ route, previousRoute, params });
        } catch (err) {
            console.error('[NAVIGATION LISTENER ERROR]', err);
        }
    });
}

function setNavigator(fn) {
    if (typeof fn !== 'function') {
        throw new TypeError('Navigation.setNavigator requires a function');
    }

    navigatorFn = fn;
}

function navigate(route, params = {}) {
    if (typeof route !== 'string' || !route.trim()) {
        console.warn('[NAVIGATION] Invalid route', route);
        return Promise.resolve(false);
    }

    if (typeof navigatorFn !== 'function') {
        console.error('[NAVIGATION] No navigator registered');
        return Promise.resolve(false);
    }

    const targetRoute = route.trim();
    const previousRoute = currentRouteValue;

    return Promise
        .resolve(navigatorFn(targetRoute, params))
        .then(result => {
            currentRouteValue = targetRoute;
            notify(targetRoute, previousRoute, params);
            return result;
        });
}

function currentRoute() {
    return currentRouteValue;
}

function subscribe(listener) {
    if (typeof listener !== 'function') {
        return () => {};
    }

    listeners.add(listener);
    return () => unsubscribe(listener);
}

function unsubscribe(listener) {
    listeners.delete(listener);
}

function bindLegacyWindow() {
    if (typeof window === 'undefined') {
        return false;
    }

    if (!legacyShim) {
        legacyShim = (route, params) => navigate(route, params);
    }

    // Deprecated compatibility bridge for legacy route modules.
    window.navigateTo = legacyShim;

    return true;
}

function unbindLegacyWindow() {
    if (typeof window === 'undefined') {
        return false;
    }

    if (legacyShim && window.navigateTo === legacyShim) {
        delete window.navigateTo;
    }

    return true;
}

export const Navigation = {
    navigate,
    currentRoute,
    subscribe,
    unsubscribe,
    setNavigator,
    bindLegacyWindow,
    unbindLegacyWindow,
};
