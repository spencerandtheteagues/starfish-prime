import { completeJSON } from "../models.js";

export async function plan(goal, projectInfo){
  const prompt = `You are a software planner. Goal: ${goal}
Project files available: ${JSON.stringify(projectInfo)}
Return JSON: { "steps": [ {"id": "s1", "title": "...", "detail": "..."} ] }`;
  const res = await completeJSON(prompt, {});
  if (!res.steps) res.steps = [{ id: "s1", title: "Implement", detail: goal }];
  return res;
}
