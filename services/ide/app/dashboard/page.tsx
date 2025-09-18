'use client';
import { useEffect, useMemo, useRef, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://api.lvh.me";
const PREVIEW_BASE = process.env.NEXT_PUBLIC_PREVIEW_BASE || "http://preview.lvh.me";
const ORCH_BASE = process.env.NEXT_PUBLIC_ORCHESTRATOR_BASE || "http://orchestrator.lvh.me";

type PreviewRec = { id: string, url: string, createdAt: string, projectId: number|null };

export default function Dashboard(){
  const [token, setToken] = useState<string>("");
  const [projectId, setProjectId] = useState<number>(1);
  const [previews, setPreviews] = useState<PreviewRec[]>([]);
  const [streamText, setStreamText] = useState<string>("");
  const [running, setRunning] = useState<boolean>(false);
  const [health, setHealth] = useState<Record<string, boolean>>({});

  async function fetchToken(){
    const r = await fetch(`${API_BASE}/api/token`, { method:"POST" });
    const j = await r.json();
    setToken(j?.token || "");
  }
  async function listPreviews(){
    const r = await fetch(`${PREVIEW_BASE}/previews`);
    const j = await r.json();
    setPreviews(j.previews || []);
  }
  async function createPreview(){
    const r = await fetch(`${PREVIEW_BASE}/previews`, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ projectId }) });
    const j = await r.json();
    await listPreviews();
    return j;
  }
  async function runAgents(){
    setRunning(true);
    const r = await fetch(`${ORCH_BASE}/runs`, { method:"POST", headers:{ "Authorization": token ? `Bearer ${token}` : "" }, body: "{}" });
    const run = await r.json();
    const es = new EventSource(`${ORCH_BASE}/runs/${run.id}/stream`);
    es.onmessage = (ev)=> setStreamText((t)=> t + ev.data + "\\n");
    es.onerror = ()=> { es.close(); setRunning(false); };
  }

  async function checkHealth(){
    const keys = { api: `${API_BASE}/health`, preview: `${PREVIEW_BASE}/health`, orchestrator: `${ORCH_BASE}/health` };
    const entries = await Promise.all(Object.entries(keys).map(async ([k,u])=>{
      try { const r = await fetch(u); return [k, r.ok]; } catch { return [k, false]; }
    }));
    setHealth(Object.fromEntries(entries));
  }

  useEffect(()=>{ fetchToken(); listPreviews(); checkHealth(); }, []);

  return (
    <div style={{display:"grid", gridTemplateRows:"64px 1fr", minHeight:"100vh", position:"relative", zIndex:1}}>
      <header style={{display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 16px", borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
        <div style={{display:"flex", alignItems:"center", gap:12}}>
          <div style={{width:10, height:10, borderRadius:9999, background:"linear-gradient(45deg, #22C55E, #06B6D4)"}} />
          <b>Dashboard</b>
        </div>
        <div style={{display:"flex", gap:12}}>
          <span style={{opacity:0.8}}>Health:</span>
          {["api","orchestrator","preview"].map(k=>{
            const ok = health[k];
            return <span key={k} style={{padding:"4px 8px", borderRadius:8, background: ok ? "rgba(34,197,94,0.15)" : "rgba(244,63,94,0.15)", border:"1px solid rgba(255,255,255,0.08)"}}>{k}: {ok ? "ok" : "down"}</span>;
          })}
        </div>
      </header>

      <main style={{padding:16, display:"grid", gap:16, gridTemplateColumns:"repeat(12, 1fr)"}}>
        <section className="card" style={{gridColumn:"span 4", padding:16}}>
          <h3 style={{marginTop:0}}>Auth Token</h3>
          <p style={{color:"var(--muted)"}}>Use demo token to call the API and Orchestrator.</p>
          <div style={{display:"flex", gap:8}}>
            <button className="btn" onClick={fetchToken}>Mint Demo Token</button>
          </div>
          {token && <pre style={{whiteSpace:"pre-wrap", wordBreak:"break-all", marginTop:12, fontSize:12, opacity:0.8}}>{token}</pre>}
        </section>

        <section className="card" style={{gridColumn:"span 4", padding:16}}>
          <h3 style={{marginTop:0}}>Previews</h3>
          <p style={{color:"var(--muted)"}}>Ephemeral containers behind Traefik on <code>p-*.{process.env.NEXT_PUBLIC_BASE_DOMAIN || "lvh.me"}</code>.</p>
          <div style={{display:"flex", gap:8, alignItems:"center"}}>
            <label>Project ID</label>
            <input value={projectId} onChange={e=> setProjectId(Number(e.target.value||1))} style={{background:"#0e0e13", color:"var(--text)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:8, padding:"8px 10px", width:100}}/>
            <button className="btn" onClick={createPreview}>Create Preview</button>
            <button className="btn" onClick={listPreviews}>Refresh</button>
          </div>
          <ul style={{listStyle:"none", padding:0, marginTop:12, display:"grid", gap:8}}>
            {previews.map(p => (
              <li key={p.id} className="card" style={{padding:12, display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                <div>
                  <div style={{fontWeight:600}}>#{p.id}</div>
                  <div style={{opacity:0.75, fontSize:12}}>{new Date(p.createdAt).toLocaleString()}</div>
                </div>
                <a className="btn" href={p.url} target="_blank" rel="noreferrer">Open</a>
              </li>
            ))}
          </ul>
        </section>

        <section className="card" style={{gridColumn:"span 4", padding:16}}>
          <h3 style={{marginTop:0}}>Agent Run</h3>
          <p style={{color:"var(--muted)"}}>Kick off a run and stream logs via SSE.</p>
          <div style={{display:"flex", gap:8}}>
            <button className="btn" onClick={runAgents} disabled={running}>{running ? "Running..." : "Run Agents"}</button>
          </div>
          <pre style={{marginTop:12, maxHeight:260, overflow:"auto", fontSize:12}}>{streamText}</pre>
        </section>

        <section className="card" style={{gridColumn:"span 12", padding:16, borderImage:"linear-gradient(90deg, #7C3AED, #06B6D4, #22C55E) 1"}}>
          <h3 style={{marginTop:0}}>Colorful Status</h3>
          <div style={{display:"grid", gridTemplateColumns:"repeat(6, 1fr)", gap:12}}>
            {["Build","Test","Preview","Deploy","Usage","Latency"].map((k,i)=> (
              <div key={k} className="card" style={{padding:16, border:`1px solid rgba(255,255,255,0.08)`}}>
                <div style={{fontSize:12, color:"var(--muted)"}}>{k}</div>
                <div style={{fontSize:28, fontWeight:700, background: i%2===0 ? "linear-gradient(45deg, #7C3AED, #06B6D4)" : "linear-gradient(45deg, #22C55E, #7C3AED)", WebkitBackgroundClip:"text", color:"transparent"}}>{Math.round(Math.random()*100)}%</div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
