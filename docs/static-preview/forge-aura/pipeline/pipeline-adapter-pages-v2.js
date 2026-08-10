import { createPipelineAdapter as createBasePipelineAdapter } from './pipeline-adapter-pages-v1.js?v=forge-beta2-post-release-recovery-010i';

function freeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(freeze);
  return value;
}

function usablePhone(value) {
  const raw = String(value || '').trim();
  const digits = raw.replace(/\D/g, '');
  if (!raw.startsWith('+') || digits.length < 8 || digits.length > 15) return null;
  return `+${digits}`;
}

async function confirmedContactByProspect(client, prospectIds = []) {
  const ids = [...new Set((prospectIds || []).map(String).filter(Boolean))];
  if (!ids.length) return new Map();

  const linkResult = await client.from('commercial_source_identity_links')
    .select('source_record_reference,person_id,match_status,effective_to')
    .eq('source_identity_type', 'PROSPECT')
    .in('source_record_reference', ids)
    .is('effective_to', null);
  if (linkResult?.error) return new Map();

  const links = (linkResult?.data || []).filter(link =>
    ['LINK_CONFIRMED', 'CREATE_CONFIRMED', 'CORRECTED'].includes(String(link.match_status || '')),
  );
  const personIds = [...new Set(links.map(link => String(link.person_id || '')).filter(Boolean))];
  if (!personIds.length) return new Map();

  const peopleResult = await client.from('commercial_people')
    .select('id,person_reference,verified_phone,lifecycle_state,archived_at')
    .in('id', personIds)
    .eq('lifecycle_state', 'CONFIRMED')
    .is('archived_at', null);
  if (peopleResult?.error) return new Map();

  const people = new Map((peopleResult?.data || []).map(person => [String(person.id), person]));
  const contacts = new Map();
  for (const link of links) {
    const person = people.get(String(link.person_id || ''));
    const phone = usablePhone(person?.verified_phone);
    if (!phone) continue;
    contacts.set(String(link.source_record_reference), freeze({
      phone,
      personReference: person.person_reference || null,
      source: 'CONFIRMED_COMMERCIAL_PERSON',
    }));
  }
  return contacts;
}

async function hydrateCards(client, cards = []) {
  const contacts = await confirmedContactByProspect(client, cards.map(card => card.id));
  return freeze((cards || []).map(card => {
    const existing = usablePhone(card?.phone || card?.prospect?.phone || card?.prospect?.whatsapp);
    const fallback = existing ? null : contacts.get(String(card.id));
    if (!fallback) return card;
    return {
      ...card,
      phone: fallback.phone,
      contactSource: fallback.source,
      contactPersonReference: fallback.personReference,
      prospect: {
        ...card.prospect,
        confirmedCommercialPersonPhone: fallback.phone,
      },
    };
  }));
}

export async function createPipelineAdapter({ client } = {}) {
  if (!client) throw new Error('PRODUCTIVE_CLIENT_REQUIRED');
  const adapter = await createBasePipelineAdapter({ client });
  let hydratedCards = [];

  async function reload() {
    hydratedCards = await hydrateCards(client, await adapter.reload());
    return hydratedCards;
  }

  return Object.freeze({
    ...adapter,
    capabilities: Object.freeze({
      ...(adapter.capabilities || {}),
      contactAvailable: true,
      confirmedCommercialPersonContactFallback010i: true,
      autoIdentityMerge: false,
      autonomousCommercialExecution: false,
    }),
    reload,
    async create(input = {}) {
      const result = await adapter.create(input);
      await reload();
      return result;
    },
    async update(id, changes = {}) {
      const result = await adapter.update(id, changes);
      await reload();
      return result;
    },
    async archive(id, reason) {
      const result = await adapter.archive(id, reason);
      await reload();
      return result;
    },
    async changeStage(id, status) {
      const result = await adapter.changeStage(id, status);
      hydratedCards = await hydrateCards(client, adapter.getCards());
      return hydratedCards.find(card => card.id === id) || result;
    },
    whatsappUrl(record, text = '') {
      const phone = usablePhone(record?.phone || record?.prospect?.phone || record?.prospect?.whatsapp || record?.prospect?.confirmedCommercialPersonPhone);
      if (!phone) return null;
      return `https://wa.me/${phone.slice(1)}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
    },
    getCards: () => hydratedCards,
  });
}
