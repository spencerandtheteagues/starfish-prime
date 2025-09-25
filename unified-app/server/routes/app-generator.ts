import { FastifyPluginAsync } from 'fastify';

const appGeneratorRoutes: FastifyPluginAsync = async (fastify) => {
  // Generate new application
  fastify.post('/create', {
    schema: {
      body: {
        type: 'object',
        required: ['prompt'],
        properties: {
          prompt: { type: 'string', minLength: 10, maxLength: 1000 },
          framework: { type: 'string', enum: ['react', 'vue', 'svelte', 'angular'], default: 'react' },
          features: {
            type: 'array',
            items: {
              type: 'string',
              enum: [
                'authentication',
                'database',
                'api',
                'realtime',
                'payments',
                'analytics',
                'file-upload',
                'email',
                'search',
                'chat'
              ]
            },
            default: []
          },
          deployment: { type: 'string', enum: ['render', 'vercel', 'netlify'], default: 'render' },
          name: { type: 'string', minLength: 1, maxLength: 50 }
        }
      }
    }
  }, async (request, reply) => {
    const { prompt, framework, features, deployment, name } = request.body as any;

    try {
      fastify.log.info({ prompt, framework, features, deployment }, 'Creating new application');

      // Get services from the server instance
      const appGenerator = (fastify as any).appGenerator;
      const agentOrchestrator = (fastify as any).agentOrchestrator;
      const githubIntegration = (fastify as any).githubIntegration;
      const previewManager = (fastify as any).previewManager;

      // Step 1: Generate app specification
      const appSpec = await agentOrchestrator.generateAppSpec({
        prompt,
        framework,
        features,
        deployment,
        name: name || undefined
      });

      // Step 2: Generate application code
      const generatedApp = await appGenerator.generateApp(appSpec);

      // Step 3: Create GitHub repository (if GitHub integration is available)
      let githubRepo = null;
      try {
        githubRepo = await githubIntegration.createRepository({
          name: appSpec.name,
          description: appSpec.description,
          code: generatedApp.code,
          isPrivate: false
        });
      } catch (error) {
        fastify.log.warn('GitHub repository creation failed, continuing without it');
      }

      // Step 4: Create preview environment
      const preview = await previewManager.createPreview(generatedApp.id, generatedApp.code);

      // Step 5: Deploy to chosen platform (if configured)
      let deploymentUrl = null;
      if (githubRepo) {
        try {
          if (deployment === 'render') {
            deploymentUrl = await previewManager.deployToRender(githubRepo);
          } else if (deployment === 'vercel') {
            deploymentUrl = await previewManager.deployToVercel(githubRepo);
          } else if (deployment === 'netlify') {
            deploymentUrl = await previewManager.deployToNetlify(githubRepo);
          }
        } catch (error) {
          fastify.log.warn('Deployment failed, app still available in preview');
        }
      }

      // Return the complete application
      return {
        success: true,
        app: {
          id: generatedApp.id,
          name: appSpec.name,
          description: appSpec.description,
          framework: appSpec.framework,
          features: appSpec.features,
          metadata: generatedApp.metadata,
          repository: githubRepo ? {
            url: githubRepo.url,
            clone_url: githubRepo.clone_url,
            ssh_url: githubRepo.ssh_url
          } : null,
          deployment: deploymentUrl ? {
            url: deploymentUrl,
            platform: deployment
          } : null,
          preview: {
            id: preview.id,
            url: preview.url,
            status: preview.status
          },
          ide_url: `/ide/${generatedApp.id}`,
          collaboration_url: `/collaborate/${generatedApp.id}`
        },
        files: Object.keys(generatedApp.code),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      fastify.log.error(error, 'Application creation failed');
      return reply.code(500).send({
        success: false,
        error: 'Application creation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get application details
  fastify.get('/app/:appId', async (request, reply) => {
    const { appId } = request.params as { appId: string };

    try {
      // In a real implementation, this would fetch from a database
      // For now, return mock data
      return {
        id: appId,
        name: 'Generated App',
        status: 'ready',
        created_at: new Date().toISOString(),
        preview_url: `/preview/${appId}`,
        ide_url: `/ide/${appId}`
      };
    } catch (error) {
      return reply.code(404).send({
        error: 'Application not found'
      });
    }
  });

  // List user's applications
  fastify.get('/apps', async (request, reply) => {
    try {
      // Mock data - in production, this would fetch user's apps from database
      return {
        apps: [
          {
            id: 'app-1',
            name: 'E-commerce Store',
            framework: 'react',
            status: 'deployed',
            created_at: new Date(Date.now() - 86400000).toISOString(),
            preview_url: '/preview/app-1'
          },
          {
            id: 'app-2',
            name: 'Blog Platform',
            framework: 'vue',
            status: 'building',
            created_at: new Date(Date.now() - 43200000).toISOString(),
            preview_url: '/preview/app-2'
          }
        ],
        total: 2
      };
    } catch (error) {
      return reply.code(500).send({
        error: 'Failed to fetch applications'
      });
    }
  });

  // Delete application
  fastify.delete('/app/:appId', async (request, reply) => {
    const { appId } = request.params as { appId: string };

    try {
      // Clean up preview environment
      const previewManager = (fastify as any).previewManager;
      const previews = previewManager.getPreviewsByApp(appId);

      for (const preview of previews) {
        await previewManager.deletePreview(preview.id);
      }

      return {
        success: true,
        message: 'Application deleted successfully'
      };
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: 'Failed to delete application'
      });
    }
  });

  // Get application source code
  fastify.get('/app/:appId/code', async (request, reply) => {
    const { appId } = request.params as { appId: string };

    try {
      // In production, this would fetch the actual code from storage
      return {
        appId,
        files: {
          'src/App.tsx': `import React from 'react';

function App() {
  return (
    <div className="App">
      <h1>Generated App ${appId}</h1>
      <p>This is your generated application!</p>
    </div>
  );
}

export default App;`,
          'package.json': `{
  "name": "generated-app-${appId}",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}`,
          'README.md': `# Generated App

This application was created by Starfish Prime AI App Builder.

## Features
- React-based frontend
- Production-ready configuration
- Deployment ready

## Getting Started
\`\`\`bash
npm install
npm start
\`\`\`
`
        }
      };
    } catch (error) {
      return reply.code(404).send({
        error: 'Application code not found'
      });
    }
  });

  // Update application code
  fastify.put('/app/:appId/code', {
    schema: {
      body: {
        type: 'object',
        required: ['files'],
        properties: {
          files: {
            type: 'object',
            additionalProperties: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { appId } = request.params as { appId: string };
    const { files } = request.body as { files: Record<string, string> };

    try {
      // Update preview environment with new code
      const previewManager = (fastify as any).previewManager;
      const previews = previewManager.getPreviewsByApp(appId);

      for (const preview of previews) {
        await previewManager.updatePreview(preview.id, files);
      }

      return {
        success: true,
        message: 'Application code updated',
        updated_files: Object.keys(files)
      };
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: 'Failed to update application code'
      });
    }
  });
};

export { appGeneratorRoutes };