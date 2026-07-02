export const forgeAliveSmartWidgetStackPreview = Object.freeze({
  version: "Preview v053C",
  article0: "Forge exists to strengthen human judgment, not replace it.",
  finalAuthority: "HUMAN",
  reviewOnly: true,
  contexts: [
    {
      id: "morning-agenda",
      label: "8:00 agenda",
      selectedWhen: "Morning agenda is available.",
      widgets: [
        {
          family: "MORNING_AGENDA_WIDGET",
          title: "Agenda de la mañana",
          subtitle: "Ordena el día antes de ejecutar.",
          priority: 90,
          whyNow: "Son las 8:00 y hay agenda disponible para revisar antes de iniciar.",
          evidence: ["agenda sample", "morning planning window"],
          uncertainty: "Sample static preview; confirm calendar and priorities before action.",
          prompt: "¿Qué decisión humana hace más valioso el día de hoy?"
        },
        {
          family: "FOLLOW_UP_PRIORITY_WIDGET",
          title: "Seguimiento prioritario",
          subtitle: "Revisa señales antes de sugerir acción.",
          priority: 86,
          whyNow: "Hay conversaciones abiertas con riesgo de enfriarse.",
          evidence: ["follow-up risk sample", "open conversation age"],
          uncertainty: "Risk is preview data, not CRM truth.",
          prompt: "¿Qué evidencia hace urgente este seguimiento?"
        }
      ]
    },
    {
      id: "four-pm-review",
      label: "16:00 revisión",
      selectedWhen: "The 25-point review is due.",
      widgets: [
        {
          family: "TWENTY_FIVE_POINT_REVIEW_WIDGET",
          title: "Revisión de 25 puntos",
          subtitle: "Cierra brechas antes del final del día.",
          priority: 88,
          whyNow: "Son las 16:00 y conviene revisar avance, riesgos y pendientes.",
          evidence: ["25-point review window", "daily progress sample"],
          uncertainty: "Preview-only review cue; not performance truth.",
          prompt: "¿Qué punto desbloquea mejor juicio para mañana?"
        },
        {
          family: "MONTHLY_GOAL_GAP_WIDGET",
          title: "Gap de meta mensual",
          subtitle: "Contexto de avance, no presión automática.",
          priority: 74,
          whyNow: "Hay una brecha mensual visible en el tablero.",
          evidence: ["monthly goal sample", "protected families sample"],
          uncertainty: "Static sample, not production forecast.",
          prompt: "¿Qué supuesto puede estar equivocado?"
        }
      ]
    },
    {
      id: "commission-update",
      label: "Comisiones",
      selectedWhen: "Commission update is available.",
      widgets: [
        {
          family: "COMMISSION_UPDATE_WIDGET",
          title: "Vistazo de comisiones",
          subtitle: "Información para revisar, no payout truth.",
          priority: 82,
          whyNow: "Hay una actualización de comisión disponible para inspección humana.",
          evidence: ["commission update sample", "rule-pack freshness sample"],
          uncertainty: "Candidate estimate only; not payout, revenue, or compensation truth.",
          prompt: "¿Qué regla o evidencia falta antes de confiar en este cálculo?"
        }
      ]
    },
    {
      id: "follow-up-risk",
      label: "Seguimiento",
      selectedWhen: "High follow-up risk exists.",
      widgets: [
        {
          family: "FOLLOW_UP_PRIORITY_WIDGET",
          title: "Seguimiento prioritario",
          subtitle: "Relación abierta con riesgo de enfriarse.",
          priority: 86,
          whyNow: "Hay señales de seguimiento pendiente y oportunidad de revisar con calma.",
          evidence: ["relationship follow-up sample", "days since last contact sample"],
          uncertainty: "Relationship context only; human must decide tone and timing.",
          prompt: "¿La persona gana claridad o siente presión?"
        },
        {
          family: "FORGOTTEN_CLIENT_WIDGET",
          title: "Cliente olvidado",
          subtitle: "Recupera contexto antes de actuar.",
          priority: 78,
          whyNow: "Hay contactos sin seguimiento reciente.",
          evidence: ["forgotten client sample", "contact age sample"],
          uncertainty: "Not CRM write; not task creation.",
          prompt: "¿Qué falta saber antes de reabrir la conversación?"
        }
      ]
    },
    {
      id: "genesis-review",
      label: "Genesis",
      selectedWhen: "Genesis review packet exists.",
      widgets: [
        {
          family: "GENESIS_REVIEW_PACKET_WIDGET_FAMILY",
          title: "Jorge / Maria follow-up review",
          subtitle: "Review only. Contexto de seguimiento, no aprobación de envío.",
          priority: 80,
          whyNow: "Hay un paquete de revisión humana listo para inspección.",
          evidence: ["previous conversation", "15-day follow-up", "pending follow-up"],
          uncertainty: "Not approved, not sendable, delivery locked.",
          prompt: "¿Qué debe aprender el asesor antes de aprobar algo?"
        }
      ]
    },
    {
      id: "judgment",
      label: "Juicio",
      selectedWhen: "Uncertainty or missing context is high.",
      widgets: [
        {
          family: "JUDGMENT_PROMPT_WIDGET",
          title: "Falta contexto",
          subtitle: "Primero mejora el juicio; luego decide.",
          priority: 92,
          whyNow: "La incertidumbre o contexto faltante supera el valor de ejecutar.",
          evidence: ["missing context signal", "uncertainty signal"],
          uncertainty: "Hold for human review; unknown is not zero.",
          prompt: "¿Qué evidencia cambiaría tu decisión?"
        }
      ]
    }
  ]
});
