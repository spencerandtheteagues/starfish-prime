import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function Home() {
  const [token, setToken] = useState('');
  const [log, setLog] = useState([]);

  const push = (m) => setLog((l) => [...l, m]);

  async function getToken() {
    const r = await fetch(`${API}/auth/token`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ userId: 'demo-user' })
    });
    const j = await r.json();
    setToken(j.token);
    push('Token minted');
  }

  async function callDemo() {
    const r = await fetch(`${API}/api/demo`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    push(`Demo: ${r.status}`);
  }

  function startSSE() {
    const es = new EventSource(`${API}/api/stream?token=${encodeURIComponent(token)}`);
    es.onmessage = (e) => push(`SSE: ${e.data}`);
    es.addEventListener('done', () => es.close());
  }

  return (
    <main style={{display:'grid',placeItems:'center',minHeight:'100vh',background:'#0b0d12',color:'#e6edf6',fontFamily:'system-ui'}}>
      <div style={{maxWidth:640,padding:24}}>
        <h1 style={{fontSize:28,marginBottom:8}}>One-Shot App</h1>
        <p style={{opacity:.8}}>Mint a token, hit the protected endpoint, then stream SSE.</p>
        <div style={{display:'flex',gap:8,marginTop:16,flexWrap:'wrap'}}>
          <button onClick={getToken}>Get Token</button>
          <button onClick={callDemo} disabled={!token}>Call /api/demo</button>
          <button onClick={startSSE} disabled={!token}>Start SSE</button>
        </div>
        <pre style={{marginTop:16,whiteSpace:'pre-wrap',background:'#111723',padding:12,borderRadius:8,minHeight:120}}>
{log.map((l,i)=><div key={i}>{l}</div>)}
        </pre>
        <small style={{opacity:.6}}>API: {API}</small>
      </div>
    </main>
  );
}
