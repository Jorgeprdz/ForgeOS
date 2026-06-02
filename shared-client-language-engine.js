const TERMS = {
  AF: "Costo de administración",

  BIT:
    "Protección para mantener la estrategia si ocurre una invalidez",

  BAIT:
    "Protección adicional por invalidez",

  CPA:
    "Protección para accidentes",

  PIM:
    "Protección para padres",

  SUMA_ASEGURADA:
    "Protección económica",

  RENTA_VITALICIA:
    "Ingreso para tu retiro",

  VALOR_EFECTIVO:
    "Dinero acumulado disponible"
};

function translateClientLanguage(term) {
  return TERMS[term] || term;
}

module.exports = {
  translateClientLanguage
};
