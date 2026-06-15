// platform/routing/route-registry.js
// Compatibility-safe route registry factory.

export function createRouteRegistry({
    dashboardLoader,
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
        prospeccion: { render: renderProspeccion,  bind: bindProspeccionEvents  },
        referidos:   { render: renderReferidos,    bind: bindReferidosEvents    },
        actividad:   { render: renderActividad,    bind: bindActividadEvents    },
        cartera:     { render: renderCartera,      bind: bindCarteraEvents      },
        comisiones:  { render: renderComisiones,   bind: bindComisionesEvents   },
    };
}
