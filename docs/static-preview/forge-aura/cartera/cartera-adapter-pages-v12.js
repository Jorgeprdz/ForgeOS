import { createCarteraAdapter as createPreviousAdapter } from './cartera-adapter-pages-v11.js?v=forge-beta2-post-release-recovery-010i';

const CONFIRMED_LINK_STATES = new Set(['LINK_CONFIRMED', 'CREATE_CONFIRMED', 'CORRECTED']);

function freeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(freeze);
  return value;
}

function phoneAvailable(prospect = {}) {
  return Boolean(String(prospect.phone_normalized || prospect.whatsapp_normalized || '').trim());
}

async function readConfirmedPipelineLinks(client) {
  const linkResult = await client.from('commercial_source_identity_links')
    .select('person_id,source_record_reference,prospect_id,match_status,effective_to')
    .eq('source_identity_type', 'PROSPECT')
    .is('effective_to', null);
  if (linkResult?.error) return new Map();

  const links = (linkResult?.data || []).filter(link => CONFIRMED_LINK_STATES.has(String(link.match_status || '')));
  if (!links.length) return new Map();

  const personIds = [...new Set(links.map(link => String(link.person_id || '')).filter(Boolean))];
  const prospectIds = [...new Set(links.map(link => String(link.prospect_id || link.source_record_reference || '')).filter(Boolean))];

  const [peopleResult, prospectsResult] = await Promise.all([
    client.from('commercial_people')
      .select('id,person_reference,display_name,preferred_name,lifecycle_state,archived_at')
      .in('id', personIds)
      .eq('lifecycle_state', 'CONFIRMED')
      .is('archived_at', null),
    client.from('prospects')
      .select('id,full_name,display_name,alias,status,phone_normalized,whatsapp_normalized,archived_at')
      .in('id', prospectIds)
      .is('archived_at', null),
  ]);
  if (peopleResult?.error || prospectsResult?.error) return new Map();

  const people = new Map((peopleResult?.data || []).map(person => [String(person.id), person]));
  const prospects = new Map((prospectsResult?.data || []).map(prospect => [String(prospect.id), prospect]));
  const byPersonReference = new Map();

  for (const link of links) {
    const person = people.get(String(link.person_id || ''));
    const prospectId = String(link.prospect_id || link.source_record_reference || '');
    const prospect = prospects.get(prospectId);
    if (!person?.person_reference || !prospect) continue;
    const item = freeze({
      prospectReference: prospect.id,
      displayName: prospect.full_name || prospect.display_name || prospect.alias || person.display_name || 'Prospecto vinculado',
      status: prospect.status || null,
      matchStatus: String(link.match_status || ''),
      contactAvailable: phoneAvailable(prospect),
      source: 'PIPELINE_CONFIRMED_IDENTITY_LINK',
    });
    const current = byPersonReference.get(person.person_reference) || [];
    byPersonReference.set(person.person_reference, [...current, item]);
  }
  return byPersonReference;
}

function isIncompletePolicy(policy = {}) {
  return String(policy.completeness_state || policy.completenessState || 'UNKNOWN').toUpperCase() !== 'COMPLETE'
    || String(policy.freshness_state || policy.freshnessState || 'UNKNOWN').toUpperCase() !== 'CURRENT'
    || String(policy.conflict_state || policy.conflictState || 'UNKNOWN').toUpperCase() !== 'CLEAR';
}

export function suppressDuplicatePolicyRadar010j(home = {}) {
  const policies = home.policies || [];
  const directPolicyAttention = new Set(policies.filter(isIncompletePolicy).map(policy => String(policy.policy_reference || policy.policyReference || '')).filter(Boolean));
  const radar = home.radar;
  if (!radar || !Array.isArray(radar.items) || !directPolicyAttention.size) return home;
  const items = radar.items.filter(item => !(
    String(item?.signalType || '').toUpperCase() === 'INCOMPLETE_POLICY_DATA'
    && directPolicyAttention.has(String(item?.policyReference || ''))
  ));
  return { ...home, radar: { ...radar, items } };
}

export async function createCarteraAdapter({ client, windowRef = window } = {}) {
  if (!client) throw new Error('CARTERA_PRODUCTIVE_CLIENT_REQUIRED');
  const adapter = await createPreviousAdapter({ client, windowRef });

  return Object.freeze({
    ...adapter,
    capabilities: Object.freeze({
      ...(adapter.capabilities || {}),
      realProductionContractRecovery010j: true,
      pipelineIdentityContinuityProjection010j: true,
      duplicatePolicyRadarSuppression010j: true,
      autoIdentityMerge: false,
      autonomousCommercialExecution: false,
    }),
    async loadHome() {
      return freeze(suppressDuplicatePolicyRadar010j(await adapter.loadHome()));
    },
    async loadDirectory() {
      const [directory, links] = await Promise.all([
        adapter.loadDirectory(),
        readConfirmedPipelineLinks(client),
      ]);
      return freeze((directory || []).map(item => {
        if (item.type !== 'PERSON') return item;
        const linkedProspects = links.get(String(item.reference || '')) || [];
        if (!linkedProspects.length) return item;
        return {
          ...item,
          secondary: linkedProspects.length === 1 ? 'Persona · Pipeline vinculado' : `Persona · ${linkedProspects.length} registros de Pipeline vinculados`,
          pipelineLinked: true,
          pipelineProspectCount: linkedProspects.length,
          pipelineProspectReferences: linkedProspects.map(link => link.prospectReference),
        };
      }));
    },
    async loadPersonWorkspace(reference) {
      const [workspace, links] = await Promise.all([
        adapter.loadPersonWorkspace(reference),
        readConfirmedPipelineLinks(client),
      ]);
      const linkedProspects = links.get(String(reference || '')) || [];
      return freeze({
        ...workspace,
        linkedProspects,
        identityContinuity: linkedProspects.length
          ? 'PIPELINE_LINK_CONFIRMED'
          : 'NO_CONFIRMED_PIPELINE_LINK',
      });
    },
  });
}
