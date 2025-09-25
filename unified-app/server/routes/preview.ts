export const previewRoutes = async (fastify) => { fastify.get('/health', async () => ({ status: 'ok' })); };
