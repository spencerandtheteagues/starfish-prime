import { Plan, PlanSchema, Prompt } from "./schema.js"; import OpenAI from "openai";
export function offlinePlan(prompt: string): Plan {
  const wants = prompt.toLowerCase(); const preset = wants.includes("ecommerce") ? "ecommerce" : wants.includes("crm") ? "crm" : wants.includes("blog") ? "blog" : "saas";
  const plan: Plan = { stack:{ frontend:"Next.js (App Router)", backend:"Fastify", orm:"Prisma", db:"Postgres (Neon)" },
    entities:[{ name:"User", fields:[{name:"id",type:"cuid",required:true},{name:"email",type:"string",required:true},{name:"createdAt",type:"datetime",required:true}]},{ name:"Thing", fields:[{name:"id",type:"cuid",required:true},{name:"name",type:"string",required:true}]}],
    pages:[{path:"/",purpose:"Home / dashboard"},{path:"/things",purpose:"Manage Things"}],
    apis:[{method:"GET",path:"/health",summary:"Service healthcheck"}], notes:`Preset guessed: ${preset}. Offline plan.` };
  return PlanSchema.parse(plan);
}
export async function modelPlan(openai: OpenAI, prompt: string): Promise<Plan> {
  const sys="You are a senior software architect. Output ONLY valid JSON matching the PlanSchema keys.";
  const user=`Create a minimal full-stack plan for: ${prompt}`;
  const resp=await openai.chat.completions.create({ model:"gpt-4o-mini", temperature:0.2, messages:[{role:"system",content:sys},{role:"user",content:user}], response_format:{type:"json_object"}});
  const content=resp.choices[0]?.message?.content ?? "{}"; try{ return PlanSchema.parse(JSON.parse(content)); }catch{ return offlinePlan(prompt); }
}
export async function planFromPrompt(p: Prompt): Promise<Plan> {
  const key=process.env.OPENAI_API_KEY; if(!key) return offlinePlan(p.prompt);
  const openai=new OpenAI({ apiKey:key }); return modelPlan(openai,p.prompt);
}
