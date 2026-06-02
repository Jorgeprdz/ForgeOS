function money(value) {
  return value.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0
  });
}

function buildFiscalClientSlide(happy) {
  return {
    title: "Tu retiro tiene un aliado: SAT",
    body: `
Aportación anual:
${money(happy.youContribute)}

SAT podría regresar aproximadamente:
${money(happy.satCouldReturn)}

Tu esfuerzo real estimado:
${money(happy.realEstimatedEffort)}

Esto es una estimación, no una promesa.
`
  };
}

module.exports = { buildFiscalClientSlide };
