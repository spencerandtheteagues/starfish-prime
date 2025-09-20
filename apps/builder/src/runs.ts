import { mkdir, writeFile } from 'node:fs/promises'; import { join } from 'node:path'; import type { Prompt } from './schema.js'; import { planFromPrompt } from './planner.js'; import { bus } from './events.js'; import { createRun } from './runmgr.js'; import { scaffold_app } from './scaffolder_runner.js'; import { pushAndPR } from './github.js'; import { execa } from 'execa'; import { autoFix } from './fixer.js';
export async function startRun(rootDir: string, p: Prompt, scaffold=false, useSpecKit=false) {
  const run = createRun(); const runId = run.id; const runDir = join(rootDir, runId); await mkdir(runDir, { recursive: true });
  const emit=(kind:any,step:any,message:string,data?:any)=>bus.emit('evt',{ ts:Date.now(), runId, kind, step, message, data });
  try{
    emit('status','planner','Planning'); const plan = await planFromPrompt(p); await writeFile(join(runDir,'plan.json'), JSON.stringify(plan,null,2)); emit('artifact','planner','Plan ready',{ plan });
    if (scaffold) { emit('status','scaffolder','Scaffolding + CRUD'); const appDir = await scaffold_app(runDir, plan); emit('artifact','scaffolder','Repo scaffolded',{ path: appDir }); }
    if (useSpecKit && process.env.SPEC_KIT_CMD){
      emit('status','coder','Running Spec Kit validation');
      try {
        const [cmd, ...args] = process.env.SPEC_KIT_CMD.split(' ');
        const child = execa(cmd, args, {
          cwd: join(runDir,'app'),
          all: true,
          env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' }
        });
        child.all?.on('data',(b)=> emit('log','coder', b.toString()));
        const result = await child;
        emit('status','coder',`Spec Kit validation completed (exit code: ${result.exitCode})`);
        if (result.exitCode !== 0) {
          emit('log','coder',`Spec Kit validation failed with exit code ${result.exitCode}`);
        }
      } catch (error: any) {
        emit('log','coder',`Spec Kit validation failed: ${error.message}`);
        emit('status','coder','Spec Kit validation failed - continuing with build');
      }
    }
    const maxIters = Number(process.env.AUTO_FIX_MAX||'2'); await autoFix(join(runDir,'app'), maxIters, (k,s,m,d)=>emit(k,s,m,d));
    emit('status',undefined,'Run complete');
  }catch(e:any){ emit('status',undefined,`Run failed: ${e?.message||e}`); }
  return { runId };
}
export async function pushRun(rootDir:string, runId:string){
  const dir = join(rootDir, runId, 'app'); const url = await pushAndPR(dir, `builder/${runId}`, `Builder: ${runId}`);
  bus.emit('evt', { ts: Date.now(), runId, kind: 'artifact', step: 'integrator', message: 'Opened PR', data: { url } });
  return { url };
}
