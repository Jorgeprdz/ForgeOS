const CONTRACT = 'FORGE_COMMERCIAL_GOAL_DIALOG_015';
const STYLE_ID = 'forge-commercial-goal-dialog-contract-015-style';

function installStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .commercial-goal-dialog-015__step[hidden]{display:none!important}
  `;
  document.head.append(style);
}

function patchDialog() {
  const layer = document.querySelector('[data-commercial-goal-layer-015]');
  if (!layer) return false;
  for (const name of ['targetMonthlyIncomeMxn', 'targetAnnualIncomeMxn']) {
    const input = layer.querySelector(`input[name="${name}"]`);
    if (!input) continue;
    input.step = '1';
    input.dataset.goalMoneyContract015 = 'true';
  }
  layer.dataset.goalDialogContract015 = CONTRACT;
  return true;
}

function patchAfterCurrentEvent() {
  patchDialog();
  queueMicrotask(patchDialog);
  window.setTimeout(patchDialog, 0);
}

installStyles();
patchDialog();

document.addEventListener('click', event => {
  if (!event.target?.closest?.('[data-commercial-goals-open],[data-goal-next],[data-goal-back]')) return;
  patchAfterCurrentEvent();
}, true);

window.addEventListener('pageshow', patchDialog);

globalThis.ForgeCommercialGoalDialogContract015 = Object.freeze({
  contract: CONTRACT,
  reconcile: patchDialog,
  diagnostics() {
    return Object.freeze({
      contract: CONTRACT,
      mutationObservers: 0,
      ownsGoalTruth: false,
      changesGoalPersistence: false,
      moneyStep: 1,
      hiddenStepContract: true,
    });
  },
});
