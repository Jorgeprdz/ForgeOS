# 107Z15R3 — Existing owner static contract review evidence

Status: **PASS**

```json
{
  "chain": "107Z15R3_EXISTING_ADAPTER_SUCCESS_PATH_OWNER_REVIEW_GATE",
  "status": "PASS",
  "generated_at_local_stamp": "20260710_121959",
  "review": {
    "IMPLEMENTATION_SCOPE_ID": "QUOTE_PREVIEW_PDF_RESULT_PERSISTENCE_V1",
    "STATIC_OWNER_REVIEW_COMPLETE": true,
    "ENGINE_FUNCTION_BODY_RESOLVED": true,
    "ENGINE_CALLABLE": "extractSolucionlineLifeQuoteFields",
    "ENGINE_PARAMETERS": [
      "text"
    ],
    "ENGINE_INPUT_SHAPE_CLASSIFIED": true,
    "ENGINE_INPUT_SHAPE_CLASS": "OPAQUE_SINGLE_ARGUMENT_WITH_HELPER_DEPENDENCIES",
    "ENGINE_INPUT_PROPERTIES": [],
    "ENGINE_HELPER_CALLS_RESOLVED": true,
    "ENGINE_HELPER_CALLS": [
      "String",
      "additionalCoverages.push",
      "advisorLine.replace",
      "birthLine.match",
      "cleanValue",
      "filter",
      "findLine",
      "formatUdi",
      "genderLine.match",
      "guaranteeLine.match",
      "i.test",
      "insuredLine.replace",
      "line.match",
      "line.replace",
      "lines.find",
      "lines.findIndex",
      "liquidationLine.match",
      "map",
      "match",
      "parseNumberList",
      "pattern.test",
      "productLine.match",
      "scenario",
      "split",
      "studyDateLine.match",
      "test",
      "trim"
    ],
    "ENGINE_NATIVE_OUTPUT_KEYS_RESOLVED": true,
    "ENGINE_NATIVE_OUTPUT_KEYS": [
      "advisor",
      "age",
      "annual",
      "annualPremium",
      "baseAnnualPremium",
      "birthDate",
      "coverage",
      "currency",
      "detectedQuoteDomain",
      "extractionSource",
      "gender",
      "guaranteePeriod",
      "liquidationOption",
      "monthly",
      "monthlyIncomeUdi",
      "optionalCoverages",
      "paymentMode",
      "paymentTerm",
      "plan",
      "plannedAnnual",
      "plannedMonthly",
      "plannedQuarterly",
      "plannedSemiannual",
      "policyTerm",
      "policyYear",
      "premium",
      "premiumTable",
      "product",
      "prospect",
      "quarterly",
      "quoteDate",
      "retirementInterestRate",
      "retirementScenarioBase",
      "retirementScenarioFavorable",
      "retirementScenarioUnfavorable",
      "semiannual",
      "singlePaymentUdi",
      "smoker",
      "sourceLayout",
      "sumInsured",
      "term",
      "totalAnnualPremium"
    ],
    "CANONICAL_FIELD_MAPPING_CLASSIFIED": true,
    "CANONICAL_FIELD_MAPPING_CLASS": "PARTIAL_CANONICAL_PLUS_NATIVE_MAPPING_REQUIRED",
    "DIRECT_CANONICAL_MAPPING": {
      "product": "product",
      "annualPremium": "annualPremium"
    },
    "MISSING_CANONICAL_FIELDS": [
      "name",
      "family",
      "insured",
      "sumAssured",
      "plannedOrAvePremium",
      "coveragePeriod"
    ],
    "ALIAS_EVIDENCE": {
      "name": [],
      "family": [],
      "insured": [
        "sumInsured"
      ],
      "sumAssured": [
        "sumInsured"
      ],
      "plannedOrAvePremium": [
        "annualPremium",
        "baseAnnualPremium",
        "plannedAnnual",
        "plannedMonthly",
        "plannedQuarterly",
        "plannedSemiannual",
        "premium",
        "premiumTable",
        "totalAnnualPremium"
      ],
      "coveragePeriod": [
        "coverage",
        "guaranteePeriod"
      ]
    },
    "PREVIOUS_HOLD_CLASSIFIED": true,
    "PREVIOUS_HOLD_CLASSIFICATION": "ENGINE_OUTPUT_IS_NATIVE_AND_REQUIRES_EXPLICIT_CANONICAL_MAPPING",
    "NEGATIVE_ADAPTER_CALLABLES_EXCLUDED": true,
    "ADAPTER_SUCCESS_PATH_CANDIDATE_RESOLVED": true,
    "ADAPTER_SUCCESS_PATH_CANDIDATE": "validateQuotePreviewPdfProductIntelligenceIntegrationShape",
    "ADAPTER_SUCCESS_PATH_SCORE": 140,
    "ADAPTER_SUCCESS_PATH_REASONS": [
      "name_token:integrat",
      "name_token:preview",
      "name_token:quote",
      "name_token:product",
      "body_token:fields",
      "non_negative_name"
    ],
    "TARGETED_NATIVE_MAPPING_INVOCATION_AUTHORIZED": true,
    "SOURCE_CODE_WRITTEN": false,
    "SOURCE_UI_CHANGED": false,
    "REAL_ENGINE_EXECUTION": false,
    "PARSER_EXECUTED": false,
    "CONTROLLED_BROWSER_EXECUTION": false,
    "PDF_READ_EXECUTED": false,
    "OCR_EXECUTED": false,
    "PROVIDER_RUNTIME_EXECUTED": false,
    "BACKEND_CONNECTION": false,
    "QUOTE_TRUTH_ALLOWED": false,
    "NEXT_GATE": "107Z15R4_EXISTING_ENGINE_NATIVE_FIELD_MAPPING_AND_TARGETED_INVOCATION_GATE"
  },
  "static_owner_analysis": {
    "status": "PASS",
    "reason": null,
    "requiredFields": [
      "name",
      "family",
      "product",
      "insured",
      "sumAssured",
      "annualPremium",
      "plannedOrAvePremium",
      "coveragePeriod"
    ],
    "engine": {
      "callable": "extractSolucionlineLifeQuoteFields",
      "parameters": [
        "text"
      ],
      "inputAccesses": [],
      "inputProperties": [],
      "inputShapeTokens": {
        "page_like": [],
        "text_like": [],
        "context_like": []
      },
      "inputShapeClass": "OPAQUE_SINGLE_ARGUMENT_WITH_HELPER_DEPENDENCIES",
      "helperCalls": [
        "String",
        "additionalCoverages.push",
        "advisorLine.replace",
        "birthLine.match",
        "cleanValue",
        "filter",
        "findLine",
        "formatUdi",
        "genderLine.match",
        "guaranteeLine.match",
        "i.test",
        "insuredLine.replace",
        "line.match",
        "line.replace",
        "lines.find",
        "lines.findIndex",
        "liquidationLine.match",
        "map",
        "match",
        "parseNumberList",
        "pattern.test",
        "productLine.match",
        "scenario",
        "split",
        "studyDateLine.match",
        "test",
        "trim"
      ],
      "nativeOutputKeys": [
        "advisor",
        "age",
        "annual",
        "annualPremium",
        "baseAnnualPremium",
        "birthDate",
        "coverage",
        "currency",
        "detectedQuoteDomain",
        "extractionSource",
        "gender",
        "guaranteePeriod",
        "liquidationOption",
        "monthly",
        "monthlyIncomeUdi",
        "optionalCoverages",
        "paymentMode",
        "paymentTerm",
        "plan",
        "plannedAnnual",
        "plannedMonthly",
        "plannedQuarterly",
        "plannedSemiannual",
        "policyTerm",
        "policyYear",
        "premium",
        "premiumTable",
        "product",
        "prospect",
        "quarterly",
        "quoteDate",
        "retirementInterestRate",
        "retirementScenarioBase",
        "retirementScenarioFavorable",
        "retirementScenarioUnfavorable",
        "semiannual",
        "singlePaymentUdi",
        "smoker",
        "sourceLayout",
        "sumInsured",
        "term",
        "totalAnnualPremium"
      ],
      "returnExpressions": [
        "null",
        "{"
      ],
      "stringLiterals": [
        "${interestValues[0]}%",
        "${paymentTermMatch[1]} años",
        ") ? lines[productIndex + 1] : ",
        "Anual",
        "IMAGINA SER",
        "UDI",
        "life",
        "pdf_text_life_fallback",
        "solucionline_imagina_ser_economic_scenarios"
      ],
      "directCanonicalMapping": {
        "product": "product",
        "annualPremium": "annualPremium"
      },
      "missingCanonicalFields": [
        "name",
        "family",
        "insured",
        "sumAssured",
        "plannedOrAvePremium",
        "coveragePeriod"
      ],
      "aliasEvidence": {
        "name": [],
        "family": [],
        "insured": [
          "sumInsured"
        ],
        "sumAssured": [
          "sumInsured"
        ],
        "plannedOrAvePremium": [
          "annualPremium",
          "baseAnnualPremium",
          "plannedAnnual",
          "plannedMonthly",
          "plannedQuarterly",
          "plannedSemiannual",
          "premium",
          "premiumTable",
          "totalAnnualPremium"
        ],
        "coveragePeriod": [
          "coverage",
          "guaranteePeriod"
        ]
      },
      "mappingClass": "PARTIAL_CANONICAL_PLUS_NATIVE_MAPPING_REQUIRED",
      "functionSourceSha256": "8af5104835a02cc62c20a9a9a4d1c9708fc1016b9b48e08a23773b91555d539d",
      "functionSourceLength": 5284,
      "sourceExcerpt": "function extractSolucionlineLifeQuoteFields(text) {\n  if (!/Solucionline|Escenarios Econ[oó]micos|IMAGINA SER/i.test(text)) return null;\n\n  const lines = String(text).split(/\\r?\\n/)\n    .map((line) => line.replace(/\\s+/g, ' ').trim())\n    .filter(Boolean);\n  const findLine = (pattern) => lines.find((line) => pattern.test(line)) || '';\n\n  const advisorLine = findLine(/Asesor profesional de seguros:/i);\n  const insuredLine = findLine(/Asegurado:/i);\n  const birthLine = findLine(/Fecha de nacimiento:/i);\n  const genderLine = findLine(/G[eé]nero:/i);\n  const liquidationLine = findLine(/Opci[oó]n de liquidaci[oó]n:/i);\n  const productIndex = lines.findIndex((line) => /IMAGINA SER/i.test(line));\n  const productLine = productIndex >= 0 ? lines[productIndex] : '';\n  const continuationLine = productIndex >= 0 && /LIMITADOS/i.test(lines[productIndex + 1] || '') ? lines[productIndex + 1] : '';\n  const planText = cleanValue(`${(productLine.match(/(IMAGINA SER.*?)(?:\\d+\\s+a[nñ]os|$)/i) || [])[1] || 'IMAGINA SER'} ${continuationLine}`);\n  const productMatch = productLine.match(/(IMAGINA SER.*?)\\s+([0-9]+\\s+a[nñ]os)\\s+([0-9,]+)\\s+([0-9,.]+)/i);\n  const totalPremiumValues = parseNumberList(findLine(/Prima Total Anual/i));\n  const basicPremiumValues = parseNumberList(findLine(/Prima b[aá]sica/i));\n  const plannedPremiumValues = parseNumberList(findLine(/Prima planeada/i));\n  const totalTablePremiumValues = parseNumberList(findLine(/Prima total/i));\n  const scenarioLine = lines.find((line) => /^\\d+\\s+\\d+\\s+[0-9,]+\\s+[0-9,]+\\s+[0-9,]+\\s+[0-9,]+\\s+[0-9,]+\\s+[0-9,]+$/.test(line)) || '';\n  const scenarioValues = parseNumberList(scenarioLine);\n  const interestValues = parseNumberList(findLine(/inter[eé]s utilizada/i));\n  const studyDateLine = findLine(/Solucionline versi[oó]n/i);\n  const guaranteeLine = findLine(/periodo de garant[ií]a/i);\n  const paymentTermMatch = planText && String(planText).match(/LIMITADOS\\s+([0-9]+)/i);\n  const birthMatch = birthLine.match(/Fecha de nacimiento:\\s*([0-9]{1,2}\\/[0-9]{1,2}\\/[0-9]{2,4}).*Edad:\\s*([0-9]{1,3})/i);\n  const genderMatch = genderLine.match(/G[eé]nero:\\s*([A-Za-zÁÉÍÓÚáéíóúÑñ]+).*Fumador:\\s*([A-Za-zÁÉÍÓÚáéíóúÑñ]+)/i);\n  const liquidationMatch = liquidationLine.match(/Opci[oó]n de liquidaci[oó]n:\\s*(.*?)\\s+Moneda:\\s*([A-Z]+)/i);\n\n  const additionalCoverages = [];\n  for (const line of lines) {\n    const match = line.match(/^(BAM UI|AV UI|BIT 65|BMA 65|BAIT 65)\\s+(.+?)\\s+(Amparado|[0-9,]+)\\s+([0-9,.]+)$/i);\n    if (!match) continue;\n    additionalCoverages.push({\n      coverage: match[1],\n      term: cleanValue(match[2]),\n      sumInsured: cleanValue(match[3]),\n      annualPremium: formatUdi(match[4])\n    });\n  }\n\n  const scenario = (offset) => scenarioValues.length >= offset + 2 ? {\n    policyYear: scenarioValues[0],\n    age: scenarioValues[1],\n    singlePaymentUdi: scenarioValues[offset],\n    monthlyIncomeUdi: scenarioValues[offset + 1]\n  } : null;\n\n  return {\n    detectedQuoteDomain: 'life',\n    sourceLayout: 'solucionline_imagina_ser_economic_scenarios',\n    product: 'IMAGINA SER',\n    plan: planText || 'IMAGINA SER',\n    prospect: insuredLine ? cleanValue(insuredLine.replace(/Asegurado:/i, '')) : null,\n    age: birthMatch ? birthMatch[2] : null,\n    gender: genderMatch ? genderMatch[1] : null,\n    smoker: genderMatch ? genderMatch[2] : null,\n    birthDate: birthMatch ? birthMatch[1] : null,\n    liquidationOption: liquidationMatch ? liquidationMatch[1] : null,\n    currency: liquidationMatch ? liquidationMatch[2] : 'UDI',\n    policyTerm: productMatch ? cleanValue(productMatch[2]) : null,\n    paymentTerm: paymentTermMatch ? `${paymentTermMatch[1]} años` : null,\n    sumInsured: productMatch ? formatUdi(productMatch[3]) : null,\n    baseAnnualPremium: productMatch ? formatUdi(productMatch[4]) : null,\n    totalAnnualPremium: totalPremiumValues.length ? formatUdi(totalPremiumValues[totalPremiumValues.length - 1]) : null,\n    premium: totalPremiumValues.length ? formatUdi(totalPremiumValues[totalPremiumValues.length - 1]) : null,\n    paymentMode: 'Anual',\n    premiumTable: {\n      monthly: basicPremiumValues[0] ?? totalTablePremiumValues[0] ?? null,\n      quarterly: basicPremiumValues[1] ?? totalTablePremiumValues[1] ?? null,\n      semiannual: basicPremiumValues[2] ?? totalTablePremiumValues[2] ?? null,\n      annual: basicPremiumValues[3] ?? totalTablePremiumValues[3] ?? totalPremiumValues[totalPremiumValues.length - 1] ?? null,\n      plannedMonthly: plannedPremiumValues[0] ?? null,\n      plannedQuarterly: plannedPremiumValues[1] ?? null,\n      plannedSemiannual: plannedPremiumValues[2] ?? null,\n      plannedAnnual: plannedPremiumValues[3] ?? null\n    },\n    retirementInterestRate: interestValues.length ? `${interestValues[0]}%` : null,\n    retirementScenarioBase: scenario(2),\n    retirementScenarioFavorable: scenario(4),\n    retirementScenarioUnfavorable: scenario(6),\n    guaranteePeriod: (guaranteeLine.match(/garant[ií]a de\\s+([0-9]+\\s+a[nñ]os)/i) || [])[1] || null,\n    optionalCoverages: additionalCoverages,\n    advisor: advisorLine ? cleanValue(advisorLine.replace(/Asesor profesional de seguros:/i, '')) : null,\n    quoteDate: (studyDateLine.match(/d[ií]a\\s+([0-9]{1,2}\\/[0-9]{1,2}\\/[0-9]{2,4})/i) || [])[1] || null,\n    extractionSource: 'pdf_text_life_fallback'\n  };\n}"
    },
    "adapter": {
      "excludedNegativeFunctions": [
        "buildQuotePreviewPdfIntegrationError",
        "extractBindingSafeError"
      ],
      "positiveCandidates": [
        {
          "name": "validateQuotePreviewPdfProductIntelligenceIntegrationShape",
          "score": 140,
          "reasons": [
            "name_token:integrat",
            "name_token:preview",
            "name_token:quote",
            "name_token:product",
            "body_token:fields",
            "non_negative_name"
          ],
          "parameters": [
            "integration"
          ],
          "calls": [
            "Object.entries",
            "Object.prototype.hasOwnProperty.call",
            "REQUIRED_INTEGRATION_FIELDS.filter",
            "filter",
            "map"
          ],
          "objectKeys": [
            "length",
            "ok"
          ],
          "returnExpressions": [
            "{"
          ],
          "sourceSha256": "69ed721069a72cbef9f82c5c65d88d030b7e334eb43ae15c3c2473c37646f313",
          "sourceLength": 477,
          "mentionsResolvedEngine": false,
          "mentionsExtractionReadyEvent": false
        },
        {
          "name": "integrateQuotePreviewPdfEngineWithProductIntelligence",
          "score": 110,
          "reasons": [
            "name_token:integrat",
            "name_token:preview",
            "name_token:quote",
            "name_token:product",
            "non_negative_name"
          ],
          "parameters": [
            "request = {}"
          ],
          "calls": [],
          "objectKeys": [],
          "returnExpressions": [],
          "sourceSha256": "6e5d3a8c46f2c0cad9793ccd9ee7c25aa421c47614324e631ba41f62d869d13a",
          "sourceLength": 75,
          "mentionsResolvedEngine": false,
          "mentionsExtractionReadyEvent": false
        }
      ],
      "topSuccessPathCandidate": {
        "name": "validateQuotePreviewPdfProductIntelligenceIntegrationShape",
        "score": 140,
        "reasons": [
          "name_token:integrat",
          "name_token:preview",
          "name_token:quote",
          "name_token:product",
          "body_token:fields",
          "non_negative_name"
        ],
        "parameters": [
          "integration"
        ],
        "calls": [
          "Object.entries",
          "Object.prototype.hasOwnProperty.call",
          "REQUIRED_INTEGRATION_FIELDS.filter",
          "filter",
          "map"
        ],
        "objectKeys": [
          "length",
          "ok"
        ],
        "returnExpressions": [
          "{"
        ],
        "sourceSha256": "69ed721069a72cbef9f82c5c65d88d030b7e334eb43ae15c3c2473c37646f313",
        "sourceLength": 477,
        "mentionsResolvedEngine": false,
        "mentionsExtractionReadyEvent": false
      },
      "allCandidateCount": 12
    },
    "previousHold": {
      "reason": "RESOLVED_ENGINE_DID_NOT_PROVE_DIFFERENTIAL_EIGHT_FIELDS",
      "classification": "ENGINE_OUTPUT_IS_NATIVE_AND_REQUIRES_EXPLICIT_CANONICAL_MAPPING",
      "attemptSummary": {
        "attemptCount": 5,
        "strategies": [
          {
            "strategy": "RESOLVED_DIRECT_VALUE",
            "status": "NO_MATCH",
            "code": null,
            "message": null,
            "differentialFieldCount": 0,
            "fieldsPathA": null,
            "fieldsPathB": null,
            "trace": {
              "parameters": [
                "text"
              ],
              "accessedProperties": []
            }
          },
          {
            "strategy": "RESOLVED_TARGETED_OBJECT",
            "status": "NO_MATCH",
            "code": null,
            "message": null,
            "differentialFieldCount": 0,
            "fieldsPathA": null,
            "fieldsPathB": null,
            "trace": {
              "parameters": [
                "text"
              ],
              "accessedProperties": []
            }
          },
          {
            "strategy": "RESOLVED_BROAD_SOLUCIONLINE_OBJECT",
            "status": "NO_MATCH",
            "code": null,
            "message": null,
            "differentialFieldCount": 0,
            "fieldsPathA": null,
            "fieldsPathB": null,
            "trace": {
              "parameters": [
                "text"
              ],
              "accessedProperties": []
            }
          },
          {
            "strategy": "RESOLVED_HYBRID_PROXY",
            "status": "NO_MATCH",
            "code": null,
            "message": null,
            "differentialFieldCount": 0,
            "fieldsPathA": null,
            "fieldsPathB": null,
            "trace": {
              "parameters": [
                "text"
              ],
              "accessedProperties": []
            }
          },
          {
            "strategy": "RESOLVED_TEXT_AND_OPTIONS",
            "status": "NO_MATCH",
            "code": null,
            "message": null,
            "differentialFieldCount": 0,
            "fieldsPathA": null,
            "fieldsPathB": null,
            "trace": {
              "parameters": [
                "text"
              ],
              "accessedProperties": []
            }
          }
        ]
      }
    },
    "passConditions": {
      "engineFunctionBodyResolved": true,
      "engineInputShapeClassified": true,
      "engineNativeOutputKeysResolved": true,
      "canonicalFieldMappingClassified": true,
      "adapterSuccessPathCandidateResolved": true,
      "previousHoldClassified": true
    },
    "recommendedNextInvocation": {
      "inputShapeClass": "OPAQUE_SINGLE_ARGUMENT_WITH_HELPER_DEPENDENCIES",
      "requiredInputProperties": [],
      "engineHelperCallsToRespect": [
        "String",
        "additionalCoverages.push",
        "advisorLine.replace",
        "birthLine.match",
        "cleanValue",
        "filter",
        "findLine",
        "formatUdi",
        "genderLine.match",
        "guaranteeLine.match",
        "i.test",
        "insuredLine.replace",
        "line.match",
        "line.replace",
        "lines.find",
        "lines.findIndex",
        "liquidationLine.match",
        "map",
        "match",
        "parseNumberList",
        "pattern.test",
        "productLine.match",
        "scenario",
        "split",
        "studyDateLine.match",
        "test",
        "trim"
      ],
      "nativeOutputKeys": [
        "advisor",
        "age",
        "annual",
        "annualPremium",
        "baseAnnualPremium",
        "birthDate",
        "coverage",
        "currency",
        "detectedQuoteDomain",
        "extractionSource",
        "gender",
        "guaranteePeriod",
        "liquidationOption",
        "monthly",
        "monthlyIncomeUdi",
        "optionalCoverages",
        "paymentMode",
        "paymentTerm",
        "plan",
        "plannedAnnual",
        "plannedMonthly",
        "plannedQuarterly",
        "plannedSemiannual",
        "policyTerm",
        "policyYear",
        "premium",
        "premiumTable",
        "product",
        "prospect",
        "quarterly",
        "quoteDate",
        "retirementInterestRate",
        "retirementScenarioBase",
        "retirementScenarioFavorable",
        "retirementScenarioUnfavorable",
        "semiannual",
        "singlePaymentUdi",
        "smoker",
        "sourceLayout",
        "sumInsured",
        "term",
        "totalAnnualPremium"
      ],
      "canonicalMappingClass": "PARTIAL_CANONICAL_PLUS_NATIVE_MAPPING_REQUIRED",
      "directCanonicalMapping": {
        "product": "product",
        "annualPremium": "annualPremium"
      },
      "aliasEvidence": {
        "name": [],
        "family": [],
        "insured": [
          "sumInsured"
        ],
        "sumAssured": [
          "sumInsured"
        ],
        "plannedOrAvePremium": [
          "annualPremium",
          "baseAnnualPremium",
          "plannedAnnual",
          "plannedMonthly",
          "plannedQuarterly",
          "plannedSemiannual",
          "premium",
          "premiumTable",
          "totalAnnualPremium"
        ],
        "coveragePeriod": [
          "coverage",
          "guaranteePeriod"
        ]
      },
      "adapterSuccessPathCandidate": "validateQuotePreviewPdfProductIntelligenceIntegrationShape",
      "strategyId": "NATIVE_INPUT_AND_OUTPUT_MAPPING_FROM_STATIC_OWNER_REVIEW"
    },
    "sourceReceipts": {
      "engineFileSha256": "d164ce99e24adde28cad3c5e558617eecaa97645f69c888d0ff3ee217e318014",
      "adapterFileSha256": "10e23cda8585af3a6650f220c724a5c8ea9b9dc04e0ecebd5941e3391fed971d"
    }
  },
  "previous_targeted_result": {
    "status": "HOLD",
    "reason": "RESOLVED_ENGINE_DID_NOT_PROVE_DIFFERENTIAL_EIGHT_FIELDS",
    "requiredFields": [
      "name",
      "family",
      "product",
      "insured",
      "sumAssured",
      "annualPremium",
      "plannedOrAvePremium",
      "coveragePeriod"
    ],
    "resolvedEnginePath": "extractSolucionlineLifeQuoteFields",
    "engineSourceLength": 5284,
    "fixtureA": {
      "variant": "A",
      "values": {
        "name": "FORGE_A_01",
        "family": "FORGE_A_02",
        "product": "FORGE_A_03",
        "insured": "FORGE_A_04",
        "sumAssured": "125516",
        "annualPremium": "126895",
        "plannedOrAvePremium": "128274",
        "coveragePeriod": "38"
      },
      "text": "SOLUCIONLINE\nCOTIZACION DE SEGURO DE VIDA\nFORGE CONTROLLED SYNTHETIC TEXT\nVARIANT: A\n\nname: FORGE_A_01\nname: FORGE_A_01\nfamily: FORGE_A_02\nfamily: FORGE_A_02\nproduct: FORGE_A_03\nproduct: FORGE_A_03\ninsured: FORGE_A_04\ninsured: FORGE_A_04\nsumAssured: 125516\nsum Assured: 125516\nannualPremium: 126895\nannual Premium: 126895\nplannedOrAvePremium: 128274\nplanned Or Ave Premium: 128274\ncoveragePeriod: 38\ncoverage Period: 38\n\nJSON_FIELDS={\"name\":\"FORGE_A_01\",\"family\":\"FORGE_A_02\",\"product\":\"FORGE_A_03\",\"insured\":\"FORGE_A_04\",\"sumAssured\":\"125516\",\"annualPremium\":\"126895\",\"plannedOrAvePremium\":\"128274\",\"coveragePeriod\":\"38\"}",
      "lines": [
        "SOLUCIONLINE",
        "COTIZACION DE SEGURO DE VIDA",
        "FORGE CONTROLLED SYNTHETIC TEXT",
        "VARIANT: A",
        "",
        "name: FORGE_A_01",
        "name: FORGE_A_01",
        "family: FORGE_A_02",
        "family: FORGE_A_02",
        "product: FORGE_A_03",
        "product: FORGE_A_03",
        "insured: FORGE_A_04",
        "insured: FORGE_A_04",
        "sumAssured: 125516",
        "sum Assured: 125516",
        "annualPremium: 126895",
        "annual Premium: 126895",
        "plannedOrAvePremium: 128274",
        "planned Or Ave Premium: 128274",
        "coveragePeriod: 38",
        "coverage Period: 38",
        "",
        "JSON_FIELDS={\"name\":\"FORGE_A_01\",\"family\":\"FORGE_A_02\",\"product\":\"FORGE_A_03\",\"insured\":\"FORGE_A_04\",\"sumAssured\":\"125516\",\"annualPremium\":\"126895\",\"plannedOrAvePremium\":\"128274\",\"coveragePeriod\":\"38\"}"
      ]
    },
    "fixtureB": {
      "variant": "B",
      "values": {
        "name": "FORGE_B_01",
        "family": "FORGE_B_02",
        "product": "FORGE_B_03",
        "insured": "FORGE_B_04",
        "sumAssured": "817468",
        "annualPremium": "819335",
        "plannedOrAvePremium": "821202",
        "coveragePeriod": "68"
      },
      "text": "SOLUCIONLINE\nCOTIZACION DE SEGURO DE VIDA\nFORGE CONTROLLED SYNTHETIC TEXT\nVARIANT: B\n\nname: FORGE_B_01\nname: FORGE_B_01\nfamily: FORGE_B_02\nfamily: FORGE_B_02\nproduct: FORGE_B_03\nproduct: FORGE_B_03\ninsured: FORGE_B_04\ninsured: FORGE_B_04\nsumAssured: 817468\nsum Assured: 817468\nannualPremium: 819335\nannual Premium: 819335\nplannedOrAvePremium: 821202\nplanned Or Ave Premium: 821202\ncoveragePeriod: 68\ncoverage Period: 68\n\nJSON_FIELDS={\"name\":\"FORGE_B_01\",\"family\":\"FORGE_B_02\",\"product\":\"FORGE_B_03\",\"insured\":\"FORGE_B_04\",\"sumAssured\":\"817468\",\"annualPremium\":\"819335\",\"plannedOrAvePremium\":\"821202\",\"coveragePeriod\":\"68\"}",
      "lines": [
        "SOLUCIONLINE",
        "COTIZACION DE SEGURO DE VIDA",
        "FORGE CONTROLLED SYNTHETIC TEXT",
        "VARIANT: B",
        "",
        "name: FORGE_B_01",
        "name: FORGE_B_01",
        "family: FORGE_B_02",
        "family: FORGE_B_02",
        "product: FORGE_B_03",
        "product: FORGE_B_03",
        "insured: FORGE_B_04",
        "insured: FORGE_B_04",
        "sumAssured: 817468",
        "sum Assured: 817468",
        "annualPremium: 819335",
        "annual Premium: 819335",
        "plannedOrAvePremium: 821202",
        "planned Or Ave Premium: 821202",
        "coveragePeriod: 68",
        "coverage Period: 68",
        "",
        "JSON_FIELDS={\"name\":\"FORGE_B_01\",\"family\":\"FORGE_B_02\",\"product\":\"FORGE_B_03\",\"insured\":\"FORGE_B_04\",\"sumAssured\":\"817468\",\"annualPremium\":\"819335\",\"plannedOrAvePremium\":\"821202\",\"coveragePeriod\":\"68\"}"
      ]
    },
    "engineAttempts": [
      {
        "strategy": "RESOLVED_DIRECT_VALUE",
        "status": "NO_MATCH",
        "fieldsPathA": null,
        "fieldsPathB": null,
        "differentialFieldCount": 0,
        "trace": {
          "parameters": [
            "text"
          ],
          "accessedProperties": []
        }
      },
      {
        "strategy": "RESOLVED_TARGETED_OBJECT",
        "status": "NO_MATCH",
        "fieldsPathA": null,
        "fieldsPathB": null,
        "differentialFieldCount": 0,
        "trace": {
          "parameters": [
            "text"
          ],
          "accessedProperties": []
        }
      },
      {
        "strategy": "RESOLVED_BROAD_SOLUCIONLINE_OBJECT",
        "status": "NO_MATCH",
        "fieldsPathA": null,
        "fieldsPathB": null,
        "differentialFieldCount": 0,
        "trace": {
          "parameters": [
            "text"
          ],
          "accessedProperties": []
        }
      },
      {
        "strategy": "RESOLVED_HYBRID_PROXY",
        "status": "NO_MATCH",
        "fieldsPathA": null,
        "fieldsPathB": null,
        "differentialFieldCount": 0,
        "trace": {
          "parameters": [
            "text"
          ],
          "accessedProperties": []
        }
      },
      {
        "strategy": "RESOLVED_TEXT_AND_OPTIONS",
        "status": "NO_MATCH",
        "fieldsPathA": null,
        "fieldsPathB": null,
        "differentialFieldCount": 0,
        "trace": {
          "parameters": [
            "text"
          ],
          "accessedProperties": []
        }
      }
    ],
    "negativeAdapterNamePattern": "(error|failure|failed|reject|invalid|throw|exception|assert|problem|unsupported)"
  },
  "source_receipts": {
    "ENGINE_SHA256": "d164ce99e24adde28cad3c5e558617eecaa97645f69c888d0ff3ee217e318014",
    "ADAPTER_SHA256": "10e23cda8585af3a6650f220c724a5c8ea9b9dc04e0ecebd5941e3391fed971d"
  },
  "authorization": {
    "TARGETED_NATIVE_MAPPING_INVOCATION_AUTHORIZED": true,
    "SOURCE_CODE_WRITE_AUTHORIZED": false,
    "PDF_READ_AUTHORIZED": false,
    "OCR_EXECUTION_AUTHORIZED": false,
    "PROVIDER_RUNTIME_AUTHORIZED": false,
    "BACKEND_CONNECTION_AUTHORIZED": false,
    "OFFICIAL_QUOTE_WRITE_AUTHORIZED": false,
    "QUOTE_TRUTH_AUTHORIZED": false,
    "REAL_CUSTOMER_DATA_AUTHORIZED": false,
    "REAL_EFFECTS_AUTHORIZED": false
  },
  "constitutional_flags": {
    "NEW_ENGINE_CREATED": false,
    "NEW_CACHE_CREATED": false,
    "DUPLICATE_BRIDGE_CREATED": false,
    "SOURCE_UI_CHANGED": false,
    "REAL_ENGINE_EXECUTION": false,
    "PARSER_EXECUTED": false,
    "CONTROLLED_BROWSER_EXECUTION": false,
    "PDF_READ_EXECUTED": false,
    "OCR_EXECUTED": false,
    "PROVIDER_RUNTIME_EXECUTED": false,
    "BACKEND_CONNECTION": false,
    "QUOTE_TRUTH_ALLOWED": false,
    "STATIC_OWNER_INSPECTION_EXECUTED": true,
    "TEST_EXECUTION": true
  }
}
```
