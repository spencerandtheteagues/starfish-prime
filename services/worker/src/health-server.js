import express from "express";

// Health check server for Render
const PORT = Number(process.env.PORT || 4002);
const app = express();

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'worker', status: 'running' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Worker health endpoint listening on port ${PORT}`);
});

export default app;