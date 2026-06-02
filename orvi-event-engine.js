function buildOrviEvents({ sumAssuredUDI, currentCashValueUDI, maturityCashValueUDI }) {
  return [
    {
      event: "FALLECIMIENTO",
      clientLanguage: "Si falleces durante la vigencia",
      result: "Tu familia recibe la suma asegurada contratada.",
      amountUDI: sumAssuredUDI
    },
    {
      event: "CANCELACION",
      clientLanguage: "Si decides cancelar",
      result: "Puedes recibir el valor en efectivo garantizado de ese año.",
      amountUDI: currentCashValueUDI
    },
    {
      event: "SUPERVIVENCIA_99",
      clientLanguage: "Si llegas a los 99 años",
      result: "Recibes la suma asegurada / valor final indicado.",
      amountUDI: maturityCashValueUDI
    }
  ];
}

module.exports = {
  buildOrviEvents
};
