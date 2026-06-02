function buildRecoveryAnalysis({
  contributed = 0,
  recovered = 0
}) {
  const gain = recovered - contributed;

  const roi =
    contributed > 0
      ? (gain / contributed) * 100
      : 0;

  const recoveryPercent =
    contributed > 0
      ? (recovered / contributed) * 100
      : 0;

  return {
    contributed,
    recovered,
    gain,
    roi,
    recoveryPercent
  };
}

module.exports = {
  buildRecoveryAnalysis
};
