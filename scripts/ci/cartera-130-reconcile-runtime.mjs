import { readFileSync, writeFileSync } from 'node:fs';

const APP_PATH = 'app.js';
const MATERIAL3_APP_PATH = 'docs/static-preview/forge-alive-material3/app.js';

const source = readFileSync(APP_PATH, 'utf8');
let output = source;

const carteraImport = "import { renderCartera,     bindCarteraEvents      } from './cartera.js';";
const enhancerImports = [
  "import { bindCartera030dPolicyPaymentCalendar } from './advisor-os/cartera/cartera-030d-policy-payment-calendar-enhancement.js';",
  "import { bindCartera040RelationshipMemory } from './advisor-os/cartera/cartera-040d-relationship-memory-enhancement.js';",
  "import { bindCartera050FutureRadar } from './advisor-os/cartera/cartera-050d-future-radar-enhancement.js';",
  "import { bindCartera060RelationshipGrowth } from './advisor-os/cartera/cartera-060d-relationship-growth-enhancement.js';",
  "import { bindCartera070RelationalActivation } from './advisor-os/cartera/cartera-070d-relational-activation-enhancement.js';",
  "import { bindCartera080EconomicConnection } from './advisor-os/cartera/cartera-080d-economic-connection-enhancement.js';",
  "import { bindCartera090RelationshipCapital } from './advisor-os/cartera/cartera-090d-relationship-capital-enhancement.js';",
  "import { bindCartera100ProductivityProof } from './advisor-os/cartera/cartera-100d-productivity-proof-enhancement.js';",
];

if (!output.includes(carteraImport)) {
  throw new Error('CARTERA130_CURRENT_MAIN_CARTERA_IMPORT_ANCHOR_MISSING');
}

const missingImports = enhancerImports.filter(line => !output.includes(line));
if (missingImports.length) {
  output = output.replace(carteraImport, `${carteraImport}\n${missingImports.join('\n')}`);
}

const bindingFunction = `function bindCarteraProductEvents() {
    bindCartera030dPolicyPaymentCalendar();
    bindCartera040RelationshipMemory();
    bindCartera050FutureRadar();
    bindCartera060RelationshipGrowth();
    bindCartera070RelationalActivation();
    bindCartera080EconomicConnection();
    bindCartera090RelationshipCapital();
    bindCartera100ProductivityProof();
    return bindCarteraEvents();
}

`;
const managerAnchor = '// ═══════════════════════════════════════════════════════════════\n// APP MANAGER';
if (!output.includes('function bindCarteraProductEvents()')) {
  if (!output.includes(managerAnchor)) {
    throw new Error('CARTERA130_CURRENT_MAIN_MANAGER_ANCHOR_MISSING');
  }
  output = output.replace(managerAnchor, `${bindingFunction}${managerAnchor}`);
}

const routeAnchor = '                renderCartera,\n                bindCarteraEvents,\n';
const reconciledRoute = '                renderCartera,\n                bindCarteraEvents: bindCarteraProductEvents,\n';
if (output.includes(routeAnchor)) {
  output = output.replace(routeAnchor, reconciledRoute);
} else if (!output.includes(reconciledRoute)) {
  throw new Error('CARTERA130_CURRENT_MAIN_ROUTE_BINDING_ANCHOR_MISSING');
}

if (output !== source) {
  writeFileSync(APP_PATH, output);
  console.log('CARTERA_130_APP_RECONCILIATION=UPDATED');
} else {
  console.log('CARTERA_130_APP_RECONCILIATION=IDEMPOTENT');
}

const material3Source = readFileSync(MATERIAL3_APP_PATH, 'utf8');
let material3Output = material3Source;
const bridgeImport = 'import "../quote-runtime/forge-quote-lifecycle-browser-bridge-cartera001b.js?v=cartera-001b-001";';
const material3Anchor = 'import "./pipeline-ui-stability.js?v=manual-pipeline-stability-001";';

if (!material3Output.includes(bridgeImport)) {
  if (!material3Output.includes(material3Anchor)) {
    throw new Error('CARTERA130_MATERIAL3_BRIDGE_ANCHOR_MISSING');
  }
  material3Output = material3Output.replace(
    material3Anchor,
    `${bridgeImport}\n${material3Anchor}`,
  );
}

if (material3Output !== material3Source) {
  writeFileSync(MATERIAL3_APP_PATH, material3Output);
  console.log('CARTERA_130_MATERIAL3_QUOTE_BRIDGE=UPDATED');
} else {
  console.log('CARTERA_130_MATERIAL3_QUOTE_BRIDGE=IDEMPOTENT');
}

console.log('CARTERA_130_CURRENT_MAIN_APP_PRESERVED=YES');
console.log('CARTERA_130_CARTERA_PRODUCT_BINDING=PASS');
console.log('CARTERA_130_MATERIAL3_BOUNDED_BRIDGE=PASS');
