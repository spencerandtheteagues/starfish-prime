import { z } from "zod";
export const PlanSchema = z.object({
  stack: z.object({ frontend: z.string(), backend: z.string(), orm: z.string(), db: z.string() }),
  entities: z.array(z.object({ name: z.string(), fields: z.array(z.object({ name: z.string(), type: z.string(), required: z.boolean().default(true) }))})).default([]),
  pages: z.array(z.object({ path: z.string(), purpose: z.string()})).default([]),
  apis: z.array(z.object({ method: z.enum(["GET","POST","PUT","DELETE"]), path: z.string(), summary: z.string()})).default([]),
  notes: z.string().default("")
});
export type Plan = z.infer<typeof PlanSchema>;
export const PromptSchema = z.object({ prompt: z.string().min(4), options: z.object({ preset: z.enum(["saas","crm","blog","ecommerce"]).optional()}).optional(), scaffold: z.boolean().optional(), useSpecKit: z.boolean().optional()});
export type Prompt = z.infer<typeof PromptSchema>;
