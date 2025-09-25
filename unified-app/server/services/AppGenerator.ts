import { EventEmitter } from 'events';
import { nanoid } from 'nanoid';
import { OpenAI } from 'openai';

interface AppSpec {
  name: string;
  description: string;
  framework: string;
  features: string[];
  architecture: any;
  fileStructure: Record<string, string>;
  dependencies: {
    production: string[];
    development: string[];
  };
}

interface GeneratedApp {
  id: string;
  spec: AppSpec;
  code: Record<string, string>;
  metadata: {
    generatedAt: Date;
    totalFiles: number;
    totalLines: number;
  };
}

export class AppGenerator extends EventEmitter {
  private openai: OpenAI | null = null;
  private templates: Map<string, any> = new Map();
  private ready = false;

  constructor() {
    super();
    this.initialize();
  }

  private async initialize() {
    // Initialize OpenAI if available
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    }

    // Load code templates
    this.loadTemplates();
    this.ready = true;
    this.emit('ready');
  }

  isReady(): boolean {
    return this.ready;
  }

  async generateApp(spec: AppSpec): Promise<GeneratedApp> {
    console.log('🔨 Generating application code for:', spec.name);

    const appId = nanoid();
    const generatedCode: Record<string, string> = {};

    // Generate each file based on the spec
    for (const [filePath, fileType] of Object.entries(spec.fileStructure)) {
      try {
        const code = await this.generateFile(filePath, fileType, spec);
        generatedCode[filePath] = code;
        console.log(`✓ Generated: ${filePath}`);
      } catch (error) {
        console.error(`✗ Failed to generate ${filePath}:`, error);
        // Generate a basic template as fallback
        generatedCode[filePath] = this.getBasicTemplate(fileType);
      }
    }

    // Calculate metadata
    const totalLines = Object.values(generatedCode)
      .reduce((sum, code) => sum + code.split('\n').length, 0);

    const generatedApp: GeneratedApp = {
      id: appId,
      spec,
      code: generatedCode,
      metadata: {
        generatedAt: new Date(),
        totalFiles: Object.keys(generatedCode).length,
        totalLines
      }
    };

    console.log(`✅ App generation complete: ${generatedApp.metadata.totalFiles} files, ${generatedApp.metadata.totalLines} lines`);
    return generatedApp;
  }

  private async generateFile(filePath: string, fileType: string, spec: AppSpec): Promise<string> {
    // Try AI generation first if OpenAI is available
    if (this.openai && this.shouldUseAI(fileType)) {
      try {
        return await this.generateFileWithAI(filePath, fileType, spec);
      } catch (error) {
        console.warn(`AI generation failed for ${filePath}, falling back to template`);
      }
    }

    // Fall back to template generation
    return this.generateFileFromTemplate(filePath, fileType, spec);
  }

  private async generateFileWithAI(filePath: string, fileType: string, spec: AppSpec): Promise<string> {
    const prompt = this.buildAIPrompt(filePath, fileType, spec);

    const response = await this.openai!.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert software developer. Generate high-quality, production-ready code based on the specifications provided. Include proper error handling, TypeScript types, and best practices.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    return response.choices[0]?.message?.content || this.getBasicTemplate(fileType);
  }

  private buildAIPrompt(filePath: string, fileType: string, spec: AppSpec): string {
    return `
Generate code for: ${filePath}
File type: ${fileType}
Framework: ${spec.framework}
Features: ${spec.features.join(', ')}

App description: ${spec.description}

Requirements:
- Use TypeScript where applicable
- Include proper error handling
- Follow ${spec.framework} best practices
- Make it production-ready
- Include relevant imports and exports

${this.getTypeSpecificInstructions(fileType, spec)}
    `.trim();
  }

  private getTypeSpecificInstructions(fileType: string, spec: AppSpec): string {
    const instructions: Record<string, string> = {
      'react-app': 'Create a main React App component with routing and basic layout',
      'react-component': 'Create a reusable React component with TypeScript props interface',
      'react-page': 'Create a React page component with proper SEO and accessibility',
      'express-server': 'Create an Express.js server with middleware, CORS, and error handling',
      'api-routes': 'Create RESTful API routes with proper validation and error responses',
      'auth-routes': 'Create authentication routes with JWT, registration, and login',
      'prisma-schema': 'Create a Prisma schema with proper models and relationships',
      'package-config': 'Create a package.json with all necessary dependencies and scripts',
      'docker-config': 'Create a multi-stage Dockerfile optimized for production',
      'render-config': 'Create a render.yaml configuration for deployment'
    };

    return instructions[fileType] || 'Generate appropriate code for this file type';
  }

  private generateFileFromTemplate(filePath: string, fileType: string, spec: AppSpec): string {
    const template = this.templates.get(fileType);
    if (template) {
      return this.processTemplate(template, spec);
    }

    return this.getBasicTemplate(fileType);
  }

  private processTemplate(template: string, spec: AppSpec): string {
    return template
      .replace(/{{APP_NAME}}/g, spec.name)
      .replace(/{{APP_DESCRIPTION}}/g, spec.description)
      .replace(/{{FRAMEWORK}}/g, spec.framework)
      .replace(/{{FEATURES}}/g, spec.features.join(', '));
  }

  private shouldUseAI(fileType: string): boolean {
    // Use AI for complex file types
    const aiFileTypes = [
      'react-component', 'vue-component', 'express-server',
      'api-routes', 'auth-routes', 'prisma-schema'
    ];
    return aiFileTypes.includes(fileType);
  }

  private getBasicTemplate(fileType: string): string {
    const templates: Record<string, string> = {
      'react-app': `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to {{APP_NAME}}</h1>
        <p>{{APP_DESCRIPTION}}</p>
      </header>
    </div>
  );
}

export default App;`,

      'react-component': `import React from 'react';

interface Props {
  title?: string;
  children?: React.ReactNode;
}

export const Component: React.FC<Props> = ({ title, children }) => {
  return (
    <div className="component">
      {title && <h2>{title}</h2>}
      {children}
    </div>
  );
};`,

      'express-server': `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

app.get('/api', (req, res) => {
  res.json({ message: 'API is running' });
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`,

      'package-config': `{
  "name": "{{APP_NAME}}",
  "version": "1.0.0",
  "description": "{{APP_DESCRIPTION}}",
  "main": "dist/index.js",
  "scripts": {
    "dev": "npm run server:dev",
    "build": "npm run server:build",
    "start": "node dist/index.js",
    "server:dev": "tsx server/index.ts",
    "server:build": "tsc"
  },
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5",
    "helmet": "^7.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "tsx": "^4.0.0",
    "typescript": "^5.0.0"
  }
}`,

      'docker-config': `FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
RUN apk add --no-cache tini
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 3000
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/index.js"]`,

      'render-config': `services:
  - type: web
    name: {{APP_NAME}}
    runtime: docker
    dockerfilePath: ./Dockerfile
    plan: starter
    healthCheckPath: /health
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        fromRender: true`,

      'readme': `# {{APP_NAME}}

{{APP_DESCRIPTION}}

## Features
- {{FEATURES}}

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Start development server:
   \`\`\`bash
   npm run dev
   \`\`\`

3. Build for production:
   \`\`\`bash
   npm run build
   \`\`\`

## Deployment

This app is configured for deployment on Render, Vercel, or Netlify.

## License

MIT`
    };

    return templates[fileType] || `// Generated ${fileType} file\n// TODO: Implement functionality`;
  }

  private loadTemplates() {
    // Load additional templates from files if needed
    // For now, we use the inline templates above
    this.emit('templates-loaded');
  }
}