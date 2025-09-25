export const agentsRoutes = async (fastify) => { fastify.get('/health', async () => ({ status: 'ok' })); };
