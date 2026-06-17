// src/services/forge-alpha-repository.js
// Supabase-backed repository for Forge Alpha Service v0.1

let SupabaseRuntime = require('../../supabase-runtime').default;

class ForgeAlphaRepository {
  setSupabaseRuntime(mock) {
    SupabaseRuntime = mock;
  }

  async findProspectByAlias(alias) {
    const { data, error } = await SupabaseRuntime.from('prospects')
      .select('*')
      .eq('alias', alias)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async createProspect(alias) {
    const { data, error } = await SupabaseRuntime.from('prospects')
      .insert({ alias, created_at: new Date().toISOString() })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async saveEvent(prospectId, rawNote, canonicalEvents) {
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
  }

  async saveOutput(eventId, output) {
    const { data, error } = await SupabaseRuntime.from('forge_outputs')
      .insert({
        event_id: eventId,
        owner: output.owner,
        ownership_confidence: output.ownership_confidence,
        waiting_state: output.waiting_state,
        advancement_state: output.advancement_state,
        recommendation: output.recommendation,
        evidence_used: output.evidence_used
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

module.exports = new ForgeAlphaRepository();
