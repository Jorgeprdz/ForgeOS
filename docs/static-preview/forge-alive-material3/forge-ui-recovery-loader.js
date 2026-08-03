const selector = '[data-forge-ui-recovery-styles]';
const loaderUrl = new URL(import.meta.url);
const version = loaderUrl.searchParams.get('v') || 'forge-ui-recovery-001';
const expectedHref = new URL(
  `./forge-ui-recovery.css?v=${encodeURIComponent(version)}`,
  import.meta.url,
).href;

let stylesheet = document.querySelector(selector);
let stylesheetReady = Boolean(stylesheet?.sheet);
let moving = false;

const keepRecoveryLast = () => {
  if (
    !stylesheetReady
    || moving
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

const markReady = () => {
  stylesheetReady = true;
  document.documentElement.dataset.forgeUiRecoveryStyles = 'ready';
  queueMicrotask(keepRecoveryLast);
};

const markFailed = () => {
  stylesheetReady = false;
  document.documentElement.dataset.forgeUiRecoveryStyles = 'failed';
};

if (!stylesheet) {
  stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.dataset.forgeUiRecoveryStyles = 'true';
}

stylesheet.addEventListener('load', markReady, { once: true });
stylesheet.addEventListener('error', markFailed, { once: true });
if (stylesheet.href !== expectedHref) stylesheet.href = expectedHref;
if (!stylesheet.isConnected) document.head.append(stylesheet);
if (stylesheet.sheet) markReady();

const observer = new MutationObserver(keepRecoveryLast);
observer.observe(document.head, { childList: true });
globalThis.addEventListener('pagehide', () => observer.disconnect(), { once: true });

document.documentElement.dataset.forgeUiRecoveryLoader = version;
