import { Queue, Worker as BWorker } from "bullmq";
import Docker from "dockerode";
import Redis from "ioredis";

const connection = new Redis(process.env.REDIS_URL || "redis://redis:6379");
const docker = new Docker({ socketPath: "/var/run/docker.sock" });

const q = new Queue("jobs", { connection });
const w = new BWorker("jobs", async (job) => {
  if (job.name === "run-tests") {
    const { projectId } = job.data;
    // This is a placeholder; you can mount project and run npm test
    return { ok: true, projectId };
  }
}, { connection });

console.log("Worker up");
