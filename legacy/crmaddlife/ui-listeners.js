// legacy/crmaddlife/ui-listeners.js
// CRMAddlife compatibility UI listeners.

export function bindCrmAddlifeThemeToggle({ onThemeChanged } = {}) {

    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    const savedTheme = localStorage.getItem('crm-theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.checked = true;
    }

    themeToggle.addEventListener('change', (e) => {
        const isDark = e.target.checked;
        document.documentElement.setAttribute(
            'data-theme',
            isDark ? 'dark' : 'light'
        );
        localStorage.setItem('crm-theme', isDark ? 'dark' : 'light');

        if (typeof onThemeChanged === 'function') {
            onThemeChanged({ dark: isDark });
        }
    });
}
