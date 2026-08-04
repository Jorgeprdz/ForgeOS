const sourceLayout = import.meta.url.includes('/docs/static-preview/');
const envBase = new URL(sourceLayout ? '../../../' : '../../', import.meta.url);
const moduleBase = new URL('./', import.meta.url);
const advisorBase = new URL(sourceLayout ? '../../../advisor-os/sales-pipeline/' : '../../advisor-os/sales-pipeline/', import.meta.url);

async function load(path, base) {
  return import(new URL(path, base));
}

try {
  await load('env.js', envBase);
  await load('forge-alive-public-config-067g17a1.js', moduleBase);
  await load('productive-prospect-bootstrap.js', advisorBase);
  await load('forge-alive-auth-entry-067g17b1.js', moduleBase);

  if (!globalThis.ForgeAliveAuthEntry067G17B1) {
    throw new Error('EARLY_AUTH_ENTRY_REQUIRED');
  }
  document.documentElement.dataset.forgeEarlyAuthBootstrap = 'ready';
} catch (error) {
  document.documentElement.dataset.forgeEarlyAuthBootstrap = 'failed';
  console.error('[FORGE EARLY AUTH]', error);
  if (!document.querySelector('[data-forge-early-auth-error]')) {
    const message = document.createElement('p');
    message.dataset.forgeEarlyAuthError = 'true';
    message.setAttribute('role', 'alert');
    message.textContent = 'No se pudo iniciar el acceso a ForgeOS. Recarga la página o inténtalo más tarde.';
    document.body.prepend(message);
  }
}
