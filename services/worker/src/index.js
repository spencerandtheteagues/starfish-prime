import { Queue, Worker as BWorker } from "bullmq";
import Docker from "dockerode";
import Redis from "ioredis";
import express from "express";
import client from 'prom-client';

const PORT = Number(process.env.PORT || process.env.WORKER_PORT || 4002);

// HTTP server for health checks (required by Render)
const app = express();
app.use(express.json());

const register = new client.Registry();
client.collectDefaultMetrics({ register });

app.get('/health', (_req, res) => res.json({ ok: true, service: 'worker' }));
app.get('/metrics', async (_req, res) => {
  res.setHeader('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Start HTTP server
app.listen(PORT, '0.0.0.0', () => console.log(`Worker HTTP server listening on ${PORT}`));

// Worker functionality (only if Redis is available)
try {
  const connection = new Redis(process.env.REDIS_URL || "redis://redis:6379", {
    maxRetriesPerRequest: 3,
    retryDelayOnFailover: 100,
    lazyConnect: true
  });

  const docker = new Docker({ socketPath: "/var/run/docker.sock" });

  const q = new Queue("jobs", { connection });
  const w = new BWorker("jobs", async (job) => {
    if (job.name === "run-tests") {
      const { projectId } = job.data;
      // This is a placeholder; you can mount project and run npm test
      return { ok: true, projectId };
    }
  }, { connection });

  console.log("Worker BullMQ processor started");
} catch (err) {
  console.log("Redis not available, running in HTTP-only mode:", err.message);
}
