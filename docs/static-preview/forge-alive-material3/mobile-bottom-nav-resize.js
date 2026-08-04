const CONTRACT_ID = "FORGE_MOBILE_BOTTOM_NAV_RESIZE_V1";
const STYLE_SELECTOR = "[data-mobile-bottom-nav-resize-styles]";

function install() {
  if (document.querySelector(STYLE_SELECTOR)) return;

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = new URL(
    "./mobile-bottom-nav-resize.css?v=mobile-bottom-nav-resize-001",
    import.meta.url,
  ).href;
  link.dataset.mobileBottomNavResizeStyles = CONTRACT_ID;
  document.head.append(link);
  document.documentElement.dataset.mobileBottomNavResize = CONTRACT_ID;
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", install, { once: true });
} else {
  install();
}
