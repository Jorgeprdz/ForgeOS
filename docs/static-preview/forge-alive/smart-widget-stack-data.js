export const forgeAliveSmartWidgetStackPreview = Object.freeze({
  version: "Contexto vivo",
  article0: "Forge fortalece el juicio humano; no lo reemplaza.",
  finalAuthority: "HUMAN",
  reviewOnly: true,
  contexts: [
    {
      id: "morning-agenda",
      label: "8:00 agenda",
      selectedWhen: "La agenda de la mañana está lista.",
      widgets: [
        {
          family: "MORNING_AGENDA_WIDGET",
          title: "Agenda de la mañana",
          subtitle: "Ordena el día antes de ejecutar.",
          priority: 90,
          whyNow: "Son las 8:00 y hay agenda disponible para revisar antes de iniciar.",
          evidence: ["agenda de muestra", "ventana de planeación"],
          uncertainty: "Muestra segura; confirma calendario y prioridades antes de actuar.",
          prompt: "¿Qué decisión humana hace más valioso el día de hoy?"
        },
        {
          family: "FOLLOW_UP_PRIORITY_WIDGET",
          title: "Seguimiento prioritario",
          subtitle: "Revisa señales antes de sugerir acción.",
          priority: 86,
          whyNow: "Hay conversaciones abiertas con riesgo de enfriarse.",
          evidence: ["riesgo de seguimiento", "antiguedad de conversación"],
          uncertainty: "Dato de muestra; no es verdad CRM.",
          prompt: "¿Qué evidencia hace urgente este seguimiento?"
        }
      ]
    },
    {
      id: "four-pm-review",
      label: "16:00 revisión",
      selectedWhen: "Toca revisión de 25 puntos.",
      widgets: [
        {
          family: "TWENTY_FIVE_POINT_REVIEW_WIDGET",
          title: "Revisión de 25 puntos",
          subtitle: "Cierra brechas antes del final del día.",
          priority: 88,
          whyNow: "Son las 16:00 y conviene revisar avance, riesgos y pendientes.",
          evidence: ["ventana de revisión", "avance diario de muestra"],
          uncertainty: "Señal de revisión; no es verdad de desempeño.",
          prompt: "¿Qué punto desbloquea mejor juicio para mañana?"
        },
        {
          family: "MONTHLY_GOAL_GAP_WIDGET",
          title: "Gap de meta mensual",
          subtitle: "Contexto de avance, no presión automática.",
          priority: 74,
          whyNow: "Hay una brecha mensual visible en el tablero.",
          evidence: ["meta mensual de muestra", "familias protegidas de muestra"],
          uncertainty: "Muestra estática; no es forecast de producción.",
          prompt: "¿Qué supuesto puede estar equivocado?"
        }
      ]
    },
    {
      id: "commission-update",
      label: "Comisiones",
      selectedWhen: "Hay actualización de comisiones.",
      widgets: [
        {
          family: "COMMISSION_UPDATE_WIDGET",
          title: "Vistazo de comisiones",
          subtitle: "Información para revisar, no es cálculo final de pago.",
          priority: 82,
          whyNow: "Hay una actualización de comisión disponible para inspección humana.",
          evidence: ["actualización de muestra", "vigencia de reglas"],
          uncertainty: "Estimación candidata; no es payout, revenue ni verdad de compensación.",
          prompt: "¿Qué regla o evidencia falta antes de confiar en este cálculo?"
        }
      ]
    },
    {
      id: "follow-up-risk",
      label: "Seguimiento",
      selectedWhen: "Hay riesgo alto de seguimiento.",
      widgets: [
        {
          family: "FOLLOW_UP_PRIORITY_WIDGET",
          title: "Seguimiento prioritario",
          subtitle: "Relación abierta con riesgo de enfriarse.",
          priority: 86,
          whyNow: "Hay señales de seguimiento pendiente y oportunidad de revisar con calma.",
          evidence: ["seguimiento de relación", "días desde último contacto"],
          uncertainty: "Contexto relacional; el humano decide tono y momento.",
          prompt: "¿La persona gana claridad o siente presión?"
        },
        {
          family: "FORGOTTEN_CLIENT_WIDGET",
          title: "Cliente olvidado",
          subtitle: "Recupera contexto antes de actuar.",
          priority: 78,
          whyNow: "Hay contactos sin seguimiento reciente.",
          evidence: ["cliente sin seguimiento", "antiguedad de contacto"],
          uncertainty: "No escribe CRM; no crea tarea.",
          prompt: "¿Qué falta saber antes de reabrir la conversación?"
        }
      ]
    },
    {
      id: "genesis-review",
      label: "Genesis",
      selectedWhen: "Hay revisión Genesis pendiente.",
      widgets: [
        {
          family: "GENESIS_REVIEW_PACKET_WIDGET_FAMILY",
          title: "Revisión de seguimiento Jorge / María",
          subtitle: "Solo revisión. Contexto de seguimiento, no aprobación de envío.",
          priority: 80,
          whyNow: "Hay un paquete de revisión humana listo para inspección.",
          evidence: ["conversación previa", "seguimiento 15 días", "seguimiento pendiente"],
          uncertainty: "No aprobado, no enviable, entrega bloqueada.",
          prompt: "¿Qué debe aprender el asesor antes de aprobar algo?"
        }
      ]
    },
    {
      id: "judgment",
      label: "Juicio",
      selectedWhen: "La incertidumbre o el contexto faltante es alto.",
      widgets: [
        {
          family: "JUDGMENT_PROMPT_WIDGET",
          title: "Falta contexto",
          subtitle: "Primero mejora el juicio; luego decide.",
          priority: 92,
          whyNow: "La incertidumbre o contexto faltante supera el valor de ejecutar.",
          evidence: ["señal de contexto faltante", "señal de incertidumbre"],
          uncertainty: "Pausa para revisión humana; desconocido no es cero.",
          prompt: "¿Qué evidencia cambiaría tu decisión?"
        }
      ]
    }
  ]
});
