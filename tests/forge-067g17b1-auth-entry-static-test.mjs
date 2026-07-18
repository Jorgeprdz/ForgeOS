import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync('docs/static-preview/forge-alive/index.html', 'utf8');
const script = readFileSync('docs/static-preview/forge-alive/forge-alive-auth-entry-067g17b1.js', 'utf8');
const styles = readFileSync('docs/static-preview/forge-alive/forge-alive-auth-entry-067g17b1.css', 'utf8');
const config = readFileSync('docs/static-preview/forge-alive/forge-alive-public-config-067g17a1.js', 'utf8');
const workflow = readFileSync('.github/workflows/pages.yml', 'utf8');
const validator = readFileSync('scripts/validate-pages-public-config.mjs', 'utf8');
const bootstrap = readFileSync('advisor-os/sales-pipeline/productive-prospect-bootstrap.js', 'utf8');
const pipelineUi = readFileSync('advisor-os/sales-pipeline/pipeline-ui.js', 'utf8');
const productiveUi = readFileSync('advisor-os/sales-pipeline/productive-prospect-ui.js', 'utf8');
const pipelineView = readFileSync('docs/static-preview/forge-alive/forge-alive-pipeline-view-067g16a.js', 'utf8');

assert.match(html, /forge-alive-auth-entry-067g17b1\.css\?v=067g17b1-1/);
assert.match(html, /forge-alive-public-config-067g17a1\.js\?v=__FORGE_BUILD_SHA__[\s\S]*forge-alive-auth-entry-067g17b1\.js\?v=067g17b1-1[\s\S]*sample-data\.js/);

assert.match(script, /FORGE_AUTH_ENTRY_067G17B1_V1/);
assert.match(script, /\.hero \.orb/);
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
assert.match(script, /ForgeTestAdvisorAuth067G17B1/);
assert.match(script, /testAdvisorLoginAvailable/);
assert.match(script, /El acceso de prueba no está disponible en esta publicación/);
assert.match(script, /data-forge-auth-open/);
assert.match(script, /canonicalRedirectUrl/);
assert.match(script, /bootstrap\.signInWithGoogle\(\{ redirectTo: canonicalRedirectUrl\(\) \}\)/);
assert.match(script, /nav', currentNav\(\)/);
assert.match(script, /CANONICAL_AUTH_CLIENT_UNAVAILABLE/);
assert.match(script, /bootstrapSession/);
assert.match(script, /waitForAuthBootstrap/);
assert.match(script, /getSession/);
assert.match(script, /onAuthStateChange/);
assert.match(script, /listenerPromise/);
assert.match(script, /bootPromise/);
assert.match(script, /SIGNED_IN/);
assert.match(script, /SIGNED_OUT/);
assert.match(script, /TOKEN_REFRESHED/);
assert.match(script, /USER_UPDATED/);
assert.match(script, /INITIAL_SESSION/);
assert.match(script, /auth_loading/);
assert.match(script, /Recuperando sesión de Forge/);
assert.match(script, /renderAuthenticatedAvatar/);
assert.match(script, /avatar_url/);
assert.match(script, /safeInitials/);
assert.match(script, /displayName/);
assert.match(script, /displayEmail/);
assert.match(script, /sessionType/);
assert.match(script, /Perfil de Forge/);
assert.match(script, /Cuenta de Google/);
assert.match(script, /Identidad verificada por Supabase Auth/);
assert.match(script, /Cerrar sesión/);
assert.match(script, /data-forge-auth-signout/);
assert.match(script, /bootstrap\.signOut/);
assert.match(script, /applySession\(null, 'SIGNED_OUT'\)/);
assert.match(script, /forge:auth-state-changed/);
assert.match(script, /history\.replaceState/);

assert.match(bootstrap, /signInWithGoogle/);
assert.match(bootstrap, /provider:"google"/);
assert.match(bootstrap, /redirectTo/);
assert.match(bootstrap, /getSession/);
assert.match(bootstrap, /onAuthStateChange/);
assert.match(pipelineUi, /stateActions/);
assert.match(pipelineUi, /forge-pipeline-state-actions/);
assert.match(productiveUi, /Inicia sesión para consultar tus prospectos y continuar trabajando\./);
assert.match(productiveUi, /data-forge-auth-open/);
assert.match(productiveUi, /data-forge-auth-open-nav/);
assert.match(productiveUi, /Volver a Inicio/);
assert.match(productiveUi, /Cargando tu Pipeline/);
assert.match(pipelineView, /forge:auth-state-changed/);
assert.match(pipelineView, /authListenerBound/);
assert.match(pipelineView, /productivePipeline = null/);
assert.doesNotMatch(productiveUi, /Tu sesión expiró\. Inicia sesión nuevamente\./);

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
assert.doesNotMatch(script, /ADVISOR_A_EMAIL|ADVISOR_A_PASSWORD|ADVISOR_B_EMAIL|ADVISOR_B_PASSWORD/);

function containsHardcodedTestPassword(source) {
  return /ADVISOR_[AB]_PASSWORD|password\s*[:=]\s*['"][^'"]{8,}/i.test(source);
}

function containsClientPrivilegedCredential(source) {
  return /SUPABASE_SERVICE_ROLE_KEY|SUPABASE_ACCESS_TOKEN|DATABASE_PASSWORD|REFRESH_TOKEN|ACCESS_TOKEN/i.test(source);
}

function containsConsoleTokenLogging(source) {
  return /console\.(log|info|warn|error)\([^)]*(token|session|password|SUPABASE_KEY)/i.test(source);
}

assert.equal(containsHardcodedTestPassword(['const ADVISOR_A_', 'PASSWORD="fixture-', 'password";'].join('')), true, 'HARDCODED_TEST_PASSWORD_DETECTED');
assert.equal(containsClientPrivilegedCredential('SUPABASE_SERVICE_ROLE_KEY'), true, 'SERVICE_ROLE_KEY_IN_CLIENT_DETECTED');
assert.equal(containsClientPrivilegedCredential('SUPABASE_ACCESS_TOKEN'), true, 'ACCESS_TOKEN_IN_CLIENT_SOURCE_DETECTED');
assert.equal(containsClientPrivilegedCredential('REFRESH_TOKEN'), true, 'REFRESH_TOKEN_IN_CLIENT_SOURCE_DETECTED');
assert.equal(containsConsoleTokenLogging('console.log("session token", token);'), true, 'TOKENS_LOGGED_TO_CONSOLE_DETECTED');

assert.equal(containsHardcodedTestPassword(script), false, 'TEST_CREDENTIALS_EMBEDDED=NO');
assert.equal(containsClientPrivilegedCredential(script), false, 'SERVICE_ROLE_KEY_EXPOSED=NO');
assert.equal(containsConsoleTokenLogging(script), false, 'TOKENS_LOGGED=NO');
assert.equal((script.match(/onAuthStateChange/g) || []).length <= 3, true, 'DUPLICATE_AUTH_LISTENER_DETECTED');
assert.equal(script.includes('Continuar con Google'), true, 'AUTH_PANEL_MISSING_GOOGLE_BUTTON_DETECTED');
assert.equal(productiveUi.includes('data-forge-auth-open'), true, 'PIPELINE_LOGIN_ACTION_MISSING_DETECTED');
assert.equal(pipelineView.includes('forge:auth-state-changed'), true, 'PIPELINE_RELOADS_AFTER_LOGIN=YES');

console.log('067G17B1 AUTH ENTRY STATIC: PASS');
