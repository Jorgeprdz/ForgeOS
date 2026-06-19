// src/services/forge-alpha-service.js
const ForgeAlphaRuntime = require('../intelligence/alpha-runtime/forge-alpha-runtime');
const repository = require('./forge-alpha-repository');

const runtime = new ForgeAlphaRuntime();

async function processNote({ prospectId, advisorId = null, note }) {
  // 1. Validate input.
  if (!prospectId || !note) {
    throw new Error('prospectId and note are required');
  }

  if (!advisorId) {
    throw new Error('advisorId is required for Supabase Alpha persistence');
  }

  // 2-5. Execute Runtime.
  // The runtime.process() executes extraction, ownership, waiting, and advancement engines.
  const runtimeResult = runtime.process(note);

  // 6. Persist alpha_event.
  const alphaEvent = await repository.saveEvent(prospectId, note, runtimeResult.extracted_events, advisorId);

  // 7. Persist forge_output.
  const forgeOutput = await repository.saveOutput(alphaEvent.id, runtimeResult, advisorId);

  // 8. Return runtime result.
  return {
    eventId: alphaEvent.id,
    outputId: forgeOutput.id,
    ...runtimeResult
  };
}

module.exports = { processNote };
