import { deriveCard, stageLabel } from "./pipeline-core.js";

const ALLOWED_STAGES = new Set([
  "referred_new",
  "contacted",
  "appointment_scheduled",
  "proposal",
  "decision",
  "client",
]);

const FIELD_MAP = Object.freeze({
  fullName: "full_name",
  phone: "phone_normalized",
  whatsapp: "whatsapp_normalized",
  email: "email_normalized",
  source: "source",
  referrerName: "referrer_name",
  referrerRelationship: "referrer_relationship",
  initialContext: "initial_context",
  status: "status",
  nextActionType: "next_action_type",
  nextActionAt: "next_action_at",
});

function contextualError(context, error) {
  const detail = String(error?.message || error?.code || "UNKNOWN_SUPABASE_ERROR");
  const wrapped = new Error(`${context}: ${detail}`);
  wrapped.name = error?.name || "PipelineDataError";
  wrapped.code = error?.code || context;
  wrapped.details = error?.details || null;
  wrapped.hint = error?.hint || null;
  return wrapped;
}

function camelize(key) {
  return key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function rowToProspect(row = {}) {
  return Object.freeze(Object.fromEntries(
    Object.entries(row).map(([key, value]) => [camelize(key), value]),
  ));
}

function rowToTimelineEvent(row = {}) {
  return Object.freeze({
    id: row.id,
    prospectId: row.prospect_id,
    eventType: row.event_type,
    eventSource: row.event_source,
    sourceRecordReference: row.source_record_reference,
    occurredAt: row.occurred_at,
    recordedAt: row.recorded_at,
    payload: row.payload || {},
    evidenceReferences: row.evidence_references || [],
    contractVersion: row.contract_version,
    privacyClassification: row.privacy_classification,
    retentionPolicy: row.retention_policy,
  });
}

function normalizePhone(value) {
  const raw = String(value || "").trim();
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  if (raw.startsWith("+") && digits.length >= 8 && digits.length <= 15) {
    return `+${digits}`;
  }
  if (digits.length === 10) return `+52${digits}`;
  const invalid = new Error("El número telefónico no es válido.");
  invalid.code = "VALIDATION_ERROR";
  throw invalid;
}

async function requireUser(client) {
  const { data, error } = await client.auth.getUser();
  if (error) throw contextualError("AUTH_GET_USER_FAILED", error);
  if (!data?.user?.id) {
    const missing = new Error("AUTH_REQUIRED");
    missing.code = "AUTH_REQUIRED";
    throw missing;
  }
  return data.user;
}

async function listProspects(client) {
  await requireUser(client);
  const { data, error } = await client
    .from("prospects")
    .select("*")
    .is("archived_at", null)
    .order("created_at", { ascending: false });
  if (error) throw contextualError("PROSPECTS_SELECT_FAILED", error);
  return Object.freeze((data || []).map(rowToProspect));
}

async function getProspect(client, id) {
  await requireUser(client);
  const { data, error } = await client
    .from("prospects")
    .select("*")
    .eq("id", id)
    .is("archived_at", null)
    .single();
  if (error) throw contextualError("PROSPECT_SELECT_FAILED", error);
  return rowToProspect(data);
}

async function listTimeline(client, prospectId) {
  await requireUser(client);
  const { data, error } = await client
    .from("prospect_commercial_timeline")
    .select("id,prospect_id,event_type,event_source,source_record_reference,occurred_at,recorded_at,payload,evidence_references,contract_version,privacy_classification,retention_policy")
    .eq("prospect_id", prospectId)
    .order("occurred_at", { ascending: false })
    .order("recorded_at", { ascending: false })
    .limit(50);
  if (error) throw contextualError("TIMELINE_SELECT_FAILED", error);
  return Object.freeze((data || []).map(rowToTimelineEvent));
}

function confirmedRpcRow(data) {
  const row = Array.isArray(data) ? data[0] : data;
  return row ? rowToProspect(row) : null;
}

export async function requestConfirmedStage({ client, prospectId, status }) {
  if (!prospectId || !ALLOWED_STAGES.has(status)) {
    const invalid = new Error("PIPELINE_STAGE_NOT_ALLOWED");
    invalid.code = "PIPELINE_STAGE_NOT_ALLOWED";
    throw invalid;
  }

  const { data, error } = await client.rpc(
    "forge_pipeline_update_prospect_stage",
    { p_prospect_id: prospectId, p_status: status },
  );
  if (error) throw contextualError("PIPELINE_STAGE_RPC_FAILED", error);

  const prospect = confirmedRpcRow(data);
  if (prospect?.id !== prospectId || prospect?.status !== status) {
    const mismatch = new Error("PIPELINE_STAGE_RPC_CONFIRMATION_MISMATCH");
    mismatch.code = "PIPELINE_STAGE_RPC_CONFIRMATION_MISMATCH";
    throw mismatch;
  }
  return prospect;
}

export async function createPipelineAdapter({ client } = {}) {
  if (!client) throw new Error("PRODUCTIVE_CLIENT_REQUIRED");
  await requireUser(client);

  const capabilities = Object.freeze({
    createProspect: true,
    importProspects: false,
    nashAvailable: false,
    nbaAvailable: false,
    contactAvailable: false,
    pagesSafeAuthority: true,
  });

  let records = [];
  let cards = [];

  async function reload() {
    records = [...await listProspects(client)];
    cards = await Promise.all(records.map(async prospect => {
      let timeline = [];
      let timelineState = "CONNECTED";
      try {
        timeline = await listTimeline(client, prospect.id);
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

  async function create(input = {}) {
    const user = await requireUser(client);
    const fullName = String(input.fullName || "").trim();
    const source = String(input.source || "").trim();
    const initialContext = String(input.initialContext || "").trim();
    if (!fullName || !source || !initialContext || (!input.phone && !input.whatsapp)) {
      const invalid = new Error("Nombre, teléfono o WhatsApp, fuente y contexto inicial son obligatorios.");
      invalid.code = "VALIDATION_ERROR";
      throw invalid;
    }

    const row = {
      advisor_id: user.id,
      full_name: fullName,
      phone_normalized: normalizePhone(input.phone),
      whatsapp_normalized: normalizePhone(input.whatsapp),
      source,
      initial_context: initialContext,
      status: "referred_new",
    };

    const { data, error } = await client
      .from("prospects")
      .insert(row)
      .select("*")
      .single();
    if (error) throw contextualError("PROSPECT_CREATE_FAILED", error);

    const created = rowToProspect(data);
    const confirmed = await getProspect(client, created.id);
    if (confirmed?.id !== created.id) {
      const mismatch = new Error("CREATE_READ_AFTER_WRITE_MISMATCH");
      mismatch.code = "CREATE_READ_AFTER_WRITE_MISMATCH";
      throw mismatch;
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
    const found = await getProspect(client, id);
    if (found?.status !== confirmed.status) {
      const mismatch = new Error("STAGE_READ_AFTER_WRITE_MISMATCH");
      mismatch.code = "STAGE_READ_AFTER_WRITE_MISMATCH";
      throw mismatch;
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

  async function update(id, changes = {}) {
    const user = await requireUser(client);
    const patch = { updated_by: user.id };
    for (const [key, value] of Object.entries(changes)) {
      const column = FIELD_MAP[key];
      if (column) {
        patch[column] = key === "phone" || key === "whatsapp"
          ? normalizePhone(value)
          : value;
      }
    }

    const { data, error } = await client
      .from("prospects")
      .update(patch)
      .eq("id", id)
      .is("archived_at", null)
      .select("*")
      .single();
    if (error) throw contextualError("PROSPECT_UPDATE_FAILED", error);
    await reload();
    return rowToProspect(data);
  }

  async function archive(id, reason = "Retirado del Pipeline") {
    const user = await requireUser(client);
    const { data, error } = await client
      .from("prospects")
      .update({
        archived_at: new Date().toISOString(),
        archived_by: user.id,
        archive_reason: reason,
        updated_by: user.id,
      })
      .eq("id", id)
      .is("archived_at", null)
      .select("*")
      .single();
    if (error) throw contextualError("PROSPECT_ARCHIVE_FAILED", error);
    await reload();
    return rowToProspect(data);
  }

  async function timeline(id) {
    return listTimeline(client, id);
  }

  function whatsappUrl(record, text = "") {
    const phone = String(
      record.phone || record.prospect?.whatsapp || "",
    ).replace(/[^\d]/g, "");
    if (!phone) return null;
    return `https://wa.me/${phone}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
  }

  return Object.freeze({
    capabilities,
    reload,
    create,
    changeStage,
    update,
    archive,
    timeline,
    whatsappUrl,
    getCards: () => cards,
  });
}
