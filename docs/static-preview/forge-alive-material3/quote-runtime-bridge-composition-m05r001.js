const VERSION = "M05R-001";

const state = {
  composedBridge: null,
  underlyingBridge: null,
  timer: null,
  compositionCount: 0,
};

function isBridge(value) {
  return Boolean(value) && typeof value === "object";
}

function alreadyComposed(bridge) {
  return Boolean(
    bridge?.__m05e003Wrapped === true &&
    bridge?.__m05e009VidaMujerHandoff === true
  );
}

function composeBridge() {
  const current = globalThis.ForgeAcceptedQuoteBridge;
  if (!isBridge(current)) return false;
  if (alreadyComposed(current)) {
    state.composedBridge = current;
    return true;
  }

  const facade = Object.freeze({
    ...current,
    __m05e003Wrapped: true,
    __m05e009VidaMujerHandoff: true,
    __m05r001BridgeComposition: true,
    __m05r001UnderlyingBridge: current,
  });

  globalThis.ForgeAcceptedQuoteBridge = facade;
  state.composedBridge = facade;
  state.underlyingBridge = current;
  state.compositionCount += 1;
  document.documentElement.dataset.quoteBridgeComposition = VERSION;
  globalThis.dispatchEvent?.(new CustomEvent("forge:quote-bridge-composed", {
    detail: Object.freeze({
      version: VERSION,
      compositionCount: state.compositionCount,
    }),
  }));
  return true;
}

function scheduleComposition() {
  if (state.timer !== null) return;
  state.timer = globalThis.setTimeout(() => {
    state.timer = null;
    composeBridge();
  }, 0);
}

for (const eventName of [
  "forge:accepted-quote-bridge-ready",
  "forge:quote-human-review-bridge-ready",
  "forge:vida-mujer-handoff-ready",
  "forge:quote-candidate-ready",
]) {
  globalThis.addEventListener?.(eventName, scheduleComposition);
}

composeBridge();

globalThis.ForgeQuoteBridgeCompositionM05R001 = Object.freeze({
  version: VERSION,
  compose: composeBridge,
  getState() {
    return Object.freeze({
      compositionCount: state.compositionCount,
      composed: alreadyComposed(globalThis.ForgeAcceptedQuoteBridge),
      sameBridge: globalThis.ForgeAcceptedQuoteBridge === state.composedBridge,
    });
  },
});

export {
  VERSION,
  alreadyComposed,
  composeBridge,
};
