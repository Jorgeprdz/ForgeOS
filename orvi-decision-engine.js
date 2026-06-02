function buildOrviDecision({ baseYear, scenarios }) {
  const valid = scenarios.filter(s => s.available);

  return {
    whatItMeans:
      "ORVI protege a tu familia durante toda la vida y, si decides cancelar más adelante, puede darte un valor garantizado.",
    options: [
      "Mantener la póliza para conservar la protección.",
      "Cancelar y tomar el valor garantizado disponible.",
      "Esperar más años para aumentar el valor garantizado, sin seguir aportando si ya terminó el periodo de pago."
    ],
    recommendation:
      valid.length > 0
        ? "Si no necesitas el dinero hoy, revisar cuánto aumenta el valor garantizado por esperar puede ayudarte a decidir mejor."
        : "Revisar la tabla de valores garantizados antes de decidir cancelar.",
    nextBestStep:
      `Comparar cancelar en el año ${baseYear} contra esperar 5, 10 y 20 años.`
  };
}

module.exports = {
  buildOrviDecision
};
