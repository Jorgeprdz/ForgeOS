import { createPipelineAdapter as createPreviousAdapter } from './pipeline-adapter-pages-v2.js?v=forge-beta2-post-release-recovery-010i';

function freeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(freeze);
  return value;
}

function usablePhone(value) {
  const raw = String(value || '').trim();
  const digits = raw.replace(/\D/g, '');
  if (!digits || digits.length < 8 || digits.length > 15) return null;
  if (raw.startsWith('+')) return `+${digits}`;
  if (digits.length === 10) return `+52${digits}`;
  return null;
}

function hydrateCard(card = {}) {
  const prospect = card.prospect || {};
  const phone = usablePhone(
    card.phone
    || prospect.phoneNormalized
    || prospect.whatsappNormalized
    || prospect.phone
    || prospect.whatsapp
    || prospect.confirmedCommercialPersonPhone,
  );
  if (!phone) return card;
  return freeze({
    ...card,
    phone,
    prospect: {
      ...prospect,
      contactPhone: phone,
    },
  });
}

function hydrateCards(cards = []) {
  return freeze((cards || []).map(hydrateCard));
}

export async function createPipelineAdapter({ client } = {}) {
  if (!client) throw new Error('PRODUCTIVE_CLIENT_REQUIRED');
  const adapter = await createPreviousAdapter({ client });
  let cards = [];

  async function reload() {
    cards = hydrateCards(await adapter.reload());
    return cards;
  }

  async function refreshFromAdapter() {
    cards = hydrateCards(adapter.getCards?.() || []);
    return cards;
  }

  return Object.freeze({
    ...adapter,
    capabilities: Object.freeze({
      ...(adapter.capabilities || {}),
      normalizedProspectContactContract010j: true,
      autoIdentityMerge: false,
      autonomousCommercialExecution: false,
    }),
    reload,
    async create(input = {}) {
      const result = await adapter.create(input);
      await refreshFromAdapter();
      return result;
    },
    async update(id, changes = {}) {
      const result = await adapter.update(id, changes);
      await refreshFromAdapter();
      return result;
    },
    async archive(id, reason) {
      const result = await adapter.archive(id, reason);
      await refreshFromAdapter();
      return result;
    },
    async changeStage(id, status) {
      const result = await adapter.changeStage(id, status);
      await refreshFromAdapter();
      return cards.find(card => card.id === id) || result;
    },
    whatsappUrl(record, text = '') {
      const phone = usablePhone(
        record?.phone
        || record?.prospect?.phoneNormalized
        || record?.prospect?.whatsappNormalized
        || record?.prospect?.contactPhone
        || record?.prospect?.confirmedCommercialPersonPhone,
      );
      if (!phone) return null;
      return `https://wa.me/${phone.slice(1)}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
    },
    getCards: () => cards,
  });
}
