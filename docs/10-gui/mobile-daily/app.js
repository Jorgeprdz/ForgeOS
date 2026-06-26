const CONFIG = window.__FORGE_MOBILE_DAILY_CONFIG__ || {};
const SUPABASE_URL = CONFIG.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = CONFIG.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

function assertConfiguredSupabase() {
  if (
    SUPABASE_URL === 'YOUR_SUPABASE_URL' ||
    SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY'
  ) {
    throw new Error('Configure window.__FORGE_MOBILE_DAILY_CONFIG__ with Supabase URL and anon key before using this demo.');
  }
}

let currentCandidates = [];
let timelineEvents = [];
let filterState = 'All';

document.getElementById('testNoteBtn').addEventListener('click', () => {
  document.getElementById('noteText').value = "Después de la llamada con Adry, quedamos en que mañana le paso tres opciones de retiro para que las compare con su esposo.";
});

document.getElementById('processBtn').addEventListener('click', async () => {
  const note = document.getElementById('noteText').value;
  const prospect = document.getElementById('prospectAlias').value || 'Unknown Prospect';
  const loading = document.getElementById('loading');
  const results = document.getElementById('results');
  const error = document.getElementById('error');

  loading.classList.remove('hidden');
  results.classList.add('hidden');
  error.classList.add('hidden');

  try {
    assertConfiguredSupabase();

    const response = await fetch(`${SUPABASE_URL}/functions/v1/semantic-extract`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({ note })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error processing');

    currentCandidates = data.candidates.map(c => ({ 
      ...c, 
      status: 'proposed', 
      audit: null, 
      prospect,
      timestamp: new Date().toISOString()
    }));
    renderResults(data);
  } catch (e) {
    error.textContent = e.message;
    error.classList.remove('hidden');
  } finally {
    loading.classList.add('hidden');
  }
});

function getProcessStatus(owner, type) {
  if (type === 'conversation_occurred') {
    return {
      state: 'INFORMATIONAL',
      chip: '⚪',
      action: 'No process action required',
      nextAction: 'No process action required',
      rationale: 'Conversation events provide context only.'
    };
  }

  if (type === 'commitment_established' && owner === 'advisor') {
    return {
      state: 'ACTION_REQUIRED',
      chip: '🟢',
      action: 'Execute commitment',
      nextAction: 'Execute commitment',
      rationale: 'Advisor owns the next action.'
    };
  }

  if (type === 'commitment_established' && owner === 'prospect') {
    return {
      state: 'WAITING',
      chip: '🟡',
      action: 'Await prospect response',
      nextAction: 'Await prospect response',
      rationale: 'Prospect owns the next action.'
    };
  }

  return {
    state: 'HUMAN_REVIEW',
    chip: '🔵',
    action: 'Clarify ownership',
    nextAction: 'Clarify ownership',
    rationale: 'Ownership is unknown or event type requires review.'
  };
}

function getTruthStatus(status) {
  if (status === 'accepted') return { state: "ELIGIBLE_FOR_RESOLUTION", chip: "🟢", corroboration: "human" };
  return { state: "UNRESOLVED", chip: "⚪", corroboration: "none" };
}

function acceptCandidate(id) {
  updateCandidateState(id, 'accepted', { actor: 'advisor', timestamp: new Date().toISOString(), reason: 'Manual acceptance' });
}

function rejectCandidate(id) {
  const reason = prompt("Enter rejection reason:");
  if (reason) {
    updateCandidateState(id, 'rejected', { actor: 'advisor', timestamp: new Date().toISOString(), reason });
  }
}

function updateCandidateState(id, status, audit) {
  const candidate = currentCandidates.find(c => c.id === id);
  candidate.status = status;
  candidate.audit = audit;
  
  if (status === 'accepted') {
    timelineEvents.unshift({ ...candidate, processState: getProcessStatus(candidate.owner, candidate.type).state });
  }
  
  renderCandidates();
  renderTimeline();
}

function filterTimeline(filter) {
  filterState = filter;
  renderTimeline();
}

document.getElementById('timelineSearch').addEventListener('input', renderTimeline);

function renderCandidates() {
  const candidatesList = document.getElementById('candidatesList');
  candidatesList.innerHTML = currentCandidates.map(c => {
    const process = getProcessStatus(c.owner, c.type);
    const truth = getTruthStatus(c.status);
    
    return `
      <div class="candidate-card ${c.status === 'accepted' ? 'status-accepted' : c.status === 'rejected' ? 'status-rejected' : ''}">
        <span class="status-chip status-${c.status}">${c.status.toUpperCase()}</span>
        
        ${c.status === 'accepted' ? `
          <div class="process-panel">
            <span class="process-chip">${process.chip} ${process.state}</span>
            <p><strong>Owner:</strong> ${c.owner}</p>
            <p><strong>Next Action:</strong> ${process.action}</p>
            <p><strong>Rationale:</strong> Based on commitment ownership.</p>
            <div class="explanation-panel">Owner of the decision may differ from owner of the process.</div>
          </div>
        ` : `
          <p><em>Semantic evidence only. Awaiting human adjudication.</em></p>
        `}

        <div class="truth-panel">
          <span class="process-chip">${truth.chip} ${truth.state}</span>
          <p><strong>Corroboration:</strong> ${truth.corroboration}</p>
          <p><strong>Evidence Span Integrity:</strong> ${c.evidence_span ? '✅ Valid' : '❌ Invalid'}</p>
          <p><strong>Evidence Source:</strong> ${c.source}</p>
        </div>

        <p><strong>${c.type}</strong> (${c.id})</p>
        <p>Action: ${c.action} | Due: ${c.due} | Quality: ${c.quality}</p>
        <p>Confidence: ${c.confidence} | Evidence: <em>${c.evidence_span}</em></p>
        
        ${c.status === 'proposed' ? `
          <div class="button-group">
            <button class="action-btn accept-btn" onclick="acceptCandidate('${c.id}')">Accept</button>
            <button class="action-btn reject-btn" onclick="rejectCandidate('${c.id}')">Reject</button>
          </div>
        ` : c.status === 'accepted' || c.status === 'rejected' ? `
          <div class="audit-trail">
            Status: ${c.status}<br>
            Actor: ${c.audit.actor}<br>
            Timestamp: ${c.audit.timestamp}<br>
            Reason: ${c.audit.reason}
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

function renderTimeline() {
  const list = document.getElementById('timelineList');
  const summary = document.getElementById('timelineSummary');
  const searchInput = document.getElementById('timelineSearch');
  const search = (searchInput && searchInput.value) ? searchInput.value.toLowerCase() : '';
  
  let filtered = timelineEvents.filter(e => {
    const matchesFilter = filterState === 'All' || 
                          (filterState === 'Accepted' && e.status === 'accepted') ||
                          (filterState === 'Rejected' && e.status === 'rejected') ||
                          (filterState === 'Waiting' && e.processState === 'WAITING') ||
                          (filterState === 'Action Required' && e.processState === 'ACTION_REQUIRED');
                          
    const prospect = e.prospect || '';
    const action = e.action || '';
    const matchesSearch = prospect.toLowerCase().includes(search) || action.toLowerCase().includes(search);
    
    return matchesFilter && matchesSearch;
  });

  list.innerHTML = filtered.map(e => `
    <div class="timeline-card">
      <p><strong>${e.prospect || 'Unknown'}</strong> - ${new Date(e.timestamp).toLocaleString()}</p>
      <p>Action: ${e.action || 'No action specified'}</p>
      <p>Type: ${e.type || 'N/A'} | Owner: ${e.owner || 'Unknown'} | Due: ${e.due || 'N/A'}</p>
      <p>Process: ${e.processState || 'N/A'} | Truth: ${e.status || 'N/A'}</p>
    </div>
  `).join('');

  summary.innerHTML = `
    <p>Total Events: ${timelineEvents.length}</p>
    <p>Open Commitments: ${timelineEvents.filter(e => e.status === 'accepted' && e.type === 'commitment_established').length}</p>
    <p>Waiting States: ${timelineEvents.filter(e => e.processState === 'WAITING').length}</p>
    <p>Advisor Actions Required: ${timelineEvents.filter(e => e.processState === 'ACTION_REQUIRED').length}</p>
  `;
}

function renderResults(data) {
  const results = document.getElementById('results');
  const metaInfo = document.getElementById('metaInfo');
  const unknownsList = document.getElementById('unknownsList');
  const rawJson = document.getElementById('rawJson');

  metaInfo.innerHTML = `
    <p>Version: ${data.function_version}</p>
    <p>Model: ${data.summary.model_version}</p>
    <p>Count: ${data.summary.candidate_count}</p>
  `;

  renderCandidates();
  unknownsList.innerHTML = data.unknowns.length ? `<p>Unknowns: ${data.unknowns.join(', ')}</p>` : '';
  rawJson.textContent = JSON.stringify(data, null, 2);
  
  // Clean up previous invariant if it exists
  const existingInv = results.querySelector('.constitutional-invariant');
  if (existingInv) existingInv.remove();

  const inv = document.createElement('div');
  inv.className = 'constitutional-invariant';
  inv.textContent = '"Semantic interpretation may expand what Forge notices. It must never expand what Forge claims to know."';
  results.appendChild(inv);
  
  results.classList.remove('hidden');
}
