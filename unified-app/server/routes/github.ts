export const githubRoutes = async (fastify) => { fastify.get('/health', async () => ({ status: 'ok' })); };
