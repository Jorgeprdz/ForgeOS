// src/intelligence/semantic-guardrails/semantic-candidate-guardrail.js
// Guardrail for Semantic Event Extraction v0.1

const FORBIDDEN_INFERENCES = [
    'emotion', 'personality', 'hidden_intent', 'psychological_state', 
    'manipulation_strategy', 'urgency_based_on_vulnerability', 
    'purchase_probability', 'conversion_likelihood', 
    'political_affiliation', 'religious_belief', 'unsupported_health_status'
];

function validateCandidate(candidate) {
    const reasons = [];

    // Basic Structure Validation
    if (!candidate.evidence_span || candidate.evidence_span.trim() === '') {
        reasons.push('Missing or empty evidence_span');
    }
    if (typeof candidate.confidence !== 'number' || candidate.confidence < 0 || candidate.confidence > 1) {
        reasons.push('Confidence must be a number between 0.0 and 1.0');
    }
    if (!candidate.source) reasons.push('Missing source');
    if (!candidate.generated_at) reasons.push('Missing generated_at');
    if (!candidate.review_status) reasons.push('Missing review_status');

    // Forbidden Inference Validation
    FORBIDDEN_INFERENCES.forEach(inference => {
        if (candidate[inference]) {
            reasons.push(`Forbidden inference: ${inference}`);
        }
    });

    return {
        valid: reasons.length === 0,
        reasons,
        sanitizedCandidate: reasons.length === 0 ? candidate : null
    };
}

module.exports = { validateCandidate };
