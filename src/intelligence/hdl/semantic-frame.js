/**
 * Forge Semantic Frame v1.0
 * 
 * An interpretive artifact produced by HDL that preserves meaning before truth adjudication.
 * This class serves as the canonical contract for all semantic understanding in Forge.
 * 
 * SCHEMA:
 * {
 *   "frame_type": "hdl_semantic_frame",
 *   "version": "1.0",
 *   "provenance": {
 *     "note_id": string | null,
 *     "note_text_snippet": string,
 *     "extractor_id": string,
 *     "timestamp": ISO8601
 *   },
 *   "semantic_confidence": number (0.0 - 1.0),
 *   "interpretations": [
 *     {
 *       "scope": "commitment" | "temporal" | "intent" | "greeting" | "relationship" | "unknown",
 *       "intent_normalized": string,
 *       "action": string | null,
 *       "temporal_reference": string | null,
 *       "confidence": {
 *         "semantic_score": number (0.0 - 1.0),
 *         "claim_score": number (0.0 - 1.0),
 *         "reasoning": string
 *       },
 *       "attributes": Object,
 *       "uncertainty_flags": string[],
 *       "claimable": boolean
 *     }
 *   ],
 *   "discovery_signals": [
 *     {
 *       "signal_type": string,
 *       "value": string,
 *       "confidence": number (0.0 - 1.0)
 *     }
 *   ],
 *   "generated_at": ISO8601
 * }
 */
class SemanticFrame {
  constructor(note, options = {}) {
    this.frame_type = 'hdl_semantic_frame';
    this.version = '1.0';
    this.generated_at = new Date().toISOString();
    
    this.provenance = {
      note_id: options.note_id || null,
      note_text_snippet: note,
      extractor_id: options.extractor_id || 'hdl_default_normalizer',
      timestamp: this.generated_at
    };

    this.semantic_confidence = 0.0;
    this.interpretations = [];
    this.discovery_signals = [];
  }

  /**
   * Adds a normalized interpretation to the frame.
   * 
   * @param {Object} data 
   * @param {string} data.scope
   * @param {string} data.intent_normalized
   * @param {string|null} [data.action=null]
   * @param {string|null} [data.temporal_reference=null]
   * @param {number} [data.semantic_score=0.0]
   * @param {number} [data.claim_score=0.0]
   * @param {string} [data.reasoning='']
   * @param {Object} [data.attributes={}]
   * @param {string[]} [data.uncertainty_flags=[]]
   * @param {boolean} [data.claimable=false]
   */
  addInterpretation(data) {
    this.interpretations.push({
      scope: data.scope || 'unknown',
      intent_normalized: data.intent_normalized || 'unknown',
      action: data.action || null,
      temporal_reference: data.temporal_reference || null,
      confidence: {
        semantic_score: data.semantic_score || 0.0,
        claim_score: data.claim_score || 0.0,
        reasoning: data.reasoning || ''
      },
      attributes: data.attributes || {},
      uncertainty_flags: data.uncertainty_flags || [],
      claimable: !!data.claimable
    });
    
    // Update root confidence based on best interpretation
    this._updateRootConfidence();
  }

  /**
   * Adds a discovery signal to the frame.
   */
  addDiscoverySignal(type, value, confidence = 0.5) {
    this.discovery_signals.push({
      signal_type: type,
      value: value,
      confidence: confidence
    });
  }

  _updateRootConfidence() {
    if (this.interpretations.length === 0) {
      this.semantic_confidence = 0.0;
      return;
    }
    this.semantic_confidence = Math.max(...this.interpretations.map(i => i.confidence.semantic_score));
  }

  toJSON() {
    return {
      frame_type: this.frame_type,
      version: this.version,
      provenance: this.provenance,
      semantic_confidence: this.semantic_confidence,
      interpretations: this.interpretations,
      discovery_signals: this.discovery_signals,
      generated_at: this.generated_at
    };
  }
}

module.exports = SemanticFrame;
