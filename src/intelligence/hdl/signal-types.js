/**
 * Forge Discovery Signal Taxonomy v1.0
 * 
 * These constants represent the authoritative categories for non-canonical
 * interpretive signals extracted by the Human Discovery Layer.
 */
const SIGNAL_TYPES = {
  PRODUCT_INTEREST: 'PRODUCT_INTEREST',     // Explicit or soft interest in a solution (e.g., "Le interesa un PPR")
  PRODUCT_COMPARISON: 'PRODUCT_COMPARISON', // Evaluation between alternatives (e.g., "PPR vs ORVI")
  NETWORK_SIGNAL: 'NETWORK_SIGNAL',         // Information about social reach (e.g., "Mamá conoce gente")
  RELATIONSHIP_SIGNAL: 'RELATIONSHIP_SIGNAL', // Connection status (e.g., "Trust established", "Skepticism")
  SENTIMENT_SIGNAL: 'SENTIMENT_SIGNAL',     // Emotional context (e.g., "Preocupado por el retiro")
  TIMING_SIGNAL: 'TIMING_SIGNAL',           // Soft temporal indicators (e.g., "Ahorita no", "Vuelve de vacaciones")
  OBJECTION_SIGNAL: 'OBJECTION_SIGNAL',     // Barriers or resistance (e.g., "No tengo dinero", "Está caro")
  UNCERTAINTY_SIGNAL: 'UNCERTAINTY_SIGNAL', // Lack of decision or clarity (e.g., "No sé si quiera", "Lo va a pensar")
  LIFE_EVENT_SIGNAL: 'LIFE_EVENT_SIGNAL'    // Significant life changes detected (e.g., "Cambio de trabajo")
};

/**
 * Validates if a signal type is a recognized Forge category.
 */
function isValidSignalType(type) {
  return Object.values(SIGNAL_TYPES).includes(type);
}

module.exports = {
  SIGNAL_TYPES,
  isValidSignalType
};
