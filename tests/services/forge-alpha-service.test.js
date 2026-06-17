// tests/services/forge-alpha-service.test.js
const assert = require('assert');

// Mock SupabaseRuntime before requiring the service
const mockSupabase = {
    from: () => ({
        insert: () => ({
            select: () => ({
                single: async () => ({ data: { id: 'mocked-id' }, error: null })
            })
        })
    })
};

// Manually setup the mock in the cache for the require
require.cache[require.resolve('../../supabase-runtime')] = {
    exports: { default: mockSupabase }
};

const { processNote } = require('../../src/services/forge-alpha-service');

async function testCases() {
  const cases = [
    {
      name: 'Lariza',
      prospectId: 'lariza-id',
      note: 'Need to refine proposal to match prospect risk-tolerance.'
    },
    {
      name: 'Claudia Sánchez',
      prospectId: 'claudia-id',
      note: 'Claudia requested policy document.'
    },
    {
      name: 'Marlene',
      prospectId: 'marlene-id',
      note: 'Marlene said she will review the proposal and call me back by Friday.'
    },
    {
      name: 'Ricardo Mejía',
      prospectId: 'ricardo-id',
      note: 'Medical exam scheduled for Tuesday.'
    },
    {
      name: 'Octavio',
      prospectId: 'octavio-id',
      note: 'Octavio needs clarification on the retirement plan.'
    },
    {
      name: 'Adry',
      prospectId: 'adry-id',
      note: 'Adry submitted payment.'
    }
  ];

  for (const c of cases) {
    console.log(`Running test: ${c.name}`);
    const result = await processNote({ prospectId: c.prospectId, note: c.note });
    
    // Validate persistence succeeded
    assert(result.eventId, 'Missing eventId');
    assert(result.outputId, 'Missing outputId');
    
    // Validate other fields
    assert(result.owner, `Missing owner for ${c.name}`);
    assert(result.waiting_state, `Missing waiting_state for ${c.name}`);
    assert(result.advancement_state, `Missing advancement_state for ${c.name}`);
    
    console.log(`Test ${c.name} passed`);
  }
}

testCases().catch(err => {
  console.error('Test failed', err);
  process.exit(1);
});
