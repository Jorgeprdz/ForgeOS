/* FORGEOS:STATIC_ACTION_PACKET_BRIDGE_059B:START */
(function () {
  "use strict";

  var desktopQuery = window.matchMedia ? window.matchMedia("(min-width: 901px)") : null;
  var packetStore = [];
  var sequence = 0;

  var actionRules = [
    { id: "quote.create.preview", match: ["/cotizar", "cotizar", "cotizacion", "cotización"], module: "cotizaciones", intent: "Prepare a read-only quote preview." },
    { id: "policy.upload.preview", match: ["/subir poliza", "/subir póliza", "subir poliza", "subir póliza"], module: "polizas", intent: "Prepare a read-only policy upload preview." },
    { id: "client.follow.preview", match: ["/follow", "follow", "seguimiento"], module: "clientes", intent: "Prepare a read-only follow-up preview." },
    { id: "client.call.preview", match: ["/llamar", "llamar"], module: "clientes", intent: "Prepare a read-only call prep preview." },
    { id: "client.message.preview", match: ["/mandar mensaje", "mandar mensaje", "mensaje"], module: "clientes", intent: "Prepare a read-only message draft preview." },
    { id: "client.search.preview", match: ["/buscar cliente", "buscar cliente"], module: "clientes", intent: "Prepare a read-only client search preview." },
    { id: "policy.open.preview", match: ["abrir poliza", "abrir póliza", "abrir"], module: "polizas", intent: "Prepare a read-only policy open preview." },
    { id: "report.open.preview", match: ["reporte", "reportes"], module: "reportes", intent: "Prepare a read-only report preview." },
    { id: "pipeline.review.preview", match: ["revisar pipeline", "pipeline"], module: "pipeline", intent: "Prepare a read-only pipeline review preview." },
    { id: "day.review.preview", match: ["revisar dia", "revisar día", "iniciar revision", "iniciar revisión"], module: "inicio", intent: "Prepare a read-only daily review preview." }
  ];

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function closestText(target) {
    var node = target && target.closest ? target.closest("button, a, [role='button'], .forge-desktop-command-suggestion-058e, .forge-mobile-widget-card-057j, .forge-smart-widget-static-card-056u") : null;
    if (!node) return "";
    return (node.getAttribute("data-command") || node.getAttribute("aria-label") || node.textContent || "").trim();
  }

  function inferRule(text) {
    var haystack = normalize(text);
    for (var i = 0; i < actionRules.length; i += 1) {
      var rule = actionRules[i];
      for (var j = 0; j < rule.match.length; j += 1) {
        if (haystack.indexOf(normalize(rule.match[j])) !== -1) {
          return rule;
        }
      }
    }
    return null;
  }

  function inferPlatform() {
    if (desktopQuery && desktopQuery.matches) return "desktop";
    return "mobile";
  }

  function inferSurface(target) {
    if (target && target.closest) {
      if (target.closest(".forge-desktop-workspace-056y")) {
        if (target.closest(".forge-desktop-rail, .forge-alfred-rail, aside")) return "desktop.right_rail";
        if (target.closest("table, .forge-opportunities, .forge-documents")) return "desktop.table_row";
        if (target.closest(".forge-decision-strip, .forge-desktop-decision-strip-058e")) return "desktop.decision_strip";
        return "desktop.command_workspace";
      }
      if (target.closest(".forge-mobile-widget-grid-057j")) return "mobile.widget_grid";
      if (target.closest(".bottom-nav")) return "mobile.bottom_nav";
    }
    return inferPlatform() === "desktop" ? "desktop.command_workspace" : "mobile.command_card";
  }

  function buildPacket(rule, text, target) {
    sequence += 1;
    var platform = inferPlatform();
    var surface = inferSurface(target);
    return {
      packetVersion: "059B.static.preview",
      packetId: "forge-static-action-" + String(sequence).padStart(4, "0"),
      actionId: rule.id,
      sourceSurface: surface,
      sourcePlatform: platform,
      sourceModule: rule.module,
      humanLabel: text || rule.id,
      previewMode: true,
      requiresHumanApproval: true,
      createdAtLocal: "static-preview-only",
      safeIntent: rule.intent,
      target: {
        clientName: inferClientName(text)
      },
      context: {
        reason: "Static preview action packet generated from UI intent.",
        recommendedNextStep: "Open preview and keep human approval required."
      },
      previewPayload: {
        title: text || "Preparar preview",
        body: rule.intent,
        safety: "Sin envio, sin CRM, sin calendario."
      }
    };
  }

  function inferClientName(text) {
    var names = ["Lariza", "Octavio", "Maria", "María", "Juan"];
    for (var i = 0; i < names.length; i += 1) {
      if (normalize(text).indexOf(normalize(names[i])) !== -1) return names[i];
    }
    return "";
  }

  function publishPacket(packet, node) {
    packetStore.push(packet);
    window.__forgeStaticActionPackets059B = packetStore.slice();
    document.documentElement.setAttribute("data-forge-action-packet-059b", packet.actionId);
    document.documentElement.setAttribute("data-forge-action-packet-count-059b", String(packetStore.length));
    if (node && node.setAttribute) {
      node.setAttribute("data-forge-last-action-packet-059b", packet.packetId);
    }
    window.dispatchEvent(new CustomEvent("forge:static-action-packet:059b", { detail: packet }));
  }

  function onClick(event) {
    var text = closestText(event.target);
    if (!text) return;
    var rule = inferRule(text);
    if (!rule) return;
    var node = event.target.closest ? event.target.closest("button, a, [role='button'], .forge-desktop-command-suggestion-058e, .forge-mobile-widget-card-057j, .forge-smart-widget-static-card-056u") : null;
    publishPacket(buildPacket(rule, text, event.target), node);
  }

  function init() {
    if (window.__forgeStaticActionPacketBridge059BReady) return;
    window.__forgeStaticActionPacketBridge059BReady = true;
    window.__forgeStaticActionPackets059B = packetStore;
    document.addEventListener("click", onClick, true);
    document.documentElement.setAttribute("data-forge-action-bridge-059b", "ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
/* FORGEOS:STATIC_ACTION_PACKET_BRIDGE_059B:END */
