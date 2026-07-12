import assert from "node:assert/strict";
import { parseVidaMujerPdfTextToAcceptedQuotePacket } from "../docs/static-preview/quote-preview-live/forge-pdf-browser-parser.js";

const sampleText = `
Solucionline Cotización
Producto Vida Mujer
Titular: Prospecto Vida Mujer Edad 33 Sexo Femenino No Fumador
Vida Mujer 20 años 50,000 UDI Prima 2,926.93
BAIT 60 P 20 años 50,000 40.00
BIT 60 P 20 años 27.89
PCF A 20 años 50,000 67.00
Prima Total Anual 3,061.82
ADAPTA 5 REN 100,000 350.70
BMA 20 años 50,000 47.50
PEP A 17 años 50,000 79.50
CLP 1 REN 100,000 350.70
Prima Total con Recomendados 3,890.21
Prima Anual Acumulada con AVE 152,136
Valor de Rescate AVE 107,486
Valor en Efectivo 40,000
Recuperación Total 147,486
96.94 % Recuperación
`;

const packet = parseVidaMujerPdfTextToAcceptedQuotePacket(sampleText, {
  currentUdiValue: 8.82994,
  fileName: "vida-mujer-test.pdf"
});

assert.equal(packet.product, "Vida Mujer");
assert.equal(packet.productFamily, "life");
assert.equal(packet.nativeResult.product, "Vida Mujer");
assert.equal(packet.sumAssured, 50000);
assert.equal(packet.annualPremium, 3062);
assert.equal(packet.annualPremiumWithRecommended, 3890);
assert.equal(packet.paymentYears, 20);
assert.equal(packet.nativeResult.totalContributed, 152136);
assert.equal(packet.currencyMetadata.currentUdiValue, 8.82994);
assert.ok(packet.nativeResult.recommendedCoverages.some((row) => row.code === "ADAPTA"));
assert.ok(packet.nativeResult.coverages.some((row) => row.code === "PCF"));
assert.deepEqual(packet.missing_information, []);

console.log("PASS pdf browser parser smoke");
