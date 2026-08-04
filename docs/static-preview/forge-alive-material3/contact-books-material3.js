const ROOT_SELECTOR = '[data-forge-cartera-module]';
const PANEL_SELECTOR = '[data-contact-books-material3]';
const SOURCE_LAYOUT = import.meta.url.includes('/docs/static-preview/');
const moduleUrl = path => new URL(SOURCE_LAYOUT ? `../../../${path}` : `../../${path}`, import.meta.url).href;
let generation = 0;
let mountedOwnerId = null;
let demoReadOnly = null;

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const operationKey = () => `contact-books:ui:${crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`}`;
const mutationBlocked = () => document.documentElement.dataset.forgeDemoSession === 'active' && demoReadOnly !== false;

async function context() {
  const bootstrap = globalThis.ForgeProductiveProspectBootstrap067G17B;
  const user = (await bootstrap?.getUser?.())?.data?.user;
  if (!user?.id || typeof bootstrap?.getClient !== 'function') throw new Error('Inicia sesión para administrar tus libros.');
  return { user, client: await bootstrap.getClient() };
}

function styles() {
  if (document.querySelector('[data-contact-books-material3-styles]')) return;
  const style = document.createElement('style');
  style.dataset.contactBooksMaterial3Styles = 'true';
  style.textContent = `
    .contact-books-m3{margin:0 0 18px;padding:18px;border:1px solid rgba(170,199,255,.18);border-radius:20px;background:rgba(12,28,50,.88);color:#f6f3ff}
    .contact-books-m3__header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap}.contact-books-m3 h2,.contact-books-m3 p{margin:0}.contact-books-m3__header p{margin-top:6px;color:#b9c7db;font-size:13px}.contact-books-m3__actions{display:flex;gap:8px;flex-wrap:wrap}
    .contact-books-m3 button{min-height:44px;border:1px solid rgba(170,199,255,.28);border-radius:13px;padding:10px 14px;background:rgba(255,255,255,.07);color:inherit;font:800 13px/1.1 Inter,system-ui;cursor:pointer}.contact-books-m3 button[data-primary]{color:#c0fffa;border-color:rgba(82,230,223,.46);background:rgba(82,230,223,.13)}.contact-books-m3 button:disabled{opacity:.5;cursor:not-allowed}
    .contact-books-m3__list{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:9px;margin-top:14px}.contact-books-m3__book{padding:12px;border:1px solid rgba(170,199,255,.14);border-radius:14px;background:rgba(255,255,255,.04)}.contact-books-m3__book strong{display:block}.contact-books-m3__book span{display:block;margin-top:4px;color:#b9c7db;font-size:12px}.contact-books-m3__status{margin-top:12px;color:#b9c7db;font-size:13px;min-height:18px}
    .contact-books-m3 dialog{width:min(440px,calc(100vw - 28px));border:1px solid rgba(170,199,255,.25);border-radius:20px;padding:0;background:#10243b;color:#f6f3ff}.contact-books-m3 dialog::backdrop{background:rgba(2,8,18,.72)}.contact-books-m3 form{padding:20px}.contact-books-m3 label{display:grid;gap:7px;margin:16px 0}.contact-books-m3 input{min-height:46px;border:1px solid rgba(170,199,255,.28);border-radius:12px;padding:10px 12px;background:#0a1a2c;color:inherit;font:inherit}.contact-books-m3 menu{display:flex;justify-content:flex-end;gap:8px;padding:0;margin:18px 0 0}
    @media(max-width:640px){.contact-books-m3__header,.contact-books-m3__actions{display:grid;grid-template-columns:1fr;width:100%}.contact-books-m3 button{width:100%}}
  `;
  document.head.append(style);
}

function markup() {
  return `
    <div class="contact-books-m3__header">
      <div><p class="section-kicker accent">CONTACT BOOKS</p><h2>Libros de contactos</h2><p>Organiza identidades existentes sin duplicar personas.</p></div>
      <div class="contact-books-m3__actions"><button type="button" data-contact-books-bulk>Carga masiva</button><button type="button" data-contact-books-create data-primary>+ Nuevo libro</button></div>
    </div>
    <p class="contact-books-m3__status" data-contact-books-status role="status" aria-live="polite">Cargando libros…</p>
    <div class="contact-books-m3__list" data-contact-books-list></div>
    <dialog data-contact-books-dialog aria-labelledby="contact-books-dialog-title"><form method="dialog" data-contact-books-form><h3 id="contact-books-dialog-title">Nuevo libro</h3><label>Nombre<input name="name" maxlength="160" autocomplete="off" required></label><menu><button value="cancel">Cancelar</button><button type="submit" value="default" data-primary>Crear libro</button></menu></form></dialog>`;
}

function showBooks(panel, books) {
  const list = panel.querySelector('[data-contact-books-list]');
  list.innerHTML = books.length ? books.map(book => `<article class="contact-books-m3__book"><strong>${escapeHtml(book.name)}</strong><span>${Number(book.memberCount || 0)} miembros</span></article>`).join('') : '';
  panel.querySelector('[data-contact-books-status]').textContent = books.length ? `${books.length} libros activos` : 'Aún no tienes libros. Crea el primero cuando lo necesites.';
}

async function bind(panel) {
  const startedGeneration = generation;
  const { user, client } = await context();
  if (startedGeneration !== generation) return;
  mountedOwnerId = user.id;
  const [{ createContactBooksRuntime }, { createContactBooksSupabaseRepository }] = await Promise.all([
    import(moduleUrl('advisor-os/contact-books/contact-books-runtime.js')),
    import(moduleUrl('advisor-os/contact-books/contact-books-supabase-repository.js')),
  ]);
  const repository = createContactBooksSupabaseRepository({
    client,
    userId: user.id,
    getCurrentUserId: () => mountedOwnerId,
    getGeneration: () => generation,
  });
  const runtime = createContactBooksRuntime({ repository });
  const refresh = async () => showBooks(panel, await runtime.listBooks({ ownerId: user.id }));
  await refresh();

  const dialog = panel.querySelector('[data-contact-books-dialog]');
  const form = panel.querySelector('[data-contact-books-form]');
  panel.querySelector('[data-contact-books-create]').addEventListener('click', () => {
    if (mutationBlocked()) return;
    form.dataset.idempotencyKey = operationKey();
    dialog.showModal();
    form.elements.name.focus();
  });
  panel.querySelector('[data-contact-books-bulk]').addEventListener('click', () => {
    panel.dispatchEvent(new CustomEvent('forge:contact-books-bulk-import-requested', { bubbles: true, detail: { ownerId: user.id } }));
    panel.querySelector('[data-contact-books-status]').textContent = 'Abriendo el flujo canónico de carga masiva…';
  });
  form.addEventListener('submit', async event => {
    if (event.submitter?.value === 'cancel') return;
    event.preventDefault();
    const button = form.querySelector('[type="submit"][data-primary]');
    button.disabled = true;
    try {
      const result = await runtime.createBook({ ownerId: user.id, name: form.elements.name.value, idempotencyKey: form.dataset.idempotencyKey });
      if (result.book?.status === 'CONFLICT' || result.book?.status === 'REJECTED') throw new Error('Ya existe un libro activo con ese nombre.');
      dialog.close();
      form.reset();
      await refresh();
    } catch (error) {
      panel.querySelector('[data-contact-books-status]').textContent = error.message || 'No pudimos guardar el libro.';
    } finally { button.disabled = false; }
  });
}

async function mount() {
  styles();
  const root = document.querySelector(ROOT_SELECTOR);
  if (!root || ['auth-required','signed-out'].includes(root.dataset.carteraMaterial3State)) return;
  let panel = root.querySelector(PANEL_SELECTOR);
  if (!panel) {
    panel = document.createElement('section');
    panel.className = 'contact-books-m3';
    panel.dataset.contactBooksMaterial3 = 'true';
    panel.innerHTML = markup();
    const policy = root.querySelector('[data-cartera-policy-entry]');
    policy ? policy.after(panel) : root.prepend(panel);
    if (mutationBlocked()) panel.querySelectorAll('button').forEach(button => { button.disabled = true; });
    bind(panel).catch(error => { panel.querySelector('[data-contact-books-status]').textContent = error.message || 'No pudimos cargar tus libros.'; });
  }
}

function scrub() {
  generation += 1;
  mountedOwnerId = null;
  document.querySelector(PANEL_SELECTOR)?.remove();
}

globalThis.addEventListener('forge:auth-state-changed', event => {
  if (event.detail?.status !== 'authenticated') scrub();
  else { scrub(); mount(); }
});
globalThis.addEventListener('forge:demo-session-classified', event => {
  demoReadOnly = event.detail?.isDemo === true ? event.detail?.readOnly !== false : false;
  scrub();
  mount();
});
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
else mount();
