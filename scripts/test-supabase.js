require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function main() {
  const eventId = 'd1d6ffa2-6893-4f39-b259-cd62e7e6ed82';

  const { data, error } = await supabase
    .from('forge_outputs')
    .insert({
      event_id: eventId,

      owner: 'prospect',
      ownership_confidence: 0.95,

      waiting_state: 'waiting',
      advancement_state: 'advanced',

      recommendation:
        'Do not follow up before Friday. Prospect owns the next action.',

      evidence_used: [
        'conversation_occurred',
        'commitment_established'
      ],

      unknowns: [],

      runtime_confidence: 0.92
    })
    .select();

  if (error) {
    console.error('❌ Error:');
    console.error(error);
    process.exit(1);
  }

  console.log('✅ Forge output inserted:');
  console.log(JSON.stringify(data, null, 2));
}

main();
