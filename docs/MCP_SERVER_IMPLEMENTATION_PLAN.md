# AutoVio MCP Server - Detaylı İmplementasyon Planı

## 📋 Genel Bakış

AutoVio MCP Server, AutoVio API'sini Model Context Protocol (MCP) üzerinden erişilebilir hale getiren bir Node.js/TypeScript paketidir. OpenAPI dokümantasyonundan otomatik olarak MCP tools oluşturur ve Claude Desktop gibi MCP client'larında kullanılabilir.

---

## 🎯 Proje Hedefleri

1. **OpenAPI → MCP Tools Dönüşümü**: OpenAPI spec'teki her endpoint bir MCP tool olacak
2. **Yapılandırılabilir AI Provider Yönetimi**: Kullanıcı hangi işlem için hangi LLM/provider kullanacağını belirleyebilecek
3. **Type-Safe**: TypeScript ile tam tip güvenliği
4. **NPM Paketi**: `@autovio/mcp-server` olarak publish edilecek
5. **Kolay Yapılandırma**: JSON config dosyası ile yapılandırma

---

## 📦 Proje Yapısı

```
autovio-mcp-server/
├── package.json
├── tsconfig.json
├── README.md
├── LICENSE
├── .gitignore
├── .npmignore
├── src/
│   ├── index.ts                    # Ana entry point (MCP server başlatır)
│   ├── config/
│   │   ├── types.ts                # Config type tanımları
│   │   ├── schema.ts               # Config validation (Zod)
│   │   └── defaults.ts             # Default config değerleri
│   ├── client/
│   │   ├── autovio-client.ts       # AutoVio API client
│   │   └── types.ts                # API request/response types
│   ├── tools/
│   │   ├── registry.ts             # Tool registry (tüm tools)
│   │   ├── generator.ts            # OpenAPI'den tool generate eder
│   │   ├── auth-tools.ts           # Authentication tools
│   │   ├── project-tools.ts        # Project tools
│   │   ├── work-tools.ts           # Work tools
│   │   ├── ai-tools.ts             # AI generation tools
│   │   ├── provider-tools.ts       # Provider tools
│   │   └── types.ts                # Tool type tanımları
│   ├── resources/
│   │   ├── registry.ts             # Resource registry
│   │   ├── project-resource.ts     # Project resources
│   │   └── work-resource.ts        # Work resources
│   ├── prompts/
│   │   ├── registry.ts             # Prompt registry
│   │   └── video-prompts.ts        # Video creation prompts
│   └── utils/
│       ├── logger.ts               # Logging utility
│       ├── errors.ts               # Custom error classes
│       └── validators.ts           # Helper validators
├── examples/
│   ├── config.example.json         # Örnek config dosyası
│   └── claude-desktop-config.json  # Claude Desktop config örneği
├── tests/
│   ├── tools/
│   ├── client/
│   └── config/
└── dist/                           # Build output (gitignore'da)
```

---

## 🔧 Teknoloji Stack

### Core Dependencies
```json
{
  "@modelcontextprotocol/sdk": "^0.5.0",
  "zod": "^3.24.2",
  "axios": "^1.6.0",
  "dotenv": "^17.3.1"
}
```

### Dev Dependencies
```json
{
  "typescript": "^5.7.3",
  "tsx": "^4.19.2",
  "@types/node": "^20.0.0",
  "vitest": "^1.0.0"
}
```

---

## 📝 Configuration Schema

### Config File: `autovio.config.json`

```json
{
  "server": {
    "name": "autovio",
    "version": "1.0.0"
  },
  "autovio": {
    "baseUrl": "http://localhost:3001",
    "apiToken": "your-api-token-here"
  },
  "providers": {
    "vision": {
      "provider": "gemini",
      "model": "gemini-2.0-flash-exp",
      "apiKey": "${GEMINI_API_KEY}"
    },
    "llm": {
      "scenario": {
        "provider": "claude",
        "model": "claude-3-5-sonnet-20241022",
        "apiKey": "${ANTHROPIC_API_KEY}"
      },
      "styleGuide": {
        "provider": "openai",
        "model": "gpt-4",
        "apiKey": "${OPENAI_API_KEY}"
      }
    },
    "image": {
      "provider": "dalle",
      "model": "dall-e-3",
      "apiKey": "${OPENAI_API_KEY}"
    },
    "video": {
      "provider": "runway",
      "model": "gen-3",
      "apiKey": "${RUNWAY_API_KEY}"
    }
  },
  "features": {
    "enableResources": true,
    "enablePrompts": true,
    "cacheResponses": false,
    "logLevel": "info"
  }
}
```

### TypeScript Config Types

```typescript
// src/config/types.ts

export interface ServerConfig {
  name: string;
  version: string;
}

export interface AutoVioConfig {
  baseUrl: string;
  apiToken: string;
}

export interface ProviderConfig {
  provider: string;
  model: string;
  apiKey: string;
}

export interface LLMProviders {
  scenario: ProviderConfig;
  styleGuide: ProviderConfig;
}

export interface ProvidersConfig {
  vision: ProviderConfig;
  llm: LLMProviders;
  image: ProviderConfig;
  video: ProviderConfig;
}

export interface FeaturesConfig {
  enableResources: boolean;
  enablePrompts: boolean;
  cacheResponses: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export interface AutoVioMCPConfig {
  server: ServerConfig;
  autovio: AutoVioConfig;
  providers: ProvidersConfig;
  features: FeaturesConfig;
}
```

### Environment Variables

`.env` dosyası:
```bash
# AutoVio API
AUTOVIO_BASE_URL=http://localhost:3001
AUTOVIO_API_TOKEN=your-token-here

# AI Provider API Keys
GEMINI_API_KEY=your-gemini-key
ANTHROPIC_API_KEY=your-anthropic-key
OPENAI_API_KEY=your-openai-key
RUNWAY_API_KEY=your-runway-key
```

---

## 🛠️ MCP Tools İmplementasyonu

### Tool Naming Convention

```
autovio_{category}_{action}
```

**Örnekler:**
- `autovio_auth_login`
- `autovio_projects_create`
- `autovio_projects_list`
- `autovio_works_create`
- `autovio_ai_analyze_video`
- `autovio_ai_generate_scenario`
- `autovio_ai_generate_image`
- `autovio_ai_generate_video`

### Tool Kategorileri

#### 1. Authentication Tools

```typescript
// src/tools/auth-tools.ts

/**
 * Tool: autovio_auth_login
 * Description: Login to AutoVio and get access token
 * Input: { email: string, password: string }
 * Output: { accessToken: string, user: {...} }
 */
```

**Tools:**
- `autovio_auth_login` - Login
- `autovio_auth_register` - Register new user
- `autovio_auth_me` - Get current user info

---

#### 2. Project Tools

```typescript
// src/tools/project-tools.ts

/**
 * Tool: autovio_projects_create
 * Description: Create a new video project
 * Input: {
 *   name: string,
 *   systemPrompt?: string,
 *   knowledge?: string,
 *   styleGuide?: StyleGuide
 * }
 * Output: Project object
 */
```

**Tools:**
- `autovio_projects_create` - Create project
- `autovio_projects_list` - List all projects
- `autovio_projects_get` - Get project by ID
- `autovio_projects_update` - Update project
- `autovio_projects_delete` - Delete project

---

#### 3. Work Tools

```typescript
// src/tools/work-tools.ts

/**
 * Tool: autovio_works_create
 * Description: Create a new work (video pipeline) in a project
 * Input: {
 *   projectId: string,
 *   mode: "style_transfer" | "content_remix",
 *   productName?: string,
 *   productDescription?: string,
 *   targetAudience?: string
 * }
 * Output: Work object
 */
```

**Tools:**
- `autovio_works_create` - Create work
- `autovio_works_list` - List project works
- `autovio_works_get` - Get work by ID
- `autovio_works_update` - Update work
- `autovio_works_delete` - Delete work
- `autovio_works_upload_reference_video` - Upload reference video
- `autovio_works_get_reference_video` - Download reference video

---

#### 4. AI Tools

```typescript
// src/tools/ai-tools.ts

/**
 * Tool: autovio_ai_analyze_video
 * Description: Analyze a reference video using vision AI
 * Input: {
 *   workId: string,
 *   projectId: string,
 *   mode: "style_transfer" | "content_remix",
 *   analyzerPrompt?: string,
 *   useConfigProvider?: boolean  // Config'deki provider'ı kullan
 * }
 * Output: AnalysisResult
 * 
 * Note: Config'deki vision provider otomatik kullanılır
 */
```

**Tools:**
- `autovio_ai_analyze_video` - Analyze video
- `autovio_ai_generate_scenario` - Generate scenario from analysis
- `autovio_ai_generate_image` - Generate image for scene
- `autovio_ai_generate_video` - Generate video from image
- `autovio_ai_extract_style_guide` - Extract style guide from text
- `autovio_ai_extract_style_guide_from_url` - Extract from landing page

---

#### 5. Provider Tools

```typescript
// src/tools/provider-tools.ts

/**
 * Tool: autovio_providers_list
 * Description: List all available AI providers and models
 * Input: {}
 * Output: { vision: [...], llm: [...], image: [...], video: [...] }
 */
```

**Tools:**
- `autovio_providers_list` - List all providers

---

#### 6. Export Tools

```typescript
// src/tools/export-tools.ts

/**
 * Tool: autovio_export_video
 * Description: Export final video with timeline editing
 * Input: ExportRequest (complex object with clips, texts, images, audio)
 * Output: { videoUrl: string }
 */
```

**Tools:**
- `autovio_export_video` - Export video

---

### Tool Input Schema Generation

Her tool için Zod schema otomatik oluşturulur:

```typescript
// src/tools/generator.ts

import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

function generateToolSchema(openApiPath: any) {
  // OpenAPI request body'yi Zod schema'ya çevir
  const inputSchema = z.object({
    // OpenAPI'den parse edilmiş fields
  });
  
  // MCP tool için JSON schema formatına çevir
  return zodToJsonSchema(inputSchema);
}
```

---

## 📚 MCP Resources İmplementasyonu

Resources, Claude'un "okuyabileceği" veri kaynakları. AutoVio için:

### Resource URI Pattern

```
autovio://projects
autovio://projects/{projectId}
autovio://projects/{projectId}/works
autovio://works/{workId}
autovio://works/{workId}/analysis
autovio://works/{workId}/scenario
autovio://works/{workId}/scenes
```

### Resource Examples

```typescript
// src/resources/project-resource.ts

/**
 * Resource: autovio://projects
 * Description: List all user projects
 * MIME Type: application/json
 */
server.registerResource({
  uri: "autovio://projects",
  name: "AutoVio Projects",
  description: "List all video projects",
  mimeType: "application/json"
}, async () => {
  const projects = await client.projects.list();
  return {
    contents: [{
      uri: "autovio://projects",
      mimeType: "application/json",
      text: JSON.stringify(projects, null, 2)
    }]
  };
});

/**
 * Resource: autovio://projects/{projectId}
 * Description: Get specific project details
 */
server.registerResource({
  uri: "autovio://projects/{projectId}",
  name: "AutoVio Project Details",
  description: "Get detailed information about a specific project"
}, async (uri) => {
  const projectId = extractProjectId(uri);
  const project = await client.projects.get(projectId);
  return {
    contents: [{
      uri,
      mimeType: "application/json",
      text: JSON.stringify(project, null, 2)
    }]
  };
});
```

---

## 🎨 MCP Prompts İmplementasyonu

Prompts, kullanıcıya hazır iş akışları sunar.

### Prompt Examples

```typescript
// src/prompts/video-prompts.ts

/**
 * Prompt: create_product_video
 * Description: Create a product showcase video from scratch
 */
server.registerPrompt({
  name: "create_product_video",
  description: "Create a product showcase video with AI",
  arguments: [
    {
      name: "productName",
      description: "Name of the product",
      required: true
    },
    {
      name: "productDescription",
      description: "Description of the product",
      required: true
    },
    {
      name: "targetAudience",
      description: "Target audience for the video",
      required: false
    },
    {
      name: "duration",
      description: "Desired video duration in seconds",
      required: false
    }
  ]
}, async (args) => {
  return {
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Create a ${args.duration || 15}-second product video for "${args.productName}".

Product Description: ${args.productDescription}
${args.targetAudience ? `Target Audience: ${args.targetAudience}` : ''}

Steps:
1. Create a new project using autovio_projects_create
2. Create a work using autovio_works_create with mode "content_remix"
3. Generate a scenario using autovio_ai_generate_scenario
4. For each scene, generate images and videos
5. Export the final video

Please execute these steps and create the video.`
        }
      }
    ]
  };
});

/**
 * Prompt: analyze_and_recreate
 * Description: Analyze a reference video and recreate with modifications
 */
server.registerPrompt({
  name: "analyze_and_recreate",
  description: "Analyze a reference video and create a similar one with your product",
  arguments: [
    {
      name: "productName",
      description: "Your product name",
      required: true
    },
    {
      name: "referenceVideoPath",
      description: "Path to reference video file",
      required: true
    },
    {
      name: "modifications",
      description: "What to change in the new video",
      required: false
    }
  ]
}, async (args) => {
  return {
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Analyze the reference video at "${args.referenceVideoPath}" and create a similar video for "${args.productName}".

${args.modifications ? `Modifications to make: ${args.modifications}` : ''}

Steps:
1. Create a new project
2. Create a work with mode "style_transfer"
3. Upload the reference video using autovio_works_upload_reference_video
4. Analyze the video using autovio_ai_analyze_video
5. Generate a new scenario based on the analysis
6. Generate scenes with your product
7. Export the final video

Please execute these steps.`
        }
      }
    ]
  };
});

/**
 * Prompt: batch_video_generation
 * Description: Generate multiple videos with different variations
 */
server.registerPrompt({
  name: "batch_video_generation",
  description: "Generate multiple video variations for A/B testing",
  arguments: [
    {
      name: "productName",
      description: "Product name",
      required: true
    },
    {
      name: "variations",
      description: "Number of variations to create",
      required: true
    },
    {
      name: "styleGuides",
      description: "JSON array of style guides for each variation",
      required: false
    }
  ]
}, async (args) => {
  // Implementation
});
```

---

## 🏗️ AutoVio API Client İmplementasyonu

### Client Structure

```typescript
// src/client/autovio-client.ts

import axios, { AxiosInstance } from 'axios';
import { AutoVioConfig, ProvidersConfig } from '../config/types.js';

export class AutoVioClient {
  private axios: AxiosInstance;
  private config: AutoVioConfig;
  private providers: ProvidersConfig;

  constructor(config: AutoVioConfig, providers: ProvidersConfig) {
    this.config = config;
    this.providers = providers;
    
    this.axios = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'Authorization': `Bearer ${config.apiToken}`,
        'Content-Type': 'application/json'
      }
    });
  }

  // Authentication
  auth = {
    login: async (email: string, password: string) => {
      const response = await this.axios.post('/api/auth/login', { email, password });
      return response.data;
    },
    
    register: async (email: string, password: string, name: string) => {
      const response = await this.axios.post('/api/auth/register', { 
        email, password, name 
      });
      return response.data;
    },
    
    me: async () => {
      const response = await this.axios.get('/api/auth/me');
      return response.data;
    }
  };

  // Projects
  projects = {
    list: async () => {
      const response = await this.axios.get('/api/projects');
      return response.data;
    },
    
    create: async (data: CreateProjectInput) => {
      const response = await this.axios.post('/api/projects', data);
      return response.data;
    },
    
    get: async (id: string) => {
      const response = await this.axios.get(`/api/projects/${id}`);
      return response.data;
    },
    
    update: async (id: string, data: UpdateProjectInput) => {
      const response = await this.axios.put(`/api/projects/${id}`, data);
      return response.data;
    },
    
    delete: async (id: string) => {
      await this.axios.delete(`/api/projects/${id}`);
    }
  };

  // Works
  works = {
    list: async (projectId: string) => {
      const response = await this.axios.get(`/api/projects/${projectId}/works`);
      return response.data;
    },
    
    create: async (projectId: string, data: CreateWorkInput) => {
      const response = await this.axios.post(`/api/projects/${projectId}/works`, data);
      return response.data;
    },
    
    get: async (projectId: string, workId: string) => {
      const response = await this.axios.get(`/api/projects/${projectId}/works/${workId}`);
      return response.data;
    },
    
    update: async (projectId: string, workId: string, data: UpdateWorkInput) => {
      const response = await this.axios.put(`/api/projects/${projectId}/works/${workId}`, data);
      return response.data;
    },
    
    delete: async (projectId: string, workId: string) => {
      await this.axios.delete(`/api/projects/${projectId}/works/${workId}`);
    },
    
    uploadReferenceVideo: async (projectId: string, workId: string, videoFile: Buffer) => {
      const formData = new FormData();
      formData.append('video', new Blob([videoFile]));
      
      const response = await this.axios.post(
        `/api/projects/${projectId}/works/${workId}/media/reference`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return response.data;
    }
  };

  // AI Operations
  ai = {
    analyze: async (videoFile: Buffer, mode: string, analyzerPrompt?: string) => {
      const formData = new FormData();
      formData.append('video', new Blob([videoFile]));
      formData.append('mode', mode);
      if (analyzerPrompt) formData.append('analyzerPrompt', analyzerPrompt);
      
      // Config'deki vision provider'ı kullan
      const { provider, model, apiKey } = this.providers.vision;
      
      const response = await this.axios.post('/api/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-vision-provider': provider,
          'x-model-id': model,
          'x-api-key': apiKey
        }
      });
      return response.data;
    },
    
    generateScenario: async (request: ScenarioRequest) => {
      // Config'deki LLM provider'ı kullan
      const { provider, model, apiKey } = this.providers.llm.scenario;
      
      const response = await this.axios.post('/api/scenario', request, {
        headers: {
          'x-llm-provider': provider,
          'x-model-id': model,
          'x-api-key': apiKey
        }
      });
      return response.data;
    },
    
    generateImage: async (request: GenerateImageRequest) => {
      const { provider, model, apiKey } = this.providers.image;
      
      const response = await this.axios.post('/api/generate/image', request, {
        headers: {
          'x-image-provider': provider,
          'x-model-id': model,
          'x-api-key': apiKey
        }
      });
      return response.data;
    },
    
    generateVideo: async (request: GenerateVideoRequest) => {
      const { provider, model, apiKey } = this.providers.video;
      
      const response = await this.axios.post('/api/generate/video', request, {
        headers: {
          'x-video-provider': provider,
          'x-model-id': model,
          'x-api-key': apiKey
        }
      });
      return response.data;
    },
    
    extractStyleGuide: async (text: string) => {
      const { provider, model, apiKey } = this.providers.llm.styleGuide;
      
      const response = await this.axios.post('/api/style-guide/extract', 
        { text },
        {
          headers: {
            'x-llm-provider': provider,
            'x-model-id': model,
            'x-api-key': apiKey
          }
        }
      );
      return response.data;
    },
    
    extractStyleGuideFromUrl: async (url: string, options?: any) => {
      const { provider, model, apiKey } = this.providers.llm.styleGuide;
      
      const response = await this.axios.post('/api/style-guide/extract-from-landing',
        { url, ...options },
        {
          headers: {
            'x-llm-provider': provider,
            'x-model-id': model,
            'x-api-key': apiKey
          }
        }
      );
      return response.data;
    }
  };

  // Providers
  providers = {
    list: async () => {
      const response = await this.axios.get('/api/providers');
      return response.data;
    }
  };

  // Export
  export = {
    video: async (request: ExportRequest) => {
      const response = await this.axios.post('/api/export', request, {
        responseType: 'blob'
      });
      return response.data;
    }
  };
}
```

---

## 🚀 Main Server Entry Point

```typescript
// src/index.ts

#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { loadConfig } from './config/schema.js';
import { AutoVioClient } from './client/autovio-client.js';
import { registerAuthTools } from './tools/auth-tools.js';
import { registerProjectTools } from './tools/project-tools.js';
import { registerWorkTools } from './tools/work-tools.js';
import { registerAITools } from './tools/ai-tools.js';
import { registerProviderTools } from './tools/provider-tools.js';
import { registerExportTools } from './tools/export-tools.js';
import { registerProjectResources } from './resources/project-resource.js';
import { registerWorkResources } from './resources/work-resource.js';
import { registerVideoPrompts } from './prompts/video-prompts.js';
import { logger } from './utils/logger.js';

async function main() {
  try {
    // Load configuration
    const config = await loadConfig();
    logger.info('Configuration loaded successfully');

    // Create AutoVio API client
    const client = new AutoVioClient(config.autovio, config.providers);
    logger.info(`AutoVio client connected to ${config.autovio.baseUrl}`);

    // Create MCP server
    const server = new Server(
      {
        name: config.server.name,
        version: config.server.version,
      },
      {
        capabilities: {
          tools: {},
          resources: config.features.enableResources ? {} : undefined,
          prompts: config.features.enablePrompts ? {} : undefined,
        },
      }
    );

    // Register all tools
    logger.info('Registering MCP tools...');
    registerAuthTools(server, client);
    registerProjectTools(server, client);
    registerWorkTools(server, client);
    registerAITools(server, client);
    registerProviderTools(server, client);
    registerExportTools(server, client);
    logger.info('Tools registered successfully');

    // Register resources (optional)
    if (config.features.enableResources) {
      logger.info('Registering MCP resources...');
      registerProjectResources(server, client);
      registerWorkResources(server, client);
      logger.info('Resources registered successfully');
    }

    // Register prompts (optional)
    if (config.features.enablePrompts) {
      logger.info('Registering MCP prompts...');
      registerVideoPrompts(server, client);
      logger.info('Prompts registered successfully');
    }

    // Start server with stdio transport
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    logger.info('AutoVio MCP Server started successfully');
    logger.info('Server is ready to accept connections');

  } catch (error) {
    logger.error('Failed to start AutoVio MCP Server:', error);
    process.exit(1);
  }
}

main();
```

---

## 📄 Package.json Configuration

```json
{
  "name": "@autovio/mcp-server",
  "version": "1.0.0",
  "description": "AutoVio MCP Server - AI-powered video automation via Model Context Protocol",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "bin": {
    "autovio-mcp": "./dist/index.js"
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE",
    "examples"
  ],
  "scripts": {
    "build": "tsc",
    "dev": "tsx watch src/index.ts",
    "start": "node dist/index.js",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src --ext .ts",
    "prepare": "npm run build"
  },
  "keywords": [
    "mcp",
    "model-context-protocol",
    "autovio",
    "video-automation",
    "ai",
    "claude",
    "llm"
  ],
  "author": "AutoVio Team",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/autovio/mcp-server.git"
  },
  "bugs": {
    "url": "https://github.com/autovio/mcp-server/issues"
  },
  "homepage": "https://github.com/autovio/mcp-server#readme",
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.5.0",
    "axios": "^1.6.0",
    "dotenv": "^17.3.1",
    "zod": "^3.24.2",
    "zod-to-json-schema": "^3.22.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.0.0",
    "tsx": "^4.19.2",
    "typescript": "^5.7.3",
    "vitest": "^1.0.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

---

## 📖 README.md Structure

```markdown
# AutoVio MCP Server

AI-powered video automation via Model Context Protocol.

## Installation

```bash
npm install -g @autovio/mcp-server
```

## Quick Start

1. Create configuration file:
```bash
autovio-mcp init
```

2. Edit `autovio.config.json`

3. Add to Claude Desktop config:
```json
{
  "mcpServers": {
    "autovio": {
      "command": "autovio-mcp",
      "args": ["--config", "/path/to/autovio.config.json"]
    }
  }
}
```

## Configuration

[Detailed config docs]

## Available Tools

[List of all tools with examples]

## Available Resources

[List of all resources]

## Available Prompts

[List of all prompts]

## Examples

[Usage examples]

## License

MIT
```

---

## 🧪 Testing Strategy

### Unit Tests

```typescript
// tests/tools/auth-tools.test.ts

import { describe, it, expect, vi } from 'vitest';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { AutoVioClient } from '../../src/client/autovio-client.js';
import { registerAuthTools } from '../../src/tools/auth-tools.js';

describe('Auth Tools', () => {
  it('should register autovio_auth_login tool', async () => {
    const server = new Server({ name: 'test', version: '1.0.0' });
    const client = vi.mocked(AutoVioClient);
    
    registerAuthTools(server, client);
    
    const tools = await server.listTools();
    expect(tools.tools).toContainEqual(
      expect.objectContaining({ name: 'autovio_auth_login' })
    );
  });
  
  it('should login successfully', async () => {
    // Test implementation
  });
});
```

### Integration Tests

```typescript
// tests/integration/full-workflow.test.ts

import { describe, it, expect } from 'vitest';

describe('Full Video Creation Workflow', () => {
  it('should create video from scratch', async () => {
    // 1. Create project
    // 2. Create work
    // 3. Generate scenario
    // 4. Generate scenes
    // 5. Export video
  });
});
```

---

## 📦 NPM Publishing Checklist

### Pre-publish

- [ ] `npm run typecheck` - No TypeScript errors
- [ ] `npm run test` - All tests pass
- [ ] `npm run build` - Build succeeds
- [ ] `npm run lint` - No linting errors
- [ ] README.md complete
- [ ] LICENSE file added
- [ ] CHANGELOG.md created
- [ ] Version bumped in package.json

### Publish

```bash
# Dry run
npm publish --dry-run

# Publish to NPM
npm publish --access public
```

### Post-publish

- [ ] Create GitHub release
- [ ] Update documentation
- [ ] Announce on social media

---

## 🎯 İmplementasyon Roadmap

### Phase 1: Core Foundation (Week 1)
- [ ] Project setup (tsconfig, package.json, folder structure)
- [ ] Config schema ve validation (Zod)
- [ ] AutoVio API client temel implementasyonu
- [ ] Logger ve error handling utilities
- [ ] Basic MCP server boilerplate

### Phase 2: Tools Implementation (Week 2)
- [ ] Authentication tools
- [ ] Project tools
- [ ] Work tools
- [ ] Provider tools
- [ ] Unit tests for tools

### Phase 3: AI Tools & Resources (Week 3)
- [ ] AI analysis tools
- [ ] AI generation tools
- [ ] MCP Resources implementation
- [ ] Integration tests

### Phase 4: Prompts & Polish (Week 4)
- [ ] MCP Prompts implementation
- [ ] Error handling improvements
- [ ] Documentation (README, examples)
- [ ] End-to-end testing

### Phase 5: NPM Package & Release (Week 5)
- [ ] Package optimization
- [ ] Final testing
- [ ] NPM publish
- [ ] GitHub release

---

## 🔍 Key Design Decisions

### 1. Config-driven Provider Management

**Rationale:** Kullanıcı hangi işlem için hangi AI provider kullanacağını config dosyasında belirler. Bu:
- API key'leri merkezi yönetir
- Her tool çağrısında provider belirtmeyi gereksiz kılar
- Maliyet optimizasyonu sağlar (ucuz provider'lar tercih edilebilir)

### 2. OpenAPI Schema Reuse

**Rationale:** Backend'deki OpenAPI schemas Zod formatına çevrilerek MCP tool input validation'da kullanılır. Bu:
- Single source of truth sağlar
- Manuel schema yazma ihtiyacını ortadan kaldırır
- API değişiklikleri otomatik yansır

### 3. Resource-based Data Access

**Rationale:** Claude'un context'e proje/work verilerini resource olarak çekmesi:
- Token kullanımını optimize eder
- Streaming data access sağlar
- Daha az tool call gerektirir

### 4. High-level Prompts

**Rationale:** Karmaşık iş akışlarını (multi-step) tek prompt ile başlatma:
- Kullanıcı deneyimini basitleştirir
- Best practices'i encode eder
- Yeni kullanıcılar için onboarding kolaylaştırır

---

## 📋 Error Handling Strategy

### Custom Error Classes

```typescript
// src/utils/errors.ts

export class AutoVioMCPError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'AutoVioMCPError';
  }
}

export class ConfigurationError extends AutoVioMCPError {
  constructor(message: string, details?: any) {
    super(message, 'CONFIG_ERROR', undefined, details);
    this.name = 'ConfigurationError';
  }
}

export class APIError extends AutoVioMCPError {
  constructor(message: string, statusCode: number, details?: any) {
    super(message, 'API_ERROR', statusCode, details);
    this.name = 'APIError';
  }
}

export class ToolExecutionError extends AutoVioMCPError {
  constructor(toolName: string, message: string, details?: any) {
    super(`Tool '${toolName}' failed: ${message}`, 'TOOL_ERROR', undefined, details);
    this.name = 'ToolExecutionError';
  }
}
```

### Error Response Format

MCP tool error response:

```typescript
{
  content: [
    {
      type: "text",
      text: JSON.stringify({
        error: "TOOL_ERROR",
        message: "Failed to create project",
        details: {
          statusCode: 400,
          apiError: "Invalid project name"
        }
      }, null, 2)
    }
  ],
  isError: true
}
```

---

## 🎓 Learning Resources

### MCP Documentation
- https://modelcontextprotocol.io/docs
- https://github.com/modelcontextprotocol/servers (example servers)

### Claude Desktop Integration
- https://docs.anthropic.com/claude/docs/model-context-protocol

### TypeScript & Node.js
- https://www.typescriptlang.org/docs/
- https://nodejs.org/en/docs/

---

## ✅ Success Criteria

Proje başarılı sayılır eğer:

1. ✅ NPM'de `@autovio/mcp-server` paketi publish edilmiş
2. ✅ Claude Desktop'ta çalışıyor
3. ✅ Tüm CRUD operations test edilmiş
4. ✅ En az 3 AI workflow prompt'u hazır
5. ✅ Dokümantasyon complete
6. ✅ Unit test coverage >80%
7. ✅ Zero critical bugs

---

## 📞 Support & Contribution

GitHub Issues: https://github.com/autovio/mcp-server/issues
Discussions: https://github.com/autovio/mcp-server/discussions

---

**Son Güncelleme:** 2024-03-05
**Versiyon:** 1.0.0
**Yazar:** AutoVio Team
