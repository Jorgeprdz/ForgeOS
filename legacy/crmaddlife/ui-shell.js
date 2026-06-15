// legacy/crmaddlife/ui-shell.js
// CRMAddlife compatibility UI shell helpers.

const _escapeHtml = (value) => {
    if (value === null || value === undefined) return '';
    return String(value)
        .replace(/&/g,  '&amp;')
        .replace(/</g,  '&lt;')
        .replace(/>/g,  '&gt;')
        .replace(/"/g,  '&quot;')
        .replace(/'/g,  '&#x27;');
};

const _hydrateHeader = (user) => {

    const nombre = user?.user_metadata?.full_name?.split(' ')[0] || 'Asesor';
    const avatar = user?.user_metadata?.avatar_url || '';

    const greetingEl = document.getElementById('header-greeting');
    const nameEl     = document.getElementById('header-name');
    const avatarEl   = document.getElementById('header-avatar');

    if (greetingEl) {
        const hora   = new Date().getHours();
        const saludo =
            hora >= 5  && hora < 12 ? 'Buenos días'   :
            hora >= 12 && hora < 19 ? 'Buenas tardes' :
                                      'Buenas noches';
        greetingEl.textContent = saludo;
    }

    if (nameEl) {
        nameEl.textContent = nombre;
    }

    if (avatarEl && avatar) {
        avatarEl.src           = avatar;
        avatarEl.style.display = 'block';
    }
};

export function showCrmAddlifeApp(user) {

    const nav    = document.getElementById('main-sidebar');
    const bubble = document.getElementById('ai-chat-bubble');

    if (nav)    nav.style.display    = '';
    if (bubble) bubble.style.display = '';

    _hydrateHeader(user);
}

export function renderCrmAddlifeLogin({ onLogin } = {}) {

    const appEl = document.getElementById('app-content');
    if (!appEl) return;

    appEl.innerHTML =
        `<div style="display:flex;flex-direction:column;align-items:center;` +
                    `justify-content:center;min-height:80vh;padding:32px;` +
                    `text-align:center;gap:20px;">` +
            `<div style="font-size:56px;">📊</div>` +
            `<h1 style="font-size:22px;font-weight:800;letter-spacing:-0.5px;">` +
                `CRM Addlife` +
            `</h1>` +
            `<p style="font-size:14px;color:var(--text-secondary);max-width:280px;">` +
                `Tu plataforma comercial para agentes de seguros` +
            `</p>` +
            `<button id="btn-login" ` +
                `style="display:flex;align-items:center;gap:10px;` +
                       `padding:14px 28px;border-radius:12px;` +
                       `background:var(--color-primary);color:white;` +
                       `border:none;font-size:15px;font-weight:600;` +
                       `cursor:pointer;box-shadow:0 4px 16px rgba(0,122,255,0.3);">` +
                `<span>Entrar con Google</span>` +
            `</button>` +
        `</div>`;

    const btnLogin = document.getElementById('btn-login');
    if (btnLogin && typeof onLogin === 'function') {
        btnLogin.addEventListener('click', () => {
            onLogin();
        }, { once: true });
    }
}

export function renderCrmAddlifeFatalError(error) {

    const appEl = document.getElementById('app-content');
    if (!appEl) return;

    appEl.innerHTML =
        `<div style="padding:32px;text-align:center;">` +
            `<div style="font-size:48px;margin-bottom:16px;">🚨</div>` +
            `<h2 style="margin-bottom:8px;">Error de arranque</h2>` +
            `<p style="color:var(--danger);font-size:13px;margin-bottom:20px;">` +
                `${_escapeHtml(error?.message || 'Error desconocido')}` +
            `</p>` +
            `<button ` +
                `onclick="location.reload()" ` +
                `style="padding:10px 24px;border-radius:8px;` +
                       `background:var(--color-primary);color:white;` +
                       `border:none;font-size:14px;font-weight:600;cursor:pointer;"` +
            `>Reintentar</button>` +
        `</div>`;
}
