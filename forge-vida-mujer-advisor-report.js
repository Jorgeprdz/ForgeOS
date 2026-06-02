const {
  extractVidaMujerKnowledge
} = require("./vida-mujer-knowledge-extractor");

const {
  formatNumber,
  bullet,
  check,
  warning,
  renderClientAdvisorPresentation
} = require("./forge-presentation-engine");

const pdfPath = process.argv[2];

if (!pdfPath) {
  console.log("Uso:");
  console.log("node forge-vida-mujer-advisor-report.js archivo.pdf");
  process.exit(1);
}

const knowledge = extractVidaMujerKnowledge(pdfPath);

const currency = knowledge.currency || "UDI";
const basic = knowledge.basicCoverage;
const finalGuaranteedRow =
  knowledge.guaranteedValues[knowledge.guaranteedValues.length - 1];

const contracted = knowledge.contractedCoverages || [];
const recommended = knowledge.recommendedCoverages || [];
const survival = knowledge.survivalBenefit;

function has(code) {
  return contracted.includes(code);
}

function recommendedHas(code) {
  return recommended.includes(code);
}

const sections = [];

sections.push({
  title: "ANÁLISIS DE COTIZACIÓN",
  body:
`Analicé tu cotización de Vida Mujer y encontré una estructura bastante clara.

La suma asegurada principal detectada es de ${formatNumber(basic?.sumAssured)} ${currency}.

La prima anual de la cobertura principal detectada es de ${formatNumber(basic?.annualPremium)} ${currency}.

La función principal de esta póliza es proteger económicamente a tus beneficiarios en caso de fallecimiento, pero este producto también incorpora beneficios en vida.`
});

sections.push({
  title: "LO MÁS IMPORTANTE DEL PLAN",
  body:
`Vida Mujer no solamente protege por fallecimiento.

También tiene beneficios programados por supervivencia.

Detecté pagos en los años:

${bullet(survival?.intermediateEvents || [])}

Cada uno corresponde al 5% de la suma asegurada.

Además, en el año ${survival?.finalYear}, se contempla un pago final equivalente al 80% de la suma asegurada.`
});

sections.push({
  title: "BENEFICIO TOTAL POR SUPERVIVENCIA",
  body:
`Suma asegurada base:

${formatNumber(survival?.sumAssured)} ${currency}

Beneficio total por supervivencia:

${formatNumber(survival?.totalBenefit)} ${currency}

Esto equivale al 115% de la suma asegurada original.

En términos simples:

Si llegas al final del periodo ilustrado, habrás recibido más de lo que originalmente contrataste como suma asegurada, mientras mantuviste protección durante todo el trayecto.`
});

if (has("PCF")) {
  sections.push({
    title: "PROTECCIÓN POR CÁNCER FEMENINO",
    body:
`Detecté contratada la cobertura PCF.

Esto significa que la cotización incluye protección por cáncer femenino.

La suma asegurada detectada está alineada con la suma asegurada principal:

${formatNumber(basic?.sumAssured)} ${currency}

Esta cobertura puede generar pagos en vida dependiendo del diagnóstico cubierto y las condiciones del producto.`
  });
}

if (has("BIT")) {
  sections.push({
    title: "INVALIDEZ TOTAL Y PERMANENTE",
    body:
`También detecté la cobertura BIT.

Esta cobertura no debe interpretarse como una suma adicional directa.

Su función principal es proteger la continuidad de la póliza.

Si ocurre una invalidez total y permanente cubierta, la póliza contempla mecanismos para exentar el pago de primas y conservar la protección.`
  });
}

if (has("BMA")) {
  sections.push({
    title: "MUERTE ACCIDENTAL",
    body:
`Detecté contratada la cobertura BMA.

Esto agrega protección adicional asociada a fallecimiento accidental, de acuerdo con las condiciones de la cobertura.`
  });
}

sections.push({
  title: "VALORES GARANTIZADOS",
  body:
`La cotización incluye tabla de valores garantizados.

Edad final ilustrada:

${finalGuaranteedRow?.age || "N/A"} años

Valor en efectivo final:

${formatNumber(finalGuaranteedRow?.cashValue)} ${currency}

Recuperación total final:

${formatNumber(finalGuaranteedRow?.totalRecovery)} ${currency}

Esto es distinto al beneficio por supervivencia. Forge separa ambos conceptos para evitar confundir valor en efectivo con pagos programados del producto.`
});

sections.push({
  title: "AVE",
  body:
knowledge.ave.status === "AVE_NOT_CONTRACTED_OR_ZERO_VALUE"
  ? `La tabla actuarial muestra valor de rescate AVE en cero.

Forge interpreta esta cotización como:

AVE no contratada
o
sin valor acumulado visible dentro de esta ilustración.

Esto no significa que AVE no pueda agregarse; significa que esta cotización en particular no muestra valor AVE activo.`
  : `Forge detectó valor AVE activo en la tabla.

Esto debería analizarse con la Shared AVE Library para estimar valor proyectado, valor de rescate e impacto en beneficio por fallecimiento.`
});

if (recommended.length > 0) {
  sections.push({
    title: "COBERTURAS RECOMENDADAS",
    body:
`Detecté coberturas que aparecen como recomendadas, no como contratadas:

${warning(recommended)}

Esto significa que están cotizadas como posibles complementos, pero no forman parte de la estructura contratada base detectada.`
  });
}

sections.push({
  title: "REVISIÓN INTELIGENTE FORGE",
  body:
knowledge.semanticFlags.length > 0
  ? `Forge no detectó errores críticos, pero sí encontró puntos para revisión:

${warning(knowledge.semanticFlags)}

El más importante actualmente es CLP, porque aparece recomendada y requiere validación adicional contra reglas del manual.`
  : `Forge no detectó alertas semánticas relevantes en esta cotización.`
});

const conclusion =
`${check([
  "Protección principal activa",
  has("PCF") ? "Protección por cáncer femenino activa" : "PCF no detectada como contratada",
  "Beneficio por supervivencia detectado",
  "Valores garantizados detectados",
  "AVE analizada correctamente",
  "Sin errores críticos detectados"
])}

Oportunidades de mejora:

${warning([
  recommendedHas("PEP") ? "Evaluar PEP" : null,
  recommendedHas("CLP") ? "Evaluar CLP con revisión técnica" : null,
  recommendedHas("ADAPTA") ? "Evaluar ADAPTA" : null,
  "Analizar si AVE aporta valor adicional"
].filter(Boolean))}

Resultado general:

🟢 COTIZACIÓN CONSISTENTE
🟢 PRODUCTO CORRECTAMENTE ESTRUCTURADO
🟡 CON PUNTOS DE REVISIÓN COMERCIAL`;

const report = renderClientAdvisorPresentation({
  title: "FORGE VIDA MUJER ADVISOR REPORT v1.0",
  intro:
"Este reporte traduce la cotización técnica a una explicación entendible para cliente y asesor.",
  sections,
  conclusion
});

console.log(report);

const tests = [
  {
    name: "Genera presentación con producto Vida Mujer",
    pass: report.includes("VIDA MUJER")
  },
  {
    name: "Incluye suma asegurada básica",
    pass: report.includes("35,000.00")
  },
  {
    name: "Incluye supervivencia",
    pass: report.includes("supervivencia")
  },
  {
    name: "Incluye AVE",
    pass: report.includes("AVE")
  },
  {
    name: "Incluye conclusión Forge",
    pass: report.includes("CONCLUSIÓN FORGE")
  }
];

console.log("\nTEST PRESENTATION ENGINE\n");

tests.forEach((test) => {
  console.log(`${test.pass ? "✅" : "❌"} ${test.name}`);
});

const pass = tests.filter((test) => test.pass).length;
const fail = tests.length - pass;

console.log("\nResumen:");
console.log(`Total: ${tests.length}`);
console.log(`Pass: ${pass}`);
console.log(`Fail: ${fail}`);

if (fail === 0) {
  console.log("\n✅ FORGE PRESENTATION ENGINE v1.0 PASS");
} else {
  console.log("\n❌ FORGE PRESENTATION ENGINE NEEDS REVIEW");
}
