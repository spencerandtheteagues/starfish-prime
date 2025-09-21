import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import formbody from "@fastify/formbody";
import rateLimit from "@fastify/rate-limit";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { z } from "zod";
import archiver from "archiver";
import client from "prom-client";

const PORT = Number(process.env.PORT || process.env.API_PORT || 3001);
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const DEMO_MODE = (process.env.DEMO_MODE || "true").toLowerCase() === "true";

const prisma = new PrismaClient();
const app = Fastify({
  logger: {
    redact: { paths: ["req.headers.authorization", "request.headers.authorization", "res.headers.set-cookie"], censor: "[REDACTED]" }
  }
});

const BASE_DOMAIN = process.env.BASE_DOMAIN || "lvh.me";
const ALLOWED = (process.env.CORS_ORIGINS || `http://ide.${BASE_DOMAIN},http://orchestrator.${BASE_DOMAIN},http://preview.${BASE_DOMAIN}`).split(",").map(s => s.trim());
await app.register(cors, { 
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // curl / smoke
    const ok = ALLOWED.includes(origin);
    cb(ok ? null : new Error("CORS"), ok);
  },
  credentials: true
});
await app.register(helmet, { contentSecurityPolicy: false });
await app.register(formbody);
await app.register(rateLimit, { max: 200, timeWindow: "1 minute" });

// Metrics
const register = new client.Registry();
client.collectDefaultMetrics({ register });
app.get("/metrics", async (_req, res) => {
  res.header("Content-Type", register.contentType);
  res.send(await register.metrics());
});

// Health
app.get("/health", async () => ({ ok: true }));

// Auth
app.decorate("authenticate", async (req: any, res: any) => {
  const auth = req.headers["authorization"];
  if (!auth) {
    if (DEMO_MODE) {
      req.user = { id: 1, demo: true };
      return;
    }
    res.code(401).send({ error: "Missing Authorization" });
    return;
  }
  const token = (auth as string).split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    req.user = { id: Number(payload.sub) || 1 };
  } catch {
    res.code(401).send({ error: "Invalid token" });
  }
});

// Token bridge (demo)
app.post("/api/token", async (_req, _res) => {
  const token = jwt.sign({ sub: 1, mode: DEMO_MODE ? "demo" : "prod" }, JWT_SECRET, { expiresIn: "2h" });
  return { token };
});

// Create project
app.post("/projects", { preHandler: app.authenticate as any }, async (req, res) => {
  const body = z.object({ name: z.string().min(1) }).parse(req.body);
  const user = (req as any).user;
  const project = await prisma.project.create({ data: { ownerId: user.id, name: body.name } });
  return { project };
});

// List files
app.get("/projects/:id/files", { preHandler: app.authenticate as any }, async (req) => {
  const id = Number((req.params as any).id);
  const files = await prisma.file.findMany({ where: { projectId: id }, select: { path: true, updatedAt: true } });
  return { files };
});

// Search files
app.get("/projects/:id/search", { preHandler: app.authenticate as any }, async (req) => {
  const id = Number((req.params as any).id);
  const q = String((req.query as any).q || "").toLowerCase();
  if (!q) return { results: [] };
  const files = await prisma.file.findMany({ where: { projectId: id } });
  const results = files.filter(f => (f.path.toLowerCase().includes(q) || f.content.toLowerCase().includes(q))).map(f => ({ path: f.path }));
  return { results };
});

// Get archive.zip
app.get("/projects/:id/archive.zip", { preHandler: app.authenticate as any }, async (req, res) => {
  const id = Number((req.params as any).id);
  const files = await prisma.file.findMany({ where: { projectId: id } });
  res.header("Content-Type", "application/zip");
  res.header("Content-Disposition", `attachment; filename=project-${id}.zip`);
  const archive = archiver("zip", { zlib: { level: 9 } });
  archive.on("error", err => { throw err; });
  archive.pipe(res.raw);
  for (const f of files) {
    archive.append(f.content, { name: f.path });
  }
  await archive.finalize();
  return res;
});

// Seed demo project if empty
async function ensureDemo() {
  if (!DEMO_MODE) return;
  const user = await prisma.user.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: "Demo" }
  });
  const proj = await prisma.project.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, ownerId: user.id, name: "Demo Project" }
  });
  const hasFiles = await prisma.file.count({ where: { projectId: proj.id } });
  if (hasFiles === 0) {
    await prisma.file.createMany({
      data: [
        { projectId: proj.id, path: "index.html", content: "<!doctype html><html><body><h1>Hello Preview</h1></body></html>" },
        { projectId: proj.id, path: "README.md", content: "# Demo Project\n\nThis is a demo file." }
      ]
    });
  }
}

await ensureDemo();

app.listen({ port: PORT, host: "0.0.0.0" }).then(() => {
  app.log.info(`API listening on ${PORT}`);
}).catch(err => {
  app.log.error(err);
  process.exit(1);
});
