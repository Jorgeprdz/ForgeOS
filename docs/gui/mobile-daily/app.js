const SUPABASE_URL = 'https://rgcolnioakzrdtsxwscp.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

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

    renderResults(data);
  } catch (e) {
    error.textContent = e.message;
    error.classList.remove('hidden');
  } finally {
    loading.classList.add('hidden');
  }
});

function renderResults(data) {
  const results = document.getElementById('results');
  const metaInfo = document.getElementById('metaInfo');
  const candidatesList = document.getElementById('candidatesList');
  const unknownsList = document.getElementById('unknownsList');
  const rawJson = document.getElementById('rawJson');

  metaInfo.innerHTML = `
    <p>Version: ${data.function_version}</p>
    <p>Model: ${data.summary.model_version}</p>
    <p>Count: ${data.summary.candidate_count}</p>
  `;

  candidatesList.innerHTML = data.candidates.map(c => `
    <div class="candidate-card">
      <p><strong>${c.type}</strong> (${c.id})</p>
      <p>Action: ${c.action} | Owner: ${c.owner}</p>
      <p>Due: ${c.due} | Quality: ${c.quality}</p>
      <p>Confidence: ${c.confidence}</p>
      <p>Evidence: <em>${c.evidence_span}</em></p>
    </div>
  `).join('');

  unknownsList.innerHTML = data.unknowns.length ? `<p>Unknowns: ${data.unknowns.join(', ')}</p>` : '';
  rawJson.textContent = JSON.stringify(data, null, 2);
  results.classList.remove('hidden');
}
