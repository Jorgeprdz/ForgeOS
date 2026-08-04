import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const sourceText = await readFile(
  new URL("../advisor-os/compensation/advisor-compensation-070-source.js", import.meta.url),
  "utf8",
);
const viewText = await readFile(
  new URL("../platform/compensation/advisor-compensation-070-view.js", import.meta.url),
  "utf8",
);
const routeText = await readFile(
  new URL("../comisiones.js", import.meta.url),
  "utf8",
);

const source = await import(`data:text/javascript;base64,${Buffer.from(sourceText).toString("base64")}`);
const view = await import(`data:text/javascript;base64,${Buffer.from(viewText).toString("base64")}`);

let total = 0;
let passed = 0;
async function test(name, fn) {
  total += 1;
  try {
    await fn();
    passed += 1;
  } catch (error) {
    console.error(`FAIL ${name}:`, error.stack || error);
  }
}
function code(fn, expected) {
  assert.throws(fn, (error) => error?.code === expected);
}
async function asyncCode(fn, expected) {
  await assert.rejects(fn, (error) => error?.code === expected);
}

function snapshot(overrides = {}) {
  const periodKey = overrides.periodKey || "2026-08";
  const advisorReference = overrides.advisorReference || "advisor-1";
  return {
    contractVersion: "ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_001",
    snapshotId: `snapshot:${advisorReference}:${periodKey}`,
    snapshotDigest: overrides.snapshotDigest || "a".repeat(64),
    advisorReference,
    periodKey,
    currency: "MXN",
    status: overrides.status || "READY",
    capturedAt: overrides.capturedAt || "2026-08-02T06:00:00.000Z",
    amounts: {
      estimated: overrides.estimated ?? 40,
      earned: {
        gross: overrides.earnedGross ?? 100,
        adjustments: overrides.adjustments ?? 20,
        reversals: overrides.reversals ?? -10,
        net: overrides.earnedNet ?? 110,
      },
      paid: {
        sourceState: overrides.paidSourceState || "AVAILABLE",
        value: Object.hasOwn(overrides, "paid") ? overrides.paid : 90,
        knownZero: overrides.paid === 0,
      },
      real: {
        basis: overrides.realBasis || "PAID",
        value: Object.hasOwn(overrides, "real") ? overrides.real : 90,
      },
      potential: overrides.potential ?? 500,
      atRisk: overrides.atRisk ?? 30,
    },
    counts: { events: 4 },
    sourceHealth: { compensationEvents: "AVAILABLE", payoutTruth: "AVAILABLE" },
    details: {
      aggregates: overrides.aggregates || [{
        aggregateKey: "agg-1",
        policyReference: "policy-1",
        concept: "LIFE_INITIAL",
        latestState: "ADJUSTED",
        estimatedAmount: 0,
        earnedGrossAmount: 100,
        adjustmentAmount: 20,
        reversalAmount: -10,
        earnedNetAmount: 110,
        earnedEventId: "earned-1",
        sourceCalculationDigest: "c".repeat(64),
        rulePackDigest: "r".repeat(64),
      }],
    },
    explanation: { realReason: "confirmed_payout_truth_available" },
    safeguards: { unknownAsZero: false },
  };
}

function history(overrides = {}) {
  const advisorReference = overrides.advisorReference || "advisor-1";
  const periods = overrides.periods || [
    "2026-03", "2026-04", "2026-05", "2026-06", "2026-07", "2026-08",
  ];
  return {
    contractVersion: "ADVISOR_COMPENSATION_HISTORY_SERIES_001",
    seriesId: "series-1",
    seriesDigest: overrides.seriesDigest || "b".repeat(64),
    advisorReference,
    currency: "MXN",
    capturedAt: overrides.capturedAt || "2026-08-02T06:00:00.000Z",
    points: periods.map((periodKey, index) => ({
      periodKey,
      status: "READY",
      estimated: index * 10,
      earnedNet: 80 + index,
      paid: index === 0 ? null : 70 + index,
      real: 70 + index,
      realBasis: index === 0 ? "EARNED" : "PAID",
      potential: 100 + index,
      atRisk: 5,
    })),
  };
}

function provider(overrides = {}) {
  return {
    async loadPeriodSnapshot(context) {
      if (overrides.delay) await overrides.delay();
      if (overrides.throwError) throw overrides.throwError;
      return overrides.snapshot || snapshot({
        advisorReference: context.advisorReference,
        periodKey: context.periodKey,
      });
    },
    async loadHistorySeries(context) {
      if (overrides.delay) await overrides.delay();
      if (overrides.throwError) throw overrides.throwError;
      return overrides.history || history({
        advisorReference: context.advisorReference,
        periods: context.periodKeys,
      });
    },
  };
}

const periods = ["2026-03", "2026-04", "2026-05", "2026-06", "2026-07", "2026-08"];

await test("source contract exported", () => {
  assert.equal(
    source.ADVISOR_COMPENSATION_PRODUCT_READ_MODEL_CONTRACT_VERSION,
    "ADVISOR_COMPENSATION_PRODUCT_READ_MODEL_001",
  );
});
await test("unavailable history never normalizes unknown truth to zero", () => {
  const html = view.renderHistory({
    points: [{ periodKey: "2026-08", real: null, paid: null, earnedNet: 0, estimated: 0, realBasis: "UNAVAILABLE" }],
  }, "MXN");
  assert.match(html, /data-comp-history-state="UNAVAILABLE"/);
  assert.match(html, /No disponible/);
  assert.doesNotMatch(html, /\$0\.00/);
});
await test("partial snapshot without aggregates does not present zero cards as evidence", () => {
  const html = view.renderAdvisorCompensationProduct({
    state: "PARTIAL",
    periodKey: "2026-08",
    snapshot: snapshot({
      status: "PARTIAL",
      realBasis: "UNAVAILABLE",
      real: null,
      paid: null,
      estimated: 0,
      earnedNet: 0,
      potential: 0,
      atRisk: 0,
      aggregates: [],
    }),
    history: history({ periods: ["2026-08"] }),
  });
  assert.match(html, /data-comp-attention-state="UNAVAILABLE"/);
  assert.match(html, /Reintentar lectura productiva/);
  assert.doesNotMatch(html, /<strong>\$0\.00<\/strong>/);
});
await test("all eight UI states", () => {
  assert.deepEqual(Object.values(source.ADVISOR_COMPENSATION_UI_STATES), [
    "LOADING", "READY", "PARTIAL", "EMPTY", "BLOCKED", "STALE", "ERROR", "DISCONNECTED",
  ]);
});
await test("valid month", () => assert.equal(source.validPeriodKey("2026-08"), true));
await test("invalid month", () => assert.equal(source.validPeriodKey("2026-13"), false));
await test("provider registration", () => {
  const value = provider();
  assert.equal(source.registerAdvisorCompensationProductProvider(value), value);
  assert.equal(source.resolveAdvisorCompensationProductProvider({}), value);
  source.clearAdvisorCompensationProductProvider();
});
await test("invalid provider registration blocked", () => {
  code(() => source.registerAdvisorCompensationProductProvider({}), "ADVISOR_COMPENSATION_UI_PROVIDER_INVALID");
});
await test("global provider resolution", () => {
  const value = provider();
  assert.equal(source.resolveAdvisorCompensationProductProvider({
    ForgeAdvisorCompensationProductSource070: value,
  }), value);
});
await test("missing provider disconnects", async () => {
  const result = await source.createAdvisorCompensationProductSource({
    providerResolver: () => null,
  }).load({ advisorReference: "advisor-1", periodKey: "2026-08", periodKeys: periods });
  assert.equal(result.state, "DISCONNECTED");
  assert.equal(result.snapshot, null);
});
await test("disconnected forbids indexeddb fallback", async () => {
  const result = await source.createAdvisorCompensationProductSource({
    providerResolver: () => null,
  }).load({ advisorReference: "advisor-1", periodKey: "2026-08", periodKeys: periods });
  assert.equal(result.safeguards.indexedDbFallback, false);
  assert.equal(result.safeguards.carteraFallback, false);
  assert.equal(result.safeguards.uiCalculation, false);
});
await test("split provider returns ready", async () => {
  const result = await source.createAdvisorCompensationProductSource({
    provider: provider(),
    now: () => Date.parse("2026-08-02T07:00:00.000Z"),
  }).load({ advisorReference: "advisor-1", periodKey: "2026-08", periodKeys: periods });
  assert.equal(result.state, "READY");
  assert.equal(result.snapshot.amounts.real.value, 90);
});
await test("unified provider supported", async () => {
  const result = await source.createAdvisorCompensationProductSource({
    provider: {
      async loadCompensationProduct() {
        return { snapshot: snapshot(), history: history(), sourceState: "PARTIAL" };
      },
    },
    now: () => Date.parse("2026-08-02T07:00:00.000Z"),
  }).load({ advisorReference: "advisor-1", periodKey: "2026-08", periodKeys: periods });
  assert.equal(result.state, "PARTIAL");
});
await test("snapshot partial maps partial", async () => {
  const result = await source.createAdvisorCompensationProductSource({
    provider: provider({ snapshot: snapshot({ status: "PARTIAL" }) }),
    now: () => Date.parse("2026-08-02T07:00:00.000Z"),
  }).load({ advisorReference: "advisor-1", periodKey: "2026-08", periodKeys: periods });
  assert.equal(result.state, "PARTIAL");
});
await test("snapshot empty maps empty", async () => {
  const result = await source.createAdvisorCompensationProductSource({
    provider: provider({ snapshot: snapshot({ status: "EMPTY" }) }),
    now: () => Date.parse("2026-08-02T07:00:00.000Z"),
  }).load({ advisorReference: "advisor-1", periodKey: "2026-08", periodKeys: periods });
  assert.equal(result.state, "EMPTY");
});
await test("snapshot blocked maps blocked", async () => {
  const result = await source.createAdvisorCompensationProductSource({
    provider: provider({ snapshot: snapshot({ status: "BLOCKED" }) }),
    now: () => Date.parse("2026-08-02T07:00:00.000Z"),
  }).load({ advisorReference: "advisor-1", periodKey: "2026-08", periodKeys: periods });
  assert.equal(result.state, "BLOCKED");
});
await test("age makes stale", async () => {
  const result = await source.createAdvisorCompensationProductSource({
    provider: provider(),
    now: () => Date.parse("2026-08-05T07:00:00.000Z"),
    maxAgeMs: 24 * 60 * 60 * 1000,
  }).load({ advisorReference: "advisor-1", periodKey: "2026-08", periodKeys: periods });
  assert.equal(result.state, "STALE");
  assert.equal(result.stale, true);
});
await test("explicit stale supported", async () => {
  const result = await source.createAdvisorCompensationProductSource({
    provider: {
      async loadCompensationProduct() {
        return { snapshot: snapshot(), history: history(), sourceState: "STALE" };
      },
    },
    now: () => Date.parse("2026-08-02T07:00:00.000Z"),
  }).load({ advisorReference: "advisor-1", periodKey: "2026-08", periodKeys: periods });
  assert.equal(result.state, "STALE");
});
await test("provider error produces error state", async () => {
  const error = Object.assign(new Error("boom"), { code: "SOURCE_BOOM" });
  const result = await source.createAdvisorCompensationProductSource({
    provider: provider({ throwError: error }),
  }).load({ advisorReference: "advisor-1", periodKey: "2026-08", periodKeys: periods });
  assert.equal(result.state, "ERROR");
  assert.equal(result.errorCode, "SOURCE_BOOM");
});
await test("advisor required", async () => {
  await asyncCode(() => source.createAdvisorCompensationProductSource({ provider: provider() })
    .load({ periodKey: "2026-08", periodKeys: periods }), "ADVISOR_COMPENSATION_UI_ADVISOR_REQUIRED");
});
await test("period required", async () => {
  await asyncCode(() => source.createAdvisorCompensationProductSource({ provider: provider() })
    .load({ advisorReference: "advisor-1", periodKey: "bad", periodKeys: periods }), "ADVISOR_COMPENSATION_UI_PERIOD_INVALID");
});
await test("history periods required", async () => {
  await asyncCode(() => source.createAdvisorCompensationProductSource({ provider: provider() })
    .load({ advisorReference: "advisor-1", periodKey: "2026-08", periodKeys: [] }), "ADVISOR_COMPENSATION_UI_HISTORY_PERIODS_INVALID");
});
await test("owner mismatch becomes error state", async () => {
  const result = await source.createAdvisorCompensationProductSource({
    provider: provider({ snapshot: snapshot({ advisorReference: "advisor-2" }) }),
  }).load({ advisorReference: "advisor-1", periodKey: "2026-08", periodKeys: periods });
  assert.equal(result.state, "ERROR");
  assert.equal(result.errorCode, "ADVISOR_COMPENSATION_UI_SNAPSHOT_OWNER_MISMATCH");
});
await test("snapshot period mismatch becomes error", async () => {
  const result = await source.createAdvisorCompensationProductSource({
    provider: provider({ snapshot: snapshot({ periodKey: "2026-07" }) }),
  }).load({ advisorReference: "advisor-1", periodKey: "2026-08", periodKeys: periods });
  assert.equal(result.errorCode, "ADVISOR_COMPENSATION_UI_SNAPSHOT_PERIOD_MISMATCH");
});
await test("snapshot contract mismatch", async () => {
  const bad = { ...snapshot(), contractVersion: "BAD" };
  const result = await source.createAdvisorCompensationProductSource({
    provider: provider({ snapshot: bad }),
  }).load({ advisorReference: "advisor-1", periodKey: "2026-08", periodKeys: periods });
  assert.equal(result.errorCode, "ADVISOR_COMPENSATION_UI_SNAPSHOT_CONTRACT_INVALID");
});
await test("history owner mismatch", async () => {
  const result = await source.createAdvisorCompensationProductSource({
    provider: provider({ history: history({ advisorReference: "advisor-2" }) }),
  }).load({ advisorReference: "advisor-1", periodKey: "2026-08", periodKeys: periods });
  assert.equal(result.errorCode, "ADVISOR_COMPENSATION_UI_HISTORY_OWNER_MISMATCH");
});
await test("history period mismatch", async () => {
  const result = await source.createAdvisorCompensationProductSource({
    provider: provider({ history: history({ periods: ["2025-01"] }) }),
  }).load({ advisorReference: "advisor-1", periodKey: "2026-08", periodKeys: periods });
  assert.equal(result.errorCode, "ADVISOR_COMPENSATION_UI_HISTORY_PERIOD_MISMATCH");
});
await test("abort before load", async () => {
  const controller = new AbortController();
  controller.abort();
  await asyncCode(() => source.createAdvisorCompensationProductSource({ provider: provider() })
    .load({
      advisorReference: "advisor-1", periodKey: "2026-08", periodKeys: periods,
      signal: controller.signal,
    }), "ABORT_ERR");
});
await test("abort after provider call", async () => {
  const controller = new AbortController();
  let release;
  const promise = source.createAdvisorCompensationProductSource({
    provider: {
      async loadCompensationProduct() {
        await new Promise((resolve) => { release = resolve; });
        return { snapshot: snapshot(), history: history() };
      },
    },
  }).load({
    advisorReference: "advisor-1", periodKey: "2026-08", periodKeys: periods,
    signal: controller.signal,
  });
  await Promise.resolve();
  controller.abort();
  release?.();
  await asyncCode(() => promise, "ABORT_ERR");
});
await test("read only context sent", async () => {
  let received;
  const result = await source.createAdvisorCompensationProductSource({
    provider: {
      async loadCompensationProduct(context) {
        received = context;
        return { snapshot: snapshot(), history: history() };
      },
    },
    now: () => Date.parse("2026-08-02T07:00:00.000Z"),
  }).load({
    advisorReference: "advisor-1", periodKey: "2026-08", periodKeys: periods,
    requestId: 7,
  });
  assert.equal(result.state, "READY");
  assert.equal(received.readOnly, true);
  assert.equal(received.requestId, 7);
});

await test("currency format", () => assert.match(view.formatCurrency(90, "MXN"), /\$90/));
await test("unknown currency amount", () => assert.equal(view.formatCurrency(null, "MXN"), "No disponible"));
await test("month label", () => assert.match(view.monthLabel("2026-08").toLowerCase(), /agosto/));
await test("paid truth label", () => assert.equal(view.truthLabel("PAID"), "Pagado confirmado"));
await test("earned truth label", () => assert.equal(view.truthLabel("EARNED"), "Devengado"));
await test("unavailable truth label", () => assert.equal(view.truthLabel("UNAVAILABLE"), "No disponible"));
await test("html escape", () => assert.equal(view.escapeHtml("<script>"), "&lt;script&gt;"));

for (const state of ["LOADING", "EMPTY", "BLOCKED", "ERROR", "DISCONNECTED"]) {
  await test(`renders ${state} state`, () => {
    const html = view.renderAdvisorCompensationProduct({
      state,
      periodKey: "2026-08",
      sourceHealth: {},
      errorCode: state === "ERROR" ? "X" : null,
    });
    assert.match(html, new RegExp(`data-compensation-state="${state}"`));
  });
}
await test("renders ready state", () => {
  const html = view.renderAdvisorCompensationProduct({
    state: "READY", periodKey: "2026-08", snapshot: snapshot(), history: history(),
    sourceHealth: { canonicalSnapshot: "READY" },
  });
  assert.match(html, /Ingreso real del periodo/);
  assert.match(html, /Pagado confirmado/);
});
await test("renders partial warning", () => {
  const html = view.renderAdvisorCompensationProduct({
    state: "PARTIAL", periodKey: "2026-08", snapshot: snapshot({ status: "PARTIAL" }),
    history: history(), sourceHealth: {},
  });
  assert.match(html, /vista es parcial/);
});
await test("renders stale warning", () => {
  const html = view.renderAdvisorCompensationProduct({
    state: "STALE", periodKey: "2026-08", snapshot: snapshot(),
    history: history(), sourceHealth: {},
  });
  assert.match(html, /puede no estar actualizada/);
});
await test("renders all truth cards", () => {
  const html = view.renderAdvisorCompensationProduct({
    state: "READY", periodKey: "2026-08", snapshot: snapshot(), history: history(),
    sourceHealth: {},
  });
  for (const key of ["paid", "earned", "estimated", "potential", "at-risk", "adjustments", "reversals"]) {
    assert.match(html, new RegExp(`data-compensation-card="${key}"`));
  }
});
await test("paid null says unavailable", () => {
  const html = view.renderAdvisorCompensationProduct({
    state: "PARTIAL", periodKey: "2026-08",
    snapshot: snapshot({ paid: null, realBasis: "EARNED", real: 110, status: "PARTIAL" }),
    history: history(), sourceHealth: {},
  });
  assert.match(html, /No disponible/);
});
await test("potential explicitly not real", () => {
  const html = view.renderAdvisorCompensationProduct({
    state: "READY", periodKey: "2026-08", snapshot: snapshot(), history: history(),
    sourceHealth: {},
  });
  assert.match(html, /no forma parte del ingreso real/);
});
await test("risk not silently deducted", () => {
  const html = view.renderAdvisorCompensationProduct({
    state: "READY", periodKey: "2026-08", snapshot: snapshot(), history: history(),
    sourceHealth: {},
  });
  assert.match(html, /no se descuenta silenciosamente/);
});
await test("one earned aggregate does not authorize unsupported potential or risk", () => {
  const html = view.renderAdvisorCompensationProduct({
    state: "PARTIAL",
    periodKey: "2026-08",
    snapshot: snapshot({ potential: 0, atRisk: 0 }),
    history: history(),
    sourceHealth: {},
  });
  assert.match(html, /data-compensation-card="potential"[\s\S]*?No disponible/);
  assert.match(html, /data-compensation-card="at-risk"[\s\S]*?No disponible/);
});
await test("explicit metric evidence preserves a known zero", () => {
  const item = snapshot({ potential: 0, atRisk: 0 });
  item.amountEvidence = { potential: "KNOWN_ZERO", atRisk: "KNOWN_ZERO" };
  const html = view.renderAdvisorCompensationProduct({
    state: "READY", periodKey: "2026-08", snapshot: item, history: history(), sourceHealth: {},
  });
  assert.match(html, /data-compensation-card="potential"[\s\S]*?\$0\.00/);
  assert.match(html, /data-compensation-card="at-risk"[\s\S]*?\$0\.00/);
});
await test("six history points rendered", () => {
  const html = view.renderHistory(history(), "MXN");
  assert.equal((html.match(/data-compensation-history-period=/g) || []).length, 6);
});
await test("history unknown paid does not break", () => {
  assert.match(view.renderHistory(history(), "MXN"), /2026-03/);
});
await test("empty history state", () => {
  assert.match(view.renderHistory({ points: [] }, "MXN"), /No hay meses/);
});
await test("detail aggregate rendered", () => {
  assert.match(view.renderEvidence(snapshot(), "MXN"), /data-compensation-aggregate="agg-1"/);
});
await test("detail evidence availability rendered in human language", () => {
  const html = view.renderEvidence(snapshot(), "MXN");
  assert.match(html, /Cálculo verificable/);
  assert.match(html, /Reglas verificables/);
});
await test("empty detail state", () => {
  assert.match(view.renderEvidence(snapshot({ aggregates: [] }), "MXN"), /No hay movimientos/);
});
await test("simulator separated", () => {
  const html = view.renderAdvisorCompensationProduct({
    state: "READY", periodKey: "2026-08", snapshot: snapshot(), history: history(),
    sourceHealth: {},
  });
  assert.match(html, /data-compensation-simulator-boundary="separate"/);
  assert.match(html, /Escenario, no ingreso confirmado/);
});
await test("safe bottom space", () => {
  assert.match(view.ADVISOR_COMPENSATION_070_STYLES, /safe-area-inset-bottom/);
});
await test("mobile breakpoint", () => {
  assert.match(view.ADVISOR_COMPENSATION_070_STYLES, /@media\(max-width:620px\)/);
});
await test("tablet breakpoint", () => {
  assert.match(view.ADVISOR_COMPENSATION_070_STYLES, /@media\(max-width:980px\)/);
});
await test("source health rendered", () => {
  const html = view.renderAdvisorCompensationProduct({
    state: "READY", periodKey: "2026-08", snapshot: snapshot(), history: history(),
    sourceHealth: { canonicalSnapshot: "READY", historicalSeries: "AVAILABLE" },
  });
  assert.match(html, /data-compensation-source="canonicalSnapshot"/);
});

await test("route removed DB import", () => assert.doesNotMatch(routeText, /from ['"].*indexeddb.*['"]/i));
await test("route removed DB.obtenerTodos", () => assert.doesNotMatch(routeText, /DB\.obtenerTodos/));
await test("route removed legacy rates", () => assert.doesNotMatch(routeText, /TASAS_VIDA|TASAS_GMM|TRAINING_METAS/));
await test("route removed UI calculation", () => assert.doesNotMatch(routeText, /calcularMotor|getTasaVida|getTasaGMM/));
await test("route uses canonical source", () => assert.match(routeText, /createAdvisorCompensationProductSource/));
await test("route uses authenticated advisor", () => assert.match(routeText, /AppState\.get\("user"\)/));
await test("route has abort controller", () => assert.match(routeText, /new AbortController\(\)/));
await test("route rejects late results", () => assert.match(routeText, /late-result-rejected/));
await test("route checks session identity after await", () => assert.match(routeText, /userReference\(\) !== sessionReference/));
await test("route scrubs app state", () => assert.match(routeText, /AppState\.set\("advisor-compensation:product", null\)/));
await test("route scrubs DOM", () => assert.match(routeText, /host\.replaceChildren\(\)/));
await test("route registers memory cleanup", () => assert.match(routeText, /Memory\.add/));
await test("route is read only", () => assert.match(routeText, /readOnly: true/));
await test("route reports no fallback", () => {
  assert.match(routeText, /indexedDbFallback: false/);
  assert.match(routeText, /carteraFallback: false/);
  assert.match(routeText, /uiCalculation: false/);
});
await test("route supports refresh", () => assert.match(routeText, /data-comp-refresh/));
await test("route supports previous and next month", () => assert.match(routeText, /data-comp-period-offset/));
await test("route blocks future navigation", () => assert.match(routeText, /next > currentMonth\(\)/));
await test("route requests six months", () => assert.match(routeText, /sixMonthPeriods/));
await test("route preserves existing exports", () => {
  assert.match(routeText, /export function renderComisiones/);
  assert.match(routeText, /export async function bindComisionesEvents/);
});
await test("route root remains fin-root", () => assert.match(routeText, /id="fin-root"/));

console.log(`MASTER_TEST_TOTAL=${total}`);
console.log(`MASTER_TEST_PASS=${passed}`);
console.log(`MASTER_TEST_FAIL=${total - passed}`);
console.log(`STAGE_070_COMPLETE=${total === passed ? "YES" : "NO"}`);
if (total !== passed) process.exit(1);
