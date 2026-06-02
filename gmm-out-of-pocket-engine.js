/*
|--------------------------------------------------------------------------
| MODULE: gmm-out-of-pocket-engine.js
|--------------------------------------------------------------------------
|
| VERSION:
| v0.1.0
|
|--------------------------------------------------------------------------
|
| Calcula participación estimada del cliente en un evento médico.
|
|--------------------------------------------------------------------------
*/

export function calcularParticipacionClienteGMM({
  claimAmount = 0,
  deductible = 0,
  coinsurancePercent = 0,
  coinsuranceCap = 0
}) {
  const amount = Number(claimAmount || 0);
  const ded = Number(deductible || 0);
  const percent = Number(coinsurancePercent || 0);
  const cap = Number(coinsuranceCap || 0);

  if (amount <= 0) {
    return {
      claimAmount: amount,
      deductibleApplied: 0,
      amountAfterDeductible: 0,
      rawCoinsurance: 0,
      coinsuranceApplied: 0,
      clientPays: 0,
      insurerPays: 0,
      status: 'NO_CLAIM_AMOUNT'
    };
  }

  const deductibleApplied = Math.min(ded, amount);
  const amountAfterDeductible = Math.max(amount - deductibleApplied, 0);

  const rawCoinsurance =
    amountAfterDeductible * (percent / 100);

  const coinsuranceApplied =
    cap > 0
      ? Math.min(rawCoinsurance, cap)
      : rawCoinsurance;

  const clientPays =
    deductibleApplied + coinsuranceApplied;

  const insurerPays =
    Math.max(amount - clientPays, 0);

  return {
    claimAmount: amount,
    deductibleApplied,
    amountAfterDeductible,
    rawCoinsurance,
    coinsuranceApplied,
    clientPays,
    insurerPays,
    status: 'CALCULATED'
  };
}
