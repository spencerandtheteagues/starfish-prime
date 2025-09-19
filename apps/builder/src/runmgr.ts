import { randomUUID } from 'node:crypto';
type RunState = { id: string; canceled: boolean; messages: string[]; };
const runs = new Map<string, RunState>();
export function createRun(): RunState { const id=randomUUID(); const st={ id, canceled:false, messages:[] }; runs.set(id, st); return st; }
export function getRun(id:string){ return runs.get(id); }
export function pushMsg(id:string, msg:string){ const r=runs.get(id); if(r) r.messages.push(msg); }
export function cancelRun(id:string){ const r=runs.get(id); if(r) r.canceled=true; }
