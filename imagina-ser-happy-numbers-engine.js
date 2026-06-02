function buildHappyNumbers151(result) {
  return {
    title: "Números felices",
    youContribute: result.annualContributionMXN,
    satCouldReturn: result.estimatedRefund,
    realEstimatedEffort: result.netCost,
    explanation:
      "Primero aportas a tu retiro. Después, por el beneficio fiscal del Artículo 151, SAT podría regresar una parte vía declaración anual. Por eso el esfuerzo real estimado puede ser menor que la aportación inicial.",
    caution:
      "La devolución no es garantizada. Depende de ingresos, ISR pagado, régimen fiscal, deducciones personales y límites legales."
  };
}

module.exports = { buildHappyNumbers151 };
