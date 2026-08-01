import { createHash } from 'node:crypto';

const ACTIONS = new Set(['ADD', 'REPLACE', 'RETAIN', 'RECONCILE']);
const CATEGORIES = new Set([
  'DOMAIN_RUNTIME',
  'READ_MODEL',
  'PRODUCT_BINDING',
  'SCHEMA_SOURCE',
  'TEST',
  'DOCUMENTATION',
]);
const FORBIDDEN_PATTERNS = [
  /^\.git\//,
  /^run\//,
  /^preservation\//,
  /^tmp\//,
  /^artifacts\//,
  /^\.github\/workflows\/.*(?:diagnostic|one-shot|remote-acceptance)/i,
  /^scripts\/ci\/.*(?:diagnostic|one-shot|remote-acceptance)/i,
  /(^|\/)\.env(?:\.|$)/,
  /service-role/i,
  /secret/i,
];

function requiredText(value, code, maxLength = 500) {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text) throw new Error(code);
  return text.slice(0, maxLength);
}

function requiredSha(value, code) {
  const text = requiredText(value, code, 40).toLowerCase();
  if (!/^[a-f0-9]{40}$/.test(text)) throw new Error(code);
  return text;
}

function normalizePath(value, code) {
  const path = requiredText(value, code, 400).replace(/^\.\//, '');
  if (path.startsWith('/') || path.includes('..') || path.includes('\\')) throw new Error(code);
  if (FORBIDDEN_PATTERNS.some(pattern => pattern.test(path))) {
    throw new Error(`CARTERA120_FORBIDDEN_PROMOTION_PATH:${path}`);
  }
  return path;
}

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (!value || typeof value !== 'object') return JSON.stringify(value);
  return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
}

function digest(value) {
  return createHash('sha256').update(stableStringify(value)).digest('hex');
}

function normalizeEntry(raw = {}) {
  const action = requiredText(raw.action, 'CARTERA120_PROMOTION_ACTION_REQUIRED', 40).toUpperCase();
  const category = requiredText(raw.category, 'CARTERA120_PROMOTION_CATEGORY_REQUIRED', 80).toUpperCase();
  if (!ACTIONS.has(action)) throw new Error(`CARTERA120_PROMOTION_ACTION_INVALID:${action}`);
  if (!CATEGORIES.has(category)) throw new Error(`CARTERA120_PROMOTION_CATEGORY_INVALID:${category}`);

  const targetPath = normalizePath(raw.targetPath, 'CARTERA120_TARGET_PATH_INVALID');
  const sourcePath = action === 'RETAIN'
    ? targetPath
    : normalizePath(raw.sourcePath, 'CARTERA120_SOURCE_PATH_INVALID');
  const sourceBlobSha = action === 'RETAIN'
    ? null
    : requiredSha(raw.sourceBlobSha, 'CARTERA120_SOURCE_BLOB_SHA_REQUIRED');

  if (targetPath === 'app.js' || targetPath === 'cartera.js') {
    if (action !== 'RECONCILE') {
      throw new Error(`CARTERA120_PRODUCT_ENTRY_REQUIRES_RECONCILE:${targetPath}`);
    }
  }

  return Object.freeze({
    action,
    category,
    capability: requiredText(raw.capability, 'CARTERA120_CAPABILITY_REQUIRED', 160),
    sourcePath,
    targetPath,
    sourceBlobSha,
    reason: requiredText(raw.reason, 'CARTERA120_PROMOTION_REASON_REQUIRED', 700),
    currentMainPreservation: requiredText(
      raw.currentMainPreservation,
      'CARTERA120_MAIN_PRESERVATION_REQUIRED',
      500
    ),
    requiresRuntimeMount: raw.requiresRuntimeMount === true,
    remoteSchemaAlreadyApplied: raw.remoteSchemaAlreadyApplied === true,
    executionMode: 'COPY_OR_RECONCILE_ON_CURRENT_MAIN',
  });
}

export function createCartera120SelectivePromotionManifest(raw = {}) {
  const reconciliation = raw.reconciliation;
  if (!reconciliation || reconciliation.contract !== 'CARTERA_120A_CURRENT_MAIN_RECONCILIATION_V1') {
    throw new Error('CARTERA120_VALID_RECONCILIATION_REQUIRED');
  }
  if (reconciliation.strategy !== 'SELECTIVE_CURRENT_MAIN_PROMOTION') {
    throw new Error('CARTERA120_SELECTIVE_STRATEGY_REQUIRED');
  }

  const entries = Array.isArray(raw.entries) ? raw.entries.map(normalizeEntry) : [];
  if (entries.length === 0) throw new Error('CARTERA120_PROMOTION_ENTRIES_REQUIRED');

  const targetPaths = new Set();
  for (const entry of entries) {
    if (targetPaths.has(entry.targetPath)) {
      throw new Error(`CARTERA120_DUPLICATE_TARGET_PATH:${entry.targetPath}`);
    }
    targetPaths.add(entry.targetPath);
  }

  const sortedEntries = [...entries].sort((left, right) => left.targetPath.localeCompare(right.targetPath));
  const manifestCore = {
    currentMainHead: reconciliation.currentMainHead,
    acceptedProgramHead: reconciliation.acceptedProgramHead,
    mergeBaseHead: reconciliation.mergeBaseHead,
    strategy: reconciliation.strategy,
    entries: sortedEntries,
  };
  const manifestDigest = digest(manifestCore);
  const runtimeMountCount = sortedEntries.filter(item => item.requiresRuntimeMount).length;
  const schemaSourceCount = sortedEntries.filter(item => item.category === 'SCHEMA_SOURCE').length;
  const reconcileCount = sortedEntries.filter(item => item.action === 'RECONCILE').length;

  return Object.freeze({
    contract: 'CARTERA_120B_SELECTIVE_PROMOTION_MANIFEST_V1',
    currentMainHead: reconciliation.currentMainHead,
    acceptedProgramHead: reconciliation.acceptedProgramHead,
    mergeBaseHead: reconciliation.mergeBaseHead,
    strategy: reconciliation.strategy,
    state: reconciliation.sourceClosureVerified && reconciliation.programCompletionVerified
      ? 'READY_FOR_AUTHORIZATION_REVIEW'
      : 'BLOCKED',
    entries: Object.freeze(sortedEntries),
    manifestDigest,
    summary: Object.freeze({
      entryCount: sortedEntries.length,
      runtimeMountCount,
      schemaSourceCount,
      reconcileCount,
      historicalCommitCountImported: 0,
    }),
    boundaries: Object.freeze({
      fullHistoryMerge: false,
      stackedBranchMerge: false,
      sourceCommitHistoryImported: false,
      directMainWrite: false,
      automaticMerge: false,
      automaticDeployment: false,
      automaticDatabaseMigration: false,
      accountMutation: false,
      executionAuthorized: false,
    }),
  });
}

export function verifyCartera120ManifestDigest(manifest = {}) {
  if (manifest.contract !== 'CARTERA_120B_SELECTIVE_PROMOTION_MANIFEST_V1') return false;
  const manifestCore = {
    currentMainHead: manifest.currentMainHead,
    acceptedProgramHead: manifest.acceptedProgramHead,
    mergeBaseHead: manifest.mergeBaseHead,
    strategy: manifest.strategy,
    entries: manifest.entries,
  };
  return digest(manifestCore) === manifest.manifestDigest;
}
