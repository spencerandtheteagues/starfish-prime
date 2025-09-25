export const authRoutes = async (fastify) => { fastify.get('/health', async () => ({ status: 'ok' })); };
