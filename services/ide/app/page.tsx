'use client';
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const r = useRouter();
  return (
    <div style={{display:"grid", gridTemplateRows:"64px 1fr", minHeight:"100vh", position:"relative", zIndex:1}}>
      <header style={{display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 16px", borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
        <div style={{display:"flex", alignItems:"center", gap:12}}>
          <div style={{width:10, height:10, borderRadius:9999, background:"linear-gradient(45deg, #7C3AED, #06B6D4)"}} />
          <b>AI Platform</b>
        </div>
        <nav style={{display:"flex", gap:12}}>
          <Link href="/dashboard">Dashboard</Link>
          <a href="http://api.lvh.me/health" target="_blank">API</a>
          <a href="http://orchestrator.lvh.me/health" target="_blank">Orchestrator</a>
          <a href="http://preview.lvh.me/health" target="_blank">Preview</a>
        </nav>
      </header>
      <main style={{display:"grid", placeItems:"center", padding:24}}>
        <div className="card" style={{padding:24, maxWidth:720, width:"100%"}}>
          <h1 style={{marginTop:0}}>Welcome to your <span className="accent">dark</span> and <span style={{color:"#06B6D4"}}>colorful</span> workspace</h1>
          <p style={{color:"var(--muted)"}}>Jump into the live dashboard to run agents, mint tokens, spawn previews, and stream logs.</p>
          <div style={{display:"flex", gap:12, marginTop:16}}>
            <Link className="btn" href="/dashboard">Open Dashboard</Link>
            <button className="btn" onClick={()=> r.push("/dashboard")}>Quick Start</button>
          </div>
        </div>
      </main>
    </div>
  );
}
