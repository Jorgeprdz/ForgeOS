const fs = require("fs");
const { execSync } = require("child_process");

function number(value) {
  return Number(
    String(value)
      .replace(/,/g, "")
      .trim()
  );
}

function extractVidaMujerKnowledge(pdfPath) {
  if (!pdfPath) {
    throw new Error("Missing pdfPath");
  }

  const txtPath =
    "vida-mujer-knowledge-source.txt";

  execSync(
    `pdftotext -layout "${pdfPath}" "${txtPath}"`
  );

  const text =
    fs.readFileSync(txtPath, "utf8");

  const knowledge = {
    product: "VIDA_MUJER",
    currency: null,
    age: null,

    basicCoverage: null,

    contractedCoverages: [],

    recommendedCoverages: [],

    guaranteedValues: [],

    survivalBenefit: null,

    ave: {
      status: "UNKNOWN"
    },

    semanticFlags: []
  };

  if (/\bUDI\b/i.test(text)) {
    knowledge.currency = "UDI";
  }

  if (/USD|Dólares|Dlls/i.test(text)) {
    knowledge.currency = "USD";
  }

  const ageMatch =
    text.match(
      /Edad de contratación\s+(\d+)/i
    );

  if (ageMatch) {
    knowledge.age =
      Number(ageMatch[1]);
  }

  const vmMatch =
    text.match(
      /Vida Mujer\s+\(Vida Mujer\)\s+20 años\s+([\d,]+)\s+([\d,.]+)/i
    );

  if (vmMatch) {
    knowledge.basicCoverage = {
      code: "VIDA_MUJER",
      sumAssured: number(vmMatch[1]),
      annualPremium: number(vmMatch[2])
    };
  }

  const coverageRules = [
    {
      code: "BAM",
      regex: /BAM/i,
      contracted: true
    },
    {
      code: "BAIT",
      regex: /BAIT/i,
      contracted: true
    },
    {
      code: "AV",
      regex: /\(AV\)/i,
      contracted: true
    },
    {
      code: "BIT",
      regex: /\(BIT\)/i,
      contracted: true
    },
    {
      code: "BMA",
      regex: /\(BMA\)/i,
      contracted: true
    },
    {
      code: "PCF",
      regex: /\(PCF/i,
      contracted: true
    },
    {
      code: "PEP",
      regex: /\(PEP/i,
      contracted: false
    },
    {
      code: "CLP",
      regex: /\(CLP\)/i,
      contracted: false
    },
    {
      code: "ADAPTA",
      regex: /ADAPTA/i,
      contracted: false
    }
  ];

  coverageRules.forEach((coverage) => {
    if (!coverage.regex.test(text)) {
      return;
    }

    if (coverage.contracted) {
      knowledge.contractedCoverages.push(
        coverage.code
      );
    } else {
      knowledge.recommendedCoverages.push(
        coverage.code
      );
    }
  });

  text.split("\n").forEach((line) => {
    const match =
      line.trim().match(
        /^([\d.]+)\s*%\s+(\d{2})\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)$/
      );

    if (!match) {
      return;
    }

    knowledge.guaranteedValues.push({
      recoveryPercentage:
        Number(match[1]),

      age:
        Number(match[2]),

      annualPremium:
        number(match[3]),

      accumulatedPremiumWithAve:
        number(match[4]),

      aveRescueValue:
        number(match[5]),

      cashValue:
        number(match[6]),

      totalRecovery:
        number(match[7]),

      basicSumAssured:
        number(match[8])
    });
  });

  if (
    knowledge.basicCoverage
  ) {
    knowledge.survivalBenefit = {
      sumAssured:
        knowledge.basicCoverage.sumAssured,

      intermediateEvents: [
        5,7,9,11,13,15,17
      ],

      intermediatePercentage: 0.05,

      finalYear: 20,

      finalPercentage: 0.80,

      totalPercentage: 1.15,

      totalBenefit:
        knowledge.basicCoverage.sumAssured *
        1.15
    };
  }

  const aveDetected =
    knowledge.guaranteedValues.some(
      row => row.aveRescueValue > 0
    );

  knowledge.ave.status =
    aveDetected
      ? "AVE_VALUE_PRESENT"
      : "AVE_NOT_CONTRACTED_OR_ZERO_VALUE";

  if (
    knowledge.recommendedCoverages.includes("CLP") &&
    knowledge.basicCoverage
  ) {
    knowledge.semanticFlags.push(
      "CLP_REQUIRES_REVIEW"
    );
  }

  return knowledge;
}

module.exports = {
  extractVidaMujerKnowledge
};
