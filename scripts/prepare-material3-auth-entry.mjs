import { copyFile, readFile, writeFile } from 'node:fs/promises';

const indexPath = new URL('../docs/static-preview/forge-alive-material3/index.html', import.meta.url);
const material3Root = new URL('../docs/static-preview/forge-alive-material3/', import.meta.url);

const canonicalAuthorities = [
  'forge-alive-auth-entry-067g17b1.css',
  'forge-alive-auth-entry-067g17b1.js',
  'forge-alive-public-config-067g17a1.js',
];

await Promise.all([
  ...canonicalAuthorities.map(async (name) => {
    const source = await readFile(new URL(name, material3Root), 'utf8');
    if (!source.trim()) throw new Error(`MATERIAL3_CANONICAL_AUTHORITY_EMPTY_${name}`);
  }),
  copyFile(
    new URL('../advisor-os/contact-books/bulk-import-engine.js', import.meta.url),
    new URL('bulk-import-engine-pages.js', material3Root),
  ),
]);

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

const authStylesheet = '  <link rel="stylesheet" href="./forge-alive-auth-entry-067g17b1.css?v=067g17b1-1" data-forge-auth-entry-styles="first-paint">';
if (!index.includes('data-forge-auth-entry-styles')) {
  index = index.replace(
    '  <link rel="stylesheet" href="./app.css?v=ui-m03-approved-004">',
    `  <link rel="stylesheet" href="./app.css?v=ui-m03-approved-004">\n${authStylesheet}`,
  );
}

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

// Static fallback content remains only as an authenticated hydration skeleton.
index = index.replaceAll('Vista estática segura', 'Acceso protegido');
index = index.replaceAll('Solo lectura', 'Sesión requerida');
index = index.replace('Miércoles, 26 de julio', 'Cargando agenda actual…');
index = index.replace('Buenos días, Jorge', 'Bienvenido a ForgeOS');
index = index.replace('<span>JP</span>', '<span aria-hidden="true">—</span>');
index = index.replace(/[\t ]+\n/g, '\n');

for (const required of [
  'data-forge-auth-entry-styles="first-paint"',
  'authenticated-route-guard.js',
  'early-auth-bootstrap.js',
]) {
  if (!index.includes(required)) throw new Error(`MATERIAL3_AUTH_ENTRY_REQUIRED_${required}`);
}

await writeFile(indexPath, index);
console.log('MATERIAL3_AUTH_FIRST_PAINT_FAIL_CLOSED=PASS');
console.log('MATERIAL3_AUTH_FIRST_PAINT_STYLED=PASS');
console.log('MATERIAL3_CANONICAL_AUTHORITY=PASS');
console.log('MATERIAL3_BULK_ENGINE_PAGES_ASSET=STAGED');
