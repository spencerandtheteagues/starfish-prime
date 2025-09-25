import { EventEmitter } from 'events';
import { OpenAI } from 'openai';

interface AppSpec {
  name: string;
  description: string;
  framework: string;
  features: string[];
  architecture: {
    frontend: string[];
    backend: string[];
    database: string;
    deployment: string;
  };
  fileStructure: Record<string, string>;
  dependencies: {
    production: string[];
    development: string[];
  };
}

interface GenerationRequest {
  prompt: string;
  framework: string;
  features: string[];
  deployment: string;
}

export class AgentOrchestrator extends EventEmitter {
  private openai: OpenAI | null = null;
  private agents: Map<string, any> = new Map();
  private ready = false;

  constructor() {
    super();
    this.initialize();
  }

  private async initialize() {
    // Initialize OpenAI if API key is available
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    }

    // Initialize specialized agents
    this.agents.set('architect', new ArchitectAgent());
    this.agents.set('frontend', new FrontendAgent());
    this.agents.set('backend', new BackendAgent());
    this.agents.set('database', new DatabaseAgent());
    this.agents.set('deployment', new DeploymentAgent());

    this.ready = true;
    this.emit('ready');
  }

  isReady(): boolean {
    return this.ready;
  }

  async generateAppSpec(request: GenerationRequest): Promise<AppSpec> {
    console.log('🎯 Generating app specification from prompt:', request.prompt);

    // Step 1: Architect agent analyzes requirements
    const architectAnalysis = await this.agents.get('architect')?.analyze(request);

    // Step 2: Generate base app structure
    const appSpec: AppSpec = {
      name: this.generateAppName(request.prompt),
      description: architectAnalysis.description || `${request.framework} application`,
      framework: request.framework,
      features: request.features,
      architecture: {
        frontend: this.determineFrontendStack(request.framework),
        backend: this.determineBackendStack(request.features),
        database: this.determineDatabaseStack(request.features),
        deployment: request.deployment
      },
      fileStructure: {},
      dependencies: {
        production: [],
        development: []
      }
    };

    // Step 3: Frontend agent determines UI structure
    const frontendSpec = await this.agents.get('frontend')?.generateSpec(appSpec, request);
    appSpec.fileStructure = { ...appSpec.fileStructure, ...frontendSpec.files };
    appSpec.dependencies.production.push(...frontendSpec.dependencies);

    // Step 4: Backend agent determines API structure
    const backendSpec = await this.agents.get('backend')?.generateSpec(appSpec, request);
    appSpec.fileStructure = { ...appSpec.fileStructure, ...backendSpec.files };
    appSpec.dependencies.production.push(...backendSpec.dependencies);

    // Step 5: Database agent determines schema
    if (this.requiresDatabase(request.features)) {
      const dbSpec = await this.agents.get('database')?.generateSpec(appSpec, request);
      appSpec.fileStructure = { ...appSpec.fileStructure, ...dbSpec.files };
      appSpec.dependencies.production.push(...dbSpec.dependencies);
    }

    // Step 6: Deployment agent adds deployment config
    const deploymentSpec = await this.agents.get('deployment')?.generateSpec(appSpec, request);
    appSpec.fileStructure = { ...appSpec.fileStructure, ...deploymentSpec.files };

    console.log('✅ App specification generated:', appSpec.name);
    return appSpec;
  }

  private generateAppName(prompt: string): string {
    // Extract app name from prompt using simple heuristics
    const words = prompt.toLowerCase().split(/\s+/);
    const appWords = words.filter(word =>
      !['a', 'an', 'the', 'for', 'to', 'of', 'with', 'and', 'or', 'but'].includes(word)
    );

    const name = appWords.slice(0, 3).join('-');
    return name || 'generated-app';
  }

  private determineFrontendStack(framework: string): string[] {
    const stacks = {
      react: ['React', 'TypeScript', 'Tailwind CSS', 'React Router'],
      vue: ['Vue 3', 'TypeScript', 'Vue Router', 'Pinia'],
      svelte: ['SvelteKit', 'TypeScript', 'Tailwind CSS'],
      angular: ['Angular', 'TypeScript', 'Angular Material']
    };
    return stacks[framework as keyof typeof stacks] || stacks.react;
  }

  private determineBackendStack(features: string[]): string[] {
    const hasAuth = features.includes('authentication');
    const hasAPI = features.includes('api') || features.includes('database');
    const hasRealtime = features.includes('realtime') || features.includes('chat');

    const stack = ['Node.js', 'TypeScript'];

    if (hasAPI) stack.push('Express.js', 'REST API');
    if (hasAuth) stack.push('JWT', 'bcrypt');
    if (hasRealtime) stack.push('Socket.IO');

    return stack;
  }

  private determineDatabaseStack(features: string[]): string {
    if (features.includes('database')) {
      if (features.includes('realtime')) return 'PostgreSQL';
      if (features.includes('analytics')) return 'MongoDB';
      return 'SQLite';
    }
    return 'None';
  }

  private requiresDatabase(features: string[]): boolean {
    return features.some(feature =>
      ['database', 'authentication', 'user-management', 'analytics'].includes(feature)
    );
  }
}

// Specialized Agent Classes
class ArchitectAgent {
  async analyze(request: GenerationRequest) {
    return {
      description: `A ${request.framework} application with ${request.features.join(', ')} features`,
      complexity: this.assessComplexity(request),
      recommendations: this.generateRecommendations(request)
    };
  }

  private assessComplexity(request: GenerationRequest): 'simple' | 'moderate' | 'complex' {
    if (request.features.length <= 2) return 'simple';
    if (request.features.length <= 5) return 'moderate';
    return 'complex';
  }

  private generateRecommendations(request: GenerationRequest): string[] {
    const recs = [];
    if (request.features.includes('authentication')) {
      recs.push('Use JWT for stateless authentication');
    }
    if (request.features.includes('realtime')) {
      recs.push('Implement WebSocket connections for real-time features');
    }
    return recs;
  }
}

class FrontendAgent {
  async generateSpec(appSpec: AppSpec, request: GenerationRequest) {
    const files: Record<string, string> = {};
    const dependencies: string[] = [];

    switch (appSpec.framework) {
      case 'react':
        files['src/App.tsx'] = 'react-app';
        files['src/components/Header.tsx'] = 'react-component';
        files['src/pages/Home.tsx'] = 'react-page';
        dependencies.push('react', 'react-dom', '@types/react');
        break;
      case 'vue':
        files['src/App.vue'] = 'vue-app';
        files['src/components/Header.vue'] = 'vue-component';
        dependencies.push('vue', '@vitejs/plugin-vue');
        break;
    }

    // Add feature-specific files
    if (request.features.includes('authentication')) {
      files['src/components/Login.tsx'] = 'login-component';
      files['src/utils/auth.ts'] = 'auth-utility';
    }

    return { files, dependencies };
  }
}

class BackendAgent {
  async generateSpec(appSpec: AppSpec, request: GenerationRequest) {
    const files: Record<string, string> = {};
    const dependencies: string[] = ['express', 'cors', 'helmet'];

    files['server/index.ts'] = 'express-server';
    files['server/routes/api.ts'] = 'api-routes';

    if (request.features.includes('authentication')) {
      files['server/routes/auth.ts'] = 'auth-routes';
      files['server/middleware/auth.ts'] = 'auth-middleware';
      dependencies.push('jsonwebtoken', 'bcryptjs');
    }

    if (request.features.includes('database')) {
      files['server/models/index.ts'] = 'database-models';
      dependencies.push('prisma', '@prisma/client');
    }

    return { files, dependencies };
  }
}

class DatabaseAgent {
  async generateSpec(appSpec: AppSpec, request: GenerationRequest) {
    const files: Record<string, string> = {};
    const dependencies: string[] = [];

    if (appSpec.architecture.database !== 'None') {
      files['prisma/schema.prisma'] = 'prisma-schema';
      files['prisma/migrations/init.sql'] = 'database-migration';
      dependencies.push('prisma', '@prisma/client');
    }

    return { files, dependencies };
  }
}

class DeploymentAgent {
  async generateSpec(appSpec: AppSpec, request: GenerationRequest) {
    const files: Record<string, string> = {};

    switch (request.deployment) {
      case 'render':
        files['render.yaml'] = 'render-config';
        files['Dockerfile'] = 'docker-config';
        break;
      case 'vercel':
        files['vercel.json'] = 'vercel-config';
        break;
      case 'netlify':
        files['netlify.toml'] = 'netlify-config';
        break;
    }

    files['package.json'] = 'package-config';
    files['README.md'] = 'readme';

    return { files, dependencies: [] };
  }
}