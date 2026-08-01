const iconPaths = Object.freeze({
  home: "m12 3 9 8h-2v9h-5v-6h-4v6H5v-9H3l9-8Z",
  pipeline: "M4 19h3V9H4v10Zm6 0h4V4h-4v15Zm7 0h3v-7h-3v7Z",
  activity: "M3 12h4l2-6 4 12 2-6h6v2h-4.5L13 22 9 10l-.5 4H3v-2Z",
  quotes: "M7 2h7l5 5v15H5V2h2Zm7 2H7v16h10V8h-3V4Zm-5 8h6v2H9v-2Zm0 4h6v2H9v-2Z",
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
]);

export function resolveForgeRoute(location = window.location) {
  const url = new URL(location.href);
  const requested = url.searchParams.get("nav")?.toLowerCase();
  const normalized = requested === "cotizaciones" ? "quotes" : requested;
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
