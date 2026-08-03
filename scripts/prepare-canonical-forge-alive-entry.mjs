import { readFile, writeFile } from 'node:fs/promises';

const material3Path = new URL('../docs/static-preview/forge-alive-material3/index.html', import.meta.url);
const canonicalPath = new URL('../docs/static-preview/forge-alive/index.html', import.meta.url);

let html = await readFile(material3Path, 'utf8');

for (const required of [
  'data-forge-application',
  'data-forge-auth-boundary',
  './app.js?',
]) {
  if (!html.includes(required)) {
    throw new Error(`CANONICAL_SOURCE_REQUIRED_${required}`);
  }
}

if (!html.includes('<base ')) {
  html = html.replace(
    '<head>',
    '<head>\n  <base href="../forge-alive-material3/">\n  <meta name="forge-canonical-entry" content="FORGE_ALIVE_CANONICAL_MATERIAL3_V1">',
  );
}

html = html.replace(
  /<title>[^<]*<\/title>/,
  '<title>ForgeOS</title>',
);

for (const forbidden of [
  'window.location.replace',
  'legacy-retired',
  'FORGE_LEGACY_UI_RETIRED',
]) {
  if (html.includes(forbidden)) {
    throw new Error(`CANONICAL_ENTRY_FORBIDDEN_${forbidden}`);
  }
}

await writeFile(canonicalPath, html);
console.log('FORGE_ALIVE_CANONICAL_ENTRY=GENERATED');
