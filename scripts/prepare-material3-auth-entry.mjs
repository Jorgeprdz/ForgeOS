import { readFile, writeFile } from 'node:fs/promises';

const indexPath = new URL('../docs/static-preview/forge-alive-material3/index.html', import.meta.url);
let index = await readFile(indexPath, 'utf8');

for (const required of [
  'tokens.css?v=ui-m03-approved-001',
  'app.css?v=ui-m03-approved-004',
  'data-forge-application',
]) {
  if (!index.includes(required)) throw new Error(`MATERIAL3_ENTRY_REQUIRED_${required}`);
}

index = index.replace(
  '<html lang="es-MX" data-forge-theme="dark">',
  '<html lang="es-MX" data-forge-theme="dark" data-forge-auth-boundary="resolving">',
);

const failClosed = `
  <style data-forge-auth-first-paint="FORGE_AUTH_FIRST_PAINT_FAIL_CLOSED_V1">
    html:not([data-forge-auth-boundary="authenticated"]) [data-forge-module-viewport],
    html:not([data-forge-auth-boundary="authenticated"]) [data-forge-shell-controls],
    html:not([data-forge-auth-boundary="authenticated"]) [data-forge-alfred-sheet] {
      display: none !important;
      visibility: hidden !important;
      pointer-events: none !important;
    }
    [data-forge-early-auth-error] {
      box-sizing: border-box;
      max-width: 34rem;
      margin: 20vh auto 0;
      padding: 1rem 1.25rem;
      border-radius: 1rem;
      color: #f7fbff;
      background: #101b2d;
      font: 600 1rem/1.45 system-ui,sans-serif;
      text-align: center;
    }
  </style>`;

if (!index.includes('data-forge-auth-first-paint')) {
  index = index.replace('</head>', `${failClosed}\n</head>`);
}

const authScripts = `
  <script type="module" src="./authenticated-route-guard.js?v=auth-first-paint-001"></script>
  <script type="module" src="./early-auth-bootstrap.js?v=auth-first-paint-001"></script>`;

const appTag = /<script type="module" src="\.\/app\.js\?[^\"]+"><\/script>/;
if (!appTag.test(index)) throw new Error('MATERIAL3_APP_ENTRY_MISSING');
if (!index.includes('early-auth-bootstrap.js')) {
  index = index.replace(appTag, `${authScripts}\n  $&`);
}

// Static fallback content may remain as an authenticated hydration skeleton, but it
// must never advertise itself as a valid anonymous/read-only experience.
index = index.replaceAll('Vista estática segura', 'Acceso protegido');
index = index.replaceAll('Solo lectura', 'Sesión requerida');
index = index.replace('Miércoles, 26 de julio', 'Cargando agenda actual…');
index = index.replace('Buenos días, Jorge', 'Bienvenido a ForgeOS');
index = index.replace('<span>JP</span>', '<span aria-hidden="true">—</span>');
index = index.replace(/[\t ]+\n/g, '\n');

await writeFile(indexPath, index);
console.log('MATERIAL3_AUTH_FIRST_PAINT_FAIL_CLOSED=PASS');
