// src/services/forge-alpha-repository.js
// Supabase-backed repository for Forge Alpha Service v0.1

let SupabaseRuntime = require('../../supabase-runtime').default;

class ForgeAlphaRepository {
  setSupabaseRuntime(mock) {
    SupabaseRuntime = mock;
  }

  requireAdvisorId(advisorId) {
    if (!advisorId) {
      throw new Error('advisorId is required for Supabase Alpha persistence');
    }
  }

  async findProspectByAlias(alias, advisorId) {
    this.requireAdvisorId(advisorId);

    const { data, error } = await SupabaseRuntime.from('prospects')
      .select('*')
      .eq('alias', alias)
      .eq('advisor_id', advisorId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async createProspect(alias, advisorId) {
    this.requireAdvisorId(advisorId);

    const { data, error } = await SupabaseRuntime.from('prospects')
      .insert({
        advisor_id: advisorId,
        alias,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async saveEvent(prospectId, rawNote, canonicalEvents, advisorId) {
    this.requireAdvisorId(advisorId);

    const { data, error } = await SupabaseRuntime.from('alpha_events')
      .insert({
        advisor_id: advisorId,
        prospect_id: prospectId,
        raw_note: rawNote,
        canonical_events: canonicalEvents
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async saveOutput(eventId, output, advisorId) {
    this.requireAdvisorId(advisorId);

    const { data, error } = await SupabaseRuntime.from('forge_outputs')
      .insert({
        advisor_id: advisorId,
        event_id: eventId,
        output: {
          owner: output.owner,
          ownership_confidence: output.ownership_confidence,
          waiting_state: output.waiting_state,
          advancement_state: output.advancement_state,
          recommendation: output.recommendation
        },
        evidence: {
          evidence_used: output.evidence_used || []
        }
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

module.exports = new ForgeAlphaRepository();
