function buildPresentationPrompt({
  clientPresentation,
  advisorAnalysis,
  objections
}) {
  return `
FORGE PRESENTATION PROMPT — IMAGINA SER

Objetivo:
Crear una presentación para cliente final usando lenguaje humano, sin tecnicismos y con precio al final.

Reglas obligatorias:
- Enamorar antes de mostrar números fuertes.
- No abrir con costo.
- Vender ingreso futuro, no capital.
- Cliente ve MXN primero cuando se convierta a pesos.
- UDI queda como respaldo técnico.
- La presentación principal usa Escenarios Económicos.
- El Desglose del Seguro se usa como respaldo del asesor.
- Cerrar con claridad de decisión.

Slides sugeridas:
${clientPresentation.slides.map(s => `${s.slide}. ${s.title}: ${s.body}`).join("\n")}

Análisis asesor:
${JSON.stringify(advisorAnalysis.technicalSummary, null, 2)}

Objeciones a cubrir:
${objections.map(o => `- ${o.objection}: ${o.answer}`).join("\n")}

Salida:
Presentación clara, emocional, humana y orientada a decisión.
`;
}

module.exports = {
  buildPresentationPrompt
};
