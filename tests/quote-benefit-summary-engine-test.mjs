import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import path from "node:path";

const { buildQuoteBenefitSummary } = await import(
  pathToFileURL(path.resolve("quote-benefit-summary-engine.js")).href
);

function findBlock(blocks, type) {
  return blocks.find((block) => block.type === type);
}

function findLine(block, id) {
  return block.lines.find((line) => line.id === id);
}

const imaginaNativeResult = {
  productName: "IMAGINA SER 65 PAGOS LIMITADOS 15",
  currency: "UDI",
  currentAge: 23,
  retirementAge: 65,
  sumAssuredUdi: 75000,
  premiumStructure: {
    totalAnnualPremium: 3437,
    premiumPayingYears: 15
  },
  scenarios: {
    favorable: {
      lumpSum: 115000,
      monthlyIncome: 775,
      projectedUdiValue: 46.177,
      targetAge: 65
    },
    base: {
      lumpSum: 89982,
      monthlyIncome: 606,
      projectedUdiValue: 46.177,
      targetAge: 65
    },
    unfavorable: {
      lumpSum: 72000,
      monthlyIncome: 430,
      projectedUdiValue: 46.177,
      targetAge: 65
    }
  }
};

const imaginaUdiProjection = {
  totalContributed: {
    udi: 51555,
    mxn: 607683.17
  },
  protection: {
    death: {
      udi: 75000,
      mxnCurrent: 662242.5
    }
  },
  retirement: {
    singlePayment: {
      udi: 89982,
      mxnAtRetirement: 4155098.814,
      projectedUdiValue: 46.177,
      targetAge: 65
    },
    monthlyIncome: {
      udi: 606,
      mxnAtRetirement: 27983.262,
      projectedUdiValue: 46.177,
      targetAge: 65
    },
    annualIncome: {
      udi: 7272,
      mxnAtRetirement: 335799.144,
      projectedUdiValue: 46.177,
      targetAge: 65
    },
    accumulatedIncome: [
      {
        fromAge: 65,
        toAge: 75,
        udi: 79992,
        mxn: 4647855.99
      }
    ]
  }
};

const blocks = buildQuoteBenefitSummary({
  productFamily: "Imagina Ser",
  nativeResult: imaginaNativeResult,
  udiProjection: imaginaUdiProjection
});

const contribution = findBlock(blocks, "contribution_summary");
assert.ok(contribution);
assert.equal(findLine(contribution, "total_contributed_udi").value, 51555);
assert.equal(findLine(contribution, "total_contributed_mxn_projected").value, 607683.17);
assert.equal(findLine(contribution, "premium_paying_years").value, 15);

const protection = findBlock(blocks, "protection_summary");
assert.ok(protection);
assert.equal(findLine(protection, "sum_assured_udi").value, 75000);
assert.equal(findLine(protection, "sum_assured_mxn_current").value, 662242.5);

const retirementScenarios = findBlock(blocks, "retirement_scenarios");
assert.ok(retirementScenarios);
assert.equal(retirementScenarios.scenarios.length, 3);
assert.deepEqual(
  retirementScenarios.scenarios.map((scenario) => scenario.id),
  ["favorable", "base", "unfavorable"]
);
assert.equal(retirementScenarios.missing.length, 0);

for (const scenario of retirementScenarios.scenarios) {
  assert.ok(scenario.singlePayment.udi > 0);
  assert.ok(scenario.singlePayment.mxn > 0);
  assert.equal(
    scenario.singlePayment.mxn,
    scenario.singlePayment.udi * scenario.singlePayment.projectedUdiValue
  );
  assert.ok(scenario.monthlyIncome.udi > 0);
  assert.ok(scenario.monthlyIncome.mxn > 0);
  assert.equal(
    scenario.monthlyIncome.mxn,
    scenario.monthlyIncome.udi * scenario.monthlyIncome.projectedUdiValue
  );
}

const baseScenario = retirementScenarios.scenarios.find((scenario) => scenario.id === "base");
assert.equal(baseScenario.singlePayment.udi, 89982);
assert.equal(baseScenario.singlePayment.mxn, 89982 * 46.177);
assert.equal(baseScenario.monthlyIncome.udi, 606);
assert.equal(baseScenario.monthlyIncome.mxn, 606 * 46.177);
assert.equal(baseScenario.annualIncome.udi, 7272);
assert.equal(baseScenario.annualIncome.mxn, 7272 * 46.177);
assert.deepEqual(baseScenario.accumulatedIncome, imaginaUdiProjection.retirement.accumulatedIncome);

const partialScenarioBlocks = buildQuoteBenefitSummary({
  productFamily: "Imagina Ser",
  nativeResult: {
    ...imaginaNativeResult,
    scenarios: {
      base: imaginaNativeResult.scenarios.base
    }
  },
  udiProjection: imaginaUdiProjection
});

const partialRetirement = findBlock(partialScenarioBlocks, "retirement_scenarios");
assert.equal(partialRetirement.scenarios.length, 1);
assert.equal(partialRetirement.scenarios[0].id, "base");
assert.deepEqual(partialRetirement.missing, [
  "Falta escenario favorable",
  "Falta escenario desfavorable"
]);

const partialMissing = findBlock(partialScenarioBlocks, "missing_information");
assert.ok(partialMissing);
assert.ok(
  partialMissing.lines.some((line) => line.label === "Falta escenario favorable")
);
assert.ok(
  partialMissing.lines.some((line) => line.label === "Falta escenario desfavorable")
);

const projectionOnlyBlocks = buildQuoteBenefitSummary({
  productFamily: "Imagina Ser",
  nativeResult: {
    productName: "IMAGINA SER",
    currentAge: 23,
    retirementAge: 65,
    sumAssuredUdi: 75000,
    premiumStructure: {
      totalAnnualPremium: 3437,
      premiumPayingYears: 15
    }
  },
  udiProjection: imaginaUdiProjection
});
const projectionOnlyRetirement = findBlock(projectionOnlyBlocks, "retirement_scenarios");
assert.equal(projectionOnlyRetirement.scenarios.length, 1);
assert.equal(projectionOnlyRetirement.scenarios[0].id, "base");
assert.equal(projectionOnlyRetirement.scenarios[0].singlePayment.udi, 89982);
assert.equal(projectionOnlyRetirement.scenarios[0].singlePayment.mxn, 4155098.814);
assert.deepEqual(projectionOnlyRetirement.missing, [
  "Falta escenario favorable",
  "Falta escenario desfavorable"
]);

const sparseImaginaBlocks = buildQuoteBenefitSummary({
  productFamily: "Imagina Ser",
  nativeResult: {
    productName: "IMAGINA SER",
    scenarios: {}
  },
  udiProjection: {}
});
assert.ok(!findBlock(sparseImaginaBlocks, "contribution_summary"));
assert.ok(!findBlock(sparseImaginaBlocks, "protection_summary"));
assert.ok(findBlock(sparseImaginaBlocks, "missing_information"));

const pprBlocks = buildQuoteBenefitSummary({
  productFamily: "PPR",
  product: "Plan Personal de Retiro",
  nativeResult: {
    productName: "Ahorro para el retiro",
    retirementAge: 65,
    premiumStructure: {
      totalAnnualPremium: 1200,
      premiumPayingYears: 10
    },
    scenarios: {
      base: {
        singlePaymentUdi: 50000,
        monthlyIncomeUdi: 450,
        projectedUdiValue: 30,
        targetAge: 65
      }
    }
  },
  udiProjection: {
    totalContributed: {
      udi: 12000,
      mxn: 180000
    }
  }
});

assert.ok(findBlock(pprBlocks, "contribution_summary"));
assert.ok(!findBlock(pprBlocks, "protection_summary"));
const pprRetirement = findBlock(pprBlocks, "retirement_scenarios");
assert.ok(pprRetirement);
assert.equal(pprRetirement.scenarios.length, 1);
assert.equal(pprRetirement.scenarios[0].id, "base");
assert.equal(pprRetirement.scenarios[0].singlePayment.udi, 50000);
assert.equal(pprRetirement.scenarios[0].singlePayment.mxn, 1500000);
assert.equal(pprRetirement.scenarios[0].monthlyIncome.udi, 450);
assert.equal(pprRetirement.scenarios[0].monthlyIncome.mxn, 13500);
assert.deepEqual(pprRetirement.missing, [
  "Falta escenario favorable",
  "Falta escenario desfavorable"
]);
assert.ok(findBlock(pprBlocks, "missing_information"));

const sparsePprBlocks = buildQuoteBenefitSummary({
  productFamily: "Plan Personal de Retiro",
  nativeResult: {},
  udiProjection: {}
});
assert.ok(!findBlock(sparsePprBlocks, "retirement_scenarios"));
const sparsePprMissing = findBlock(sparsePprBlocks, "missing_information");
assert.ok(sparsePprMissing);
assert.ok(
  sparsePprMissing.lines.some((line) => line.label === "Faltan datos de aportación")
);
assert.ok(
  sparsePprMissing.lines.some(
    (line) => line.label === "Faltan datos de recuperación o escenarios de retiro"
  )
);
assert.ok(
  sparsePprMissing.lines.some((line) => line.label === "Faltan datos de protección")
);

// R8 repair: Vida Mujer ya tiene summary propio; sólo Segubeca y ORVI quedan en unsupported legacy.
for (const productFamily of ["Segubeca", "ORVI"]) {
  const productBlocks = buildQuoteBenefitSummary({
    productFamily,
    nativeResult: {},
    udiProjection: {}
  });
  assert.equal(productBlocks.length, 1);
  assert.equal(productBlocks[0].type, "missing_information");
  assert.match(productBlocks[0].lines[0].label, /Faltan reglas o datos suficientes/);
}


// R8 VIDA MUJER COVERAGE
const vidaMujerBlocks = buildQuoteBenefitSummary({
  productFamily: "Vida Mujer",
  product: "Vida Mujer",
  nativeResult: {
    product: "Vida Mujer",
    currency: "UDI",
    totalAnnualPremium: 3061.82,
    sumAssured: 50000,
    paymentYears: 20,
    coverages: [
      { name: "Vida Mujer (Vida Mujer)", sumAssured: 50000, annualPremium: 2926.93 },
      { name: "Beneficio de Asistencia Médica (BAM UI)", value: "Amparado", annualPremium: 0 },
      { name: "Beneficio de Pago de Suma Asegurada por Invalidez Total y Permanente (BAIT 60 P)", sumAssured: 50000, annualPremium: 40 },
      { name: "Apoyo en Vida (AV UI)", value: "Amparado", annualPremium: 0 },
      { name: "Beneficio de Exención de pago de primas por Invalidez Total y Permanente (BIT 60 P)", value: "Amparado", annualPremium: 27.89 },
      { name: "Protección por Cáncer Femenino (PCF A)", sumAssured: 50000, annualPremium: 67 },
    ],
    recommendedCoverages: [
      { name: "ADAPTA (ADAPTA)", sumAssured: 100000, annualPremium: 350.70 },
      { name: "Beneficio por Muerte Accidental (BMA)", sumAssured: 50000, annualPremium: 47.50 },
      { name: "Protección para Complicaciones del Embarazo y Padecimientos Femeninos (PEP A)", sumAssured: 50000, annualPremium: 79.50 },
      { name: "Cuidados a Largo Plazo (CLP)", sumAssured: 100000, annualPremium: 350.70 },
    ],
    guaranteedValues: [
      {
        age: 33,
        annualPremiumAccumulatedWithAve: 7607,
        aveSurrenderValue: 4616,
        cashValue: 0,
        totalRecovery: 4616,
        basicSumAssured: 50000,
        recoveryPercentage: 60.69,
      },
      {
        age: 52,
        annualPremiumAccumulatedWithAve: 152136,
        aveSurrenderValue: 107486,
        cashValue: 40000,
        totalRecovery: 147486,
        basicSumAssured: 50000,
        recoveryPercentage: 96.94,
      },
    ],
  },
  udiProjection: {
    rows: Array.from({ length: 20 }, (_, index) => ({
      year: index + 1,
      policyYear: index + 1,
      projectedUdiValue: 8.82994 * Math.pow(1.04, index),
    })),
  },
  currencyMetadata: {
    currentUdiValue: 8.82994,
  },
});

const r8FindBlock = (blocks, type) => blocks.find((block) => block.type === type);

assert.ok(r8FindBlock(vidaMujerBlocks, "contribution_summary"), "Vida Mujer debe mostrar lo que aporta.");
assert.ok(r8FindBlock(vidaMujerBlocks, "protection_summary"), "Vida Mujer debe mostrar lo que protege.");
assert.ok(r8FindBlock(vidaMujerBlocks, "scheduled_endowments"), "Vida Mujer debe mostrar dotales.");
assert.ok(r8FindBlock(vidaMujerBlocks, "recovery_summary"), "Vida Mujer debe mostrar recuperación.");
assert.ok(r8FindBlock(vidaMujerBlocks, "women_health_benefits"), "Vida Mujer debe mostrar tabla PCF.");
assert.ok(r8FindBlock(vidaMujerBlocks, "recommended_benefits"), "Vida Mujer debe mostrar recomendados.");
assert.equal(r8FindBlock(vidaMujerBlocks, "retirement_scenarios"), undefined, "Vida Mujer no debe usar escenarios de retiro.");

const vidaContribution = r8FindBlock(vidaMujerBlocks, "contribution_summary");
assert.ok(vidaContribution.rows.some((row) => String(row.value).includes("152,136 UDI")), "Total aportado debe venir de prima acumulada con AVE.");

assert.ok(vidaContribution.rows.some((row) => row.label === "Prima anual base" && String(row.value).includes("3,062 UDI")), "Prima anual base debe mostrarse en Lo que aportas.");
assert.ok(vidaContribution.rows.some((row) => row.label === "Prima AVE anual" && String(row.value).includes("4,545 UDI")), "Prima AVE anual debe derivarse de total con AVE menos prima base.");
assert.ok(vidaContribution.rows.some((row) => row.label === "Prima anual total con AVE" && String(row.value).includes("7,607 UDI")), "Prima anual total con AVE debe mostrarse sin llamarse Prima AVE.");
assert.ok(vidaContribution.rows.some((row) => row.label === "Prima total con beneficios recomendados" && String(row.value).includes("3,890 UDI")), "Prima total con recomendados debe mostrarse en Lo que aportas.");
assert.ok(vidaContribution.rows.some((row) => row.label === "Plazo de pago" && String(row.value).includes("20 años")), "Plazo de pago debe mostrarse en Lo que aportas.");
assert.ok(vidaContribution.rows.some((row) => row.label === "Total aportado / Prima anual acumulada con AVE" && String(row.value).includes("152,136 UDI")), "Prima acumulada con AVE debe mostrarse como total aportado.");


const vidaEndowments = r8FindBlock(vidaMujerBlocks, "scheduled_endowments");
assert.ok(vidaEndowments.rows.some((row) => row.label === "Años 5, 7, 9, 11, 13, 15 y 17" && String(row.value).includes("2,500 UDI")), "Dotales recurrentes deben agruparse como 2,500 UDI c/u.");
assert.ok(vidaEndowments.rows.some((row) => row.label === "Año 20 (80%)" && String(row.value).includes("40,000 UDI")), "Dotal final debe mostrarse como año 20 80%.");
assert.ok(vidaEndowments.rows.some((row) => row.label === "Total dotales" && String(row.value).includes("57,500 UDI")), "Total dotales debe mantenerse sin duplicados.");
assert.deepEqual(vidaEndowments.calendar.years, [5, 7, 9, 11, 13, 15, 17, 20], "Dotales deben tener calendario horizontal.");
assert.deepEqual(
  vidaEndowments.calendar.payments.map((payment) => payment.udi),
  [2500, 2500, 2500, 2500, 2500, 2500, 2500, 40000],
  "Calendario de dotales debe conservar UDI correctas."
);
assert.ok(vidaEndowments.calendar.payments.every((payment) => payment.mxn > 0), "Cada dotal debe tener MXN proyectado cuando existe proyección.");
assert.ok(vidaEndowments.calendar.total.mxn > 57500 * 8.82994, "Total dotales MXN debe usar proyección anual, no conversión plana.");


const vidaRecovery = r8FindBlock(vidaMujerBlocks, "recovery_summary");
assert.ok(vidaRecovery.rows.some((row) => row.label === "Valor de rescate AVE" && row.value === "107,486 UDI"));
assert.ok(vidaRecovery.rows.some((row) => row.label === "Recuperación comercial total" && row.value === "164,986 UDI"));
assert.ok(vidaRecovery.rows.some((row) => row.label === "Recuperación total tabla Solucionline" && row.value === "147,486 UDI"));

const vidaPcf = r8FindBlock(vidaMujerBlocks, "women_health_benefits");
assert.ok(vidaPcf.rows.some((row) => row.label.includes("Tumor maligno de mama") && row.value.includes("50,000 UDI")));
assert.ok(vidaPcf.rows.some((row) => row.label.includes("Tumor maligno de mama localizado") && row.value.includes("23,500 UDI")));
assert.ok(vidaPcf.rows.some((row) => row.value.includes("≈ $441,497 MXN")));

const vidaRecommended = r8FindBlock(vidaMujerBlocks, "recommended_benefits");
assert.ok(vidaRecommended.rows.some((row) => row.label.includes("PEP") && row.value.includes("Estatus: recomendado")));
assert.ok(vidaRecommended.rows.some((row) => row.label.includes("CLP") && row.value.includes("Prima MXN")));

const sparseVidaMujerBlocks = buildQuoteBenefitSummary({
  productFamily: "Vida Mujer",
  nativeResult: {
    product: "Vida Mujer",
  },
});

assert.equal(r8FindBlock(sparseVidaMujerBlocks, "retirement_scenarios"), undefined);
assert.ok(r8FindBlock(sparseVidaMujerBlocks, "missing_information"), "Vida Mujer sin datos debe marcar faltantes.");

console.log("PASS quote benefit summary engine");
