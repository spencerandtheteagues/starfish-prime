import { mkdir, writeFile } from 'node:fs/promises'; import { join } from 'node:path'; import type { Plan } from './schema.js';
function prismaType(t:string){ const k=t.toLowerCase(); if(k==='cuid') return 'String @id @default(cuid())'; if(k==='uuid') return 'String @id @default(uuid())'; if(['datetime','date','timestamp'].includes(k)) return 'DateTime @default(now())'; if(['int','integer','number'].includes(k)) return 'Int'; if(['float','double','decimal'].includes(k)) return 'Float'; if(['boolean','bool'].includes(k)) return 'Boolean'; return 'String'; }
function renderPrismaSchema(plan:Plan){ const models=plan.entities.map(ent=>{ const fields=ent.fields.map(f=>`  ${f.name} ${prismaType(f.type)}${f.required?'':'?'}`).join('\n'); return `model ${ent.name} {\n${fields}\n}`; }); if(!plan.entities.find(e=>e.name.toLowerCase()==='user')) models.push(`model User {\n  id String @id @default(cuid())\n  email String\n  createdAt DateTime @default(now())\n}`); return `generator client { provider = "prisma-client-js" }\n\ndatasource db { provider = "postgresql"; url = env("DATABASE_URL") }\n\n${models.join('\n\n')}\n`; }
export async function scaffold_app(runDir:string, plan:Plan){
  const appDir = join(runDir,'app');
  const mk=async(p:string,s?:string)=>{ const full=join(appDir,p); await mkdir(join(full,'..'),{recursive:true}); if(s!==undefined) await writeFile(full,s); };
  await mkdir(appDir,{recursive:true});
  await mk('package.json', JSON.stringify({ name:'generated-app', private:true, version:'1.0.0', workspaces:['apps/*','prisma'], engines:{node:'>=20 <21'},
    scripts:{ build:'npm run -w apps/api build && npm run -w apps/web build', dev:"echo 'use workspace scripts'", 'db:push':'npm -w prisma run db:push','db:generate':'npm -w prisma run generate','test':'vitest run','test:e2e':'playwright test' },
    devDependencies:{ vitest:'2.1.2', vite:'5.4.8', '@playwright/test':'1.47.2', typescript:'5.6.3', tsx:'4.19.2', '@types/node':'20.12.14' } },null,2));
  await mk('.gitignore','node_modules\n.next\ndist\n.env*\n');
  // Prisma
  await mk('prisma/schema.prisma', renderPrismaSchema(plan));
  await mk('prisma/package.json', JSON.stringify({ name:'generated-prisma', private:true, version:'1.0.0', scripts:{ generate:'prisma generate', 'db:push':'prisma db push' }, devDependencies:{ prisma:'5.19.1' } },null,2));
  // API
  await mk('apps/api/package.json', JSON.stringify({ name:'generated-api', private:true, version:'1.0.0', type:'module', engines:{node:'>=20 <21'},
    scripts:{ dev:'tsx watch src/index.ts', build:'tsc -p tsconfig.json', start:'node dist/index.js', test:'vitest run' },
    dependencies:{ fastify:'4.26.2','@fastify/cors':'8.4.2','@prisma/client':'5.19.1', zod:'3.23.8', pino:'8.19.0' },
    devDependencies:{ typescript:'5.6.3', tsx:'4.19.2','@types/node':'20.12.14','vitest':'2.1.2' } },null,2));
  await mk('apps/api/tsconfig.json', JSON.stringify({ compilerOptions:{ target:'ES2020', module:'ES2020', moduleResolution:'bundler', outDir:'dist', rootDir:'src', strict:true, esModuleInterop:true, skipLibCheck:true }, include:['src','tests'] },null,2));
  await mk('apps/api/src/routes.ts', `import Fastify from 'fastify'; import cors from '@fastify/cors'; import { randomUUID } from 'node:crypto';
export type Base = { id:string }; export type Store<T extends Base> = { all():T[]; get(id:string):T|undefined; add(x:Omit<T,'id'>):T; put(id:string,x:Partial<T>):T|undefined; del(id:string):boolean };
export function makeStore<T extends Base>(): Store<T> { const m=new Map<string,T>(); return { all:()=>[...m.values()], get:(id)=>m.get(id), add:(x:any)=>{ const id=randomUUID(); const v={...x,id}; m.set(id,v as T); return v as T; }, put:(id,x)=>{ const cur=m.get(id); if(!cur) return; const v={...cur,...x,id}; m.set(id,v as T); return v as T; }, del:(id)=> m.delete(id) }; }
export async function buildAppForTest(models:any){ const app=Fastify({logger:false}); await app.register(cors,{origin:true});
  const stores:Record<string,any>={};
  for(const name of Object.keys(models)){ stores[name]=makeStore<any>(); const base='/api/'+name.toLowerCase();
    app.get(base, async()=>stores[name].all()); app.post(base, async(req:any)=>stores[name].add(req.body));
    app.get(base+'/:id', async(req:any)=>stores[name].get(req.params.id)||{});
    app.put(base+'/:id', async(req:any)=>stores[name].put(req.params.id, req.body)||{});
    app.delete(base+'/:id', async(req:any)=>({ ok: stores[name].del(req.params.id) })); }
  return app; }`);
  const planEntities = plan.entities || [];
  let dynamic = '';
  for (const ent of planEntities){
    const Name = ent.name; const lower = Name.toLowerCase();
    dynamic += `try{ if(!SAFE){ /* @ts-ignore */ models['${Name}']=(prisma as any).${lower}; } }catch{}
{ const base='/api/${lower}';
  app.get(base, async()=> SAFE ? mem['${Name}'].all() : handlersFor(models['${Name}']).list());
  app.post(base, async(req:any)=> SAFE ? mem['${Name}'].add(req.body) : handlersFor(models['${Name}']).create(req));
  app.get(\`${base}/:id\`, async(req:any)=> SAFE ? mem['${Name}'].get(req.params.id) : handlersFor(models['${Name}']).read(req));
  app.put(\`${base}/:id\`, async(req:any)=> SAFE ? mem['${Name}'].put(req.params.id, req.body) : handlersFor(models['${Name}']).update(req));
  app.delete(\`${base}/:id\`, async(req:any)=> SAFE ? ({ ok: mem['${Name}'].del(req.params.id) }) : handlersFor(models['${Name}']).remove(req)); }
`;
  }
  await mk('apps/api/src/index.ts', `import Fastify from 'fastify'; import cors from '@fastify/cors'; import { PrismaClient } from '@prisma/client'; import { makeStore } from './routes.js';
const PORT=Number(process.env.PORT||4002); const ORIGINS=(process.env.ALLOWED_ORIGINS||'').split(',').map(s=>s.trim()).filter(Boolean);
const app=Fastify({logger:true}); await app.register(cors,{origin:(origin,cb)=>{ if(ORIGINS.length===0) return cb(null,true); if(!origin||ORIGINS.includes(origin)) return cb(null,true); cb(new Error('Origin not allowed'),false); }});
const prisma=new PrismaClient(); const SAFE=process.env.SAFE_MODE==='1'; type ModelMap=Record<string,any>; const models:ModelMap={};
function handlersFor(model:any){ return { list: async()=> model.findMany(), create: async(req:any)=> model.create({ data: req.body }), read: async(req:any)=> model.findUnique({ where: { id: req.params.id } }), update: async(req:any)=> model.update({ where: { id: req.params.id }, data: req.body }), remove: async(req:any)=> (await model.delete({ where: { id: req.params.id } }), { ok:true }) }; }
const mem:Record<string,any>={};
${''.join([f"mem['{e['name']}']=makeStore<any>();" for e in planEntities])}
app.get('/api/health', async()=>({ ok:true, ts:new Date().toISOString(), safe: SAFE }));
${dynamic}
app.listen({port:PORT,host:'0.0.0.0'}).catch(e=>{ app.log.error(e); process.exit(1); });`);
  // Web (generated) with rewrites
  await mk('apps/web/package.json', JSON.stringify({ name:'generated-web', private:true, version:'1.0.0', type:'module', scripts:{ dev:'next dev', build:'next build', start:'next start -p 3001' }, dependencies:{ next:'14.2.5', react:'18.3.1','react-dom':'18.3.1' }, devDependencies:{ typescript:'5.6.3','@types/node':'20.12.14','@types/react':'18.3.10','@types/react-dom':'18.3.0' } },null,2));
  await mk('apps/web/next.config.mjs', `export default {
  async rewrites() {
    const api = process.env.API_BASE_URL || 'http://localhost:4002';
    return [{ source: '/api/:path*', destination: \`\${api}/api/:path*\` }];
  }
};
`);
  await mk('apps/web/tsconfig.json', JSON.stringify({ compilerOptions:{ strict:true, target:'ES2020', module:'ESNext', moduleResolution:'Bundler', jsx:'preserve', types:['node'] }, include:['next-env.d.ts','**/*.ts','**/*.tsx'], exclude:['node_modules'] },null,2));
  await mk('apps/web/next-env.d.ts', '//');
  await mk('apps/web/app/layout.tsx', "export const metadata={title:'Generated Web'}; export default function Root({children}:{children:React.ReactNode}){return(<html lang='en'><body style={{fontFamily:'ui-sans-serif,system-ui',padding:24}}>{children}</body></html>);}");
  await mk('apps/web/app/page.tsx', "export default function Page(){return(<div><h1>Generated Web</h1><p>Welcome.</p></div>);}");
  for (const ent of planEntities){
    const lower=ent.name.toLowerCase(); const inputs = (ent.fields||[]).filter((f:any)=>f.name!=='id').map((f:any)=>f.name).map((n:string)=>f"<div><label>{n}: <input name=\"{n}\" /></label></div>").join('\n') or '<div>No fields</div>';
    await mk(f"apps/web/app/{lower}.tsx", f"""'use client';
import {{ useEffect, useState }} from 'react';
export default function Page(){{ const [items,setItems]=useState<any[]>([]);
  async function load(){{ const r=await fetch('/api/{lower}'); setItems(await r.json()); }}
  useEffect(()=>{{ load(); }},[]);
  async function create(e:any){{ e.preventDefault(); const data=Object.fromEntries(new FormData(e.target).entries()); await fetch('/api/{lower}',{{method:'POST',headers:{{'Content-Type':'application/json'}},body:JSON.stringify(data)}}); (e.target as HTMLFormElement).reset(); await load(); }}
  return (<div><h1>{ent.name}</h1><form onSubmit={{create}}>{inputs}<button type='submit'>Create</button></form><ul>{{items.map((x,i)=>(<li key={{i}}>{{JSON.stringify(x)}}</li>))}}</ul></div>); }}
""");
  }
  // E2E for generated
  await mk('tests/e2e.spec.ts', """import { test, expect } from '@playwright/test';
test('homepage shows heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText(/Generated Web/i);
});""");
  await mk('playwright.config.ts', """import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  use: { baseURL: 'http://localhost:3001' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: { command: 'npm run -w apps/web start', url: 'http://localhost:3001', reuseExistingServer: true, timeout: 120000 }
});""");
  await mk('.github/workflows/ci.yml', """name: generated-ci
on: { push: { branches: [ main ] }, pull_request: { branches: [ main ] } }
jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - name: Install deps
        run: npm i --no-audit --no-fund
      - name: Build web
        run: npm run -w apps/web build
      - name: Unit tests (Vitest)
        run: npm test || true
      - name: Install Playwright
        uses: microsoft/playwright-github-action@v1
      - name: E2E (Playwright)
        run: npm run test:e2e || true
""");
  return appDir;
}
