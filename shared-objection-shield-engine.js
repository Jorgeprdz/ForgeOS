function buildObjectionShield({
  policyCurrency,
  scenarioRate
}) {
  return [
    {
      objection: "¿Por qué cambia el pago en pesos?",
      answer:
        policyCurrency === "UDI"
          ? "Porque la cotización está expresada en UDI. La cantidad de UDI se mantiene, pero el valor en pesos cambia conforme cambia la UDI."
          : "Porque la cotización está expresada en moneda extranjera. El monto en pesos depende del tipo de cambio."
    },
    {
      objection: "¿Esta proyección es garantizada?",
      answer:
        `No. La proyección en pesos usa un escenario de crecimiento de ${(scenarioRate * 100).toFixed(2)}% anual. Lo garantizado es lo expresado en la moneda de la póliza, según la cotización y condiciones del producto.`
    },
    {
      objection: "¿Por qué no se muestra solo el total acumulado?",
      answer:
        "Porque sumar todos los pagos usando un solo valor futuro de la UDI puede confundir. Forge convierte cada año con su valor estimado correspondiente."
    },
    {
      objection: "¿Qué pasa si la UDI crece más o menos?",
      answer:
        "El monto real en pesos puede ser mayor o menor. Por eso Forge puede mostrar escenarios conservador, asesor e intenso."
    }
  ];
}

module.exports = {
  buildObjectionShield
};
