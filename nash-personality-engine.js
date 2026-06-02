function detectPersonality(context = {}) {
  const scores = {
    PROTECTOR: 0,
    CONSTRUCTOR: 0,
    ANALYTICAL: 0,
    RELATIONAL: 0,
    VISIONARY: 0
  };

  const notes = (context.notes || []).join(" ").toLowerCase();

  if (context.children > 0) scores.PROTECTOR += 30;

  if (/hijos|familia|seguridad|tranquilidad|protección/.test(notes)) {
    scores.PROTECTOR += 30;
  }

  if (/negocio|empresa|patrimonio|crecimiento|emprender/.test(notes)) {
    scores.CONSTRUCTOR += 30;
  }

  if (/datos|comparar|analizar|números|detalle/.test(notes)) {
    scores.ANALYTICAL += 30;
  }

  if (/personas|amistad|confianza|relación|equipo/.test(notes)) {
    scores.RELATIONAL += 30;
  }

  if (/futuro|libertad|metas|sueños|visión/.test(notes)) {
    scores.VISIONARY += 30;
  }

  const [personality, score] = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];

  const motivatorsByType = {
    PROTECTOR: ["FAMILIA", "SEGURIDAD", "TRANQUILIDAD"],
    CONSTRUCTOR: ["PATRIMONIO", "CRECIMIENTO", "CONTROL"],
    ANALYTICAL: ["DATOS", "CLARIDAD", "COMPARACIÓN"],
    RELATIONAL: ["CONFIANZA", "CERCANÍA", "RECOMENDACIÓN"],
    VISIONARY: ["FUTURO", "LIBERTAD", "OBJETIVOS"]
  };

  return {
    personality,
    confidence: Math.min(score, 95),
    motivators: motivatorsByType[personality],
    scores
  };
}

module.exports = { detectPersonality };
