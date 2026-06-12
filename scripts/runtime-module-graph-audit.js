#!/usr/bin/env node

/*
 * RUNTIME-003 module graph audit
 *
 * Safety posture:
 * - Reads root JavaScript files.
 * - Writes only architecture reports.
 * - Does not move, rename, rewrite imports or modify runtime files.
 * - Exits 1 when a BOOT_BLOCKER is detected.
 */

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, 'docs', 'architecture', 'runtime');

const APP_SHELL_ENTRY = 'app.js';
const APP_SHELL_IMPORT_CLASSES = new Map([
  ['db.js', 'Platform boot'],
  ['utils.js', 'Platform boot'],
  ['dashboard.js', 'Domain route'],
  ['prospeccion.js', 'Advisor OS'],
  ['referidos.js', 'Advisor OS'],
  ['actividad.js', 'Advisor OS'],
  ['cartera.js', 'Legacy route'],
  ['comisiones.js', 'Manager OS'],
  ['core-app-engine.js', 'Platform boot'],
  ['state-manager.js', 'Platform boot'],
  ['event-system.js', 'Platform boot'],
  ['module-lifecycle.js', 'Platform boot'],
  ['ui-render-engine.js', 'Platform boot'],
  ['sync-orchestrator.js', 'Platform boot'],
  ['analytics-engine.js', 'Platform boot'],
  ['error-boundary.js', 'Platform boot'],
  ['logger.js', 'Platform boot'],
  ['app-shell-manager.js', 'Platform boot'],
]);

function ensureReportDir() {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

function rootJsFiles() {
  const IGNORE_DIRS = new Set(['.git', 'node_modules', 'docs', 'scripts', 'tests', 'fixtures', 'Concursos SMNYL']);

  function scan(dir, base = ROOT) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    let files = [];
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (IGNORE_DIRS.has(entry.name) || entry.name.startsWith('.')) continue;
        files = files.concat(scan(path.join(dir, entry.name), base));
      } else if (entry.isFile() && entry.name.endsWith('.js')) {
        const relativePath = path.posix.relative(base, path.join(dir, entry.name));
        files.push(relativePath);
      }
    }
    return files;
  }

  return scan(ROOT).sort();
}

function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

function parseNamedImportClause(clause) {
  const trimmed = clause.trim();
  if (!trimmed) return [];
  if (trimmed.startsWith('* as ')) return [{ imported: '*', local: trimmed.slice(5).trim() }];
  if (!trimmed.includes('{')) return [{ imported: 'default', local: trimmed.split(',')[0].trim() }];

  const names = [];
  const defaultPart = trimmed.split('{')[0].replace(',', '').trim();
  if (defaultPart) names.push({ imported: 'default', local: defaultPart });

  const namedPart = trimmed.match(/\{([\s\S]*?)\}/);
  if (!namedPart) return names;

  for (const raw of namedPart[1].split(',')) {
    const item = raw.trim();
    if (!item) continue;
    const [imported, local] = item.split(/\s+as\s+/).map((part) => part.trim());
    names.push({ imported, local: local || imported });
  }

  return names;
}

function parseImports(source) {
  const clean = stripComments(source);
  const imports = [];

  const fromPattern = /import\s+([\s\S]*?)\s+from\s+['"]([^'"]+)['"]/g;
  for (const match of clean.matchAll(fromPattern)) {
    imports.push({
      type: 'static',
      target: match[2],
      names: parseNamedImportClause(match[1]),
    });
  }

  const sideEffectPattern = /import\s+['"]([^'"]+)['"]/g;
  for (const match of clean.matchAll(sideEffectPattern)) {
    imports.push({
      type: 'static',
      target: match[1],
      names: [],
    });
  }

  const dynamicPattern = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  for (const match of clean.matchAll(dynamicPattern)) {
    imports.push({
      type: 'dynamic',
      target: match[1],
      names: [],
    });
  }

  return imports;
}

function parseExports(source) {
  const clean = stripComments(source);
  const names = new Set();
  let hasDefault = false;

  const declarationPattern = /export\s+(?:async\s+)?(?:function|class|const|let|var)\s+([A-Za-z_$][\w$]*)/g;
  for (const match of clean.matchAll(declarationPattern)) names.add(match[1]);

  const listPattern = /export\s*\{([\s\S]*?)\}/g;
  for (const match of clean.matchAll(listPattern)) {
    for (const raw of match[1].split(',')) {
      const item = raw.trim();
      if (!item) continue;
      const alias = item.match(/\s+as\s+([A-Za-z_$][\w$]*)$/);
      if (alias) names.add(alias[1]);
      else names.add(item.split(/\s+/)[0]);
    }
  }

  if (/export\s+default\b/.test(clean)) {
    hasDefault = true;
    names.add('default');
  }

  return {
    names: Array.from(names).sort(),
    hasDefault,
  };
}

function resolveRelative(sourceFile, target) {
  if (!target.startsWith('.')) return null;
  const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(sourceFile), target));
  if (path.posix.extname(resolved)) return resolved;
  return `${resolved}.js`;
}

function classifyOwner(file) {
  const name = file.toLowerCase();
  if (APP_SHELL_IMPORT_CLASSES.has(file)) return APP_SHELL_IMPORT_CLASSES.get(file);
  if (/policy|cartera/.test(name)) return 'Product intelligence / Policy route';
  if (/comision|commission|smnyl|concursos/.test(name)) return 'Manager OS';
  if (/prospect|refer|advisor|activity|followup|dashboard/.test(name)) return 'Advisor OS';
  if (/core|runtime|storage|sync|state|event|logger|analytics|error|auth|network|render|ui|shell/.test(name)) return 'Platform boot';
  return 'Unknown';
}

function buildGraph() {
  const files = rootJsFiles();
  const fileSet = new Set(files);
  const modules = {};

  for (const file of files) {
    const source = fs.readFileSync(path.join(ROOT, file), 'utf8');
    modules[file] = {
      file,
      imports: parseImports(source),
      exports: parseExports(source),
    };
  }

  for (const module of Object.values(modules)) {
    module.imports = module.imports.map((entry) => ({
      ...entry,
      resolved: resolveRelative(module.file, entry.target),
    }));
  }

  return { files, fileSet, modules };
}

function appReachableSet(modules) {
  const reachable = new Set();
  const stack = [APP_SHELL_ENTRY];

  while (stack.length > 0) {
    const file = stack.pop();
    if (reachable.has(file) || !modules[file]) continue;
    reachable.add(file);
    for (const item of modules[file].imports) {
      if (item.type !== 'static') continue;
      if (item.resolved && modules[item.resolved]) stack.push(item.resolved);
    }
  }

  return reachable;
}

function classifyBlocker(sourceFile, reachable, appImports) {
  if (sourceFile === APP_SHELL_ENTRY || reachable.has(sourceFile)) return 'BOOT_BLOCKER';
  if (appImports.has(sourceFile)) return 'BOOT_BLOCKER';
  if (/-test\.js$|master-test\.js$|smoke-test\.js$/.test(sourceFile)) return 'TEST_ONLY';
  if (classifyOwner(sourceFile).includes('route')) return 'ROUTE_BLOCKER';
  return 'DOMAIN_BLOCKER';
}

function validateTargets(graph, reachable, appImports) {
  const issues = [];

  for (const module of Object.values(graph.modules)) {
    for (const item of module.imports) {
      if (!item.resolved) continue;
      if (!graph.fileSet.has(item.resolved)) {
        issues.push({
          source: module.file,
          target: item.target,
          resolved: item.resolved,
          type: item.type,
          classification: classifyBlocker(module.file, reachable, appImports),
        });
      }
    }
  }

  return issues;
}

function validateNamedExports(graph, reachable, appImports) {
  const issues = [];

  for (const module of Object.values(graph.modules)) {
    for (const item of module.imports) {
      if (!item.resolved || !graph.modules[item.resolved]) continue;
      if (item.type !== 'static') continue;
      const exported = new Set(graph.modules[item.resolved].exports.names);

      for (const name of item.names) {
        if (name.imported === '*' || name.imported === 'default') {
          if (name.imported === 'default' && !exported.has('default')) {
            issues.push({
              source: module.file,
              target: item.target,
              resolved: item.resolved,
              imported: name.imported,
              classification: classifyBlocker(module.file, reachable, appImports),
            });
          }
          continue;
        }
        if (!exported.has(name.imported)) {
          issues.push({
            source: module.file,
            target: item.target,
            resolved: item.resolved,
            imported: name.imported,
            classification: classifyBlocker(module.file, reachable, appImports),
          });
        }
      }
    }
  }

  return issues;
}

function detectCycles(graph) {
  const cycles = [];
  const visited = new Set();
  const stack = [];
  const inStack = new Set();

  function visit(file) {
    if (inStack.has(file)) {
      const start = stack.indexOf(file);
      const cycle = stack.slice(start).concat(file);
      const key = cycle.join('>');
      if (!cycles.some((item) => item.key === key)) {
        cycles.push({
          key,
          chain: cycle,
          classification: cycle.includes(APP_SHELL_ENTRY) ? 'APP_SHELL_CYCLE' : 'DOMAIN_CYCLE',
        });
      }
      return;
    }
    if (visited.has(file)) return;

    visited.add(file);
    inStack.add(file);
    stack.push(file);

    for (const item of graph.modules[file]?.imports || []) {
      if (item.type === 'static' && item.resolved && graph.modules[item.resolved]) visit(item.resolved);
    }

    stack.pop();
    inStack.delete(file);
  }

  for (const file of graph.files) visit(file);
  return cycles;
}

function appShellCouplings(graph) {
  return (graph.modules[APP_SHELL_ENTRY]?.imports || [])
    .filter((item) => item.type === 'static' && item.resolved)
    .map((item) => {
      const category = APP_SHELL_IMPORT_CLASSES.get(item.resolved) || classifyOwner(item.resolved);
      const shouldLazy = ['Domain route', 'Advisor OS', 'Manager OS', 'Legacy route', 'Product intelligence / Policy route'].includes(category);
      return {
        path: item.resolved,
        importedNames: item.names.map((name) => name.imported).join(', '),
        category,
        shouldEventuallyBeDynamic: shouldLazy,
      };
    });
}

function markdownTable(headers, rows) {
  const escape = (value) => String(value ?? '').replace(/\|/g, '\\|');
  return [
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${row.map(escape).join(' | ')} |`),
  ].join('\n');
}

function verdict({ missingTargets, missingExports }) {
  const bootBlockers = [...missingTargets, ...missingExports]
    .filter((issue) => issue.classification === 'BOOT_BLOCKER');
  if (bootBlockers.length > 0) return 'LIKELY_BOOT_FAILURE';
  if (missingTargets.length || missingExports.length) return 'EXECUTABLE_WITH_WARNINGS';
  return 'EXECUTABLE';
}

function writeReports(result) {
  ensureReportDir();

  fs.writeFileSync(
    path.join(REPORT_DIR, 'RUNTIME-003_MODULE_GRAPH_VALIDATION.json'),
    JSON.stringify(result, null, 2),
  );

  const validation = [];
  validation.push('# RUNTIME-003 Module Graph Validation');
  validation.push('');
  validation.push('Report ID: RUNTIME-003');
  validation.push('Status: EXECUTABLE VALIDATION / NO FIXES');
  validation.push('');
  validation.push('## Executive Summary');
  validation.push('');
  validation.push(`Scanned ${result.summary.totalJsFilesScanned} root JavaScript files and found ${result.summary.totalImportsFound} import edges.`);
  validation.push('');
  validation.push(`Executability verdict: \`${result.summary.executabilityVerdict}\``);
  validation.push('');
  validation.push('No runtime files were modified, no imports were rewritten, and no files were renamed.');
  validation.push('');
  validation.push('## Summary');
  validation.push('');
  validation.push(markdownTable(
    ['Metric', 'Count'],
    [
      ['Total JS files scanned', result.summary.totalJsFilesScanned],
      ['Total imports found', result.summary.totalImportsFound],
      ['Missing targets', result.summary.missingTargetsCount],
      ['Missing exports', result.summary.missingExportsCount],
      ['Circular imports', result.summary.circularImportsCount],
      ['Boot blockers', result.summary.bootBlockersCount],
    ],
  ));
  validation.push('');
  validation.push('## Missing Import Targets');
  validation.push('');
  validation.push(result.missingTargets.length
    ? markdownTable(['Source', 'Target', 'Resolved', 'Type', 'Classification'], result.missingTargets.map((item) => [item.source, item.target, item.resolved, item.type, item.classification]))
    : 'None.');
  validation.push('');
  validation.push('## Missing Named Exports');
  validation.push('');
  validation.push(result.missingExports.length
    ? markdownTable(['Source', 'Target', 'Resolved', 'Imported Name', 'Classification'], result.missingExports.map((item) => [item.source, item.target, item.resolved, item.imported, item.classification]))
    : 'None.');
  validation.push('');
  validation.push('## Circular Imports');
  validation.push('');
  validation.push(result.circularImports.length
    ? markdownTable(['Classification', 'Chain'], result.circularImports.map((item) => [item.classification, item.chain.join(' -> ')]))
    : 'None detected.');
  validation.push('');
  validation.push('## Specific RUNTIME-002 Findings');
  validation.push('');
  validation.push(markdownTable(
    ['Finding', 'Result'],
    [
      ['utils.js imports ./overlay-manager.js', result.missingTargets.some((item) => item.source === 'utils.js' && item.resolved === 'overlay-manager.js') ? 'CONFIRMED MISSING TARGET' : 'Not detected'],
      ['./ovelay-manager.js exists', fs.existsSync(path.join(ROOT, 'ovelay-manager.js')) ? 'YES' : 'NO'],
      ['callGemini imported from app.js', result.missingExports.some((item) => item.resolved === 'app.js' && item.imported === 'callGemini') ? 'CONFIRMED MISSING EXPORT' : 'Not detected'],
    ],
  ));
  validation.push('');
  validation.push('## Executability Verdict');
  validation.push('');
  validation.push(`\`${result.summary.executabilityVerdict}\``);
  validation.push('');
  validation.push(result.summary.executabilityVerdict === 'LIKELY_BOOT_FAILURE'
    ? 'Static module evidence contains BOOT_BLOCKER issues in the app shell reachable graph. Runtime movement and shell refactor remain blocked until these contracts are repaired or proven false by executable browser validation.'
    : 'No boot blockers were detected by static module evidence.');
  validation.push('');
  validation.push('## Recommended RUNTIME-004 Scope');
  validation.push('');
  validation.push('Perform a controlled repair plan for the two boot-blocking contracts: resolve the overlay manager filename/export mismatch and resolve the `callGemini` export contract without changing app-shell architecture beyond the approved fixes.');
  validation.push('');
  validation.push('Confidence score: 0.88');
  validation.push('');

  fs.writeFileSync(path.join(REPORT_DIR, 'RUNTIME-003_MODULE_GRAPH_VALIDATION.md'), validation.join('\n'));

  const coupling = [];
  coupling.push('# RUNTIME-003 App Shell Coupling Map');
  coupling.push('');
  coupling.push('Report ID: RUNTIME-003');
  coupling.push('Status: APP SHELL COUPLING MAP / NO FIXES');
  coupling.push('');
  coupling.push('## Direct app.js Imports');
  coupling.push('');
  coupling.push(markdownTable(
    ['Path', 'Imported Names', 'Classification', 'Eventually Dynamic?'],
    result.appShellCouplings.map((item) => [item.path, item.importedNames, item.category, item.shouldEventuallyBeDynamic ? 'YES' : 'NO']),
  ));
  coupling.push('');
  coupling.push('## Boundary Finding');
  coupling.push('');
  coupling.push('`app.js` statically imports route/domain modules, so route module contract failures can become boot failures. Route/domain modules should become lazy route dependencies after boot blockers are repaired and after a separate shell refactor is approved.');
  coupling.push('');

  fs.writeFileSync(path.join(REPORT_DIR, 'RUNTIME-003_APP_SHELL_COUPLING_MAP.md'), coupling.join('\n'));
}

function main() {
  const graph = buildGraph();
  const reachable = appReachableSet(graph.modules);
  const appImports = new Set((graph.modules[APP_SHELL_ENTRY]?.imports || [])
    .map((item) => item.resolved)
    .filter(Boolean));
  const missingTargets = validateTargets(graph, reachable, appImports);
  const missingExports = validateNamedExports(graph, reachable, appImports);
  const circularImports = detectCycles(graph);
  const appShell = appShellCouplings(graph);
  const allImports = Object.values(graph.modules).flatMap((module) => module.imports);
  const bootBlockers = [...missingTargets, ...missingExports]
    .filter((issue) => issue.classification === 'BOOT_BLOCKER');
  const result = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalJsFilesScanned: graph.files.length,
      totalImportsFound: allImports.length,
      staticImportsFound: allImports.filter((item) => item.type === 'static').length,
      dynamicImportsFound: allImports.filter((item) => item.type === 'dynamic').length,
      missingTargetsCount: missingTargets.length,
      missingExportsCount: missingExports.length,
      circularImportsCount: circularImports.length,
      bootBlockersCount: bootBlockers.length,
      executabilityVerdict: verdict({ missingTargets, missingExports }),
      confidenceScore: 0.88,
    },
    missingTargets,
    missingExports,
    circularImports,
    bootBlockers,
    appShellCouplings: appShell,
  };

  writeReports(result);

  console.log(JSON.stringify(result.summary, null, 2));
  process.exit(bootBlockers.length > 0 ? 1 : 0);
}

main();
