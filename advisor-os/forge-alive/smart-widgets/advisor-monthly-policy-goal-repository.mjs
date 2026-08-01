function abortIfNeeded(signal) {
  if (signal?.aborted) throw new DOMException("Monthly policy goal operation aborted", "AbortError");
}

function validateYearMonth(value) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(String(value || ""))) {
    throw new TypeError("yearMonth must use YYYY-MM");
  }
  return String(value);
}

function validateTarget(value) {
  if (!Number.isInteger(value) || value < 1 || value > 1000) {
    throw new TypeError("targetPolicyCount must be an integer between 1 and 1000");
  }
  return value;
}

export function createAdvisorMonthlyPolicyGoalRepository({ client, getSessionAdvisorId } = {}) {
  if (!client || typeof client.from !== "function" || typeof client.rpc !== "function") {
    throw new TypeError("Supabase-compatible client is required");
  }
  if (typeof getSessionAdvisorId !== "function") {
    throw new TypeError("getSessionAdvisorId is required");
  }

  async function authorityAdvisorId(expectedAdvisorId) {
    const authenticatedAdvisorId = await getSessionAdvisorId();
    if (!authenticatedAdvisorId) throw new Error("SESSION_REQUIRED");
    if (expectedAdvisorId && expectedAdvisorId !== authenticatedAdvisorId) {
      throw new Error("MONTHLY_GOAL_CROSS_ADVISOR_REQUEST_BLOCKED");
    }
    return authenticatedAdvisorId;
  }

  return Object.freeze({
    repositoryId: "ADVISOR_MONTHLY_POLICY_GOAL_SUPABASE_REPOSITORY",

    async readCurrent({ advisorId, yearMonth, signal } = {}) {
      abortIfNeeded(signal);
      const authorityId = await authorityAdvisorId(advisorId);
      const month = validateYearMonth(yearMonth);
      const query = client
        .from("advisor_monthly_policy_goals")
        .select("id,advisor_id,year_month,target_policy_count,revision,reason,evidence_reference,effective_from,supersedes_goal_id,created_at")
        .eq("advisor_id", authorityId)
        .eq("year_month", `${month}-01`)
        .order("revision", { ascending: false })
        .limit(1)
        .maybeSingle();
      const { data, error } = await query;
      abortIfNeeded(signal);
      if (error) throw error;
      if (!data) return null;
      return Object.freeze({
        advisorId: data.advisor_id,
        yearMonth: String(data.year_month).slice(0, 7),
        targetPolicyCount: data.target_policy_count,
        revision: data.revision,
        reason: data.reason,
        evidenceRef: data.evidence_reference,
        effectiveFrom: data.effective_from,
        supersedesGoalId: data.supersedes_goal_id,
        createdAt: data.created_at,
      });
    },

    async append({ advisorId, yearMonth, targetPolicyCount, reason = null, evidenceReference = null, signal } = {}) {
      abortIfNeeded(signal);
      await authorityAdvisorId(advisorId);
      const month = validateYearMonth(yearMonth);
      const target = validateTarget(targetPolicyCount);
      const { data, error } = await client.rpc("forge_set_monthly_policy_goal", {
        p_year_month: `${month}-01`,
        p_target_policy_count: target,
        p_reason: reason,
        p_evidence_reference: evidenceReference,
      });
      abortIfNeeded(signal);
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      if (!row) throw new Error("MONTHLY_GOAL_APPEND_RETURNED_NO_ROW");
      return Object.freeze({
        advisorId: row.advisor_id,
        yearMonth: String(row.year_month).slice(0, 7),
        targetPolicyCount: row.target_policy_count,
        revision: row.revision,
        reason: row.reason,
        evidenceRef: row.evidence_reference,
        effectiveFrom: row.effective_from,
        supersedesGoalId: row.supersedes_goal_id,
        createdAt: row.created_at,
      });
    },
  });
}
