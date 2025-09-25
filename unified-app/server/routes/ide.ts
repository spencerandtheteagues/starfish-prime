export const ideRoutes = async (fastify) => { fastify.get('/health', async () => ({ status: 'ok' })); };
