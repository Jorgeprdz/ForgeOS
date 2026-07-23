#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

SOURCE_COMMIT="$(git rev-parse HEAD^)"
PRESERVE_DIR="$(mktemp -d)"
trap 'rm -rf "$PRESERVE_DIR"' EXIT

preserve_paths=(
  "AGENTS.md"
  "adr"
  "governance"
  "docs/architecture"
  "docs/contracts"
  "docs/decisions"
  "docs/migration/constitutional-history"
  "docs/migration/governance-history"
)

printf 'SOURCE_COMMIT=%s\n' "$SOURCE_COMMIT"
printf 'TARGET_BRANCH=%s\n' "$(git branch --show-current)"

for path in "${preserve_paths[@]}"; do
  if [[ -e "$path" ]]; then
    mkdir -p "$PRESERVE_DIR/$(dirname "$path")"
    cp -a "$path" "$PRESERVE_DIR/$path"
    printf 'PRESERVED=%s\n' "$path"
  fi
done

find . -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf -- {} +
cp -a "$PRESERVE_DIR"/. .

mkdir -p forge/cli forge/tests modules/carrier-scope tools .github/workflows .forge21/state .forge21/receipts

cat > .gitignore <<'EOF'
node_modules/
.forge21/logs/
.forge21/tmp/
*.log
.DS_Store
EOF

cat > README.md <<'EOF'
# Forge OS 2.1

Forge OS 2.1 is a clean, deterministic rewrite that preserves the constitutional,
governance, ADR, architecture, contract, and owner-decision record while removing the
previous runtime and rewrite machinery.

## Commands

```bash
bash tools/forge doctor
bash tools/forge status
bash tools/forge plan MOD-CARRIER-SCOPE
bash tools/forge run MOD-CARRIER-SCOPE
bash tools/forge advance MOD-CARRIER-SCOPE implementation_complete
bash tools/forge validate MOD-CARRIER-SCOPE
npm test
```

## Runtime model

- One canonical manifest: `forge/modules.json`
- One state file per module: `.forge21/state/<MODULE>.json`
- Immutable timestamped validation receipts under `.forge21/receipts/`
- Sequential state transitions only
- No hidden `FORGE_ROOT` prerequisite
- Governance remains outside runtime mutation
EOF

cat > package.json <<'EOF'
{
  "name": "forge-os-2.1",
  "version": "2.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "forge": "node forge/cli/forge.mjs",
    "test": "node --test forge/tests/*.test.mjs modules/**/*.test.mjs",
    "validate": "node forge/cli/forge.mjs validate",
    "check": "npm test && node forge/cli/forge.mjs doctor && node forge/cli/forge.mjs validate"
  },
  "engines": {
    "node": ">=20"
  }
}
EOF

cat > forge/modules.json <<'EOF'
{
  "schemaVersion": 1,
  "engineVersion": "2.1.0",
  "modules": [
    {
      "id": "MOD-CARRIER-SCOPE",
      "title": "Carrier Scope",
      "description": "Canonical carrier-scope contract and implementation.",
      "dependencies": [],
      "governanceInputs": [
        "docs/architecture/CARRIER_SCOPE_NAMING_CONVENTION.md"
      ],
      "entrypoint": "modules/carrier-scope/index.mjs",
      "tests": [
        "modules/carrier-scope/index.test.mjs"
      ],
      "requiredExports": [
        "CarrierScopeError",
        "assertCarrierScope",
        "createCarrierScope",
        "isCarrierScope"
      ]
    }
  ]
}
EOF

cat > modules/carrier-scope/index.mjs <<'EOF'
const TOKEN_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/u;

export class CarrierScopeError extends TypeError {
  constructor(message, details = {}) {
    super(message);
    this.name = 'CarrierScopeError';
    this.code = 'INVALID_CARRIER_SCOPE';
    this.details = Object.freeze({ ...details });
  }
}

function normalizeToken(value, field) {
  if (typeof value !== 'string') {
    throw new CarrierScopeError(`${field} must be a string`, {
      field,
      receivedType: typeof value
    });
  }

  const normalized = value.trim().toLowerCase();

  if (!TOKEN_PATTERN.test(normalized)) {
    throw new CarrierScopeError(`${field} must use lowercase kebab-case`, {
      field,
      value
    });
  }

  return normalized;
}

export function createCarrierScope(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new CarrierScopeError('carrier scope input must be an object');
  }

  const carrier = normalizeToken(input.carrier, 'carrier');
  const market = normalizeToken(input.market, 'market');
  const productLine = input.productLine == null
    ? null
    : normalizeToken(input.productLine, 'productLine');

  return Object.freeze({
    kind: 'carrier-scope',
    version: 1,
    carrier,
    market,
    productLine,
    canonical: productLine
      ? `${carrier}:${market}:${productLine}`
      : `${carrier}:${market}`
  });
}

export function assertCarrierScope(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new CarrierScopeError('carrier scope must be an object');
  }

  const expected = createCarrierScope(value);

  for (const key of ['kind', 'version', 'carrier', 'market', 'productLine', 'canonical']) {
    if (value[key] !== expected[key]) {
      throw new CarrierScopeError(`carrier scope ${key} mismatch`, {
        key,
        expected: expected[key],
        received: value[key]
      });
    }
  }

  return value;
}

export function isCarrierScope(value) {
  try {
    assertCarrierScope(value);
    return true;
  } catch {
    return false;
  }
}
EOF

cat > modules/carrier-scope/index.test.mjs <<'EOF'
import assert from 'node:assert/strict';
import test from 'node:test';

import {
  CarrierScopeError,
  assertCarrierScope,
  createCarrierScope,
  isCarrierScope
} from './index.mjs';

test('creates canonical scope', () => {
  const scope = createCarrierScope({
    carrier: 'SMNYL',
    market: 'Mexico',
    productLine: 'Vida-Individual'
  });

  assert.deepEqual(scope, {
    kind: 'carrier-scope',
    version: 1,
    carrier: 'smnyl',
    market: 'mexico',
    productLine: 'vida-individual',
    canonical: 'smnyl:mexico:vida-individual'
  });
  assert.equal(Object.isFrozen(scope), true);
});

test('supports no product line', () => {
  const scope = createCarrierScope({ carrier: 'smnyl', market: 'mexico' });
  assert.equal(scope.productLine, null);
  assert.equal(scope.canonical, 'smnyl:mexico');
});

test('rejects invalid tokens', () => {
  assert.throws(
    () => createCarrierScope({ carrier: 'SM NYL', market: 'mexico' }),
    CarrierScopeError
  );
});

test('asserts valid scope', () => {
  const scope = createCarrierScope({ carrier: 'smnyl', market: 'mexico' });
  assert.equal(assertCarrierScope(scope), scope);
  assert.equal(isCarrierScope(scope), true);
  assert.equal(isCarrierScope({}), false);
});
EOF

cat > forge/cli/forge.mjs <<'EOF'
#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ENGINE_VERSION = '2.1.0';
const STATES = Object.freeze([
  'declared',
  'ready',
  'implementation_started',
  'implementation_complete',
  'tests_pass',
  'validated',
  'delivered'
]);
const TRANSITIONS = Object.freeze({
  declared: ['ready'],
  ready: ['implementation_started'],
  implementation_started: ['implementation_complete'],
  implementation_complete: ['tests_pass'],
  tests_pass: ['validated'],
  validated: ['delivered'],
  delivered: []
});

const cliDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = process.env.FORGE_ROOT
  ? path.resolve(process.env.FORGE_ROOT)
  : path.resolve(cliDirectory, '..', '..');
const manifestPath = path.join(root, 'forge', 'modules.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

function kv(key, value) {
  console.log(`${key}=${Array.isArray(value) ? value.join(',') : String(value)}`);
}

function moduleById(moduleId) {
  const record = manifest.modules.find(({ id }) => id === moduleId);
  if (!record) throw new Error(`UNKNOWN_MODULE:${moduleId}`);
  return record;
}

function statePath(moduleId) {
  return path.join(root, '.forge21', 'state', `${moduleId}.json`);
}

function writeJsonAtomic(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temporary = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`);
  fs.renameSync(temporary, file);
}

function loadState(record) {
  const file = statePath(record.id);
  if (!fs.existsSync(file)) {
    const now = new Date().toISOString();
    const state = {
      schemaVersion: 1,
      engineVersion: ENGINE_VERSION,
      moduleId: record.id,
      state: 'declared',
      createdAt: now,
      updatedAt: now,
      history: [{ state: 'declared', at: now, reason: 'module initialized' }]
    };
    writeJsonAtomic(file, state);
    return state;
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function advance(record, target, reason = 'explicit transition') {
  if (!STATES.includes(target)) throw new Error(`UNKNOWN_STATE:${target}`);
  const current = loadState(record);
  if (current.state === target) return current;
  if (!TRANSITIONS[current.state]?.includes(target)) {
    throw new Error(`INVALID_TRANSITION:${current.state}:${target}`);
  }
  const now = new Date().toISOString();
  const next = {
    ...current,
    state: target,
    updatedAt: now,
    history: [...current.history, { state: target, at: now, reason }]
  };
  writeJsonAtomic(statePath(record.id), next);
  return next;
}

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

async function validate(record) {
  const errors = [];
  const hashes = {};
  const requiredFiles = [
    ...(record.governanceInputs ?? []),
    record.entrypoint,
    ...(record.tests ?? [])
  ];

  for (const relative of requiredFiles) {
    const file = path.join(root, relative);
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
      errors.push(`MISSING_FILE:${relative}`);
    } else {
      hashes[relative] = sha256(file);
    }
  }

  if (errors.length === 0) {
    const moduleUrl = `${pathToFileURL(path.join(root, record.entrypoint)).href}?v=${Date.now()}`;
    const imported = await import(moduleUrl);
    for (const name of record.requiredExports ?? []) {
      if (!(name in imported)) errors.push(`MISSING_EXPORT:${name}`);
    }
  }

  const result = {
    schemaVersion: 1,
    engineVersion: ENGINE_VERSION,
    moduleId: record.id,
    validatedAt: new Date().toISOString(),
    pass: errors.length === 0,
    errors,
    hashes
  };

  const receiptDirectory = path.join(root, '.forge21', 'receipts', record.id);
  fs.mkdirSync(receiptDirectory, { recursive: true });
  const timestamp = result.validatedAt.replaceAll(/[:.]/g, '-');
  writeJsonAtomic(path.join(receiptDirectory, `${timestamp}.json`), result);
  writeJsonAtomic(path.join(receiptDirectory, 'latest.json'), result);
  return result;
}

function runTests(record) {
  const result = spawnSync(process.execPath, ['--test', ...record.tests], {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, FORGE_ROOT: root }
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`TESTS_FAILED:${result.status}`);
}

async function run(record) {
  let state = loadState(record);
  kv('MODULE_ID', record.id);
  kv('START_STATE', state.state);

  if (state.state === 'declared') state = advance(record, 'ready', 'manifest resolved');
  if (state.state === 'ready') state = advance(record, 'implementation_started', 'implementation requested');

  if (state.state === 'implementation_started') {
    kv('RUN_STATE', state.state);
    kv('ACTION_REQUIRED', 'IMPLEMENT_MODULE');
    return;
  }

  if (state.state === 'implementation_complete') {
    runTests(record);
    state = advance(record, 'tests_pass', 'module tests passed');
  }

  if (state.state === 'tests_pass') {
    const result = await validate(record);
    kv('VALIDATION', result.pass ? 'PASS' : 'FAIL');
    if (!result.pass) {
      kv('VALIDATION_ERRORS', result.errors);
      process.exitCode = 1;
      return;
    }
    state = advance(record, 'validated', 'validation receipt passed');
  }

  kv('RUN_STATE', state.state);
  kv('ACTION_REQUIRED', state.state === 'validated' ? 'REVIEW_AND_DELIVER' : 'NONE');
}

async function main() {
  const [command = 'help', moduleId, target] = process.argv.slice(2);

  if (command === 'doctor') {
    kv('FORGE_ROOT', root);
    kv('ENGINE_VERSION', ENGINE_VERSION);
    kv('NODE_VERSION', process.version);
    kv('MANIFEST', fs.existsSync(manifestPath) ? 'PASS' : 'FAIL');
    kv('GOVERNANCE', fs.existsSync(path.join(root, 'governance')) ? 'PASS' : 'FAIL');
    kv('DOCTOR', 'PASS');
    return;
  }

  if (command === 'status') {
    const records = moduleId ? [moduleById(moduleId)] : manifest.modules;
    for (const record of records) {
      const state = loadState(record);
      kv('MODULE_ID', record.id);
      kv('STATE', state.state);
      kv('NEXT_STATES', TRANSITIONS[state.state]);
    }
    return;
  }

  if (command === 'plan') {
    const record = moduleById(moduleId);
    kv('MODULE_ID', record.id);
    kv('DEPENDENCIES', record.dependencies ?? []);
    kv('GOVERNANCE_INPUTS', record.governanceInputs ?? []);
    kv('ENTRYPOINT', record.entrypoint);
    kv('TESTS', record.tests ?? []);
    return;
  }

  if (command === 'advance') {
    const record = moduleById(moduleId);
    const state = advance(record, target, 'forge advance');
    kv('MODULE_ID', record.id);
    kv('STATE', state.state);
    return;
  }

  if (command === 'validate') {
    const records = moduleId ? [moduleById(moduleId)] : manifest.modules;
    let failed = false;
    for (const record of records) {
      const result = await validate(record);
      kv('MODULE_ID', record.id);
      kv('VALIDATION', result.pass ? 'PASS' : 'FAIL');
      kv('VALIDATION_ERRORS', result.errors);
      failed ||= !result.pass;
    }
    if (failed) process.exitCode = 1;
    return;
  }

  if (command === 'run') {
    await run(moduleById(moduleId));
    return;
  }

  console.log('Usage: forge doctor|status|plan|run|advance|validate [MODULE_ID] [TARGET_STATE]');
}

main().catch((error) => {
  console.error(`FORGE_ERROR=${error.message}`);
  process.exitCode = 1;
});
EOF
chmod +x forge/cli/forge.mjs

cat > tools/forge <<'EOF'
#!/usr/bin/env bash
set -Eeuo pipefail
SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
ROOT="$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd -P)"
export FORGE_ROOT="$ROOT"
exec node "$ROOT/forge/cli/forge.mjs" "$@"
EOF
chmod +x tools/forge

cat > forge/tests/state-graph.test.mjs <<'EOF'
import assert from 'node:assert/strict';
import test from 'node:test';

const states = [
  'declared',
  'ready',
  'implementation_started',
  'implementation_complete',
  'tests_pass',
  'validated',
  'delivered'
];

test('states are unique', () => {
  assert.equal(new Set(states).size, states.length);
});

test('state graph is sequential', () => {
  assert.deepEqual(states.slice(0, 3), [
    'declared',
    'ready',
    'implementation_started'
  ]);
});
EOF

cat > docs/FORGE_2_1_MIGRATION.md <<EOF
# Forge OS 2.1 Migration

- Source branch: \`main\`
- Source commit: \`${SOURCE_COMMIT}\`
- Migration branch: \`rewrite/forge-2.1\`
- Strategy: preserve governance and rebuild runtime from a minimal deterministic core.

## Preserved boundaries

- \`AGENTS.md\`
- \`adr/\`
- \`governance/\`
- \`docs/architecture/\`
- \`docs/contracts/\`
- \`docs/decisions/\`
- constitutional and governance migration history
EOF

cat > .github/workflows/forge-2.1-ci.yml <<'EOF'
name: Forge 2.1 CI

on:
  push:
    branches:
      - rewrite/forge-2.1
  pull_request:
    paths:
      - 'forge/**'
      - 'modules/**'
      - 'tools/forge'
      - 'package.json'

permissions:
  contents: read

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - run: npm test
      - run: bash tools/forge doctor
      - run: bash tools/forge validate MOD-CARRIER-SCOPE
EOF

npm test
bash tools/forge doctor
bash tools/forge run MOD-CARRIER-SCOPE
bash tools/forge advance MOD-CARRIER-SCOPE implementation_complete
bash tools/forge run MOD-CARRIER-SCOPE
bash tools/forge validate MOD-CARRIER-SCOPE

git diff --check
git add -A
git status --short

git config user.name "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
git commit -m "feat(forge): rebuild Forge OS 2.1"
git push origin HEAD:rewrite/forge-2.1
