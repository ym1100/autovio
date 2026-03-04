/**
 * AutoVio API OpenAPI 3.0 Documentation
 * Manually crafted OpenAPI spec with detailed schemas
 */

export function generateOpenAPIDocument() {
  return {
    openapi: "3.0.0",
    info: {
      title: "AutoVio API",
      version: "1.0.0",
      description:
        "AI-powered video automation platform API. Generate videos from reference analysis, create scenes with AI, and export professional videos with timeline editing.",
      contact: {
        name: "AutoVio Support",
        email: "support@autovio.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3001",
        description: "Development server",
      },
      {
        url: "https://api.autovio.com",
        description: "Production server",
      },
    ],
    tags: [
      { name: "Authentication", description: "User authentication and session management" },
      { name: "API Tokens", description: "API token management with scoped permissions" },
      { name: "Projects", description: "Video project management" },
      { name: "Works", description: "Video pipeline workflows" },
      { name: "AI Analysis", description: "Video analysis using vision AI" },
      { name: "AI Scenario", description: "Scene generation using LLMs" },
      { name: "AI Generation", description: "Image and video generation" },
      { name: "Assets", description: "Project asset management" },
      { name: "Templates", description: "Reusable overlay templates" },
      { name: "Style Guide", description: "Brand style guide extraction" },
      { name: "Providers", description: "Available AI providers" },
      { name: "Export", description: "Video export" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT access token from /api/auth/login",
        },
      },
      schemas: {
        // Auth
        RegisterRequest: {
          type: "object",
          required: ["email", "password", "name"],
          properties: {
            email: { type: "string", format: "email", example: "user@example.com" },
            password: { type: "string", minLength: 8, example: "SecurePass123!" },
            name: { type: "string", minLength: 1, example: "John Doe" },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email", example: "user@example.com" },
            password: { type: "string", example: "SecurePass123!" },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            accessToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
            refreshToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
            user: {
              type: "object",
              properties: {
                id: { type: "string", example: "507f191e810c19729de860ea" },
                email: { type: "string", example: "user@example.com" },
                name: { type: "string", example: "John Doe" },
              },
            },
          },
        },

        // Style Guide
        StyleGuide: {
          type: "object",
          properties: {
            tone: { type: "string", example: "professional" },
            color_palette: { type: "array", items: { type: "string" }, example: ["#FF5733", "#3498DB"] },
            tempo: { type: "string", example: "moderate" },
            camera_style: { type: "string", example: "dynamic" },
            brand_voice: { type: "string", example: "friendly and approachable" },
            must_include: { type: "array", items: { type: "string" }, example: ["company logo"] },
            must_avoid: { type: "array", items: { type: "string" }, example: ["competitor brands"] },
          },
        },

        // Projects
        CreateProjectRequest: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", example: "Summer Campaign 2024" },
            systemPrompt: { type: "string", example: "You are a creative video assistant..." },
            knowledge: { type: "string", example: "Our brand focuses on sustainability..." },
            styleGuide: { $ref: "#/components/schemas/StyleGuide" },
            imageSystemPrompt: { type: "string" },
            videoSystemPrompt: { type: "string" },
          },
        },
        ProjectResponse: {
          type: "object",
          properties: {
            _id: { type: "string", example: "507f1f77bcf86cd799439011" },
            userId: { type: "string", example: "507f191e810c19729de860ea" },
            name: { type: "string", example: "Summer Campaign 2024" },
            systemPrompt: { type: "string" },
            knowledge: { type: "string" },
            styleGuide: { $ref: "#/components/schemas/StyleGuide" },
            imageSystemPrompt: { type: "string" },
            videoSystemPrompt: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },

        // Works
        CreateWorkRequest: {
          type: "object",
          required: ["mode"],
          properties: {
            mode: { type: "string", enum: ["style_transfer", "content_remix"], example: "style_transfer" },
            productName: { type: "string", example: "EcoBottle Pro" },
            productDescription: { type: "string", example: "Sustainable water bottle..." },
            targetAudience: { type: "string", example: "Eco-conscious millennials" },
          },
        },
        WorkResponse: {
          type: "object",
          properties: {
            _id: { type: "string", example: "507f1f77bcf86cd799439012" },
            projectId: { type: "string", example: "507f1f77bcf86cd799439011" },
            userId: { type: "string" },
            currentStep: { type: "integer", minimum: 0, maximum: 4, example: 2 },
            mode: { type: "string", enum: ["style_transfer", "content_remix"] },
            hasReferenceVideo: { type: "boolean", example: true },
            productName: { type: "string" },
            productDescription: { type: "string" },
            targetAudience: { type: "string" },
            intent: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },

        // AI Analysis
        AnalysisResponse: {
          type: "object",
          properties: {
            scenes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  timestamp: { type: "number", example: 0 },
                  duration: { type: "number", example: 5 },
                  description: { type: "string", example: "Product showcase" },
                  visualElements: { type: "string" },
                  cameraMovement: { type: "string", example: "slow zoom in" },
                  transition: { type: "string", example: "fade" },
                },
              },
            },
            tone: { type: "string", example: "professional" },
            colors: { type: "array", items: { type: "string" } },
            tempo: { type: "string", example: "moderate" },
            textOverlays: { type: "array", items: { type: "object" } },
            cameraMovements: { type: "array", items: { type: "string" } },
          },
        },

        // AI Scenario
        ScenarioRequest: {
          type: "object",
          required: ["intent"],
          properties: {
            analysis: { $ref: "#/components/schemas/AnalysisResponse" },
            intent: { type: "string", example: "Create an engaging product showcase" },
            systemPrompt: { type: "string" },
            knowledge: { type: "string" },
            styleGuide: { $ref: "#/components/schemas/StyleGuide" },
          },
        },
        ScenarioResponse: {
          type: "object",
          properties: {
            scenes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  index: { type: "integer", example: 0 },
                  imagePrompt: { type: "string", example: "A sleek product..." },
                  videoPrompt: { type: "string", example: "Smooth camera movement..." },
                  duration: { type: "number", example: 5 },
                  transition: { type: "string", example: "fade" },
                  textOverlays: { type: "array", items: { type: "object" } },
                },
              },
            },
          },
        },

        // AI Generation
        GenerateImageRequest: {
          type: "object",
          required: ["prompt"],
          properties: {
            prompt: { type: "string", example: "A modern eco-friendly water bottle" },
            negative_prompt: { type: "string", default: "", example: "blurry, low quality" },
            image_instruction: { type: "string" },
            styleGuide: { $ref: "#/components/schemas/StyleGuide" },
          },
        },
        GenerateImageResponse: {
          type: "object",
          properties: {
            imageUrl: { type: "string", format: "uri", example: "https://example.com/image.png" },
          },
        },
        GenerateVideoRequest: {
          type: "object",
          required: ["image_url", "prompt"],
          properties: {
            image_url: { type: "string", format: "uri" },
            prompt: { type: "string", example: "Smooth zoom in on the product" },
            duration: { type: "number", default: 5, example: 5 },
            video_instruction: { type: "string" },
            styleGuide: { $ref: "#/components/schemas/StyleGuide" },
          },
        },
        GenerateVideoResponse: {
          type: "object",
          properties: {
            videoUrl: { type: "string", format: "uri", example: "https://example.com/video.mp4" },
          },
        },

        // Error
        Error: {
          type: "object",
          properties: {
            error: { type: "string", example: "Resource not found" },
            details: { type: "string", example: "The requested project does not exist" },
          },
        },
      },
    },
    paths: {
      "/api/health": {
        get: {
          tags: ["Health"],
          summary: "Health check",
          responses: {
            200: {
              description: "Server is healthy",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string", example: "ok" },
                      timestamp: { type: "string", format: "date-time" },
                    },
                  },
                },
              },
            },
          },
        },
      },

      "/api/auth/register": {
        post: {
          tags: ["Authentication"],
          summary: "Register a new user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RegisterRequest" },
              },
            },
          },
          responses: {
            201: {
              description: "User registered successfully",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AuthResponse" },
                },
              },
            },
            409: {
              description: "Email already exists",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
          },
        },
      },

      "/api/auth/login": {
        post: {
          tags: ["Authentication"],
          summary: "Login with email and password",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginRequest" },
              },
            },
          },
          responses: {
            200: {
              description: "Login successful",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AuthResponse" },
                },
              },
            },
            401: {
              description: "Invalid credentials",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
          },
        },
      },

      "/api/projects": {
        get: {
          tags: ["Projects"],
          summary: "List all projects",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "List of projects",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/ProjectResponse" },
                  },
                },
              },
            },
            401: {
              description: "Not authenticated",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
          },
        },
        post: {
          tags: ["Projects"],
          summary: "Create a new project",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateProjectRequest" },
              },
            },
          },
          responses: {
            201: {
              description: "Project created",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ProjectResponse" },
                },
              },
            },
            401: {
              description: "Not authenticated",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
          },
        },
      },

      "/api/projects/{id}": {
        get: {
          tags: ["Projects"],
          summary: "Get project by ID",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              example: "507f1f77bcf86cd799439011",
            },
          ],
          responses: {
            200: {
              description: "Project details",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ProjectResponse" },
                },
              },
            },
            404: {
              description: "Project not found",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
          },
        },
        put: {
          tags: ["Projects"],
          summary: "Update project",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateProjectRequest" },
              },
            },
          },
          responses: {
            200: {
              description: "Project updated",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ProjectResponse" },
                },
              },
            },
            404: {
              description: "Project not found",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
          },
        },
        delete: {
          tags: ["Projects"],
          summary: "Delete project",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            204: {
              description: "Project deleted",
            },
            404: {
              description: "Project not found",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
          },
        },
      },

      "/api/projects/{projectId}/works": {
        get: {
          tags: ["Works"],
          summary: "List all works for a project",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "projectId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: {
              description: "List of works",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/WorkResponse" },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ["Works"],
          summary: "Create a new work",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "projectId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateWorkRequest" },
              },
            },
          },
          responses: {
            201: {
              description: "Work created",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/WorkResponse" },
                },
              },
            },
          },
        },
      },

      "/api/analyze": {
        post: {
          tags: ["AI Analysis"],
          summary: "Analyze reference video",
          description: "Analyzes a video using vision AI to extract scenes, tone, colors, and camera movements. Requires multipart/form-data with video file.",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "x-vision-provider",
              in: "header",
              schema: { type: "string" },
              description: "Vision AI provider (gemini, claude, openai)",
              example: "gemini",
            },
            {
              name: "x-model-id",
              in: "header",
              schema: { type: "string" },
              description: "Model ID",
              example: "gemini-2.0-flash-exp",
            },
            {
              name: "x-api-key",
              in: "header",
              schema: { type: "string" },
              description: "Provider API key",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  required: ["video", "mode"],
                  properties: {
                    video: { type: "string", format: "binary", description: "Video file" },
                    mode: { type: "string", enum: ["style_transfer", "content_remix"] },
                    analyzerPrompt: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Analysis complete",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AnalysisResponse" },
                },
              },
            },
            400: {
              description: "Bad request",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
          },
        },
      },

      "/api/scenario": {
        post: {
          tags: ["AI Scenario"],
          summary: "Generate scene-by-scene scenario",
          description: "Creates a detailed video scenario with image/video prompts for each scene using LLM.",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "x-llm-provider",
              in: "header",
              schema: { type: "string" },
              description: "LLM provider (gemini, claude, openai)",
              example: "openai",
            },
            {
              name: "x-model-id",
              in: "header",
              schema: { type: "string" },
              example: "gpt-4",
            },
            {
              name: "x-api-key",
              in: "header",
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ScenarioRequest" },
              },
            },
          },
          responses: {
            200: {
              description: "Scenario generated",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ScenarioResponse" },
                },
              },
            },
          },
        },
      },

      "/api/generate/image": {
        post: {
          tags: ["AI Generation"],
          summary: "Generate image from text prompt",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "x-image-provider",
              in: "header",
              schema: { type: "string" },
              example: "dalle",
            },
            {
              name: "x-model-id",
              in: "header",
              schema: { type: "string" },
              example: "dall-e-3",
            },
            {
              name: "x-api-key",
              in: "header",
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/GenerateImageRequest" },
              },
            },
          },
          responses: {
            200: {
              description: "Image generated",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/GenerateImageResponse" },
                },
              },
            },
          },
        },
      },

      "/api/generate/video": {
        post: {
          tags: ["AI Generation"],
          summary: "Generate video from image (image-to-video)",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "x-video-provider",
              in: "header",
              schema: { type: "string" },
              example: "runway",
            },
            {
              name: "x-model-id",
              in: "header",
              schema: { type: "string" },
              example: "gen-3",
            },
            {
              name: "x-api-key",
              in: "header",
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/GenerateVideoRequest" },
              },
            },
          },
          responses: {
            200: {
              description: "Video generated",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/GenerateVideoResponse" },
                },
              },
            },
          },
        },
      },

      "/api/providers": {
        get: {
          tags: ["Providers"],
          summary: "List all available AI providers and models",
          responses: {
            200: {
              description: "List of providers",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      vision: { type: "array", items: { type: "object" } },
                      llm: { type: "array", items: { type: "object" } },
                      image: { type: "array", items: { type: "object" } },
                      video: { type: "array", items: { type: "object" } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };
}
