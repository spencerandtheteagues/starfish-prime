import { completeJSON } from "../models.js";
import { tools } from "../tools.js";

export async function review({ projectId, token }){
  const files = [ "app/server.js", "app/test.spec.js" ];
  const ctx = await Promise.all(files.map(async p => ({ path: p, content: await tools.readFile(projectId, p, token).catch(()=> "") })));
  const prompt = `You are a strict code reviewer. Identify issues and propose patches.
Return JSON: {"issues":[{"file":"path","problem":"...","suggested":"full new content"}]}`;
  const res = await completeJSON(prompt, {});
  if (res.issues) {
    for (const i of res.issues) if (i.suggested) await tools.writeFile(projectId, i.file, i.suggested, token);
  }
  return { issues: (res.issues||[]).length };
}
