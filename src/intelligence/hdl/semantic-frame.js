/**
 * Forge Semantic Frame Definition
 * 
 * An interpretive artifact produced by HDL that preserves meaning before truth adjudication.
 */
class SemanticFrame {
  constructor(note, generatedAt = new Date().toISOString()) {
    this.frame_type = 'hdl_semantic_frame';
    this.source = 'hdl_semantic_normalizer';
    this.original_text = note;
    this.semantic_confidence = 0.0;
    this.interpretations = [];
    this.discovery_signals = [];
    this.generated_at = generatedAt;
    this.provenance = {
      timestamp: generatedAt
    };
  }

  addInterpretation(interpretation) {
    this.interpretations.push(interpretation);
  }

  addDiscoverySignal(signal) {
    this.discovery_signals.push(signal);
  }

  toJSON() {
    return {
      frame_type: this.frame_type,
      source: this.source,
      original_text: this.original_text,
      semantic_confidence: this.semantic_confidence,
      interpretations: this.interpretations,
      discovery_signals: this.discovery_signals,
      generated_at: this.generated_at,
      provenance: this.provenance
    };
  }
}

module.exports = SemanticFrame;
