'use client';
import { signIn } from "next-auth/react";

export default function Login(){
  return (
    <div style={{display:'grid',placeItems:'center',height:'100vh'}}>
      <div style={{padding:24,border:'1px solid #eee',borderRadius:12}}>
        <h2>Sign in</h2>
        <button onClick={()=> signIn('github')}>GitHub</button>
        <button onClick={()=> signIn('google')} style={{marginLeft:8}}>Google</button>
      </div>
    </div>
  );
}
