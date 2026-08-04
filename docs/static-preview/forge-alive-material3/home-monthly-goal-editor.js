const EDITOR_STATE = Symbol.for("forge.home.monthly-goal-editor.v1");
const GOAL_REASON_PREFIX = "HOME_MONTHLY_GOALS_V2:";
const TIME_ZONE = "America/Mexico_City";

function monthKey(value, timeZone = TIME_ZONE) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(value instanceof Date ? value : new Date(value));
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  if (!year || !month) throw new Error("MONTHLY_GOAL_MONTH_UNAVAILABLE");
  return `${year}-${month}`;
}

function parseEconomicGoal(reason) {
  if (typeof reason !== "string" || !reason.startsWith(GOAL_REASON_PREFIX)) return null;
  try {
    const parsed = JSON.parse(reason.slice(GOAL_REASON_PREFIX.length));
    const value = Number(parsed?.targetMonthlyIncomeMxn);
    return Number.isFinite(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}

function formatMoney(value) {
  if (!Number.isFinite(value)) return null;
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(value);
}

function authenticatedAdvisorId(sessionResult) {
  const advisorId = sessionResult?.data?.session?.user?.id || null;
  if (!advisorId) throw new Error("MONTHLY_GOAL_SESSION_REQUIRED");
  return advisorId;
}

function ensureDialog() {
  let dialog = document.querySelector("[data-forge-home-monthly-goals-dialog]");
  if (dialog) return dialog;

  dialog = document.createElement("dialog");
  dialog.className = "productive-goal-dialog";
  dialog.dataset.forgeHomeMonthlyGoalsDialog = "true";
  dialog.innerHTML = `
    <form class="productive-goal-form" data-forge-home-monthly-goals-form novalidate>
      <div>
        <p class="productive-smart-widget-eyebrow">METAS DEL MES</p>
        <h2>Define tus metas mensuales</h2>
        <p>La meta económica expresa cuánto quieres ganar. No modifica comisiones pagadas ni crea ingresos automáticamente.</p>
      </div>
      <label>
        <span>¿Cuánto quieres ganar este mes?</span>
        <input
          type="number"
          min="1"
          max="100000000"
          step="1000"
          inputmode="decimal"
          autocomplete="off"
          required
          data-forge-monthly-income-input
        >
      </label>
      <label>
        <span>¿Cuántas pólizas quieres vender?</span>
        <input
          type="number"
          min="1"
          max="1000"
          step="1"
          inputmode="numeric"
          autocomplete="off"
          required
          data-forge-monthly-policy-input
        >
      </label>
      <p class="productive-goal-error" data-forge-home-monthly-goals-error hidden></p>
      <div class="productive-goal-actions">
        <button type="button" data-forge-home-monthly-goals-cancel>Cancelar</button>
        <button type="submit" class="productive-smart-widget-action" data-forge-home-monthly-goals-save>Guardar metas</button>
      </div>
    </form>
  `;
  document.body.appendChild(dialog);
  return dialog;
}

export function createHomeMonthlyGoalEditor({
  root,
  productiveHome,
  bootstrap = globalThis.ForgeProductiveProspectBootstrap067G17B,
  clock = () => new Date(),
  timeZone = TIME_ZONE,
} = {}) {
  if (!(root instanceof Element)) throw new TypeError("Home monthly goal editor root is required");
  if (root[EDITOR_STATE]) return root[EDITOR_STATE];

  const dialog = ensureDialog();
  const form = dialog.querySelector("[data-forge-home-monthly-goals-form]");
  const incomeInput = dialog.querySelector("[data-forge-monthly-income-input]");
  const policyInput = dialog.querySelector("[data-forge-monthly-policy-input]");
  const errorNode = dialog.querySelector("[data-forge-home-monthly-goals-error]");
  const saveButton = dialog.querySelector("[data-forge-home-monthly-goals-save]");
  const cancelButton = dialog.querySelector("[data-forge-home-monthly-goals-cancel]");

  let mounted = false;
  let observer = null;
  let currentSnapshot = null;

  function selectedBootstrap() {
    const selected = globalThis.ForgeProductiveProspectBootstrap067G17B || bootstrap;
    if (typeof selected?.getClient !== "function" || typeof selected?.getSession !== "function") {
      throw new Error("MONTHLY_GOAL_BOOTSTRAP_UNAVAILABLE");
    }
    return selected;
  }

  function setBusy(busy) {
    incomeInput.disabled = busy;
    policyInput.disabled = busy;
    saveButton.disabled = busy;
    cancelButton.disabled = busy;
    dialog.dataset.monthlyGoalsState = busy ? "saving" : "ready";
  }

  function showError(message) {
    errorNode.textContent = message;
    errorNode.hidden = false;
  }

  function clearError() {
    errorNode.textContent = "";
    errorNode.hidden = true;
  }

  async function readCurrent() {
    const selected = selectedBootstrap();
    const [client, sessionResult] = await Promise.all([
      selected.getClient(),
      selected.getSession(),
    ]);
    const advisorId = authenticatedAdvisorId(sessionResult);
    const month = monthKey(clock(), timeZone);
    const query = client
      .from("advisor_monthly_policy_goals")
      .select("target_policy_count,reason,revision")
      .eq("advisor_id", advisorId)
      .eq("year_month", `${month}-01`)
      .order("revision", { ascending: false })
      .limit(1)
      .maybeSingle();
    const { data, error } = await query;
    if (error) throw error;
    currentSnapshot = Object.freeze({
      advisorId,
      month,
      targetPolicyCount: Number.isInteger(data?.target_policy_count)
        ? data.target_policy_count
        : 10,
      targetMonthlyIncomeMxn: parseEconomicGoal(data?.reason),
    });
    return currentSnapshot;
  }

  function decorateCard() {
    const cards = root.querySelectorAll(
      '[data-widget-family="MONTHLY_POLICY_GOAL_WIDGET"]',
    );
    for (const card of cards) {
      const title = card.querySelector(".productive-smart-widget-title");
      const subtitle = card.querySelector(".productive-smart-widget-subtitle");
      const action = card.querySelector("button.productive-smart-widget-action");
      if (title) title.textContent = "Metas del mes";
      if (subtitle && card.dataset.widgetState === "BLOCKED_BY_MISSING_EVIDENCE") {
        subtitle.textContent = "Define cuánto quieres ganar y cuántas pólizas quieres vender.";
      }
      if (action) {
        action.textContent = card.dataset.widgetState === "BLOCKED_BY_MISSING_EVIDENCE"
          ? "Definir metas del mes"
          : "Editar metas del mes";
      }

      let summary = card.querySelector("[data-forge-monthly-goals-summary]");
      if (!summary) {
        summary = document.createElement("p");
        summary.className = "productive-smart-widget-reason";
        summary.dataset.forgeMonthlyGoalsSummary = "true";
        card.querySelector(".productive-smart-widget-footer")?.before(summary);
      }
      if (currentSnapshot?.targetMonthlyIncomeMxn) {
        summary.textContent = `Meta de ingreso: ${formatMoney(currentSnapshot.targetMonthlyIncomeMxn)} · Meta de pólizas: ${currentSnapshot.targetPolicyCount}`;
        summary.hidden = false;
      } else {
        summary.textContent = "Falta definir la meta económica del mes.";
        summary.hidden = false;
      }
    }
  }

  async function openEditor() {
    clearError();
    if (typeof dialog.showModal === "function" && !dialog.open) dialog.showModal();
    else dialog.setAttribute("open", "");
    setBusy(true);
    try {
      const snapshot = await readCurrent();
      incomeInput.value = snapshot.targetMonthlyIncomeMxn
        ? String(snapshot.targetMonthlyIncomeMxn)
        : "";
      policyInput.value = String(snapshot.targetPolicyCount);
      decorateCard();
    } catch (error) {
      console.error("Forge monthly goals read failed", error);
      policyInput.value ||= "10";
      showError("No pudimos leer las metas actuales. Puedes intentar guardarlas nuevamente.");
    } finally {
      setBusy(false);
      incomeInput.focus({ preventScroll: true });
    }
  }

  async function save(event) {
    event.preventDefault();
    event.stopPropagation();
    clearError();

    const targetMonthlyIncomeMxn = Number(incomeInput.value);
    const targetPolicyCount = Number(policyInput.value);
    if (
      !Number.isFinite(targetMonthlyIncomeMxn)
      || targetMonthlyIncomeMxn < 1
      || targetMonthlyIncomeMxn > 100000000
    ) {
      showError("Ingresa una meta económica válida entre $1 y $100,000,000 MXN.");
      incomeInput.focus({ preventScroll: true });
      return;
    }
    if (!Number.isInteger(targetPolicyCount) || targetPolicyCount < 1 || targetPolicyCount > 1000) {
      showError("La meta de pólizas debe ser un número entero entre 1 y 1000.");
      policyInput.focus({ preventScroll: true });
      return;
    }

    setBusy(true);
    try {
      const selected = selectedBootstrap();
      const [client, sessionResult] = await Promise.all([
        selected.getClient(),
        selected.getSession(),
      ]);
      const advisorId = authenticatedAdvisorId(sessionResult);
      const month = monthKey(clock(), timeZone);
      const reason = `${GOAL_REASON_PREFIX}${JSON.stringify({
        targetMonthlyIncomeMxn: Math.round(targetMonthlyIncomeMxn * 100) / 100,
        currency: "MXN",
      })}`;
      const { data, error } = await client.rpc("forge_set_monthly_policy_goal", {
        p_year_month: `${month}-01`,
        p_target_policy_count: targetPolicyCount,
        p_reason: reason,
        p_evidence_reference: `HOME_MONTHLY_GOALS:${month}`,
      });
      if (error) throw error;
      if (!data) throw new Error("MONTHLY_GOALS_APPEND_RETURNED_NO_ROW");

      currentSnapshot = Object.freeze({
        advisorId,
        month,
        targetPolicyCount,
        targetMonthlyIncomeMxn,
      });
      decorateCard();
      dialog.close?.();
      await productiveHome?.refresh?.();
    } catch (error) {
      console.error("Forge monthly goals save failed", error);
      showError(
        error?.message === "MONTHLY_GOAL_SESSION_REQUIRED"
          ? "La sesión cambió. Vuelve a iniciar sesión antes de guardar."
          : "No pudimos guardar las metas. Las metas anteriores permanecen intactas.",
      );
    } finally {
      setBusy(false);
    }
  }

  function handleActionCapture(event) {
    const action = event.target.closest?.("button.productive-smart-widget-action");
    const card = action?.closest?.('[data-widget-family="MONTHLY_POLICY_GOAL_WIDGET"]');
    if (!action || !card || !root.contains(card)) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    void openEditor();
  }

  function mount() {
    if (mounted) return;
    mounted = true;
    root.addEventListener("click", handleActionCapture, true);
    form.addEventListener("submit", save);
    cancelButton.addEventListener("click", () => dialog.close?.());
    observer = new MutationObserver(decorateCard);
    observer.observe(root, { childList: true, subtree: true });
    decorateCard();
  }

  function close() {
    if (dialog.open) dialog.close?.();
  }

  function unmount() {
    if (!mounted) return;
    mounted = false;
    close();
    observer?.disconnect();
    observer = null;
    root.removeEventListener("click", handleActionCapture, true);
    form.removeEventListener("submit", save);
  }

  const api = Object.freeze({
    mount,
    close,
    unmount,
    reconcile: decorateCard,
    diagnostics: () => Object.freeze({
      mounted,
      dialogOpen: Boolean(dialog.open),
      currentSnapshot,
      storageAuthority: "ADVISOR_MONTHLY_POLICY_GOALS_APPEND_ONLY",
      economicGoalEncoding: GOAL_REASON_PREFIX,
    }),
  });
  root[EDITOR_STATE] = api;
  return api;
}

export const HOME_MONTHLY_GOAL_EDITOR_VERSION = "HOME_MONTHLY_GOALS_V2";
