/* FORGEOS:REPORT_READ_MODEL_DRY_RUN_ADAPTER_060D:START */
(function () {
  "use strict";

  var ACTION_ID = "report.open.preview";
  var SELECTED_CANDIDATE = "selected.report_read_model_preview";
  var ADAPTER_CANDIDATE = "report_read_model_dry_run";

  function baseOutput(packet, status) {
    return {
      dryRunStatus: status,
      actionId: packet && packet.actionId ? packet.actionId : "",
      adapterCandidate: ADAPTER_CANDIDATE,
      selectedCandidate: SELECTED_CANDIDATE,
      previewMode: true,
      requiresHumanApproval: true,
      executionAllowed: false,
      writesAllowed: false,
      sendAllowed: false,
      calendarAllowed: false,
      crmAllowed: false,
      evidence: {
        source: "060D static report read-model dry-run adapter",
        decision: status === "DRY_RUN_ACCEPTED" ? "accepted_preview_only" : "refused_preview_only"
      }
    };
  }

  function refusal(packet, reason, message) {
    var output = baseOutput(packet || {}, "DRY_RUN_REFUSED");
    output.refusal = {
      reason: reason,
      message: message
    };
    return output;
  }

  function acceptsSelectedCandidate(packet) {
    if (!packet.selectedCandidate) return true;
    return packet.selectedCandidate === SELECTED_CANDIDATE;
  }

  function buildReportPreview(packet) {
    return {
      title: "Preview de reporte",
      summary: "Lectura segura preparada para revision humana.",
      sourceModule: packet.sourceModule || "reportes",
      sourceSurface: packet.sourceSurface || "desktop.command_workspace",
      rows: [
        { label: "Estado", value: "Preview sin ejecucion" },
        { label: "Motor", value: "Dry-run estatico" },
        { label: "Aprobacion", value: "Humana requerida" }
      ]
    };
  }

  function runDry(packet) {
    if (!packet || typeof packet !== "object") {
      return refusal(packet, "INVALID_PACKET", "A packet object is required.");
    }
    if (packet.actionId !== ACTION_ID) {
      return refusal(packet, "UNKNOWN_ACTION_ID", "Only report.open.preview is accepted.");
    }
    if (packet.previewMode !== true) {
      return refusal(packet, "NOT_PREVIEW_MODE", "Preview mode is required.");
    }
    if (packet.requiresHumanApproval !== true) {
      return refusal(packet, "MISSING_HUMAN_APPROVAL_GATE", "Human approval must remain required.");
    }
    if (!acceptsSelectedCandidate(packet)) {
      return refusal(packet, "WRONG_SELECTED_CANDIDATE", "Selected candidate does not match the report read-model path.");
    }

    var output = baseOutput(packet, "DRY_RUN_ACCEPTED");
    output.reportPreview = buildReportPreview(packet);
    return output;
  }

  function handlePacketEvent(event) {
    var packet = event && event.detail ? event.detail : null;
    var output = runDry(packet);
    window.dispatchEvent(new CustomEvent("forge:report-read-model-dry-run:060d", { detail: output }));
  }

  if (typeof window !== "undefined") {
    window.__forgeRunReportReadModelDryRun060D = runDry;
    window.addEventListener("forge:static-action-packet:059b", handlePacketEvent);
  }
})();
/* FORGEOS:REPORT_READ_MODEL_DRY_RUN_ADAPTER_060D:END */
