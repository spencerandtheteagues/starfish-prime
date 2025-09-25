import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import websocket from '@fastify/websocket';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import unified modules
import { authRoutes } from './routes/auth.js';
import { appGeneratorRoutes } from './routes/app-generator.js';
import { githubRoutes } from './routes/github.js';
import { agentRoutes } from './routes/agents.js';
import { previewRoutes } from './routes/preview.js';
import { ideRoutes } from './routes/ide.js';
import { AppGenerator } from './services/AppGenerator.js';
import { AgentOrchestrator } from './services/AgentOrchestrator.js';
import { GitHubIntegration } from './services/GitHubIntegration.js';
import { PreviewManager } from './services/PreviewManager.js';
import { CollaborationService } from './services/CollaborationService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 10000;
const JWT_SECRET = process.env.JWT_SECRET || 'starfish-prime-secret-key';

// Initialize Fastify server
const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: process.env.NODE_ENV === 'development' ? {
      target: 'pino-pretty'
    } : undefined
  }
});

// Create HTTP server for Socket.IO
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Initialize services
const appGenerator = new AppGenerator();
const agentOrchestrator = new AgentOrchestrator();
const githubIntegration = new GitHubIntegration();
const previewManager = new PreviewManager();
const collaborationService = new CollaborationService(io);

// Attach services to fastify for route access
(fastify as any).appGenerator = appGenerator;
(fastify as any).agentOrchestrator = agentOrchestrator;
(fastify as any).githubIntegration = githubIntegration;
(fastify as any).previewManager = previewManager;
(fastify as any).collaborationService = collaborationService;

// Register plugins
await fastify.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"]
    }
  }
});

await fastify.register(cors, {
  origin: true,
  credentials: true
});

await fastify.register(jwt, {
  secret: JWT_SECRET
});

await fastify.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute'
});

await fastify.register(websocket);

// Health check endpoint
fastify.get('/health', async (request, reply) => {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    services: {
      appGenerator: appGenerator.isReady(),
      agentOrchestrator: agentOrchestrator.isReady(),
      githubIntegration: githubIntegration.isReady(),
      previewManager: previewManager.isReady()
    }
  };
});

// API Routes
await fastify.register(authRoutes, { prefix: '/api/auth' });
await fastify.register(appGeneratorRoutes, { prefix: '/api/generate' });
await fastify.register(githubRoutes, { prefix: '/api/github' });
await fastify.register(agentRoutes, { prefix: '/api/agents' });
await fastify.register(previewRoutes, { prefix: '/api/preview' });
await fastify.register(ideRoutes, { prefix: '/api/ide' });

// WebSocket endpoints for real-time collaboration
fastify.register(async function (fastify) {
  fastify.get('/api/collaborate/:projectId', { websocket: true }, (connection, request) => {
    const { projectId } = request.params as { projectId: string };
    collaborationService.handleConnection(connection.socket, projectId);
  });
});

// Serve static files from Next.js build in production
if (process.env.NODE_ENV === 'production') {
  const nextBuildPath = join(__dirname, '../../.next');
  fastify.register(require('@fastify/static'), {
    root: nextBuildPath,
    prefix: '/_next/'
  });

  // Serve the Next.js app for all other routes
  fastify.setNotFoundHandler(async (request, reply) => {
    return reply.sendFile('index.html');
  });
}

// Main app generation endpoint - the core functionality
fastify.post('/api/generate-app', {
  schema: {
    body: {
      type: 'object',
      required: ['prompt'],
      properties: {
        prompt: { type: 'string', minLength: 10 },
        framework: { type: 'string', enum: ['react', 'vue', 'svelte', 'angular'] },
        features: { type: 'array', items: { type: 'string' } },
        deployment: { type: 'string', enum: ['render', 'vercel', 'netlify'] }
      }
    }
  }
}, async (request, reply) => {
  const { prompt, framework = 'react', features = [], deployment = 'render' } = request.body as any;

  try {
    fastify.log.info({ prompt, framework, features, deployment }, 'Starting app generation');

    // Step 1: Generate app specification using AI agents
    const appSpec = await agentOrchestrator.generateAppSpec({
      prompt,
      framework,
      features,
      deployment
    });

    // Step 2: Generate the actual application code
    const generatedApp = await appGenerator.generateApp(appSpec);

    // Step 3: Create GitHub repository
    const githubRepo = await githubIntegration.createRepository({
      name: appSpec.name,
      description: appSpec.description,
      code: generatedApp.code
    });

    // Step 4: Deploy to chosen platform
    let deploymentUrl = null;
    if (deployment === 'render') {
      deploymentUrl = await previewManager.deployToRender(githubRepo);
    }

    // Step 5: Return complete app package
    return {
      success: true,
      app: {
        id: generatedApp.id,
        name: appSpec.name,
        description: appSpec.description,
        framework,
        features,
        repository: {
          url: githubRepo.url,
          clone_url: githubRepo.clone_url
        },
        deployment: {
          url: deploymentUrl,
          platform: deployment
        },
        preview_url: `/preview/${generatedApp.id}`,
        ide_url: `/ide/${generatedApp.id}`
      },
      generatedFiles: Object.keys(generatedApp.code),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    fastify.log.error(error, 'App generation failed');
    return reply.code(500).send({
      success: false,
      error: 'App generation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Start the server
const start = async () => {
  try {
    // Start Socket.IO server
    httpServer.listen(parseInt(PORT as string) + 1, () => {
      console.log(`🔗 Socket.IO server running on port ${parseInt(PORT as string) + 1}`);
    });

    // Start Fastify server
    await fastify.listen({
      port: parseInt(PORT as string),
      host: '0.0.0.0'
    });

    console.log(`🚀 Starfish Prime running on port ${PORT}`);
    console.log(`📡 API: http://localhost:${PORT}/api`);
    console.log(`🎨 IDE: http://localhost:${PORT}/ide`);
    console.log(`👁️  Preview: http://localhost:${PORT}/preview`);
    console.log(`💾 Health: http://localhost:${PORT}/health`);

  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();