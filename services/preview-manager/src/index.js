import express from 'express';
import cors from 'cors';
import client from 'prom-client';
import axios from 'axios';

const PORT = Number(process.env.PORT || process.env.PREVIEW_PORT || 4002);
const BASE_DOMAIN = process.env.BASE_DOMAIN || 'lvh.me';
const CORS_ORIGINS = (process.env.CORS_ORIGINS || `http://localhost:3000,http://web:3000,http://preview.${BASE_DOMAIN}`)
  .split(',').map(s => s.trim()).filter(Boolean);

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true);
    cb(null, CORS_ORIGINS.includes(origin));
  }
}));

const register = new client.Registry();
client.collectDefaultMetrics({ register });

app.get('/health', (_req, res) => res.json({ ok: true, service: 'preview-manager' }));
app.get('/metrics', async (_req, res) => {
  res.setHeader('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Example that forwards Authorization and X-User-Id headers when talking to API
app.post('/echo-proxy', async (req, res) => {
  try {
    const api = process.env.API_URL || 'http://api:4000';
    const r = await axios.get(`${api}/health`, {
      headers: {
        'authorization': req.headers['authorization'] || '',
        'x-user-id': req.headers['x-user-id'] || ''
      }
    });
    res.json({ upstream: r.data, forwarded: true });
  } catch (err) {
    res.status(500).json({ error: 'proxy_failed', detail: String(err) });
  }
});

app.listen(PORT, '0.0.0.0', () => console.log('Preview Manager listening on', PORT));