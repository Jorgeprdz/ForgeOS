import assert from 'node:assert/strict';

import {
  ADVISOR_COMPENSATION_STAGES,
  resolveAdvisorCompensationStage,
} from '../compensation/contracts/advisor-compensation-stage.js';

const partner = resolveAdvisorCompensationStage({ role: 'partner' });
assert.equal(partner.stage, ADVISOR_COMPENSATION_STAGES.PARTNER_MANAGER);

const manager = resolveAdvisorCompensationStage({ role: 'manager' });
assert.equal(manager.stage, ADVISOR_COMPENSATION_STAGES.PARTNER_MANAGER);

const unknownRole = resolveAdvisorCompensationStage({ role: 'unknown' });
assert.equal(unknownRole.stage, ADVISOR_COMPENSATION_STAGES.UNKNOWN);
assert.equal(unknownRole.unknownDefaultsToAdvisor, false);

const development = resolveAdvisorCompensationStage({ role: 'advisor', careerMonth: 9 });
assert.equal(development.stage, ADVISOR_COMPENSATION_STAGES.DEVELOPMENT_MONTH_1_12);
assert.equal(development.stageCalculatesBonus, false);

const professional = resolveAdvisorCompensationStage({ role: 'advisor', careerMonth: 13 });
assert.equal(professional.stage, ADVISOR_COMPENSATION_STAGES.NEW_PROFESSIONAL_MONTH_13_PLUS);

console.log('PASS advisor-compensation-stage-test');
