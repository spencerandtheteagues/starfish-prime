import { execa } from 'execa'; import { join } from 'node:path'; import { writeFile, mkdir, readFile } from 'node:fs/promises'; import OpenAI from 'openai'; import { bus } from './events.js';
type Emit = (kind:string, step:string, message:string, data?:any)=>void;
async function run(cmd:string, args:string[], cwd:string, emit:Emit){ const child=execa(cmd,args,{cwd,all:true}); child.all?.on('data',b=>emit('log','tester',b.toString())); try{ await child; return { ok:true, out:'' }; }catch(e:any){ return { ok:false, out:String(e.all||e.stderr||e.stdout||e.message) }; } }
function openaiClient(){ const key=process.env.OPENAI_API_KEY; if(!key) return null; return new OpenAI({ apiKey: key }); }
async function proposePatches(prompt:string){ const client=openaiClient(); if(!client) return null;
  const sys = `You are a senior software engineer. Return ONLY JSON: {"files":[{"path":"relative/path.ts","content":"<entire new file content>"}]}. No markdown, no backticks.`;
  const msgs=[{role:"system",content:sys as any},{role:"user",content:prompt as any}];
  const resp=await client.chat.completions.create({ model:'gpt-4o-mini', temperature:0.2, messages: msgs, response_format:{type:'json_object'} });
  try{ return JSON.parse(resp.choices[0]?.message?.content||'{}'); }catch{ return null; }
}
async function applyPatches(repo:string, patches:any, emit:Emit){ if(!patches?.files?.length) return 0; let n=0; for(const f of patches.files){ const full=join(repo,f.path); await mkdir(join(full,'..'),{recursive:true}); await writeFile(full,f.content,'utf8'); n++; emit('log','tester',`patched: ${f.path}`); } return n; }
export async function autoFix(repo:string, iterations:number, emit:Emit){
  if(process.env.AUTO_FIX!=='1') return;
  emit('status','tester',`Auto-fix enabled (max ${iterations})`);
  for(let i=0;i<iterations;i++){
    emit('status','tester',`Iteration ${i+1}: installing deps`);
    let r=await run('npm',['i','--no-audit','--no-fund'],repo,emit); if(!r.ok){ emit('status','tester','npm install failed; aborting'); return; }
    emit('status','tester','Building web'); r=await run('npm',['run','-w','apps/web','build'],repo,emit); if(!r.ok){ /* continue with patch */ }
    emit('status','tester','Unit tests'); r=await run('npm',['test'],repo,emit); const unitOk=r.ok;
    emit('status','tester','E2E tests'); r=await run('npm',['run','test:e2e'],repo,emit); const e2eOk=r.ok;
    if(unitOk && e2eOk){ emit('status','tester','All tests passed — stopping auto-fix'); return; }
    const log = `Unit OK: ${unitOk}, E2E OK: ${e2eOk}. Please fix. Consider TypeScript build errors if any. The repo layout is monorepo with apps/api, apps/web, prisma.`;
    const pkg = await readFile(join(repo,'package.json'),'utf8');
    const prompt = `We have a generated monorepo. Here is package.json at root:\n${pkg}\nFix tests/build using minimal edits. Return JSON with files.`;
    const patches = await proposePatches(prompt + "\n" + log);
    if(!patches){ emit('status','tester','No patches returned; stopping'); return; }
    const n = await applyPatches(repo, patches, emit);
    if(n===0){ emit('status','tester','No patches applied; stopping'); return; }
    await run('git',['add','.'],repo,emit);
    await run('git',['commit','-m',`fix: auto patch iteration ${i+1}`],repo,emit);
  }
  emit('status','tester','Reached max iterations; stopping');
}
