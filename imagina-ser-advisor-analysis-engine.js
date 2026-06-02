function buildAdvisorAnalysis({
  clientDoc,
  advisorDoc,
  fundAnalysis
}) {
  return {
    presentationType: "ADVISOR_VIEW",
    warnings: [],
    technicalSummary: {
      clientDocumentDetected:
        clientDoc.documentType === "CLIENT_DOCUMENT",
      advisorDocumentDetected:
        advisorDoc.documentType === "ADVISOR_DOCUMENT",
      paymentYears:
        fundAnalysis.paymentYears,
      totalContributedUDI:
        fundAnalysis.totalContributedUDI,
      finalReserveFundUDI:
        fundAnalysis.finalReserveFundUDI,
      growthUDI:
        fundAnalysis.growthUDI,
      growthPercent:
        fundAnalysis.growthPercent
    },
    note:
      "Escenarios Económicos debe alimentar la presentación cliente. Desglose del Seguro debe alimentar validación técnica del asesor."
  };
}

module.exports = {
  buildAdvisorAnalysis
};
