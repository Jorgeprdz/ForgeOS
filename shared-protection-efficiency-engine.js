function calculateProtectionEfficiency({
  totalContributed,
  protectedCapital
}) {
  if (totalContributed === undefined || protectedCapital === undefined) {
    throw new Error("Missing totalContributed or protectedCapital");
  }

  const protectionRatio = totalContributed > 0
    ? protectedCapital / totalContributed
    : 0;

  return {
    totalContributed,
    protectedCapital,
    protectionRatio,
    calculationMode: "PROTECTED_CAPITAL_VS_CONTRIBUTED"
  };
}

module.exports = {
  calculateProtectionEfficiency
};
