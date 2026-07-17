// platform/routing/route-registry.js
// Compatibility-safe route registry factory.

export function createRouteRegistry({
    dashboardLoader,
    pipelineLoader,
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
}) {
    return {
        dashboard: {
            load:       dashboardLoader,
            renderName: 'renderDashboard',
            bindName:   'bindDashboardEvents',
        },
        'advisor-sales-pipeline': {
            load: pipelineLoader,
            renderName: 'renderAdvisorSalesPipeline',
            bindName: 'bindAdvisorSalesPipeline',
            routeId: 'advisor-sales-pipeline',
            domain: 'ADVISOR_OS',
            moduleId: 'advisor-os.sales-pipeline.live-route.067g16',
            title: 'Pipeline',
            navigation: { mobile: true, desktop: true },
            deepLink: { supported: true, contexts: ['prospect', 'opportunity'] },
        },
        prospeccion: { render: renderProspeccion,  bind: bindProspeccionEvents  },
        referidos:   { render: renderReferidos,    bind: bindReferidosEvents    },
        actividad:   { render: renderActividad,    bind: bindActividadEvents    },
        cartera:     { render: renderCartera,      bind: bindCarteraEvents      },
        comisiones:  { render: renderComisiones,   bind: bindComisionesEvents   },
    };
}
