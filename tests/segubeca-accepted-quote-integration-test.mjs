import assert from "node:assert/strict";
import {
  parseSegubecaPdfTextToAcceptedQuotePacket
} from "../docs/static-preview/quote-runtime/forge-pdf-browser-parser.js";
import {
  buildAcceptedNativeResult107z15p2R9C,
  isSegubecaAcceptedR14E,
  calculateSegubecaAcceptedR14E
} from "../docs/static-preview/quote-runtime/forge-accepted-quote-adapter.js";
import {
  buildSegubecaDashboardModel
} from "../docs/static-preview/quote-runtime/forge-segubeca-product-dashboard-adapter.js";

const sampleText = `
UDI SeguBeca 18
Titular Menor Prueba No 25/06/2022 4 4 Masculino No
Contratante Contratante Prueba No 29/09/1992 33 31 Masculino No
SeguBeca 18 (SeguBeca 18) 14 años 30,000 2,284.33
Protección por Fallecimiento e Invalidez del Contratante (PIM 18 CT UI) 14 años Amparado 73.06
Prima Total Anual 2,524.19
ADAPTA (ADAPTA) 5 REN 100,000 418.73
Prima total con beneficios recomendados 3,080.09
0.00 % 4 2,524 2,524 0 0 0 2,284
84.89 % 17 2,524 35,339 0 30,000 30,000 30,000
La tasa de interes para entrega mensual es estimada a 1.0% anual vigente al momento de la cotización.
1 18 30,000 637 7,647 22,819 24,979
2 19 22,612 637 15,294 15,288 19,353
3 20 15,149 637 22,941 7,682 13,362
4 21 7,612 637 30,588 - 6,702
Todas las cantidades están expresadas en Unidades de Inversión (UDI).
`;

const packet = parseSegubecaPdfTextToAcceptedQuotePacket(sampleText);
assert.equal(packet.nativeResult.prospect, "Contratante Prueba");
assert.equal(packet.nativeResult.sumInsured, 30000);
assert.equal(packet.nativeResult.premiumTable.annual, 2524.19);
assert.equal(packet.nativeResult.premiumTable.plannedAnnual, 3080.09);
assert.equal(packet.nativeResult.policyTerm, "14 años");

const normalized = buildAcceptedNativeResult107z15p2R9C(packet);
assert.equal(isSegubecaAcceptedR14E(packet, normalized), true);
assert.equal(normalized.benefitSummary.blocks.length > 0, true);

const calculation = calculateSegubecaAcceptedR14E(packet, normalized);
assert.equal(calculation.productFamily, "segubeca");
assert.equal(calculation.annualPremium, 2524.19);
assert.equal(calculation.coveragePeriod, "14 años");
assert.equal(calculation.totalContributed, 35339);
assert.equal(calculation.totalRecovery, 30000);
assert.equal(calculation.nativeResult.benefitSummary.blocks.length > 0, true);

const model = buildSegubecaDashboardModel(calculation.nativeResult.benefitSummary);
assert.equal(model.productType, "segubeca");
assert.equal(model.sections.length > 0, true);

console.log("PASS SeguBeca accepted runtime/modal integration R14E");
