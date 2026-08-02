import "./quote-runtime-printable-presence-guard-m05w002.js?v=m05w-002-shared-presence";

const VERSION = "M05W-001";
const STYLE_MARKER = "data-m05w001-printable-modal-layer";

function installLayerContract() {
  if (document.querySelector(`[${STYLE_MARKER}]`)) return false;
  const style = document.createElement("style");
  style.setAttribute(STYLE_MARKER, "true");
  style.textContent = `
    [data-m05e005-printable-modal] {
      z-index: 2147483003 !important;
    }

    body.forge-printable-modal-open-m05e005
      .forge-auth-floating-avatar-067g17b1 {
      display: none !important;
      pointer-events: none !important;
    }
  `;
  document.head.append(style);
  document.documentElement.dataset.printableModalLayer = VERSION;
  document.documentElement.dataset.printableModalAuthIsolation = "ready";
  return true;
}

installLayerContract();

globalThis.ForgePrintableModalLayerM05W001 = Object.freeze({
  version: VERSION,
  install: installLayerContract,
});

export { VERSION, installLayerContract };
