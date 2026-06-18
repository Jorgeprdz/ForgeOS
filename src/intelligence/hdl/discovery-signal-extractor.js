const { SIGNAL_TYPES, isValidSignalType } = require('./signal-types');

/**
 * HDL Discovery Signal Extractor
 * 
 * This service derives consultative context (Discovery Signals) from 
 * Semantic Frames.
 */

/**
 * Creates a structured Discovery Signal.
 * 
 * @param {string} type - One of SIGNAL_TYPES
 * @param {string} value - The specific observation (e.g., "PPR_INTEREST")
 * @param {number} [confidence=0.5] - Signal intensity (0.0 - 1.0)
 * @returns {Object}
 */
function createDiscoverySignal(type, value, confidence = 0.5) {
  if (!isValidSignalType(type)) {
    throw new Error(`Invalid Discovery Signal Type: ${type}`);
  }

  return {
    signal_type: type,
    value: value,
    confidence: Math.max(0, Math.min(1, confidence)),
    extracted_at: new Date().toISOString()
  };
}

/**
 * Extracts signals from a semantic frame based on its interpretations.
 * 
 * @param {Object} frame - The Semantic Frame
 */
function extractDiscoverySignals(frame) {
  const signals = [];
  
  // Design Note: In v1.0, this is a placeholder for extraction logic.
  // It identifies interpretations that are valuable for discovery 
  // but were rejected as Claims (claimable: false).
  
  return signals;
}

module.exports = {
  createDiscoverySignal,
  extractDiscoverySignals
};
