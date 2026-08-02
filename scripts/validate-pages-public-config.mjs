import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {
  prepareForgeAlivePagesRuntimeClosure,
} from './prepare-forge-alive-pages-runtime-closure.mjs';

export const REQUIRED_PUBLIC_KEYS = ['DEMO_MODE', 'ENABLE_TEST_ADVISOR_LOGIN', 'SUPABASE_KEY', 'SUPABASE_URL'];
export const FORBIDDEN_KEY_PATTERN = /(ACCESS_TOKEN|SERVICE_ROLE|DATABASE_PASSWORD|ADVISOR_[AB]_(EMAIL|PASSWORD)|REFRESH_TOKEN|SESSION_TOKEN|PRIVATE_KEY)/i;

export function evaluatePublicEnv(source, filename = 'env.js') {
  const sandbox = Object.create(null);
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  sandbox.self = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox, { filename, timeout: 1000 });

  const publicEnv = sandbox.__ENV__ ?? sandbox.window?.__ENV__ ?? sandbox.globalThis?.__ENV__;
  assert.ok(publicEnv && typeof publicEnv === 'object', 'PUBLIC_ENV_OBJECT_REQUIRED');
  assert.deepEqual(Object.keys(publicEnv).sort(), REQUIRED_PUBLIC_KEYS, 'PUBLIC_ENV_KEYS_MISMATCH');
  assert.equal(Object.keys(publicEnv).some((key) => FORBIDDEN_KEY_PATTERN.test(key)), false, 'PRIVILEGED_PUBLIC_ENV_KEY_FORBIDDEN');
  assert.equal(typeof publicEnv.DEMO_MODE, 'string', 'DEMO_MODE_STRING_REQUIRED');
  assert.equal(typeof publicEnv.ENABLE_TEST_ADVISOR_LOGIN, 'string', 'ENABLE_TEST_ADVISOR_LOGIN_STRING_REQUIRED');
  assert.match(publicEnv.ENABLE_TEST_ADVISOR_LOGIN, /^(true|false)$/, 'ENABLE_TEST_ADVISOR_LOGIN_BOOLEAN_STRING_REQUIRED');
  assert.equal(typeof publicEnv.SUPABASE_URL, 'string', 'SUPABASE_URL_STRING_REQUIRED');
  assert.equal(typeof publicEnv.SUPABASE_KEY, 'string', 'SUPABASE_KEY_STRING_REQUIRED');
  return { publicEnv, sandbox };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const configPath = process.argv[2];
  assert.ok(configPath, 'CONFIG_PATH_REQUIRED');

  const siteDir = path.dirname(path.resolve(configPath));
  if (
    path.basename(siteDir) === '_site'
    && process.env.FORGE_SKIP_PAGES_RUNTIME_PREPARATION !== 'true'
  ) {
    await prepareForgeAlivePagesRuntimeClosure({ siteDir });
  }

  const { publicEnv } = evaluatePublicEnv(fs.readFileSync(configPath, 'utf8'), configPath);
  const expectedDemoMode = process.env.EXPECTED_DEMO_MODE ?? 'false';
  assert.equal(publicEnv.DEMO_MODE, expectedDemoMode);
  if (expectedDemoMode !== 'true') {
    assert.equal(new URL(publicEnv.SUPABASE_URL).hostname, 'rmlxigxysujsuwzgoimv.supabase.co');
    assert.ok(publicEnv.SUPABASE_KEY);
  }
  console.log('067G17A1 PAGES PUBLIC CONFIG ARTIFACT: PASS');
}
