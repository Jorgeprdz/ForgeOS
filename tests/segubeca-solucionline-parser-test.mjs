import assert from "node:assert/strict";
import { parseSolucionlineSegubecaQuote } from "../docs/static-preview/quote-preview-live/forge-segubeca-solucionline-parser.js";
import { parseSegubecaPdfTextToAcceptedQuotePacket, parsePdfTextToAcceptedQuotePacket } from "../docs/static-preview/quote-preview-live/forge-pdf-browser-parser.js";
import { buildSegubecaDashboardModel } from "../docs/static-preview/quote-preview-live/forge-segubeca-product-dashboard-adapter.js";

const sampleText = `
ESTUDIO DE VIDA INDIVIDUAL GENERAR ESTUDIO
UDI SeguBeca 18
Datos generales Nombre Preferente Fecha de Nacimiento Edad Edad de Cálculo Sexo Fumador
Titular Menor Prueba No 25/06/2022 4 4 Masculino No
Contratante Contratante Prueba No 29/09/1992 33 31 Masculino No
Coberturas Suma Asegurada Plazo de Cobertura Prima Anualizada
SeguBeca 18 (SeguBeca 18) 14 años 30,000 2,284.33
Protección por Fallecimiento e Invalidez del Contratante (PIM 18 CT UI) 14 años Amparado 73.06
Cobertura de Protección Absoluta (CPA UI) 14 años 60,000 72.60
Beneficio de Asistencia Médica (BAM UI) 1 REN Amparado SIN COSTO
Beneficio de Pago de Suma Asegurada por Invalidez Total y Permanente (BAIT SB 18) 14 años 60,000 94.20
Apoyo en Vida (AV UI) 1 REN Amparado SIN COSTO
Prima Total Anual 2,524.19
Además te recomendamos adquirir Prima Anualizada Suma Asegurada Plazo de Cobertura
ADAPTA (ADAPTA) 5 REN 100,000 418.73
Beneficio por Muerte Accidental (BMA) 14 años 60,000 78.00
Certificado de Garantía de Contratación (CGC) 26 años 2,500 59.18
Prima total con beneficios recomendados 3,080.09
VALORES GARANTIZADOS
0.00 % 4 2,524 2,524 0 0 0 2,284
84.89 % 17 2,524 35,339 0 30,000 30,000 30,000
ADMINISTRACIÓN DEL AHORRO
La administración del ahorro será a través del producto llamado Aumento al Valor en Efectivo (AVE).
La tasa de interes para entrega mensual es estimada a 1.0% anual vigente al momento de la cotización.
Año póliza Edad del Asegurado Suma asegurada a administrar Entrega mensual Entrega acumulada Beneficio por fallecimiento Valor en efectivo
1 18 30,000 637 7,647 22,819 24,979
2 19 22,612 637 15,294 15,288 19,353
3 20 15,149 637 22,941 7,682 13,362
4 21 7,612 637 30,588 - 6,702
NOTAS
Todas las cantidades están expresadas en Unidades de Inversión (UDI).
En caso de supervivencia del asegurado a la edad de 18, la compañía pagará al mismo 30,000 Unidades de Inversión (UDI).
`;

const parsed = parseSolucionlineSegubecaQuote({ text: sampleText });
assert.equal(parsed.productName, "SeguBeca");
assert.equal(parsed.planVariant, "SeguBeca 18");
assert.equal(parsed.currency, "UDI");
assert.equal(parsed.participants.primary_insured, "Contratante Prueba");
assert.equal(parsed.participants.child_or_education_beneficiary, "Menor Prueba");
assert.equal(parsed.participants.participant_modality, "individual");
assert.equal(parsed.baseCoverage.sumAssured, 30000);
assert.equal(parsed.totalAnnualPremium, 2524.19);
assert.equal(parsed.totalWithRecommended, 3080.09);
assert.equal(parsed.coverages.length, 5);
assert.equal(parsed.recommendedCoverages.length, 3);
assert.equal(parsed.guaranteedRows.at(-1).totalRecovery, 30000);
assert.equal(parsed.administrationRows.length, 4);
assert.equal(parsed.monthlyDelivery, 637);
assert.equal(parsed.accumulatedDelivery, 30588);
assert.equal(parsed.interestRate, 1);

const packet = parseSegubecaPdfTextToAcceptedQuotePacket(sampleText);
assert.equal(packet.productFamily, "segubeca");
assert.equal(packet.productType, "segubeca");
assert.equal(packet.productName, "SeguBeca 18");
assert.equal(packet.nativeResult.monthlyDelivery, 637);
assert.equal(packet.sumAssured, 30000);
assert.equal(packet.annualPremium, 2524.19);
assert.equal(packet.coveragePeriod, "14 años");
assert.equal(packet.totalRecovery, 30000);
assert.equal(packet.nativeResult.totalRecovery, 30000);
assert.equal(packet.benefitSummary.blocks.some((block) => block.type === "education_goal"), true);
assert.equal(packet.benefitSummary.blocks.some((block) => block.type === "payout_options"), true);

const routedPacket = parsePdfTextToAcceptedQuotePacket(sampleText);
assert.equal(routedPacket.extractionVersion, "R14C_segubeca_pdf_intake");
assert.equal(routedPacket.productFamily, "segubeca");

const model = buildSegubecaDashboardModel(packet.benefitSummary);
assert.equal(model.sections.find((section) => section.kind === "participants").title, "Quiénes quedan protegidos");
assert.equal(model.sections.find((section) => section.kind === "education_goal").title, "Meta educativa");
assert.equal(model.sections.find((section) => section.kind === "payout").title, "Cómo se entrega");
assert.equal(model.sections.find((section) => section.kind === "contribution").items[0].label, "Aportación anual");
assert.equal(model.missingInformation.includes("Falta estructura de participantes"), false);

console.log("PASS SeguBeca Solucionline PDF parser R14C");
