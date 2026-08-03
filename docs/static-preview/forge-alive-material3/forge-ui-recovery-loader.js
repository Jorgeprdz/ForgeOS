const selector = '[data-forge-ui-recovery-styles]';
const loaderUrl = new URL(import.meta.url);
const version = loaderUrl.searchParams.get('v') || 'forge-ui-recovery-001';
const expectedHref = new URL(
  `./forge-ui-recovery.css?v=${encodeURIComponent(version)}`,
  import.meta.url,
).href;

let stylesheet = document.querySelector(selector);
if (!stylesheet) {
  stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.dataset.forgeUiRecoveryStyles = 'true';
  document.head.append(stylesheet);
}
stylesheet.href = expectedHref;

let moving = false;
const keepRecoveryLast = () => {
  if (
    moving
    || !stylesheet.isConnected
    || stylesheet === document.head.lastElementChild
  ) {
    return;
  }
  moving = true;
  document.head.append(stylesheet);
  queueMicrotask(() => {
    moving = false;
  });
};

const observer = new MutationObserver(keepRecoveryLast);
observer.observe(document.head, { childList: true });
queueMicrotask(keepRecoveryLast);
globalThis.addEventListener('pagehide', () => observer.disconnect(), { once: true });

document.documentElement.dataset.forgeUiRecoveryLoader = version;
