#!/usr/bin/env node

/*
 * REPO_MIGRATION_HARNESS_v1
 *
 * Safety posture:
 * - Does not move files.
 * - Does not delete files.
 * - Does not rewrite references.
 * - Does not infer constitutional ownership.
 * - Produces inventory, plans and validation reports for human approval.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = process.cwd();

const PROTECTED_ROOT_ASSETS = new Set([
  'AGENTS.md',
  'FORGE_CONSTITUTION_V3.md',
  'FORGE_MASTER_BUILD_TREE.md',
  'app.js',
  'index.html',
  'manifest.json',
  'service-worker.js',
  'sw-cache-config.js',
]);

const CODE_EXTENSIONS = new Set([
  '.js',
  '.ts',
  '.tsx',
  '.jsx',
  '.json',
  '.html',
  '.css',
  '.png',
  '.jpg',
  '.jpeg',
  '.svg',
]);

const DOC_EXTENSIONS = new Set(['.md', '.txt']);

function runGit(args) {
  try {
    return execFileSync('git', args, {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  } catch (error) {
    return '';
  }
}

function parseArgs(argv) {
  const parsed = {
    command: argv[2],
    options: {},
  };

  for (let index = 3; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith('--')) continue;

    const key = arg.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith('--')) {
      parsed.options[key] = true;
    } else {
      parsed.options[key] = next;
      index += 1;
    }
  }

  return parsed;
}

function walk(dir, base = '') {
  const entries = fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const rel = path.posix.join(base, entry.name);
    const full = path.join(ROOT, rel);

    if (entry.isDirectory()) {
      files.push(...walk(rel, rel));
    } else if (entry.isFile()) {
      files.push(rel);
    }
  }

  return files.sort();
}

function rootFiles() {
  return fs.readdirSync(ROOT, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .sort();
}

function extname(file) {
  return path.extname(file).toLowerCase();
}

function isDoc(file) {
  return DOC_EXTENSIONS.has(extname(file));
}

function isCode(file) {
  return CODE_EXTENSIONS.has(extname(file));
}

function isRoot(file) {
  return !file.includes('/');
}

function isTestDoc(file) {
  const lower = file.toLowerCase();
  return lower.includes('test') || lower.includes('validation');
}

function statusSets() {
  const tracked = new Set(runGit(['ls-files']).split('\n').filter(Boolean));
  const status = runGit(['status', '--short']).split('\n').filter(Boolean);
  const untracked = new Set();
  const staged = [];

  for (const line of status) {
    if (line.startsWith('?? ')) {
      untracked.add(line.slice(3));
    } else {
      staged.push(line);
    }
  }

  return { tracked, untracked, staged, status };
}

function destinationFor(file) {
  const lower = file.toLowerCase();
  if (PROTECTED_ROOT_ASSETS.has(file)) return null;
  if (!isRoot(file) || !isDoc(file)) return null;

  if (
    lower.includes('constitution') ||
    lower.includes('ratification') ||
    lower.includes('constitutional') ||
    lower.includes('article_0') ||
    lower.includes('truth_classification') ||
    lower.includes('truth_dependency')
  ) {
    return `docs/architecture/constitution/${file}`;
  }

  if (lower.includes('adr') || /^PAQ-\d+/.test(file)) {
    return `docs/adr/${file}`;
  }

  if (lower.includes('repository') || lower.includes('repo-') || lower.includes('codebase') || lower.includes('migration')) {
    return `docs/architecture/repository/${file}`;
  }

  if (
    lower.includes('build_tree') ||
    lower.includes('build-tree') ||
    lower.includes('module_decision') ||
    lower.includes('refactor') ||
    lower.includes('move_later') ||
    lower.includes('do_not_touch') ||
    lower.includes('review_required') ||
    lower.includes('delete_later') ||
    lower.includes('consolidate_later')
  ) {
    return `docs/architecture/build-tree/${file}`;
  }

  if (lower.includes('manager') || lower.includes('partner') || lower.includes('andrey') || lower.includes('russell')) {
    return `docs/architecture/manager-os/${file}`;
  }

  if (lower.includes('advisor') || lower.includes('nash') || lower.includes('relationship')) {
    return `docs/architecture/advisor-os/${file}`;
  }

  if (
    lower.includes('alfa_medical') ||
    lower.includes('gmm') ||
    lower.includes('vida-mujer') ||
    lower.includes('imagina-ser') ||
    lower.includes('orvi') ||
    lower.includes('segu-beca') ||
    lower.includes('product') ||
    lower.includes('quote') ||
    lower.includes('coverage')
  ) {
    return `docs/architecture/product-intelligence/${file}`;
  }

  if (lower.includes('compensation') || lower.includes('comision') || lower.includes('commission')) {
    return `docs/architecture/compensation/${file}`;
  }

  if (
    lower.includes('discovery') ||
    lower.includes('friction') ||
    lower.includes('readiness') ||
    lower.includes('judgment') ||
    lower.includes('action_safety') ||
    lower.includes('career') ||
    lower.includes('excellence') ||
    lower.includes('skynet') ||
    lower.includes('wall_e') ||
    lower.includes('professional') ||
    lower.includes('dependency_signal')
  ) {
    return `docs/architecture/discovery/${file}`;
  }

  return `docs/archive/${file}`;
}

function classifyPlanRecord(file, sets) {
  const destination = destinationFor(file);

  if (PROTECTED_ROOT_ASSETS.has(file)) {
    return {
      source: file,
      destination,
      action: 'SKIP_PROTECTED',
      reason: 'Protected root asset; harness must reject movement.',
    };
  }

  if (!isRoot(file) || !isDoc(file)) {
    return {
      source: file,
      destination,
      action: 'REVIEW_REQUIRED',
      reason: 'Not a root documentation file in harness scope.',
    };
  }

  if (isTestDoc(file)) {
    return {
      source: file,
      destination,
      action: 'SKIP_TEST_DOC',
      reason: 'Filename indicates test/validation artifact; requires separate evidence policy.',
    };
  }

  if (isCode(file)) {
    return {
      source: file,
      destination,
      action: 'REVIEW_REQUIRED',
      reason: 'Runtime/code-like file is outside document migration scope.',
    };
  }

  if (sets.untracked.has(file)) {
    return {
      source: file,
      destination,
      action: 'BLOCKED_UNTRACKED',
      reason: 'Untracked file; git mv cannot be used without explicit tracking decision.',
    };
  }

  if (destination && fs.existsSync(path.join(ROOT, destination))) {
    return {
      source: file,
      destination,
      action: 'SKIP_DEST_EXISTS',
      reason: 'Destination already exists; harness refuses overwrite.',
    };
  }

  if (!sets.tracked.has(file)) {
    return {
      source: file,
      destination,
      action: 'REVIEW_REQUIRED',
      reason: 'File is neither tracked nor clearly untracked in current git view.',
    };
  }

  return {
    source: file,
    destination,
    action: 'MOVE',
    reason: 'Tracked root documentation file with destination candidate.',
  };
}

function makeInventory() {
  const sets = statusSets();
  const allFiles = walk('.');
  const root = rootFiles();
  const rootDocs = root.filter(isDoc);
  const protectedAssets = root.filter((file) => PROTECTED_ROOT_ASSETS.has(file));
  const codeFiles = allFiles.filter(isCode);
  const candidates = rootDocs.map((file) => classifyPlanRecord(file, sets));

  return {
    generatedAt: new Date().toISOString(),
    safety: {
      writes: 'reports_only',
      movesFiles: false,
      rewritesReferences: false,
      deletesFiles: false,
    },
    counts: {
      allFiles: allFiles.length,
      trackedFiles: sets.tracked.size,
      untrackedFiles: sets.untracked.size,
      rootFiles: root.length,
      rootDocs: rootDocs.length,
      protectedAssets: protectedAssets.length,
      codeFiles: codeFiles.length,
      destinationCandidates: candidates.filter((record) => record.destination).length,
    },
    protectedRootAssets: Array.from(PROTECTED_ROOT_ASSETS),
    protectedAssets: Array.from(PROTECTED_ROOT_ASSETS),
    files: allFiles,
    trackedFiles: Array.from(sets.tracked).sort(),
    untrackedFiles: Array.from(sets.untracked).sort(),
    rootFiles: root,
    rootDocs,
    codeFiles,
    destinationCandidates: candidates,
    candidates,
  };
}

function writeJson(file, value) {
  fs.writeFileSync(path.join(ROOT, file), `${JSON.stringify(value, null, 2)}\n`);
}

function tableRow(cells) {
  return `| ${cells.map((cell) => String(cell ?? '').replace(/\|/g, '\\|').replace(/\n/g, '<br>')).join(' | ')} |`;
}

function normalizeRel(file) {
  const normalized = path.posix.normalize(file).replace(/^\.\//, '');
  return normalized === '.' ? '' : normalized;
}

function actionCounts(records) {
  return records.reduce((acc, record) => {
    acc[record.action] = (acc[record.action] || 0) + 1;
    return acc;
  }, {});
}

function writePlan(batch) {
  const inventory = makeInventory();
  const records = inventory.destinationCandidates;
  const file = `ROOT_DOCS_MIGRATION_BATCH_${batch}_MOVE_MAP.md`;
  const counts = actionCounts(records);

  let md = '';
  md += `# ROOT DOCS MIGRATION BATCH ${batch} MOVE MAP\n\n`;
  md += 'Status: PLAN ONLY / NO FILES MOVED\n\n';
  md += 'Generated by: `scripts/repo-doc-migration-harness.js plan`\n\n';
  md += '## Safety Rules\n\n';
  md += '- Harness does not execute moves.\n';
  md += '- Protected root assets are hard-blocked.\n';
  md += '- Existing destinations are not overwritten.\n';
  md += '- Untracked files require human tracking approval.\n';
  md += '- Test/validation docs require separate evidence policy.\n\n';
  md += '## Summary\n\n';
  md += tableRow(['Action', 'Count']) + '\n';
  md += tableRow(['---', '---:']) + '\n';
  for (const action of Object.keys(counts).sort()) {
    md += tableRow([action, counts[action]]) + '\n';
  }
  md += '\n## Move Map\n\n';
  md += tableRow(['Action', 'Source', 'Destination', 'Reason']) + '\n';
  md += tableRow(['---', '---', '---', '---']) + '\n';
  for (const record of records) {
    md += tableRow([
      record.action,
      `\`${record.source}\``,
      record.destination ? `\`${record.destination}\`` : '-',
      record.reason,
    ]) + '\n';
  }

  fs.writeFileSync(path.join(ROOT, file), md);
  return { file, counts };
}

function validate() {
  const inventory = makeInventory();
  const records = inventory.destinationCandidates;
  const destinationGroups = new Map();

  for (const record of records) {
    if (!record.destination) continue;
    if (!destinationGroups.has(record.destination)) destinationGroups.set(record.destination, []);
    destinationGroups.get(record.destination).push(record.source);
  }

  const duplicateDestinations = Array.from(destinationGroups.entries())
    .filter(([, sources]) => sources.length > 1)
    .map(([destination, sources]) => ({ destination, sources }));

  const destinationCollisions = records
    .filter((record) => record.destination && fs.existsSync(path.join(ROOT, record.destination)))
    .map((record) => ({ source: record.source, destination: record.destination }));

  const protectedViolations = records
    .filter((record) => PROTECTED_ROOT_ASSETS.has(record.source) && record.action === 'MOVE');

  const runtimeInMoveList = records
    .filter((record) => record.action === 'MOVE' && isCode(record.source));

  const ownershipIssues = records
    .filter((record) => record.action === 'REVIEW_REQUIRED')
    .map((record) => ({ source: record.source, reason: record.reason }));

  const status = (
    protectedViolations.length === 0 &&
    runtimeInMoveList.length === 0 &&
    duplicateDestinations.length === 0
  ) ? 'PASS_WITH_REVIEW_ITEMS' : 'FAIL';

  let md = '';
  md += '# Migration Validation Report\n\n';
  md += `Status: ${status}\n\n`;
  md += 'This report validates the generated plan. It does not move files.\n\n';
  md += '## Checks\n\n';
  md += tableRow(['Check', 'Count', 'Status']) + '\n';
  md += tableRow(['---', '---:', '---']) + '\n';
  md += tableRow(['Destination collisions', destinationCollisions.length, destinationCollisions.length ? 'REVIEW_REQUIRED' : 'PASS']) + '\n';
  md += tableRow(['Protected root violations', protectedViolations.length, protectedViolations.length ? 'FAIL' : 'PASS']) + '\n';
  md += tableRow(['Runtime files in MOVE list', runtimeInMoveList.length, runtimeInMoveList.length ? 'FAIL' : 'PASS']) + '\n';
  md += tableRow(['Duplicate destinations', duplicateDestinations.length, duplicateDestinations.length ? 'FAIL' : 'PASS']) + '\n';
  md += tableRow(['Broken ownership rules / review required', ownershipIssues.length, ownershipIssues.length ? 'REVIEW_REQUIRED' : 'PASS']) + '\n';
  md += '\n## Destination Collisions\n\n';
  md += tableRow(['Source', 'Destination']) + '\n';
  md += tableRow(['---', '---']) + '\n';
  for (const item of destinationCollisions) md += tableRow([`\`${item.source}\``, `\`${item.destination}\``]) + '\n';
  if (!destinationCollisions.length) md += tableRow(['-', '-']) + '\n';
  md += '\n## Review Required\n\n';
  md += tableRow(['Source', 'Reason']) + '\n';
  md += tableRow(['---', '---']) + '\n';
  for (const item of ownershipIssues) md += tableRow([`\`${item.source}\``, item.reason]) + '\n';
  if (!ownershipIssues.length) md += tableRow(['-', '-']) + '\n';

  fs.writeFileSync(path.join(ROOT, 'migration-validation-report.md'), md);
  return { status, destinationCollisions, protectedViolations, runtimeInMoveList, duplicateDestinations, ownershipIssues };
}

function markdownFiles() {
  return walk('.').filter((file) => file.endsWith('.md'));
}

function stripMarkdownCodeBlocks(content) {
  return content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/~~~[\s\S]*?~~~/g, '');
}

function cleanMarkdownTarget(rawTarget) {
  const trimmed = rawTarget.trim();
  const withoutAngleBrackets = trimmed.startsWith('<') && trimmed.endsWith('>')
    ? trimmed.slice(1, -1).trim()
    : trimmed;
  const titleMatch = withoutAngleBrackets.match(/^(\S+)\s+["'][^"']*["']$/);
  return titleMatch ? titleMatch[1] : withoutAngleBrackets;
}

function extractMarkdownLinks(content) {
  const links = [];
  const pattern = /!?\[[^\]]*]\(([^)]+)\)/g;
  let match;
  while ((match = pattern.exec(content))) {
    links.push(cleanMarkdownTarget(match[1]));
  }
  return links;
}

function extractFilenameReferences(content, filenames) {
  const refs = [];
  for (const filename of filenames) {
    if (content.includes(filename)) refs.push(filename);
  }
  return refs;
}

function rewritePlan() {
  const inventory = makeInventory();
  const moveCandidates = inventory.destinationCandidates
    .filter((record) => record.destination)
    .map((record) => ({ source: record.source, destination: record.destination, action: record.action }));
  const filenames = moveCandidates.map((record) => record.source);

  const records = [];
  for (const file of markdownFiles()) {
    const content = fs.readFileSync(path.join(ROOT, file), 'utf8');
    const markdownLinks = extractMarkdownLinks(content)
      .filter((link) => !link.startsWith('http://') && !link.startsWith('https://') && !link.startsWith('#') && !link.startsWith('mailto:'));
    const filenameReferences = extractFilenameReferences(content, filenames);

    for (const link of markdownLinks) {
      records.push({
        file,
        type: 'markdown_link',
        reference: link,
        suggestedAction: 'review_before_rewrite',
      });
    }

    for (const ref of filenameReferences) {
      const candidate = moveCandidates.find((record) => record.source === ref);
      records.push({
        file,
        type: 'filename_reference',
        reference: ref,
        suggestedDestination: candidate ? candidate.destination : '',
        suggestedAction: 'review_before_rewrite',
      });
    }
  }

  let md = '';
  md += '# Reference Rewrite Plan\n\n';
  md += 'Status: PLAN ONLY / NO WRITES\n\n';
  md += 'This report identifies markdown links, relative paths and filename references that may need review after document movement.\n\n';
  md += '## Summary\n\n';
  const byType = records.reduce((acc, record) => {
    acc[record.type] = (acc[record.type] || 0) + 1;
    return acc;
  }, {});
  md += tableRow(['Type', 'Count']) + '\n';
  md += tableRow(['---', '---:']) + '\n';
  for (const type of Object.keys(byType).sort()) md += tableRow([type, byType[type]]) + '\n';
  md += '\n## References\n\n';
  md += tableRow(['File', 'Type', 'Reference', 'Suggested Destination', 'Action']) + '\n';
  md += tableRow(['---', '---', '---', '---', '---']) + '\n';
  for (const record of records) {
    md += tableRow([
      `\`${record.file}\``,
      record.type,
      `\`${record.reference}\``,
      record.suggestedDestination ? `\`${record.suggestedDestination}\`` : '-',
      record.suggestedAction,
    ]) + '\n';
  }
  if (!records.length) md += tableRow(['-', '-', '-', '-', '-']) + '\n';

  fs.writeFileSync(path.join(ROOT, 'reference-rewrite-plan.md'), md);
  return { records };
}

function classifyMarkdownLink(sourceFile, rawLink) {
  const link = cleanMarkdownTarget(rawLink);

  if (!link) {
    return {
      sourceFile,
      linkedPath: rawLink,
      resolvedTarget: '',
      status: 'UNKNOWN',
    };
  }

  if (/^[a-z][a-z0-9+.-]*:/i.test(link) || link.startsWith('//')) {
    return {
      sourceFile,
      linkedPath: link,
      resolvedTarget: '',
      status: 'EXTERNAL',
    };
  }

  if (link.startsWith('#')) {
    return {
      sourceFile,
      linkedPath: link,
      resolvedTarget: sourceFile,
      status: 'ANCHOR_ONLY',
    };
  }

  const pathOnly = link.split('#')[0];
  if (!pathOnly) {
    return {
      sourceFile,
      linkedPath: link,
      resolvedTarget: sourceFile,
      status: 'ANCHOR_ONLY',
    };
  }

  let decodedPath = pathOnly;
  try {
    decodedPath = decodeURIComponent(pathOnly);
  } catch (error) {
    return {
      sourceFile,
      linkedPath: link,
      resolvedTarget: '',
      status: 'UNKNOWN',
    };
  }

  const resolvedTarget = normalizeRel(path.posix.join(path.posix.dirname(sourceFile), decodedPath));
  const exists = Boolean(resolvedTarget) && fs.existsSync(path.join(ROOT, resolvedTarget));

  return {
    sourceFile,
    linkedPath: link,
    resolvedTarget,
    status: exists ? 'OK' : 'BROKEN',
  };
}

function linkReport() {
  const records = [];

  for (const file of markdownFiles()) {
    const content = fs.readFileSync(path.join(ROOT, file), 'utf8');
    const links = extractMarkdownLinks(stripMarkdownCodeBlocks(content));
    for (const link of links) {
      records.push(classifyMarkdownLink(file, link));
    }
  }

  const counts = records.reduce((acc, record) => {
    acc[record.status] = (acc[record.status] || 0) + 1;
    return acc;
  }, {});

  let md = '';
  md += '# Broken Link Report\n\n';
  md += 'Status: REPORT ONLY / NO WRITES TO SOURCE DOCS\n\n';
  md += 'This report resolves Markdown links relative to each source file. It ignores fenced code blocks before extraction.\n\n';
  md += '## Summary\n\n';
  md += tableRow(['Status', 'Count']) + '\n';
  md += tableRow(['---', '---:']) + '\n';
  for (const status of Object.keys(counts).sort()) md += tableRow([status, counts[status]]) + '\n';
  if (!records.length) md += tableRow(['-', 0]) + '\n';
  md += '\n## Links\n\n';
  md += tableRow(['Source File', 'Linked Path', 'Resolved Target', 'Status']) + '\n';
  md += tableRow(['---', '---', '---', '---']) + '\n';
  for (const record of records) {
    md += tableRow([
      `\`${record.sourceFile}\``,
      `\`${record.linkedPath}\``,
      record.resolvedTarget ? `\`${record.resolvedTarget}\`` : '-',
      record.status,
    ]) + '\n';
  }
  if (!records.length) md += tableRow(['-', '-', '-', '-']) + '\n';

  fs.writeFileSync(path.join(ROOT, 'broken-link-report.md'), md);
  return { records, counts };
}

function compareDestination(record) {
  if (!record.destination) {
    return {
      source: record.source,
      destination: '',
      status: 'REVIEW_REQUIRED',
      reason: 'No destination candidate exists for this record.',
    };
  }

  const sourcePath = path.join(ROOT, record.source);
  const destinationPath = path.join(ROOT, record.destination);

  if (!fs.existsSync(destinationPath)) {
    return {
      source: record.source,
      destination: record.destination,
      status: 'DESTINATION_MISSING',
      reason: 'Destination does not exist.',
    };
  }

  if (!fs.existsSync(sourcePath)) {
    return {
      source: record.source,
      destination: record.destination,
      status: 'REVIEW_REQUIRED',
      reason: 'Source file is missing; cannot compare content.',
    };
  }

  const source = fs.readFileSync(sourcePath);
  const destination = fs.readFileSync(destinationPath);
  const exact = source.length === destination.length && source.equals(destination);

  return {
    source: record.source,
    destination: record.destination,
    status: exact ? 'EXACT_DUPLICATE' : 'CONTENT_DIFFERS',
    reason: exact ? 'Source and destination contents match exactly.' : 'Destination exists with different content.',
  };
}

function duplicateDestinationReport() {
  const inventory = makeInventory();
  const records = inventory.destinationCandidates
    .filter((record) => record.destination)
    .map(compareDestination);
  const counts = records.reduce((acc, record) => {
    acc[record.status] = (acc[record.status] || 0) + 1;
    return acc;
  }, {});

  let md = '';
  md += '# Duplicate Destination Report\n\n';
  md += 'Status: REPORT ONLY / NEVER OVERWRITE\n\n';
  md += 'This report compares planned destinations that already exist and marks missing destinations as safe from collision.\n\n';
  md += '## Summary\n\n';
  md += tableRow(['Status', 'Count']) + '\n';
  md += tableRow(['---', '---:']) + '\n';
  for (const status of Object.keys(counts).sort()) md += tableRow([status, counts[status]]) + '\n';
  if (!records.length) md += tableRow(['-', 0]) + '\n';
  md += '\n## Destinations\n\n';
  md += tableRow(['Source', 'Destination', 'Status', 'Reason']) + '\n';
  md += tableRow(['---', '---', '---', '---']) + '\n';
  for (const record of records) {
    md += tableRow([
      `\`${record.source}\``,
      record.destination ? `\`${record.destination}\`` : '-',
      record.status,
      record.reason,
    ]) + '\n';
  }
  if (!records.length) md += tableRow(['-', '-', '-', '-']) + '\n';

  fs.writeFileSync(path.join(ROOT, 'duplicate-destination-report.md'), md);
  return { records, counts };
}

function validateInventoryObject(inventory) {
  const checks = [
    ['generatedAt', (value) => typeof value === 'string' && value.length > 0, 'Required ISO timestamp string.'],
    ['files', Array.isArray, 'Required array of repository files.'],
    ['protectedAssets', Array.isArray, 'Required array of hardcoded protected assets.'],
    ['rootDocs', Array.isArray, 'Required array of root documentation files.'],
    ['trackedFiles', Array.isArray, 'Required array of git-tracked files.'],
    ['untrackedFiles', Array.isArray, 'Required array of git-untracked files.'],
    ['candidates', Array.isArray, 'Required array of destination candidates.'],
  ];

  const results = checks.map(([field, predicate, expectation]) => {
    const present = Object.prototype.hasOwnProperty.call(inventory, field);
    const valid = present && predicate(inventory[field]);
    const observed = present && Array.isArray(inventory[field]) ? 'array' : typeof inventory[field];
    return {
      field,
      status: valid ? 'PASS' : 'FAIL',
      expectation,
      observed: present ? observed : 'missing',
    };
  });

  const missingProtectedAssets = Array.from(PROTECTED_ROOT_ASSETS)
    .filter((asset) => !Array.isArray(inventory.protectedAssets) || !inventory.protectedAssets.includes(asset));

  for (const asset of missingProtectedAssets) {
    results.push({
      field: `protectedAssets:${asset}`,
      status: 'FAIL',
      expectation: 'Protected root asset must be present in inventory schema.',
      observed: 'missing',
    });
  }

  return {
    valid: results.every((result) => result.status === 'PASS'),
    results,
  };
}

function validateInventory(file = 'migration-inventory.json') {
  const fullPath = path.join(ROOT, file);
  let inventory = null;
  let parseError = '';

  try {
    inventory = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  } catch (error) {
    parseError = error.message;
  }

  const validation = inventory ? validateInventoryObject(inventory) : {
    valid: false,
    results: [{
      field: file,
      status: 'FAIL',
      expectation: 'Readable JSON inventory file.',
      observed: parseError || 'missing',
    }],
  };

  let md = '';
  md += '# Inventory Schema Validation Report\n\n';
  md += `Status: ${validation.valid ? 'PASS' : 'FAIL'}\n\n`;
  md += 'This report validates the structure required by the migration harness. It does not modify the inventory.\n\n';
  md += '## Checks\n\n';
  md += tableRow(['Field', 'Status', 'Expectation', 'Observed']) + '\n';
  md += tableRow(['---', '---', '---', '---']) + '\n';
  for (const result of validation.results) {
    md += tableRow([result.field, result.status, result.expectation, result.observed]) + '\n';
  }

  fs.writeFileSync(path.join(ROOT, 'inventory-schema-validation-report.md'), md);
  return validation;
}

function printHelp() {
  console.log(`Usage:
  node scripts/repo-doc-migration-harness.js inventory
  node scripts/repo-doc-migration-harness.js plan --batch 1
  node scripts/repo-doc-migration-harness.js validate
  node scripts/repo-doc-migration-harness.js rewrite-plan
  node scripts/repo-doc-migration-harness.js links
  node scripts/repo-doc-migration-harness.js duplicates
  node scripts/repo-doc-migration-harness.js validate-inventory

Outputs:
  migration-inventory.json
  ROOT_DOCS_MIGRATION_BATCH_X_MOVE_MAP.md
  migration-validation-report.md
  reference-rewrite-plan.md
  broken-link-report.md
  duplicate-destination-report.md
  inventory-schema-validation-report.md`);
}

function main() {
  const { command, options } = parseArgs(process.argv);

  if (command === 'inventory') {
    const inventory = makeInventory();
    writeJson('migration-inventory.json', inventory);
    console.log('Wrote migration-inventory.json');
    return;
  }

  if (command === 'plan') {
    const batch = options.batch || '1';
    const result = writePlan(batch);
    console.log(`Wrote ${result.file}`);
    return;
  }

  if (command === 'validate') {
    const result = validate();
    console.log(`Wrote migration-validation-report.md (${result.status})`);
    return;
  }

  if (command === 'rewrite-plan') {
    const result = rewritePlan();
    console.log(`Wrote reference-rewrite-plan.md (${result.records.length} references)`);
    return;
  }

  if (command === 'links') {
    const result = linkReport();
    console.log(`Wrote broken-link-report.md (${result.records.length} links)`);
    return;
  }

  if (command === 'duplicates') {
    const result = duplicateDestinationReport();
    console.log(`Wrote duplicate-destination-report.md (${result.records.length} destinations)`);
    return;
  }

  if (command === 'validate-inventory') {
    const result = validateInventory();
    console.log(`Wrote inventory-schema-validation-report.md (${result.valid ? 'PASS' : 'FAIL'})`);
    process.exitCode = result.valid ? 0 : 1;
    return;
  }

  printHelp();
  process.exitCode = command ? 1 : 0;
}

if (require.main === module) {
  main();
}

module.exports = {
  PROTECTED_ROOT_ASSETS,
  isCode,
  isDoc,
  isRoot,
  destinationFor,
  classifyPlanRecord,
  makeInventory,
  validate,
  extractMarkdownLinks,
  classifyMarkdownLink,
  linkReport,
  compareDestination,
  duplicateDestinationReport,
  validateInventoryObject,
  validateInventory,
};
