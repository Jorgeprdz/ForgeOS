import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const app = readFileSync('app.js', 'utf8');
const cartera = readFileSync('cartera.js', 'utf8');
const receipt = readFileSync(
  'docs/evidence/FORGE_CARTERA_120_SELECTIVE_PROMOTION_AUTHORIZATION_RECEIPT_001.md',
  'utf8'
);
const manifest = readFileSync(
  'docs/evidence/FORGE_CARTERA_130_SELECTIVE_PROMOTION_MANIFEST_001.tsv',
  'utf8'
);

const requiredEnhancers = [
  'bindCartera030dPolicyPaymentCalendar',
  'bindCartera040RelationshipMemory',
  'bindCartera050FutureRadar',
  'bindCartera060RelationshipGrowth',
  'bindCartera070RelationalActivation',
  'bindCartera080EconomicConnection',
  'bindCartera090RelationshipCapital',
  'bindCartera100ProductivityProof',
];

const requiredRuntimeFiles = [
  'advisor-os/cartera/canonical-portfolio-service.js',
  'advisor-os/cartera/canonical-directory-service.js',
  'advisor-os/cartera/cartera-030d-policy-payment-calendar-enhancement.js',
  'advisor-os/cartera/cartera-040d-relationship-memory-enhancement.js',
  'advisor-os/cartera/cartera-050d-future-radar-enhancement.js',
  'advisor-os/cartera/cartera-060d-relationship-growth-enhancement.js',
  'advisor-os/cartera/cartera-070d-relational-activation-enhancement.js',
  'advisor-os/cartera/cartera-080d-economic-connection-enhancement.js',
  'advisor-os/cartera/cartera-090d-relationship-capital-enhancement.js',
  'advisor-os/cartera/cartera-100d-productivity-proof-enhancement.js',
  'platform/policy-intelligence/cartera-010d-unified-directory-read-model.js',
  'platform/economic-connection/cartera-080-economic-connection.js',
  'platform/relationship-intelligence/cartera-090a-relationship-capital-projection.js',
  'platform/productivity/cartera-100a-productivity-proof-contract.js',
];

test('130 records the exact Board and merge authorization receipt', () => {
  assert.match(receipt, /EXACT_AUTHORIZATION_PHRASE=AUTHORIZE_CARTERA_120_SELECTIVE_PROMOTION/);
  assert.match(receipt, /BOARD_APPROVAL=GRANTED/);
  assert.match(receipt, /MERGE_AUTHORIZATION=GRANTED/);
  assert.match(receipt, /CURRENT_MAIN_HEAD=9d014116f6b3f0a626d8848d680a5c607f924d99/);
  assert.match(receipt, /ACCEPTED_PROGRAM_HEAD=b83a37abe3eb8b3a48c2fe89940b562e1367bfcc/);
});

test('130 reconciles the current-main app instead of replacing it', () => {
  assert.match(app, /APP V7 ENTERPRISE/);
  assert.match(app, /dashboardLoader: \(\) => import\('\.\/dashboard\.js'\)/);
  assert.match(app, /pipelineLoader: \(\) => import\('\.\/advisor-os\/sales-pipeline\/pipeline-live-route\.js'\)/);
  assert.match(app, /function bindCarteraProductEvents\(\)/);
  assert.match(app, /bindCarteraEvents: bindCarteraProductEvents/);
  for (const enhancer of requiredEnhancers) {
    assert.match(app, new RegExp(`${enhancer}\\(\\)`));
  }
});

test('130 promotes the accepted canonical Cartera route and preserves the legacy file', () => {
  assert.match(cartera, /CARTERA 010D read-only unified directory route adapter/);
  assert.match(cartera, /Directorio canónico de personas, cuentas y pólizas/);
  assert.match(cartera, /SOLO LECTURA/);
  assert.doesNotMatch(cartera, /legacy\/quarantine\/crmaddlife-indexeddb/);
  assert.ok(existsSync('legacy/quarantine/cartera-enterprise-main-pre-canonical-20260801.js'));
  const legacy = readFileSync(
    'legacy/quarantine/cartera-enterprise-main-pre-canonical-20260801.js',
    'utf8'
  );
  assert.match(legacy, /ENTERPRISE POLICY MANAGEMENT ENGINE/);
});

test('130 materializes every required productive runtime family', () => {
  for (const path of requiredRuntimeFiles) {
    assert.ok(existsSync(path), `missing ${path}`);
    assert.match(manifest, new RegExp(`^${path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\t`, 'm'));
  }
});

test('130 manifest is head-bound and distinguishes copy from reconciliation', () => {
  assert.match(manifest, /\tCOPY_ACCEPTED_BLOB\tb83a37abe3eb8b3a48c2fe89940b562e1367bfcc\t/);
  assert.match(manifest, /^app\.js\tRECONCILE_CURRENT_MAIN\t9d014116f6b3f0a626d8848d680a5c607f924d99\t/m);
  assert.match(manifest, /^cartera\.js\tREPLACE_LEGACY_WITH_ACCEPTED_CANONICAL_ROUTE\t/m);
  assert.match(manifest, /^legacy\/quarantine\/cartera-enterprise-main-pre-canonical-20260801\.js\tPRESERVE_PRE_PROMOTION_LEGACY\t/m);
});

test('130 does not replace productive Pages Material 3 or execute remote effects', () => {
  assert.ok(existsSync('docs/static-preview/forge-alive-material3/app.js'));
  assert.doesNotMatch(manifest, /^docs\/static-preview\/forge-alive-material3\/app\.js\t/m);
  assert.doesNotMatch(manifest, /^\.github\/workflows\/cartera-0/m);
  assert.doesNotMatch(manifest, /DEPLOY|REMOTE_MUTATION|FULL_HISTORY_MERGE/);
});
