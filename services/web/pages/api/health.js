// Health check endpoint for web service
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.status(200).json({
    ok: true,
    service: 'web',
    ts: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
}