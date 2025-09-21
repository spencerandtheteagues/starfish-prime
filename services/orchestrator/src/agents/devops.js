import { tools } from "../tools.js";
export async function deploy({ projectId, token }){
  const url = await tools.startPreview(projectId, token);
  return { url };
}
