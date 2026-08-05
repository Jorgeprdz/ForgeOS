export {
  AURA_PIPELINE_CALENDAR_TIME_ZONE as PIPELINE_CALENDAR_TIME_ZONE,
  buildAuraPipelineGoogleCalendarUrl as buildPipelineGoogleCalendarUrl,
} from "./pipeline-aura-calendar.js?v=aura-native-pipeline-002";

export function installPipelineGoogleCalendar() {
  return Object.freeze({
    installed: false,
    nativeRenderer: true,
    designAuthority: "FORGE_AURA_LIGHT_2026_V1",
    automaticWorkspaceInstallation: false,
    material3DesignUsed: false,
    reapply() {},
    close() { return false; },
    destroy() {},
  });
}
