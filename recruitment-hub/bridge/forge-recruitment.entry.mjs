// Safe consumer entry: five original CommonJS engines; no legacy scoring/provenance.
import interviews from '../../manager-os/recruitment/interview-flow/interview-flow-engine.js';
import pipeline from '../../manager-os/recruitment/pipeline/recruitment-pipeline-engine.js';
import events from '../../manager-os/recruitment/events/manager-recruitment-event-capture-contract.js';
import snapshots from '../../manager-os/recruitment/snapshots/candidate-manager-snapshot-engine.js';
import metrics from '../../manager-os/metrics/manager-recruitment-metrics-engine.js';
export const evaluateInterviewFlow = interviews.evaluateInterviewFlow;
export const normalizeInterviewStage = interviews.normalizeInterviewStage;
export const evaluateRecruitmentPipeline = pipeline.evaluateRecruitmentPipeline;
export const normalizeRecruitmentPipelineState = pipeline.normalizeRecruitmentPipelineState;
export const captureManagerRecruitmentEvent = events.captureManagerRecruitmentEvent;
export const buildCandidateManagerSnapshot = snapshots.buildCandidateManagerSnapshot;
export const calculateManagerRecruitmentMetrics = metrics.calculateManagerRecruitmentMetrics;
