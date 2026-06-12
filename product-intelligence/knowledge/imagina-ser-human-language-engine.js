function translateTerm(term) {
  const dictionary = {
    PRIMA_BASICA: "aportación principal",
    PRIMA_PLANEADA: "aportación para acelerar tu retiro",
    FONDO_RESERVA: "tu fondo para el retiro",
    RENTA_MENSUAL: "ingreso mensual para tu retiro",
    SUMA_ASEGURADA: "protección para tu familia",
    BAIT: "protección si una invalidez te impide seguir trabajando",
    BIT: "ayuda para que el plan no se pierda si ocurre una invalidez",
    AF: "costo de administración del fondo"
  };

  return dictionary[term] || term;
}

function buildTwoBagsExplanation() {
  return {
    bag1: {
      name: "Bolsa 1: Construye tu retiro",
      explanation:
        "Aquí vive la mayor parte de tu estrategia. Esta bolsa se alimenta con tu aportación principal y tu aportación planeada para formar tu fondo de retiro."
    },
    bag2: {
      name: "Bolsa 2: Protege el camino",
      explanation:
        "Esta parte ayuda a mantener las protecciones del plan mientras tu fondo crece, para que no solo estés ahorrando, también estés protegido."
    }
  };
}

module.exports = {
  translateTerm,
  buildTwoBagsExplanation
};
