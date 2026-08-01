import { readFileSync, writeFileSync } from 'node:fs';

function patch(path, replacements) {
  let source = readFileSync(path, 'utf8');
  for (const [before, after, code] of replacements) {
    if (!source.includes(before)) {
      throw new Error(`${code}:${path}`);
    }
    source = source.replace(before, after);
  }
  writeFileSync(path, source);
}

patch('tests/material3-pipeline-integration-test.mjs', [[
  '    "Cotizaciones",\n  ]);',
  '    "Cotizaciones",\n    "Cartera",\n  ]);',
  'CARTERA_M3_NAV_REGRESSION_EXPECTATION_NOT_FOUND',
]]);

patch('docs/static-preview/forge-alive-material3/cartera-module.js', [
  [
    '    runtime,\n    memory,\n    cartera,',
    '    runtime,\n    memory,\n    appState,\n    cartera,',
    'CARTERA_M3_APP_STATE_DESTRUCTURE_POINT_NOT_FOUND',
  ],
  [
    '    import(moduleUrl("supabase-runtime.js")),\n    import(moduleUrl("memory-manager.js")),\n    import(moduleUrl("cartera.js")),',
    '    import(moduleUrl("supabase-runtime.js")),\n    import(moduleUrl("memory-manager.js")),\n    import(moduleUrl("state-manager.js")),\n    import(moduleUrl("cartera.js")),',
    'CARTERA_M3_APP_STATE_IMPORT_POINT_NOT_FOUND',
  ],
  [
    '    SupabaseRuntime: runtime.SupabaseRuntime,\n    Memory: memory.Memory,',
    '    SupabaseRuntime: runtime.SupabaseRuntime,\n    Memory: memory.Memory,\n    AppState: appState.AppState,',
    'CARTERA_M3_APP_STATE_EXPORT_POINT_NOT_FOUND',
  ],
  [
    '  let activeAdvisorId = null;\n\n  function clearProductSession(reason = "scrub") {',
    '  let activeAdvisorId = null;\n  let activeProduct = null;\n\n  function clearProductSession(reason = "scrub") {',
    'CARTERA_M3_ACTIVE_PRODUCT_STATE_POINT_NOT_FOUND',
  ],
  [
    '    runCleaners(sessionCleaners);\n    activeAdvisorId = null;\n    root.replaceChildren();\n    root.dataset.carteraMaterial3State = reason;\n    delete root.dataset.carteraAdvisorId;',
    '    runCleaners(sessionCleaners);\n    if (activeProduct?.AppState?.state) {\n      activeProduct.AppState.state.cartera = [];\n      for (const key of Object.keys(activeProduct.AppState.state)) {\n        if (key.startsWith("cartera:")) delete activeProduct.AppState.state[key];\n      }\n    }\n    activeProduct = null;\n    activeAdvisorId = null;\n    root.replaceChildren();\n    root.dataset.carteraMaterial3State = reason;',
    'CARTERA_M3_SESSION_SCRUB_POINT_NOT_FOUND',
  ],
  [
    '      const product = await productModulesPromise;\n      if (!mounted || requestGeneration !== generation) return;\n\n      product.SupabaseRuntime.init(client);\n      activeAdvisorId = user.id;\n      root.dataset.carteraAdvisorId = user.id;',
    '      const product = await productModulesPromise;\n      if (!mounted || requestGeneration !== generation) return;\n\n      activeProduct = product;\n      product.SupabaseRuntime.init(client);\n      activeAdvisorId = user.id;',
    'CARTERA_M3_PRODUCT_SESSION_BINDING_POINT_NOT_FOUND',
  ],
  [
    '          advisorId: user.id,\n          routeId: "cartera",',
    '          authenticated: true,\n          routeId: "cartera",',
    'CARTERA_M3_MOUNT_EVENT_IDENTITY_POINT_NOT_FOUND',
  ],
  [
    '        advisorId: activeAdvisorId,\n        capturedCleanerCount:',
    '        authenticated: Boolean(activeAdvisorId),\n        capturedCleanerCount:',
    'CARTERA_M3_DIAGNOSTIC_IDENTITY_POINT_NOT_FOUND',
  ],
]);

patch('tests/cartera-material3-productive-ui-mount-test.mjs', [[
  "    'root.replaceChildren()',\n  ]);\n  assert.doesNotMatch(moduleSource, /Memory\\.cleanup\\(\\)/);",
  "    'root.replaceChildren()',\n    'activeProduct.AppState.state.cartera = []',\n    'key.startsWith(\"cartera:\")',\n  ]);\n  assert.doesNotMatch(moduleSource, /dataset\\.carteraAdvisorId/);\n  assert.doesNotMatch(moduleSource, /Memory\\.cleanup\\(\\)/);",
  'CARTERA_M3_SCRUB_TEST_POINT_NOT_FOUND',
]]);

console.log('CARTERA_MATERIAL3_NAV_REGRESSION_RECONCILIATION=PASS');
console.log('CARTERA_MATERIAL3_APP_STATE_SCRUB=PASS');
console.log('CARTERA_MATERIAL3_DOM_IDENTITY_EXPOSURE=BLOCKED');
