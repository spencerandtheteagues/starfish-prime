import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';
import requestId from '@fastify/request-id';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import client from 'prom-client';
import logger from './logger.js';
import { randomToken, sha256base64, addSeconds } from './tokens.js';

const PORT = Number(process.env.PORT || process.env.API_PORT || 4000);
const DEMO_MODE = String(process.env.DEMO_MODE || 'true').toLowerCase() === 'true';
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-prod';
const JWT_ISSUER = process.env.JWT_ISSUER || 'one-shot';
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'one-shot-clients';
const REFRESH_TTL = Number(process.env.REFRESH_TTL || 60 * 60 * 24 * 7); // seconds
const CORS_ORIGINS = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://web:3000')
  .split(',').map(s => s.trim()).filter(Boolean);

const app = Fastify({ logger, trustProxy: true });
if (process.env.NODE_ENV === 'production' && JWT_SECRET === 'change-me-in-prod') {
  app.log.warn('Insecure JWT_SECRET default in production');
}

await app.register(requestId);
await app.register(helmet, { contentSecurityPolicy: false });
await app.register(cors, {
  origin(origin, cb) {
    if (!origin) return cb(null, true);
    cb(null, CORS_ORIGINS.includes(origin));
  },
  exposedHeaders: ['x-request-id'],
  credentials: false,
});
await app.register(rateLimit, { max: 100, timeWindow: '1 minute' });
await app.register(jwt, {
  secret: JWT_SECRET,
  sign: { issuer: JWT_ISSUER, audience: JWT_AUDIENCE },
});

const prisma = new PrismaClient();
const register = new client.Registry();
client.collectDefaultMetrics({ register });

/** Utils */
app.decorate('auth', async (req, res) => {
  try {
    await req.jwtVerify({ complete: false });
  } catch {
    return res.code(401).send({ error: 'unauthorized' });
  }
});

/** Health & Metrics */
app.get('/health', async (_req, res) => {
  return res.send({ ok: true, service: 'api', ts: new Date().toISOString() });
});
app.get('/metrics', async (_req, res) => {
  res.header('content-type', register.contentType);
  res.send(await register.metrics());
});

/** Demo endpoint (protected) */
app.get('/api/demo', { preHandler: [app.auth] }, async (req, res) => {
  const sub = req.user?.sub || 'anonymous';
  return res.send({ ok: true, user: sub, demo: true });
});

/** Token mint (for demo or bridged auth) */
app.post('/auth/token', async (req, res) => {
  const body = z.object({ userId: z.string().min(1) }).safeParse(req.body);
  if (!body.success) return res.code(400).send({ error: 'invalid_body' });
  const { userId } = body.data;

  // idempotent user
  let user = await prisma.user.findUnique({ where: { userId } });
  if (!user) user = await prisma.user.create({ data: { userId } });

  const refreshPlain = randomToken(48);
  const refreshHash = sha256base64(refreshPlain);
  const expiresAt = addSeconds(new Date(), REFRESH_TTL);

  await prisma.refreshToken.create({
    data: { userId: user.id, tokenHash: refreshHash, expiresAt }
  });

  const access = await res.jwtSign({ sub: user.userId }, { expiresIn: '15m' });
  return res.send({ token: access, refreshToken: refreshPlain, expiresIn: 900 });
});

/** Token refresh */
app.post('/auth/refresh', async (req, res) => {
  const body = z.object({ refreshToken: z.string().min(1) }).safeParse(req.body);
  if (!body.success) return res.code(400).send({ error: 'invalid_body' });
  const plain = body.data.refreshToken;
  const hash = sha256base64(plain);

  const db = await prisma.refreshToken.findUnique({ where: { tokenHash: hash } });
  if (!db || db.revokedAt || db.expiresAt < new Date()) {
    return res.code(401).send({ error: 'invalid_refresh' });
  }
  // rotate
  const newPlain = randomToken(48);
  const newHash = sha256base64(newPlain);
  await prisma.refreshToken.update({
    where: { tokenHash: hash },
    data: { replacedBy: newHash, revokedAt: new Date() }
  });
  await prisma.refreshToken.create({
    data: { userId: db.userId, tokenHash: newHash, expiresAt: addSeconds(new Date(), REFRESH_TTL) }
  });

  // load user
  const user = await prisma.user.findUnique({ where: { id: db.userId } });
  const access = await res.jwtSign({ sub: user?.userId || 'user' }, { expiresIn: '15m' });
  return res.send({ token: access, refreshToken: newPlain, expiresIn: 900 });
});

/** Logout */
app.post('/auth/logout', { preHandler: [app.auth] }, async (req, res) => {
  const userId = req.user?.sub;
  if (!userId) return res.code(401).send({ error: 'unauthorized' });
  const user = await prisma.user.findUnique({ where: { userId } });
  if (user) {
    await prisma.refreshToken.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() }
    });
  }
  return res.send({ ok: true });
});

/** Simple SSE stream for smoke */
app.get('/sse', { preHandler: [app.auth] }, async (req, res) => {
  res.raw.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
  });
  let n = 0;
  const id = setInterval(() => {
    n++;
    res.raw.write(`event: log\n`);
    res.raw.write(`data: ${JSON.stringify({ message: 'tick', n })}\n\n`);
    if (n >= 5) {
      res.raw.write(`event: end\n`);
      res.raw.write(`data: { "ok": true }\n\n`);
      clearInterval(id);
      res.raw.end();
    }
  }, 300);
  req.raw.on('close', () => clearInterval(id));
  res.hijack();
});

try {
  await app.listen({ port: PORT, host: '0.0.0.0' });
  app.log.info(`API listening on ${PORT}`);
} catch (err) {
  app.log.error({ err }, 'Failed to start API');
  process.exit(1);
}