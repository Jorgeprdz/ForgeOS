import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync('docs/static-preview/forge-alive/index.html', 'utf8');
const script = readFileSync('docs/static-preview/forge-alive/forge-alive-auth-entry-067g17b1.js', 'utf8');
const styles = readFileSync('docs/static-preview/forge-alive/forge-alive-auth-entry-067g17b1.css', 'utf8');
const config = readFileSync('docs/static-preview/forge-alive/forge-alive-public-config-067g17a1.js', 'utf8');
const workflow = readFileSync('.github/workflows/pages.yml', 'utf8');
const validator = readFileSync('scripts/validate-pages-public-config.mjs', 'utf8');
const bootstrap = readFileSync('advisor-os/sales-pipeline/productive-prospect-bootstrap.js', 'utf8');

assert.match(html, /forge-alive-auth-entry-067g17b1\.css\?v=067g17b1-1/);
assert.match(html, /forge-alive-public-config-067g17a1\.js\?v=__FORGE_BUILD_SHA__[\s\S]*forge-alive-auth-entry-067g17b1\.js\?v=067g17b1-1[\s\S]*sample-data\.js/);

assert.match(script, /FORGE_AUTH_ENTRY_067G17B1_V1/);
assert.match(script, /textContent = 'F'/);
assert.match(script, /type = 'button'/);
assert.match(script, /aria-label', 'Iniciar sesión o abrir perfil'/);
assert.match(script, /Iniciar sesión en Forge/);
assert.match(script, /Accede para consultar tu Pipeline y administrar tus prospectos\./);
assert.match(script, /Continuar con Google/);
assert.match(script, /Acceso de prueba/);
assert.match(script, /Asesor A/);
assert.match(script, /Asesor B/);
assert.match(script, /Cancelar/);
assert.match(script, /role="dialog"/);
assert.match(script, /aria-modal="true"/);
assert.match(script, /allowsTestAdvisorLogin/);
assert.match(script, /data-forge-auth-open/);
assert.match(script, /canonicalRedirectUrl/);
assert.match(script, /bootstrap\.signInWithGoogle\(\{ redirectTo: canonicalRedirectUrl\(\) \}\)/);
assert.match(script, /nav', currentNav\(\)/);
assert.match(script, /CANONICAL_AUTH_CLIENT_UNAVAILABLE/);

assert.match(bootstrap, /signInWithGoogle/);
assert.match(bootstrap, /provider:"google"/);
assert.match(bootstrap, /redirectTo/);
assert.match(bootstrap, /getSession/);
assert.match(bootstrap, /onAuthStateChange/);

assert.match(styles, /focus-visible/);
assert.match(styles, /min-height: 42px/);
assert.match(styles, /position: fixed/);
assert.match(styles, /max-block-size: calc\(100vh - 36px\)/);
assert.match(styles, /@media \(max-width: 640px\)/);
assert.match(styles, /env\(safe-area-inset-bottom\)/);

assert.match(config, /ENABLE_TEST_ADVISOR_LOGIN/);
assert.match(config, /allowsTestAdvisorLogin/);
assert.match(workflow, /ENABLE_TEST_ADVISOR_LOGIN: \$\{\{ vars\.ENABLE_TEST_ADVISOR_LOGIN \|\| 'false' \}\}/);
assert.match(validator, /ENABLE_TEST_ADVISOR_LOGIN/);

for (const source of [script, styles, config, workflow, bootstrap]) {
  assert.doesNotMatch(source, /SUPABASE_SERVICE_ROLE_KEY|SUPABASE_ACCESS_TOKEN|DATABASE_PASSWORD|ADVISOR_A_PASSWORD|ADVISOR_B_PASSWORD|refresh_token|access_token/i);
}

assert.doesNotMatch(script, /localStorage\.setItem/);
assert.doesNotMatch(script, /advisorId\\s*=\\s*['"]/);

console.log('067G17B1 AUTH ENTRY STATIC: PASS');
