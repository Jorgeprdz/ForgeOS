// src/services/forge-alpha-repository.js
// Supabase-backed repository for Forge Alpha Service v0.1

// Since supabase-runtime.js uses `export`, and this file uses `require`, 
// I need to make sure I am importing the correct thing.
const SupabaseRuntime = require('../../supabase-runtime').default;

class ForgeAlphaRepository {
  async saveEvent(prospectId, rawNote, canonicalEvents) {
    // For testing/mocking in this environment, I'll need to make sure Supabase is initialized.
    // Given the constraints, I will add a guard check or assume it is handled.
    try {
        const { data, error } = await SupabaseRuntime.from('alpha_events')
          .insert({
            prospect_id: prospectId,
            raw_note: rawNote,
            canonical_events: canonicalEvents,
            timestamp: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Supabase Error:", error);
        throw error;
    }
  }

  async saveOutput(eventId, output) {
    try {
        const { data, error } = await SupabaseRuntime.from('forge_outputs')
          .insert({
            event_id: eventId,
            owner: output.owner,
            ownership_confidence: output.ownership_confidence,
            waiting_state: output.waiting_state,
            advancement_state: output.advancement_state,
            recommendation: output.recommendation,
            evidence_used: output.evidence_used,
            timestamp: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Supabase Error:", error);
        throw error;
    }
  }
}

module.exports = new ForgeAlphaRepository();
