function compareCancelVsWait({ timeline, currentYear, waitYears }) {
  const current = timeline.find(row => row.year === currentYear);
  const future = timeline.find(row => row.year === currentYear + waitYears);

  if (!current || !future) {
    return {
      available: false,
      reason: "Missing current or future year in timeline"
    };
  }

  const extraValueUDI = future.cashValueUDI - current.cashValueUDI;
  const growthPercent =
    current.cashValueUDI > 0
      ? (extraValueUDI / current.cashValueUDI) * 100
      : 0;

  return {
    available: true,
    currentYear,
    futureYear: currentYear + waitYears,
    currentAge: current.age,
    futureAge: future.age,
    currentCashValueUDI: current.cashValueUDI,
    futureCashValueUDI: future.cashValueUDI,
    extraValueUDI,
    growthPercent,
    message:
      `Si cancela en el año ${currentYear}, recibe ${current.cashValueUDI} UDI. Si espera ${waitYears} años, podría recibir ${future.cashValueUDI} UDI.`
  };
}

function buildWaitingScenarios({ timeline, baseYear, waits = [5, 10, 20] }) {
  return waits.map(waitYears =>
    compareCancelVsWait({
      timeline,
      currentYear: baseYear,
      waitYears
    })
  );
}

module.exports = {
  compareCancelVsWait,
  buildWaitingScenarios
};
