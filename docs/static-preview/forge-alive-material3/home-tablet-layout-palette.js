const CONTRACT_ID = "FORGE_HOME_TABLET_LAYOUT_PALETTE_V1";
const HOME_SELECTOR = "[data-forge-home-module]";
const OPPORTUNITY_SELECTOR = ":scope > .opportunities[data-home-live-opportunities]";
const STYLE_SELECTOR = "[data-home-tablet-layout-palette-styles]";

function injectStyles() {
  if (document.querySelector(STYLE_SELECTOR)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = new URL(
    "./home-tablet-layout-palette.css?v=home-tablet-layout-palette-001",
    import.meta.url,
  ).href;
  link.dataset.homeTabletLayoutPaletteStyles = CONTRACT_ID;
  document.head.append(link);
}

function reconcileHomeSurface() {
  const root = document.querySelector(HOME_SELECTOR);
  if (!root) return false;
  root.dataset.homeTabletLayoutPalette = CONTRACT_ID;

  const opportunities = root.querySelector(OPPORTUNITY_SELECTOR);
  if (opportunities) {
    opportunities.hidden = false;
    opportunities.removeAttribute("hidden");
    opportunities.removeAttribute("aria-hidden");
  }
  return Boolean(opportunities);
}

function install() {
  injectStyles();
  reconcileHomeSurface();

  const observer = new MutationObserver(() => {
    reconcileHomeSurface();
  });
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["data-home-live-opportunities", "hidden", "aria-hidden"],
  });

  globalThis.addEventListener("pagehide", () => observer.disconnect(), { once: true });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", install, { once: true });
} else {
  install();
}
