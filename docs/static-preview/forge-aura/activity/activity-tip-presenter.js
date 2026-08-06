export function createActivityTipPresenter(catalog) {
  if (!catalog || typeof catalog !== "object") throw new TypeError("ACTIVITY_LOCALE_CATALOG_REQUIRED");
  const text = (key, values = {}) => {
    const template = catalog[key];
    if (typeof template !== "string") throw new Error(`ACTIVITY_LOCALE_KEY_MISSING:${key}`);
    return template.replace(/\{([A-Za-z0-9_]+)\}/g, (_, name) => String(values[name] ?? ""));
  };
  function present(tip) {
    const remaining = Number.isFinite(tip.targetValue) && Number.isFinite(tip.observedValue)
      ? Math.max(0, tip.targetValue - tip.observedValue)
      : null;
    const combination = tip.combinationCandidates?.[0] || null;
    return Object.freeze({
      type: tip.tipType,
      title: text(`tip.${tip.tipType}.title`),
      body: text(`tip.${tip.tipType}.body`, { remaining }),
      combination: combination ? text("tip.combination", combination) : null,
      period: tip.period,
      evidenceRefs: tip.evidenceRefs,
      uncertainty: tip.uncertainty,
      policySnapshotId: tip.policySnapshotId,
    });
  }
  return Object.freeze({ text, present, presentMany: (tips) => tips.map(present) });
}
