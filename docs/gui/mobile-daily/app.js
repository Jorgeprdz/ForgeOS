const SUPABASE_URL = 'https://rgcolnioakzrdtsxwscp.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

let currentCandidates = [];

document.getElementById('testNoteBtn').addEventListener('click', () => {
  document.getElementById('noteText').value = "Después de la llamada con Adry, quedamos en que mañana le paso tres opciones de retiro para que las compare con su esposo.";
});

document.getElementById('processBtn').addEventListener('click', async () => {
  const note = document.getElementById('noteText').value;
  const loading = document.getElementById('loading');
  const results = document.getElementById('results');
  const error = document.getElementById('error');

  loading.classList.remove('hidden');
  results.classList.add('hidden');
  error.classList.add('hidden');

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/semantic-extract`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ note })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error processing');

    currentCandidates = data.candidates.map(c => ({ ...c, status: 'proposed', audit: null }));
    renderResults(data);
  } catch (e) {
    error.textContent = e.message;
    error.classList.remove('hidden');
  } finally {
    loading.classList.add('hidden');
  }
});

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
  renderCandidates();
}

function renderCandidates() {
  const candidatesList = document.getElementById('candidatesList');
  candidatesList.innerHTML = currentCandidates.map(c => `
    <div class="candidate-card ${c.status === 'accepted' ? 'status-accepted' : c.status === 'rejected' ? 'status-rejected' : ''}">
      <span class="status-chip status-${c.status}">${c.status.toUpperCase()}</span>
      <p><strong>${c.type}</strong> (${c.id})</p>
      <p>Action: ${c.action} | Owner: ${c.owner}</p>
      <p>Due: ${c.due} | Quality: ${c.quality}</p>
      <p>Confidence: ${c.confidence}</p>
      <p>Evidence: <em>${c.evidence_span}</em></p>
      
      ${c.status === 'proposed' ? `
        <div class="button-group">
          <button class="action-btn accept-btn" onclick="acceptCandidate('${c.id}')">Accept</button>
          <button class="action-btn reject-btn" onclick="rejectCandidate('${c.id}')">Reject</button>
        </div>
      ` : `
        <div class="audit-trail">
          Status: ${c.status}<br>
          Actor: ${c.audit.actor}<br>
          Timestamp: ${c.audit.timestamp}<br>
          Reason: ${c.audit.reason}
        </div>
      `}
    </div>
  `).join('');
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
  results.classList.remove('hidden');
}
