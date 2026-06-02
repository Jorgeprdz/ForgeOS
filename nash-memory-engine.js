const fs = require("fs");
const path = require("path");

const MEMORY_DIR = path.join(__dirname, "nash-memory");

function ensureMemoryDir() {
  if (!fs.existsSync(MEMORY_DIR)) {
    fs.mkdirSync(MEMORY_DIR, { recursive: true });
  }
}

function normalizeId(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9áéíóúñ]+/gi, "_")
    .replace(/^_+|_+$/g, "") || "unknown_prospect";
}

function getMemoryPath(prospectId) {
  ensureMemoryDir();
  return path.join(MEMORY_DIR, `${normalizeId(prospectId)}.json`);
}

function createEmptyMemory(prospectId) {
  return {
    prospectId,
    personality: "UNKNOWN",
    knownMotivators: [],
    conversationHistory: [],
    objectionHistory: [],
    actionHistory: [],
    lastContactDate: null,
    lastAction: null,
    lastOutcome: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function loadMemory(prospectId) {
  const file = getMemoryPath(prospectId);

  if (!fs.existsSync(file)) {
    return createEmptyMemory(prospectId);
  }

  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function saveMemory(memory) {
  const file = getMemoryPath(memory.prospectId);
  const updated = {
    ...memory,
    updatedAt: new Date().toISOString()
  };

  fs.writeFileSync(file, JSON.stringify(updated, null, 2));
  return updated;
}

function appendConversation({ prospectId, message, direction = "OUTBOUND", channel = "whatsapp", date = new Date().toISOString() }) {
  const memory = loadMemory(prospectId);

  memory.conversationHistory.push({
    date,
    channel,
    direction,
    message
  });

  memory.lastContactDate = date;
  memory.lastAction = direction === "OUTBOUND" ? "MESSAGE_SENT" : "MESSAGE_RECEIVED";

  return saveMemory(memory);
}

function appendObjection({ prospectId, objection, type = "UNKNOWN", intent = "UNKNOWN", date = new Date().toISOString() }) {
  const memory = loadMemory(prospectId);

  memory.objectionHistory.push({
    date,
    objection,
    type,
    intent
  });

  memory.lastContactDate = date;
  memory.lastAction = "OBJECTION_RECORDED";

  return saveMemory(memory);
}

function updateOutcome({ prospectId, outcome, action = "UNKNOWN", date = new Date().toISOString() }) {
  const memory = loadMemory(prospectId);

  memory.actionHistory.push({
    date,
    action,
    outcome
  });

  memory.lastContactDate = date;
  memory.lastAction = action;
  memory.lastOutcome = outcome;

  return saveMemory(memory);
}

function updateProfileMemory({ prospectId, personality, motivators = [] }) {
  const memory = loadMemory(prospectId);

  if (personality) memory.personality = personality;

  const existing = new Set(memory.knownMotivators || []);
  motivators.forEach(m => existing.add(m));

  memory.knownMotivators = Array.from(existing);

  return saveMemory(memory);
}

function detectMemoryPatterns(memory) {
  const objectionTypes = memory.objectionHistory.map(o => o.type);
  const counts = objectionTypes.reduce((acc, type) => {
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const dominantObjection = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];

  return {
    totalConversations: memory.conversationHistory.length,
    totalObjections: memory.objectionHistory.length,
    dominantObjectionType: dominantObjection ? dominantObjection[0] : null,
    dominantObjectionCount: dominantObjection ? dominantObjection[1] : 0,
    hasRepeatedObjection: dominantObjection ? dominantObjection[1] >= 2 : false,
    lastOutcome: memory.lastOutcome
  };
}

module.exports = {
  loadMemory,
  saveMemory,
  appendConversation,
  appendObjection,
  updateOutcome,
  updateProfileMemory,
  detectMemoryPatterns
};
