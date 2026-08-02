"use strict";

const LEGACY_RULE_AUTHORITY = "CANDIDATE_LEGACY_RUNTIME";
const LEGACY_RULE_SOURCE = "comisiones.js — FULL SAFE RECOVERY BUILD v16 (RLS Safe)";
const LEGACY_RULE_STATUS = "REQUIRES_STAGE_020_VALIDATION";

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(deepFreeze);
  return value;
}

const LEGACY_LIFE_RATES = deepFreeze({
  "Segubeca": { default: [0.33, 0.10, 0.07, 0.03, 0.03, 0.00] },
  "Imagina Ser": {
    default: [0.35, 0.12, 0.08, 0.05, 0.05, 0.035],
    "10 Pagos": [0.27, 0.085, 0.04, 0.04, 0.04, 0],
    "15 Pagos": [0.30, 0.12, 0.08, 0.05, 0.05, 0.035],
    "Prima Única": [0.085, 0, 0, 0, 0, 0]
  },
  "Orvi": { default: [0.44, 0.15, 0.10, 0.10, 0.05, 0.02] },
  "Orvi 99": { default: [0.44, 0.15, 0.10, 0.10, 0.05, 0.02] },
  "Realiza": { default: [0.44, 0.15, 0.10, 0.05, 0.05, 0.008] },
  "Star Temporal": {
    default: [0.35, 0.15, 0.10, 0.10, 0.05, 0.02],
    "20a <500k": [0.44, 0.15, 0.10, 0.10, 0.05, 0.02],
    "10a >=500k": [0.30, 0.15, 0.10, 0.10, 0.05, 0.00],
    "1a": [0.22, 0, 0, 0, 0, 0],
    "5a": [0.35, 0.10, 0.09, 0.09, 0, 0]
  },
  "Mio": { default: [0.80, 0.20, 0.14, 0.08, 0.08, 0.02] },
  "Objetivo Vida": { default: [0.44, 0.15, 0.10, 0.05, 0.05, 0.01] },
  "Nuevo Plenitud": {
    default: [0.35, 0.12, 0.08, 0.05, 0.05, 0.035],
    "15 Pagos": [0.32, 0.05, 0.04, 0.02, 0.02, 0]
  },
  "Plenitud": { default: [0.35, 0.12, 0.08, 0.05, 0.05, 0.035] },
  "Vida Mujer": { default: [0.40, 0.15, 0.10, 0.05, 0.05, 0.02] },
  "Nuevo Vida Mujer": { default: [0.40, 0.15, 0.10, 0.05, 0.05, 0.02] },
  "Star Dotal": {
    default: [0.35, 0.12, 0.10, 0.05, 0.05, 0.02],
    "5a": [0.11, 0.05, 0.04, 0, 0, 0],
    "10a": [0.27, 0.09, 0.07, 0.05, 0.05, 0],
    "15a": [0.28, 0.09, 0.07, 0.05, 0.05, 0.05]
  },
  "Legado": { default: [0.44, 0.15, 0.10, 0.05, 0.05, 0.01] },
  "Respaldo Educativo": { default: [0.35, 0.10, 0.09, 0, 0, 0] },
  "Respaldo Negocio": { default: [0.35, 0.10, 0.09, 0, 0, 0] }
});

const LEGACY_GMM_RATES = deepFreeze({
  "Alfa Medical": { i: [0.17, 0.22, 0.13, 0.10], r: [0.15, 0.17, 0.13, 0.10] },
  "Alfa Medical Flex": { i: [0.15, 0.22, 0.13, 0.10], r: [0.13, 0.17, 0.13, 0.10] },
  "Alfa Medical Internacional": { i: [0.17, 0.25, 0.25, 0.10], r: [0.15, 0.17, 0.17, 0.10] }
});

const LEGACY_GMM_PLANS = deepFreeze(Object.keys(LEGACY_GMM_RATES));
const LEGACY_NO_POINT_PLANS = deepFreeze(["Star Temporal 1", "Tempo Vida 1"]);

const LEGACY_TRAINING_TARGETS = deepFreeze({
  1: { comAcum: 9000, ptosAcum: 3, premMax: 33000 },
  2: { comAcum: 15000, ptosAcum: 6, premMax: 56000 },
  3: { comAcum: 21000, ptosAcum: 9, premMax: 69000 },
  4: { comAcum: 31000, ptosAcum: 12, premMax: 102000 },
  5: { comAcum: 39000, ptosAcum: 15, premMax: 129000 },
  6: { comAcum: 51000, ptosAcum: 18, premMax: 167000 },
  7: { comAcum: 13000, ptosAcum: 3, premMax: 38000 },
  8: { comAcum: 21000, ptosAcum: 6, premMax: 64000 },
  9: { comAcum: 32000, ptosAcum: 9, premMax: 95000 },
  10: { comAcum: 43000, ptosAcum: 12, premMax: 130000 },
  11: { comAcum: 55000, ptosAcum: 15, premMax: 165000 },
  12: { comAcum: 70000, ptosAcum: 18, premMax: 210000 }
});

const LEGACY_NP_GROUPS = deepFreeze([
  { g: 1, mes6: 2735000 }, { g: 2, mes6: 2505000 },
  { g: 3, mes6: 2125000 }, { g: 4, mes6: 1945000 },
  { g: 5, mes6: 1820000 }, { g: 6, mes6: 1675000 },
  { g: 7, mes6: 1495000 }, { g: 8, mes6: 1290000 },
  { g: 9, mes6: 1115000 }, { g: 10, mes6: 950000 },
  { g: 11, mes6: 735000 }, { g: 12, mes6: 525000 },
  { g: 13, mes6: 420000 }, { g: 14, mes6: 385000 },
  { g: 15, mes6: 330000 }, { g: 16, mes6: 275000 }
]);

const LEGACY_NP_BONUS_PERCENTAGES = deepFreeze({
  1: { min: 9.8, l87: 19.5, l89: 33.0, l91: 36.0, l95: 45.0 },
  2: { min: 8.3, l87: 16.5, l89: 30.5, l91: 34.0, l95: 43.0 },
  3: { min: 7.0, l87: 14.0, l89: 27.5, l91: 32.0, l95: 40.0 },
  4: { min: 6.3, l87: 12.5, l89: 26.5, l91: 30.0, l95: 37.0 },
  5: { min: 5.8, l87: 11.5, l89: 24.5, l91: 28.0, l95: 35.0 },
  6: { min: 5.3, l87: 10.5, l89: 22.0, l91: 26.0, l95: 33.0 },
  7: { min: 5.0, l87: 10.0, l89: 19.5, l91: 25.0, l95: 31.0 },
  8: { min: 4.8, l87: 9.5, l89: 16.5, l91: 23.0, l95: 29.0 },
  9: { min: 4.5, l87: 9.0, l89: 14.0, l91: 22.0, l95: 27.0 },
  10: { min: 4.3, l87: 8.5, l89: 11.0, l91: 20.0, l95: 25.0 },
  11: { min: 4.0, l87: 8.0, l89: 10.0, l91: 18.0, l95: 23.0 },
  12: { min: 3.5, l87: 7.0, l89: 9.0, l91: 17.0, l95: 21.0 },
  13: { min: 2.8, l87: 5.5, l89: 8.0, l91: 15.0, l95: 19.0 },
  14: { min: 2.3, l87: 4.5, l89: 7.0, l91: 14.0, l95: 17.0 },
  15: { min: 1.8, l87: 3.5, l89: 5.5, l91: 12.0, l95: 15.0 },
  16: { min: 1.0, l87: 2.0, l89: 2.5, l91: 11.0, l95: 14.0 }
});

const LEGACY_GMM_GROUPS = deepFreeze([
  { g: 1, pols: 8, mes3: 790000, pct: 0.16 },
  { g: 2, pols: 6, mes3: 610000, pct: 0.14 },
  { g: 3, pols: 5, mes3: 485000, pct: 0.13 },
  { g: 4, pols: 4, mes3: 365000, pct: 0.10 },
  { g: 5, pols: 3, mes3: 280000, pct: 0.09 },
  { g: 6, pols: 3, mes3: 215000, pct: 0.08 },
  { g: 7, pols: 2, mes3: 160000, pct: 0.07 }
]);

const LEGACY_PREMIUM_WEIGHTS = deepFreeze({
  "Star Temporal": 1.10,
  "Orvi 99": 0.90,
  "Orvi": 0.90,
  "Mio": 1.30,
  "Imagina Ser": 1.10,
  "Nuevo Plenitud": 1.00,
  "Plenitud": 1.00,
  "Respaldo Educativo": 1.00,
  "Respaldo Negocio": 1.00,
  "Vida Mujer": 1.00,
  "Nuevo Vida Mujer": 1.00,
  "Star Dotal": 0.50,
  "Legado": 1.10,
  "Realiza": 1.10,
  "Objetivo Vida": 1.20,
  "Segubeca": 0.50
});

module.exports = {
  LEGACY_RULE_AUTHORITY,
  LEGACY_RULE_SOURCE,
  LEGACY_RULE_STATUS,
  LEGACY_LIFE_RATES,
  LEGACY_GMM_RATES,
  LEGACY_GMM_PLANS,
  LEGACY_NO_POINT_PLANS,
  LEGACY_TRAINING_TARGETS,
  LEGACY_NP_GROUPS,
  LEGACY_NP_BONUS_PERCENTAGES,
  LEGACY_GMM_GROUPS,
  LEGACY_PREMIUM_WEIGHTS
};