function buildProspectContext(input = {}) {
  const prospect = input.prospect || {};

  const normalized = {
    name: prospect.name || "Prospecto",
    age: prospect.age || null,
    occupation: prospect.occupation || "UNKNOWN",
    maritalStatus: prospect.maritalStatus || "UNKNOWN",
    children: prospect.children || 0,
    source: input.source || "manual",
    notes: input.notes || [],
    channel: input.channel || "whatsapp"
  };

  const lifeSignals = [];

  if (normalized.children > 0) {
    lifeSignals.push("HAS_CHILDREN");
  }

  if (/arquitect|doctor|abogad|empres|director|gerent|consultor/i.test(normalized.occupation)) {
    lifeSignals.push("PROFESSIONAL_PROFILE");
  }

  if (normalized.age >= 30 && normalized.age <= 45) {
    lifeSignals.push("PROTECTION_AND_GROWTH_STAGE");
  }

  return {
    ...normalized,
    lifeSignals
  };
}

module.exports = {
  buildProspectContext
};
