const iconPaths = Object.freeze({
  home: "m12 3 9 8h-2v9h-5v-6h-4v6H5v-9H3l9-8Z",
  pipeline: "M4 19h3V9H4v10Zm6 0h4V4h-4v15Zm7 0h3v-7h-3v7Z",
  activity: "M3 12h4l2-6 4 12 2-6h6v2h-4.5L13 22 9 10l-.5 4H3v-2Z",
  quotes: "M7 2h7l5 5v15H5V2h2Zm7 2H7v16h10V8h-3V4Zm-5 8h6v2H9v-2Zm0 4h6v2H9v-2Z",
  cartera: "M8 3h8a2 2 0 0 1 2 2v2h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2V5a2 2 0 0 1 2-2Zm0 4h8V5H8v2Zm-4 4v8h16v-8h-5v2H9v-2H4Zm7 0h2V9h-2v2Z",
  income: "M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm1 3v1.1c1.7.3 3 1.3 3 2.9h-2c0-.7-.8-1.2-2-1.2s-2 .5-2 1.2c0 .8.8 1.1 2.4 1.5 2 .5 3.6 1.2 3.6 3.2 0 1.7-1.3 2.8-3 3.2V20h-2v-1.1c-2-.3-3.3-1.5-3.3-3.2h2c0 .9.9 1.5 2.3 1.5 1.3 0 2-.5 2-1.3 0-.8-.8-1.2-2.5-1.6-2-.5-3.5-1.2-3.5-3.1 0-1.6 1.2-2.8 3-3.1V7h2Z",
});

export const FORGE_NAVIGATION_ITEMS = Object.freeze([
  Object.freeze({
    id: "home",
    routeId: "inicio",
    target: "?nav=inicio",
    label: "Inicio",
    icon: "home",
    iconPath: iconPaths.home,
    accessibilityLabel: "Ir a Inicio",
    availability: "available",
    order: 10,
  }),
  Object.freeze({
    id: "pipeline",
    routeId: "pipeline",
    target: "?nav=pipeline",
    label: "Pipeline",
    icon: "pipeline",
    iconPath: iconPaths.pipeline,
    accessibilityLabel: "Ir a Pipeline",
    availability: "available",
    order: 20,
  }),
  Object.freeze({
    id: "activity",
    routeId: "actividad",
    target: "?nav=actividad",
    label: "Actividad",
    icon: "activity",
    iconPath: iconPaths.activity,
    accessibilityLabel: "Ir a Actividad",
    availability: "available",
    order: 30,
  }),
  Object.freeze({
    id: "quotes",
    routeId: "quotes",
    target: "?nav=cotizaciones",
    label: "Cotizaciones",
    icon: "quotes",
    iconPath: iconPaths.quotes,
    accessibilityLabel: "Abrir Cotizaciones",
    availability: "available",
    order: 40,
  }),
  Object.freeze({
    id: "cartera",
    routeId: "cartera",
    target: "?nav=cartera",
    label: "Cartera",
    icon: "cartera",
    iconPath: iconPaths.cartera,
    accessibilityLabel: "Abrir Cartera",
    availability: "available",
    order: 50,
  }),
  Object.freeze({
    id: "income",
    routeId: "comisiones",
    target: "?nav=comisiones",
    label: "Comisiones",
    icon: "income",
    iconPath: iconPaths.income,
    accessibilityLabel: "Abrir Comisiones",
    availability: "available",
    order: 60,
  }),
]);

const CONTEXTUAL_ROUTES = Object.freeze(new Set(["persona"]));

export function resolveForgeRoute(location = window.location) {
  const url = new URL(location.href);
  const requested = url.searchParams.get("nav")?.toLowerCase();
  const normalized = requested === "cotizaciones" ? "quotes" : requested;
  if (CONTEXTUAL_ROUTES.has(normalized)) return normalized;
  const matched = FORGE_NAVIGATION_ITEMS.find(
    (item) => item.routeId === normalized,
  );
  return matched?.availability === "available"
    ? matched.routeId
    : "inicio";
}

export function navigationItems() {
  return [...FORGE_NAVIGATION_ITEMS].sort(
    (first, second) => first.order - second.order,
  );
}
