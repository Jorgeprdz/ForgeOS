const EDUCATION_PATHS = {
  PUBLIC_UNIVERSITY: [
    {
      name: "UNAM",
      annualStudentCostMXN: 140000,
      type: "PUBLIC"
    },
    {
      name: "IPN",
      annualStudentCostMXN: 120000,
      type: "PUBLIC"
    },
    {
      name: "UAM",
      annualStudentCostMXN: 130000,
      type: "PUBLIC"
    },
    {
      name: "BUAP",
      annualStudentCostMXN: 110000,
      type: "PUBLIC"
    },
    {
      name: "Universidad de Guadalajara",
      annualStudentCostMXN: 125000,
      type: "PUBLIC"
    }
  ],

  PRIVATE_MID: [
    {
      name: "UVM",
      totalCareerCostMXN: 1700000,
      type: "PRIVATE_MID"
    },
    {
      name: "Tecmilenio",
      totalCareerCostMXN: 1500000,
      type: "PRIVATE_MID"
    },
    {
      name: "La Salle",
      totalCareerCostMXN: 1900000,
      type: "PRIVATE_MID"
    }
  ],

  PRIVATE_PREMIUM: [
    {
      name: "Tec de Monterrey",
      totalCareerCostMXN: 3200000,
      type: "PRIVATE_PREMIUM"
    },
    {
      name: "Anáhuac",
      totalCareerCostMXN: 2900000,
      type: "PRIVATE_PREMIUM"
    },
    {
      name: "Ibero",
      totalCareerCostMXN: 2800000,
      type: "PRIVATE_PREMIUM"
    },
    {
      name: "ITAM",
      totalCareerCostMXN: 2600000,
      type: "PRIVATE_PREMIUM"
    },
    {
      name: "Panamericana",
      totalCareerCostMXN: 2700000,
      type: "PRIVATE_PREMIUM"
    }
  ]
};

function buildEducationFreedomScore({
  projectedCapitalMXN
}) {
  if (projectedCapitalMXN >= 3000000) {
    return {
      score: 95,
      level: "MAXIMUM_FREEDOM"
    };
  }

  if (projectedCapitalMXN >= 2000000) {
    return {
      score: 75,
      level: "HIGH_FREEDOM"
    };
  }

  if (projectedCapitalMXN >= 1200000) {
    return {
      score: 55,
      level: "MODERATE_FREEDOM"
    };
  }

  if (projectedCapitalMXN >= 600000) {
    return {
      score: 35,
      level: "LIMITED_FREEDOM"
    };
  }

  return {
    score: 15,
    level: "LOW_FREEDOM"
  };
}

function buildEducationPathsComparison({
  projectedCapitalMXN,
  yearsUntilCollege,
  educationInflation = 0.07
}) {
  const publicComparison =
    EDUCATION_PATHS.PUBLIC_UNIVERSITY.map(u => {
      const totalProjectedCost =
        (u.annualStudentCostMXN * 4) *
        Math.pow(1 + educationInflation, yearsUntilCollege);

      return {
        ...u,
        projectedCostMXN: totalProjectedCost,
        coveragePercent:
          (projectedCapitalMXN / totalProjectedCost) * 100
      };
    });

  const privateMidComparison =
    EDUCATION_PATHS.PRIVATE_MID.map(u => {
      const projectedCost =
        u.totalCareerCostMXN *
        Math.pow(1 + educationInflation, yearsUntilCollege);

      return {
        ...u,
        projectedCostMXN: projectedCost,
        coveragePercent:
          (projectedCapitalMXN / projectedCost) * 100
      };
    });

  const privatePremiumComparison =
    EDUCATION_PATHS.PRIVATE_PREMIUM.map(u => {
      const projectedCost =
        u.totalCareerCostMXN *
        Math.pow(1 + educationInflation, yearsUntilCollege);

      return {
        ...u,
        projectedCostMXN: projectedCost,
        coveragePercent:
          (projectedCapitalMXN / projectedCost) * 100
      };
    });

  return {
    publicComparison,
    privateMidComparison,
    privatePremiumComparison,
    freedomScore:
      buildEducationFreedomScore({
        projectedCapitalMXN
      })
  };
}

module.exports = {
  EDUCATION_PATHS,
  buildEducationFreedomScore,
  buildEducationPathsComparison
};
