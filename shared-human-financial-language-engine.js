function formatNumber(value) {
  return value.toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function explainFinancialReturn({
  totalContributed,
  totalRecovered,
  profit,
  returnPercent,
  currency
}) {
  return `Durante el periodo analizado, la aportación estimada sería de ${formatNumber(totalContributed)} ${currency}.

La recuperación estimada sería de ${formatNumber(totalRecovered)} ${currency}.

La diferencia aproximada sería de ${formatNumber(profit)} ${currency}, equivalente a ${formatNumber(returnPercent)}%.

Esto no debe leerse como una inversión pura, porque durante todo el periodo también se mantiene protección activa.`;
}

module.exports = {
  explainFinancialReturn,
  formatNumber
};
