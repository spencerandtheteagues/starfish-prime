import { EventEmitter } from 'events';
import axios from 'axios';
import { nanoid } from 'nanoid';

interface PreviewEnvironment {
  id: string;
  appId: string;
  url: string;
  status: 'building' | 'ready' | 'error' | 'stopped';
  createdAt: Date;
  lastUpdated: Date;
  buildLogs: string[];
}

interface DeploymentConfig {
  platform: 'render' | 'vercel' | 'netlify';
  repository: {
    url: string;
    branch: string;
  };
  environment: Record<string, string>;
}

export class PreviewManager extends EventEmitter {
  private previews: Map<string, PreviewEnvironment> = new Map();
  private ready = false;
  private renderApiKey = process.env.RENDER_API_KEY;

  constructor() {
    super();
    this.initialize();
  }

  private async initialize() {
    this.ready = true;
    this.emit('ready');
    console.log('✅ Preview Manager initialized');
  }

  isReady(): boolean {
    return this.ready;
  }

  async createPreview(appId: string, code: Record<string, string>): Promise<PreviewEnvironment> {
    const previewId = nanoid();
    console.log(`🔧 Creating preview environment for app: ${appId}`);

    const preview: PreviewEnvironment = {
      id: previewId,
      appId,
      url: '',
      status: 'building',
      createdAt: new Date(),
      lastUpdated: new Date(),
      buildLogs: ['Starting build process...']
    };

    this.previews.set(previewId, preview);

    // Simulate build process
    setTimeout(async () => {
      try {
        // In a real implementation, this would:
        // 1. Create a temporary git repository
        // 2. Push code to the repository
        // 3. Trigger a deployment
        // 4. Monitor deployment status

        preview.url = `https://preview-${previewId}.starfish-prime.dev`;
        preview.status = 'ready';
        preview.buildLogs.push('Build completed successfully');
        preview.lastUpdated = new Date();

        this.emit('preview-ready', preview);
        console.log(`✅ Preview ready: ${preview.url}`);
      } catch (error) {
        preview.status = 'error';
        preview.buildLogs.push(`Build failed: ${error}`);
        preview.lastUpdated = new Date();
        this.emit('preview-error', preview, error);
      }
    }, 5000); // Simulate 5 second build time

    return preview;
  }

  async deployToRender(repository: any): Promise<string | null> {
    if (!this.renderApiKey) {
      console.warn('⚠️ Render API key not available, skipping deployment');
      return null;
    }

    try {
      console.log('🚀 Deploying to Render:', repository.name);

      const deploymentConfig = {
        name: repository.name,
        runtime: 'docker',
        repo: repository.clone_url,
        branch: repository.default_branch,
        plan: 'starter',
        region: 'oregon',
        healthCheckPath: '/health',
        envVars: [
          {
            key: 'NODE_ENV',
            value: 'production'
          },
          {
            key: 'PORT',
            fromRender: true
          }
        ]
      };

      // Create Render service
      const response = await axios.post('https://api.render.com/v1/services', {
        type: 'web_service',
        ...deploymentConfig
      }, {
        headers: {
          'Authorization': `Bearer ${this.renderApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const service = response.data.service;
      const deploymentUrl = service.serviceDetails.url;

      console.log('✅ Deployed to Render:', deploymentUrl);
      return deploymentUrl;
    } catch (error: any) {
      console.error('❌ Render deployment failed:', error.response?.data || error.message);
      return null;
    }
  }

  async deployToVercel(repository: any): Promise<string | null> {
    // Placeholder for Vercel deployment
    console.log('🔄 Vercel deployment not implemented yet');
    return `https://${repository.name}.vercel.app`;
  }

  async deployToNetlify(repository: any): Promise<string | null> {
    // Placeholder for Netlify deployment
    console.log('🔄 Netlify deployment not implemented yet');
    return `https://${repository.name}.netlify.app`;
  }

  getPreview(previewId: string): PreviewEnvironment | undefined {
    return this.previews.get(previewId);
  }

  getAllPreviews(): PreviewEnvironment[] {
    return Array.from(this.previews.values());
  }

  getPreviewsByApp(appId: string): PreviewEnvironment[] {
    return Array.from(this.previews.values()).filter(p => p.appId === appId);
  }

  async updatePreview(previewId: string, code: Record<string, string>): Promise<void> {
    const preview = this.previews.get(previewId);
    if (!preview) {
      throw new Error(`Preview ${previewId} not found`);
    }

    preview.status = 'building';
    preview.buildLogs.push('Updating preview...');
    preview.lastUpdated = new Date();

    // Simulate update process
    setTimeout(() => {
      preview.status = 'ready';
      preview.buildLogs.push('Preview updated successfully');
      preview.lastUpdated = new Date();
      this.emit('preview-updated', preview);
    }, 3000);
  }

  async deletePreview(previewId: string): Promise<void> {
    const preview = this.previews.get(previewId);
    if (!preview) {
      throw new Error(`Preview ${previewId} not found`);
    }

    preview.status = 'stopped';
    preview.lastUpdated = new Date();

    // Clean up resources
    setTimeout(() => {
      this.previews.delete(previewId);
      this.emit('preview-deleted', previewId);
      console.log(`🗑️ Preview ${previewId} deleted`);
    }, 1000);
  }

  async getPreviewLogs(previewId: string): Promise<string[]> {
    const preview = this.previews.get(previewId);
    return preview?.buildLogs || [];
  }

  // Helper method to generate iframe-safe preview URL
  getEmbedUrl(previewId: string): string {
    const preview = this.previews.get(previewId);
    if (!preview || preview.status !== 'ready') {
      return '';
    }
    return preview.url + '?embedded=true';
  }

  // Method to handle preview environment cleanup
  async cleanupOldPreviews(maxAge: number = 24 * 60 * 60 * 1000): Promise<void> {
    const now = Date.now();
    const toDelete: string[] = [];

    for (const [id, preview] of this.previews) {
      if (now - preview.createdAt.getTime() > maxAge) {
        toDelete.push(id);
      }
    }

    for (const id of toDelete) {
      await this.deletePreview(id);
    }

    if (toDelete.length > 0) {
      console.log(`🧹 Cleaned up ${toDelete.length} old preview environments`);
    }
  }
}