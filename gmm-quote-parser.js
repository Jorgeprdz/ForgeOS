function normalizeText(text = '') {
  return String(text)
    .replace(/\s+/g, ' ')
    .trim();
}

function parseMoney(value = '') {
  return Number(
    String(value)
      .replace(/\$/g, '')
      .replace(/,/g, '')
      .replace(/Pesos/gi, '')
      .replace(/Dólares/gi, '')
      .trim()
  );
}

function findMoneyAfter(label, text) {
  const clean = normalizeText(text);
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const regex = new RegExp(
    `${escapedLabel}[^$\\d]*(?:\\$)?([\\d,]+(?:\\.\\d+)?)`,
    'i'
  );

  const match = clean.match(regex);
  return match ? parseMoney(match[1]) : null;
}

export function parseGMMQuote({ text = '' }) {
  const clean = normalizeText(text);

  const planMatch = clean.match(/plan:\s*([A-ZÁÉÍÓÚÑ0-9\s]+?)\s+Zona:/i);
  const deductibleMatch = clean.match(/Deducible:\s*\$?([\d,]+(?:\.\d+)?)\s*Pesos/i);
  const coinsuranceMatch = clean.match(/Coaseguro:\s*(\d+)%/i);
  const coinsuranceLimitMatch = clean.match(/límite de\s*\$?([\d,]+(?:\.\d+)?)\s*Pesos/i);
  const sumAssuredMatch = clean.match(/Suma Asegurada:\s*\$?([\d,]+(?:\.\d+)?)\s*Pesos/i);
  const territorialityMatch = clean.match(/Territorialidad:\s*([A-Za-zÁÉÍÓÚÑ]+)/i);
  const tabulatorMatch = clean.match(/Tabulador:\s*([A-ZÁÉÍÓÚÑ0-9]+)/i);
  const currencyMatch = clean.match(/Moneda:\s*([A-Za-zÁÉÍÓÚÑ]+)/i);

  const annualPremium =
    findMoneyAfter('PRIMA ANUAL', clean)
    ?? findMoneyAfter('Prima anual', clean);

  return {
    productType: 'GMM',

    productName: clean.includes('Alfa Medical')
      ? 'Alfa Medical'
      : 'UNKNOWN',

    plan: planMatch
      ? planMatch[1].trim()
      : 'UNKNOWN',

    deductible: deductibleMatch
      ? parseMoney(deductibleMatch[1])
      : null,

    coinsurance: {
      percent: coinsuranceMatch
        ? Number(coinsuranceMatch[1])
        : null,

      maxOutOfPocket: coinsuranceLimitMatch
        ? parseMoney(coinsuranceLimitMatch[1])
        : null,
    },

    sumAssured: sumAssuredMatch
      ? parseMoney(sumAssuredMatch[1])
      : null,

    territoriality: territorialityMatch
      ? territorialityMatch[1].toUpperCase()
      : 'UNKNOWN',

    tabulator: tabulatorMatch
      ? tabulatorMatch[1].toUpperCase()
      : 'UNKNOWN',

    currency: currencyMatch
      ? currencyMatch[1].toUpperCase()
      : 'UNKNOWN',

    annualPremium,
  };
}
