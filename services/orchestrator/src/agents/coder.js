import { completeJSON, completeText } from "../models.js";
import { tools } from "../tools.js";

export async function codeStep({ projectId, token, instruction }){
  const fileList = [ "app/server.js", "README.md", "app/test.spec.js" ];
  const ctx = await Promise.all(fileList.map(async p => ({ path: p, content: await tools.readFile(projectId, p, token).catch(()=> "") })));
  const prompt = `You are a coding agent. Apply the instruction to the Node project.
Instruction: ${instruction}
Codebase context: ${ctx.map(c=> c.path + ":
" + c.content).join("\n---\n")}
Return JSON: [{"path": "...", "content": "new full file content"}]`;
  const edits = await completeJSON(prompt, {});
  for (const e of edits) await tools.writeFile(projectId, e.path, e.content, token);
  return { changed: edits.map(e => e.path) };
}
