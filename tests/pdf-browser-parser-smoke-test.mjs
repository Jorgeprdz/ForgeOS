import assert from "node:assert/strict";
import { parseVidaMujerPdfTextToAcceptedQuotePacket } from "../docs/static-preview/quote-preview-live/forge-pdf-browser-parser.js";

const solucionlineRows = `
Nombre
Titular Persona Prueba 07/01/1993 33 Femenino No
Coberturas Plazo de Cobertura Suma Asegurada Prima Anualizada
Vida Mujer (Vida Mujer) 20 años 50,000 2,926.93
Beneficio de Asistencia Médica (BAM UI) 1 REN Amparado SIN COSTO
Beneficio de Pago de Suma Asegurada por Invalidez Total y Permanente (BAIT 60 P) 20 años 50,000 40.00
Apoyo en Vida (AV UI) 1 REN Amparado SIN COSTO
Beneficio de Exención de pago de primas por Invalidez Total y Permanente (BIT 60 P) 20 años Amparado 27.89
Protección por Cáncer Femenino (PCF A) 20 años 50,000 67.00
Prima Total Anual 3,061.82
ADAPTA (ADAPTA) 5 REN 100,000 350.70
Beneficio por Muerte Accidental (BMA) 20 años 50,000 47.50
Protección para Complicaciones del Embarazo y Padecimientos Femeninos (PEP A) 17 años 50,000 79.50
Cuidados a Largo Plazo (CLP) 1 REN 100,000 350.70
Prima total con beneficios recomendados 3,890.21
Porcentaje de Recuperación Total Edad Real Prima Anual Prima Anual Acumulada con AVE Valor de Rescate AVE Valor en Efectivo Recuperación Total Suma Asegurada Básico
60.69 % 33 3,062 7,607 4,616 0 4,616 50,000
96.94 % 52 3,062 152,136 107,486 40,000 147,486 50,000
`;

const headerCollisionRows = `
Datos generales Nombre Fecha de Nacimiento Edad Género Fumador
Coberturas Plazo de Cobertura Suma Asegurada Prima Anualizada
Titular Persona Prueba 07/01/1993 33 Femenino No
Vida Mujer (Vida Mujer) 20 años 50,000 2,926.93
Beneficio de Pago de Suma Asegurada por Invalidez Total y Permanente (BAIT 60 P) 20 años 50,000 40.00
Beneficio de Exención de pago de primas por Invalidez Total y Permanente (BIT 60 P) 20 años Amparado 27.89
Protección por Cáncer Femenino (PCF A) 20 años 50,000 67.00
Prima Total Anual 3,061.82
Prima total con beneficios recomendados 3,890.21
96.94 % 52 3,062 152,136 107,486 40,000 147,486 50,000
`;

for (const [name, sampleText] of Object.entries({ solucionlineRows, headerCollisionRows })) {
  const packet = parseVidaMujerPdfTextToAcceptedQuotePacket(sampleText, {
    currencyMetadata: {
      currentUdiValue: 8.82994,
      source: "TEST_VERIFIED_CACHE",
      sourceDate: "2026-07-11"
    },
    fileName: `${name}.pdf`
  });

  assert.equal(packet.product, "Vida Mujer", name);
  assert.equal(packet.name, "Persona Prueba", name);
  assert.equal(packet.insured, "Persona Prueba", name);
  assert.equal(packet.age, 33, name);
  assert.equal(packet.sumAssured, 50000, name);
  assert.equal(packet.annualPremium, 3062, name);
  assert.equal(packet.annualPremiumWithRecommended, 3890, name);
  assert.equal(packet.annualPremiumTotalWithAve, 7607, name);
  assert.equal(packet.annualAvePremium, 4545, name);
  assert.equal(packet.annualPremiumAccumulatedWithAve, 152136, name);
  assert.equal(packet.plannedOrAvePremium, 7607, name);
  assert.equal(packet.coveragePeriod, "20 años", name);
  assert.equal(packet.nativeResult.totalContributed, 152136, name);
  assert.equal(packet.nativeResult.cashValue, 40000, name);
  assert.equal(packet.nativeResult.aveSurrenderValue, 107486, name);
  assert.equal(packet.nativeResult.recoveryTotal, 147486, name);
  assert.equal(packet.currencyMetadata.currentUdiValue, 8.82994, name);
  assert.equal(packet.currencyMetadata.source, "TEST_VERIFIED_CACHE", name);
  if (name === "solucionlineRows") {
    assert.ok(packet.nativeResult.recommendedCoverages.some((coverage) => coverage.code === "PEP"), name);
    assert.ok(packet.nativeResult.recommendedCoverages.some((coverage) => coverage.code === "CLP"), name);
  }
  assert.equal(packet.missing_information.length, 0, name);
}

console.log("PASS pdf browser parser smoke R11E");
