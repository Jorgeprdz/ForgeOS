import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRouteRegistry } from '../platform/routing/route-registry.js';

const pipelineLoader = async () => ({
    renderAdvisorSalesPipeline: () => '<main class="forge-pipeline"></main>',
    bindAdvisorSalesPipeline: async () => {},
});
const noop = () => '';
const registry = createRouteRegistry({
    dashboardLoader: async () => ({ renderDashboard: noop, bindDashboardEvents: noop }),
    pipelineLoader,
    renderProspeccion: noop,
    bindProspeccionEvents: noop,
    renderReferidos: noop,
    bindReferidosEvents: noop,
    renderActividad: noop,
    bindActividadEvents: noop,
    renderCartera: noop,
    bindCarteraEvents: noop,
    renderComisiones: noop,
    bindComisionesEvents: noop,
});

const route = registry['advisor-sales-pipeline'];
assert.ok(route, 'canonical Pipeline route exists');
assert.equal(route.routeId, 'advisor-sales-pipeline');
assert.equal(route.domain, 'ADVISOR_OS');
assert.equal(route.moduleId, 'advisor-os.sales-pipeline.live-route.067g16');
assert.deepEqual(route.navigation, { mobile: true, desktop: true });
assert.deepEqual(route.deepLink.contexts, ['prospect', 'opportunity']);
assert.equal(Object.keys(registry).filter(key => key.includes('pipeline')).length, 1);

const app = fs.readFileSync('app.js', 'utf8');
const shell = fs.readFileSync('platform/app/forge-app-shell.js', 'utf8');
const router = fs.readFileSync('platform/routing/enterprise-router.js', 'utf8');
const liveRoute = fs.readFileSync('advisor-os/sales-pipeline/pipeline-live-route.js', 'utf8');
const index = fs.readFileSync('index.html', 'utf8');
const dashboard = fs.readFileSync('dashboard.js', 'utf8');

assert.ok(app.includes("pipelineLoader: () => import('./advisor-os/sales-pipeline/pipeline-live-route.js')"));
assert.ok(app.includes('Navigation.navigate(target)'));
assert.ok(shell.includes('this.router.navigate(route, params)'));
assert.ok(shell.includes("window.addEventListener('popstate'"));
assert.ok(router.includes('history.pushState'));
assert.ok(router.includes("options.history === 'replace'"));
assert.ok(index.includes('data-target="advisor-sales-pipeline"'));
assert.ok(dashboard.includes("event.target.closest('[data-forge-route]')"));
assert.ok(liveRoute.includes("import('./pipeline-ui.js')"));
assert.ok(liveRoute.includes('ForgePipelineStageReadModel'));
assert.ok(liveRoute.includes('writerAvailable: false'));
assert.ok(!liveRoute.includes('setInterval'));
assert.ok(!liveRoute.includes('MutationObserver'));
assert.ok(!liveRoute.includes('localStorage'));
assert.ok(!liveRoute.includes('location.href'));

console.log('067G16 ADVISOR PIPELINE LIVE NAVIGATION CONTRACT: PASS');
