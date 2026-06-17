// src/intelligence/alpha-runtime/event-extraction-engine.js
class EventExtractionEngine {
  extract(rawText) {
    const events = [];
    const text = rawText.toLowerCase();

    const conversationPatterns = ["hablé", "revisa", "look at it", "call you", "dijo"];
    const commitmentPatterns = [
        "me llama", "me avisa", "me confirma", "lo revisa", "lo revisan", 
        "me busca", "me contacta", "me escribe", "me manda documentos", 
        "me comparte información", "quedó de mandarme", "voy a enviar"
    ];
    const temporalMarkers = [
        "el viernes", "mañana", "la próxima semana", "el lunes", 
        "en unos días", "después de vacaciones"
    ];

    if (conversationPatterns.some(p => text.includes(p))) {
        events.push({ type: 'conversation_occurred', data: { raw: rawText } });
    }
    
    // Check for prospect commitments
    const prospectCommitmentFound = commitmentPatterns.some(p => text.includes(p));
    if (prospectCommitmentFound) {
        const temporal = temporalMarkers.find(t => text.includes(t)) || 'unknown';
        const owner = text.includes("yo le voy a enviar") ? 'advisor' : 'prospect';
        
        events.push({ 
            type: 'commitment_established', 
            data: { 
                owner: owner,
                due: temporal,
                description: rawText 
            } 
        });
    }

    return events;
  }
}
module.exports = EventExtractionEngine;
