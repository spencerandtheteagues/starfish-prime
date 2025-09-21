import express from 'express';
import cors from 'cors';
import client from 'prom-client';

const PORT = Number(process.env.PORT || process.env.ORCHESTRATOR_PORT || 4001);
const BASE_DOMAIN = process.env.BASE_DOMAIN || 'lvh.me';
const CORS_ORIGINS = (process.env.CORS_ORIGINS || `http://localhost:3000,http://web:3000,http://ide.${BASE_DOMAIN}`)
  .split(',').map(s => s.trim()).filter(Boolean);

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true);
    cb(null, CORS_ORIGINS.includes(origin));
  }
}));

const register = new client.Registry();
client.collectDefaultMetrics({ register });

app.get('/health', (_req, res) => res.json({ ok: true, service: 'orchestrator' }));
app.get('/metrics', async (_req, res) => {
  res.setHeader('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Fake agent run that produces SSE
const runs = new Map();

app.post('/runs', (req, res) => {
  const id = Math.random().toString(36).slice(2);
  runs.set(id, { id, status: 'running', logs: [] });
  res.json({ id, status: 'running' });
});

app.get('/runs/:id/stream', (req, res) => {
  const id = req.params.id;
  const run = runs.get(id);
  if (!run) return res.status(404).end();

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
  });

  let n = 0;
  const timer = setInterval(() => {
    n++;
    const line = JSON.stringify({ n, msg: 'working' });
    res.write(`event: log\n`);
    res.write(`data: ${line}\n\n`);
    if (n >= 5) {
      res.write(`event: end\n`);
      res.write(`data: ${JSON.stringify({ ok: true })}\n\n`);
      clearInterval(timer);
      res.end();
    }
  }, 300);

  req.on('close', () => clearInterval(timer));
});

app.listen(PORT, '0.0.0.0', () => console.log('Orchestrator listening on', PORT));