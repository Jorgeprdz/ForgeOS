function detectDocumentPurpose(text) {
  const isClient =
    /Escenarios Econ[oó]micos/i.test(text) &&
    /Renta mensual/i.test(text) &&
    /Favorable/i.test(text) &&
    /Desfavorable/i.test(text);

  const isAdvisor =
    /Desglose del Seguro/i.test(text) &&
    /Prima B[aá]sica/i.test(text) &&
    /Prima Planeada/i.test(text) &&
    /Fondo de reserva/i.test(text);

  if (isClient) return "CLIENT_DOCUMENT";
  if (isAdvisor) return "ADVISOR_DOCUMENT";

  return "UNKNOWN_DOCUMENT";
}

module.exports = {
  detectDocumentPurpose
};
