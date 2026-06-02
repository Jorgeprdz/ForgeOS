function evaluateClpEvent({
  sumAssured,
  impairedFunctions = [],
  cifLevel,
  requiresPermanentAssistance
}) {

  const qualifyingFunctions = [
    "ASEO_PERSONAL",
    "VESTIRSE",
    "ALIMENTACION",
    "HIGIENE_PERSONAL",
    "CONTROL_ESFINTERES",
    "MOVILIDAD_FUNCIONAL"
  ];

  const validFunctions =
    impairedFunctions.filter(
      f => qualifyingFunctions.includes(f)
    );

  const qualifies =
    validFunctions.length >= 3 &&
    cifLevel === 4 &&
    requiresPermanentAssistance === true;

  return {
    coverageType: "LONG_TERM_CARE",
    qualifies,
    affectedFunctions:
      validFunctions.length,
    benefit:
      qualifies ? sumAssured : 0,
    reason:
      qualifies
        ? "CLP_TRIGGERED"
        : "CLP_NOT_TRIGGERED"
  };
}

module.exports = {
  evaluateClpEvent
};
