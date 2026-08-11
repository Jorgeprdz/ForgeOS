import { deriveCard, stageLabel } from "./pipeline-core.js";
import { createPipelineDomainIntelligenceConsumer } from "../../../../advisor-os/sales-pipeline/pipeline-domain-intelligence-consumer.js";

const rootUrl = new URL("../../../../", import.meta.url);
const authority = path => new URL(path, rootUrl);

let loadedPromise;

async function loadScript(path) {
  const url = authority(path);
  if (path.endsWith(".js")) await import(url.href);
}

async function loadAuthorities() {
  if (loadedPromise) return loadedPromise;
  loadedPromise = (async () => {
    await loadScript("advisor-os/sales-pipeline/productive-prospect-service.js");
    await loadScript("advisor-os/sales-pipeline/prospect-timeline/prospect-timeline-contract.js");
    await loadScript("advisor-os/sales-pipeline/prospect-timeline/prospect-timeline-service.js");

    let intelligenceUnavailableReason = null;
    try {
      await loadScript("platform/shared-commercial-model/crs-02-domain-link-envelope-contract.js");
      await loadScript("platform/shared-commercial-model/crs-02-authoritative-domain-link-adapters.js");
      await loadScript("platform/shared-commercial-model/crs-03-pipeline-person-convergence-contract.js");
      await loadScript("advisor-os/sales-pipeline/crs-03-pipeline-person-convergence-service.js");
    } catch (error) {
      intelligenceUnavailableReason = error?.code || error?.message || "PIPELINE_INTELLIGENCE_DEPENDENCY_UNAVAILABLE";
    }

    return Object.freeze({ intelligenceUnavailableReason });
  })();
  return loadedPromise;
}

function confirmedRpcRow(data) {
  const row = Array.isArray(data) ? data[0] : data;
  return row
    ? Object.freeze({
        ...row,
        id: row.id,
        status: row.status,
        fullName: row.full_name ?? row.fullName,
        updatedAt: row.updated_at ?? row.updatedAt,
      })
    : null;
}

export async function requestConfirmedStage({ client, prospectId, status }) {
  const allowed = new Set([
    "referred_new",
    "contacted",
    "appointment_scheduled",
    "proposal",
    "decision",
    "client",
  ]);
  if (!prospectId || !allowed.has(status)) {
    throw Object.assign(new Error("PIPELINE_STAGE_NOT_ALLOWED"), {
      code: "PIPELINE_STAGE_NOT_ALLOWED",
    });
  }

  const { data, error } = await client.rpc(
    "forge_pipeline_update_prospect_stage",
    { p_prospect_id: prospectId, p_status: status },
  );
  if (error) throw error;

  const prospect = confirmedRpcRow(data);
  if (prospect?.id !== prospectId || prospect?.status !== status) {
    throw Object.assign(new Error("PIPELINE_STAGE_RPC_CONFIRMATION_MISMATCH"), {
      code: "PIPELINE_STAGE_RPC_CONFIRMATION_MISMATCH",
    });
  }
  return prospect;
}

export async function createPipelineAdapter({ client } = {}) {
  if (!client) throw new Error("PRODUCTIVE_CLIENT_REQUIRED");
  const authorityState = await loadAuthorities();

  const prospectAuthority = globalThis.ForgeProductiveProspectService067G17B;
  const timelineAuthority = globalThis.ForgeProspectTimelineServiceNFAST08;
  if (!prospectAuthority?.create || !timelineAuthority?.create) {
    throw new Error("PRODUCTIVE_PIPELINE_AUTHORITY_UNAVAILABLE");
  }

  const service = prospectAuthority.create(client);
  const timelineService = timelineAuthority.create(client);
  let intelligenceConsumer = null;
  let intelligenceUnavailableReason = authorityState.intelligenceUnavailableReason;
  if (!intelligenceUnavailableReason) {
    try {
      intelligenceConsumer = createPipelineDomainIntelligenceConsumer({
        client,
        convergenceServiceModule: globalThis.ForgeCrs03PipelinePersonConvergenceService,
      });
    } catch (error) {
      intelligenceUnavailableReason = error?.code || error?.message || "PIPELINE_INTELLIGENCE_CONSUMER_UNAVAILABLE";
    }
  }

  const capabilities = Object.freeze({
    createProspect: typeof service.createProspect === "function",
    importProspects: false,
    nashAvailable: false,
    nbaAvailable: false,
    contactAvailable: false,
    personConvergenceAvailable: Boolean(intelligenceConsumer),
    intelligenceAvailable: Boolean(intelligenceConsumer),
  });

  let records = [];
  let cards = [];

  async function reload() {
    records = await service.listProspects();
    cards = await Promise.all(records.map(async prospect => {
      let timeline = [];
      let timelineState = "CONNECTED";
      try {
        timeline = await timelineService.listProspectTimeline(prospect.id);
      } catch {
        timelineState = "UNAVAILABLE";
      }
      return Object.freeze({
        ...deriveCard(prospect, timeline),
        timelineState,
      });
    }));
    return cards;
  }

  async function create(input) {
    if (!capabilities.createProspect) {
      const error = new Error("CREATE_PROSPECT_AUTHORITY_UNAVAILABLE");
      error.code = "CREATE_PROSPECT_AUTHORITY_UNAVAILABLE";
      throw error;
    }
    const created = await service.createProspect(input);
    const confirmed = await service.getProspect(created.id);
    if (!confirmed?.id || confirmed.id !== created.id) {
      throw Object.assign(new Error("CREATE_READ_AFTER_WRITE_MISMATCH"), {
        code: "CREATE_READ_AFTER_WRITE_MISMATCH",
      });
    }
    await reload();
    return confirmed;
  }

  async function changeStage(id, status) {
    const confirmed = await requestConfirmedStage({
      client,
      prospectId: id,
      status,
    });
    const found = await service.getProspect(id);
    if (found?.status !== confirmed.status) {
      throw Object.assign(new Error("STAGE_READ_AFTER_WRITE_MISMATCH"), {
        code: "STAGE_READ_AFTER_WRITE_MISMATCH",
      });
    }

    const index = records.findIndex(record => record.id === id);
    if (index >= 0) records[index] = found;
    cards = cards.map(card => card.id === id
      ? Object.freeze({
          ...card,
          status: found.status,
          stageLabel: stageLabel(found.status),
          prospect: found,
        })
      : card);
    return cards.find(card => card.id === id);
  }

  async function update(id, changes) {
    const updated = await service.updateProspect(id, changes);
    const confirmed = await service.getProspect(id);
    if (updated?.id !== id || confirmed?.id !== id) {
      throw Object.assign(new Error("EDIT_READ_AFTER_WRITE_MISMATCH"), {
        code: "EDIT_READ_AFTER_WRITE_MISMATCH",
      });
    }
    await reload();
    return confirmed;
  }

  async function archive(id, reason) {
    const archived = await service.archiveProspect(id, reason);
    const visible = await service.listProspects();
    if (!archived?.archivedAt || visible.some(item => item.id === id)) {
      throw Object.assign(new Error("ARCHIVE_READ_AFTER_WRITE_MISMATCH"), {
        code: "ARCHIVE_READ_AFTER_WRITE_MISMATCH",
      });
    }
    await reload();
    return archived;
  }

  async function timeline(id) {
    return timelineService.listProspectTimeline(id);
  }

  async function intelligence(id, options = {}) {
    if (!intelligenceConsumer) {
      return Object.freeze({
        state: "unavailable",
        prospectReference: id || null,
        personReference: null,
        projections: Object.freeze([]),
        degradedReasons: Object.freeze([
          intelligenceUnavailableReason || "PIPELINE_INTELLIGENCE_CONSUMER_UNAVAILABLE",
        ]),
        boundaries: Object.freeze({
          readOnly: true,
          automaticExecutionAllowed: false,
          identityMutationAllowed: false,
          persistenceAllowed: false,
        }),
      });
    }
    return intelligenceConsumer.getProspectDecisionContext(id, options);
  }

  function whatsappUrl(record, text = "") {
    const phone = String(
      record.phone || record.prospect?.whatsapp || "",
    ).replace(/[^\d]/g, "");
    if (!phone) return null;
    return `https://wa.me/${phone}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
  }

  return Object.freeze({
    service,
    timelineService,
    intelligenceConsumer,
    capabilities,
    reload,
    create,
    changeStage,
    update,
    archive,
    timeline,
    intelligence,
    whatsappUrl,
    getCards: () => cards,
  });
}