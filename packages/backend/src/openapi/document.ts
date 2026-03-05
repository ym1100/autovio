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
      { name: "Health", description: "API health check" },
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
        UserResponse: {
          type: "object",
          description: "Current user info (GET /api/auth/me). Timestamps are Unix milliseconds.",
          properties: {
            id: { type: "string", example: "e581655d-f76c-4ee4-a0fb-7beadedd30e7" },
            email: { type: "string", example: "admin@autovio.local" },
            name: { type: "string", example: "Admin" },
            createdAt: { type: "number", description: "Unix timestamp in milliseconds" },
            updatedAt: { type: "number", description: "Unix timestamp in milliseconds" },
          },
        },

        // Style Guide (Brand Elements: UI'da "Brand Elements" bölümü = brand_voice vb.; proje ile kaydedilir)
        StyleGuide: {
          type: "object",
          description:
            "Proje stil rehberi. UI'daki 'Brand Elements' alanları bu objede yer alır. POST/PUT /api/projects ile project.styleGuide olarak kaydedilir; senaryo ve görsel/video üretiminde kullanılır.",
          example: {
            tone: "professional",
            color_palette: ["#FF5733", "#3498DB"],
            tempo: "medium",
            camera_style: "Static and slow pans",
            brand_voice: "Friendly and approachable; our brand focuses on clarity and simplicity.",
            must_include: ["logo watermark"],
            must_avoid: ["heavy shadows", "neon colors"],
          },
          properties: {
            tone: { type: "string", description: "Genel ton (örn. energetic, professional)." },
            color_palette: { type: "array", items: { type: "string" }, description: "Hex renk kodları." },
            tempo: { type: "string", enum: ["fast", "medium", "slow"], description: "Video ritmi. Backend sadece bu değerleri kabul eder." },
            camera_style: { type: "string", description: "Kamera hareketi tercihleri." },
            brand_voice: { type: "string", description: "Marka iletişim tonu (Brand Elements – Brand Voice). UI'da 'Brand Elements' altında gösterilir." },
            must_include: { type: "array", items: { type: "string" }, description: "Mutlaka görünmesi istenen öğeler." },
            must_avoid: { type: "array", items: { type: "string" }, description: "Kullanılmaması istenen öğeler." },
          },
        },

        // Projects
        CreateProjectRequest: {
          type: "object",
          description:
            "All listed fields are applied on create. Optional fields use backend defaults if omitted.",
          example: {
            name: "Summer Campaign 2024",
            systemPrompt: "Custom prompt",
            knowledge: "Brand info",
            styleGuide: {
              tone: "professional",
              color_palette: ["#FF5733", "#3498DB"],
              tempo: "medium",
              camera_style: "Static and slow pans",
              brand_voice: "Friendly and approachable; our brand focuses on clarity.",
              must_include: ["logo watermark"],
              must_avoid: ["heavy shadows", "neon colors"],
            },
            imageSystemPrompt: "Image instructions",
            videoSystemPrompt: "Video instructions",
          },
          properties: {
            name: { type: "string", description: "Project name (default: Yeni Proje)." },
            systemPrompt: { type: "string" },
            knowledge: { type: "string" },
            styleGuide: { $ref: "#/components/schemas/StyleGuide" },
            imageSystemPrompt: { type: "string" },
            videoSystemPrompt: { type: "string" },
          },
        },
        UpdateProjectRequest: {
          type: "object",
          description:
            "Full project object for PUT /api/projects/{id}. Body must include 'id' matching path parameter. All fields are persisted.",
          example: {
            id: "proj_1234567890_abc12de",
            userId: "e581655d-f76c-4ee4-a0fb-7beadedd30e7",
            name: "Updated Project Name",
            systemPrompt: "Custom system prompt",
            knowledge: "Brand context",
            analyzerPrompt: "",
            styleGuide: {
              tone: "professional",
              color_palette: ["#FF5733", "#3498DB"],
              tempo: "medium",
              camera_style: "Static and slow pans",
              brand_voice: "Friendly and approachable; our brand focuses on clarity.",
              must_include: ["logo watermark"],
              must_avoid: ["heavy shadows", "neon colors"],
            },
            imageSystemPrompt: "Custom image instructions",
            videoSystemPrompt: "Custom video instructions",
            createdAt: 1700000000000,
            updatedAt: 1700000001000,
          },
          required: ["id", "name"],
          properties: {
            id: { type: "string", description: "Must match path {id}" },
            userId: { type: "string" },
            name: { type: "string" },
            systemPrompt: { type: "string" },
            knowledge: { type: "string" },
            analyzerPrompt: { type: "string" },
            styleGuide: { $ref: "#/components/schemas/StyleGuide" },
            imageSystemPrompt: { type: "string" },
            videoSystemPrompt: { type: "string" },
            createdAt: { type: "number", description: "Unix timestamp (ms)" },
            updatedAt: { type: "number", description: "Unix timestamp (ms)" },
          },
        },
        ProjectMeta: {
          type: "object",
          description: "Minimal project info returned by GET /api/projects (list). Full details via GET /api/projects/{id}.",
          properties: {
            id: { type: "string", description: "Project ID" },
            userId: { type: "string" },
            name: { type: "string" },
            updatedAt: { type: "number", description: "Unix timestamp in milliseconds" },
          },
        },
        ProjectResponse: {
          type: "object",
          description: "Full project entity (GET /api/projects/{id} or POST response). ID is returned as 'id'. Timestamps are Unix milliseconds. styleGuide may be absent if not set.",
          properties: {
            id: { type: "string", example: "proj_1772669015410_40ofxu7", description: "Project ID" },
            _id: { type: "string", deprecated: true, description: "Use 'id' instead" },
            userId: { type: "string", example: "e581655d-f76c-4ee4-a0fb-7beadedd30e7" },
            name: { type: "string", example: "Summer Campaign 2024" },
            systemPrompt: { type: "string" },
            knowledge: { type: "string" },
            styleGuide: { $ref: "#/components/schemas/StyleGuide" },
            imageSystemPrompt: { type: "string" },
            videoSystemPrompt: { type: "string" },
            analyzerPrompt: { type: "string" },
            createdAt: { type: "number", description: "Unix timestamp in milliseconds" },
            updatedAt: { type: "number", description: "Unix timestamp in milliseconds" },
          },
        },

        // Works
        CreateWorkRequest: {
          type: "object",
          description:
            "All listed fields are applied on create. Default: start from scratch (no reference video). mode defaults to style_transfer.",
          example: {
            name: "Test Work",
            mode: "content_remix",
            productName: "EcoBottle",
            productDescription: "Green bottle",
            targetAudience: "Eco users",
            language: "tr",
            videoDuration: 20,
            sceneCount: 4,
          },
          properties: {
            name: { type: "string", description: "Work name (default: Yeni Çalışma)." },
            mode: { type: "string", enum: ["style_transfer", "content_remix"] },
            productName: { type: "string" },
            productDescription: { type: "string" },
            targetAudience: { type: "string" },
            language: { type: "string" },
            videoDuration: { type: "number", description: "Target video duration in seconds." },
            sceneCount: { type: "number", description: "Number of scenes for scenario generation." },
          },
        },
        WorkSceneItem: {
          type: "object",
          description: "One scene in work.scenes. Same shape as POST /api/scenario response items (snake_case). Save scenario output by putting it in PUT body.scenes.",
          properties: {
            scene_index: { type: "number" },
            duration_seconds: { type: "number" },
            image_prompt: { type: "string" },
            negative_prompt: { type: "string" },
            video_prompt: { type: "string" },
            text_overlay: { type: "string" },
            transition: { type: "string" },
          },
        },
        UpdateWorkRequest: {
          type: "object",
          description:
            "Full work object for PUT. Body id and projectId must match path. Sahneler: POST /api/scenario çıktısını body.scenes olarak gönderin. Editör: videoya eklenen text/image overlay'ler body.editorState içinde (editorData.textTrack, imageTrack, textOverlays, imageOverlays, exportSettings) gönderilir; ayrı overlay endpoint'i yok.",
          required: ["id", "projectId", "name", "createdAt", "updatedAt", "currentStep", "hasReferenceVideo", "mode"],
          example: {
            id: "work_1772669705500_qzamfe9",
            projectId: "proj_1772669528088_8dt51un",
            name: "Güncellenmiş Work Adı",
            createdAt: 1772669705500,
            updatedAt: 1700000002000,
            systemPrompt: "Custom system prompt",
            analyzerPrompt: "",
            imageSystemPrompt: "Custom image instructions",
            videoSystemPrompt: "Custom video instructions",
            currentStep: 0,
            hasReferenceVideo: false,
            mode: "style_transfer",
            productName: "EcoBottle Pro",
            productDescription: "Sustainable bottle",
            targetAudience: "Eco users",
            language: "",
            analysis: null,
            scenes: [
              { scene_index: 0, duration_seconds: 5, image_prompt: "Product on white background", negative_prompt: "", video_prompt: "Slow zoom in", text_overlay: "", transition: "cut" },
            ],
            generatedScenes: [],
            editorState: {
              editorData: { videoTrack: [], textTrack: [], imageTrack: [], audioTrack: [] },
              textOverlays: {},
              imageOverlays: {},
              exportSettings: { width: 1080, height: 1920, fps: 30 },
            },
          },
          properties: {
            id: { type: "string" },
            projectId: { type: "string" },
            name: { type: "string" },
            createdAt: { type: "number" },
            updatedAt: { type: "number" },
            systemPrompt: { type: "string" },
            analyzerPrompt: { type: "string" },
            imageSystemPrompt: { type: "string" },
            videoSystemPrompt: { type: "string" },
            currentStep: { type: "integer", minimum: 0, maximum: 4 },
            hasReferenceVideo: { type: "boolean" },
            mode: { type: "string", enum: ["style_transfer", "content_remix"] },
            productName: { type: "string" },
            productDescription: { type: "string" },
            targetAudience: { type: "string" },
            language: { type: "string" },
            videoDuration: { type: "number" },
            sceneCount: { type: "number" },
            analysis: { type: "object", nullable: true },
            scenes: {
              type: "array",
              items: { $ref: "#/components/schemas/WorkSceneItem" },
              description: "Sahne listesi. POST /api/scenario yanıtındaki scenes buraya konup PUT ile kaydedilir.",
            },
            generatedScenes: {
              type: "array",
              items: { type: "object" },
              description: "Üretilen sahne medya durumları (image/video URL vb.).",
            },
            editorState: {
              type: "object",
              description: "Editör sekmesi state: timeline (editorData.videoTrack, textTrack, imageTrack, audioTrack), textOverlays, imageOverlays, exportSettings. UI'da videoya eklenen text/image overlay'ler burada; PUT ile gönderilir.",
            },
          },
        },
        WorkResponse: {
          type: "object",
          description: "Work (video pipeline) entity. ID is returned as 'id'. Timestamps are Unix milliseconds. editorState contains timeline and overlays (e.g. after POST .../apply-template).",
          properties: {
            id: { type: "string", example: "work_1772669049563_kpb3uhd", description: "Work ID" },
            _id: { type: "string", deprecated: true, description: "Use 'id' instead" },
            projectId: { type: "string", example: "proj_1772669015410_40ofxu7" },
            userId: { type: "string", description: "Optional; may be omitted in list/detail" },
            name: { type: "string", example: "Yeni Çalışma" },
            systemPrompt: { type: "string" },
            analyzerPrompt: { type: "string" },
            imageSystemPrompt: { type: "string" },
            videoSystemPrompt: { type: "string" },
            currentStep: { type: "integer", minimum: 0, maximum: 4, example: 0 },
            hasReferenceVideo: { type: "boolean", example: false },
            mode: { type: "string", enum: ["style_transfer", "content_remix"] },
            productName: { type: "string" },
            productDescription: { type: "string" },
            targetAudience: { type: "string" },
            language: { type: "string" },
            videoDuration: { type: "number", description: "Target video duration in seconds." },
            sceneCount: { type: "number", description: "Number of scenes." },
            intent: { type: "string" },
            analysis: { type: "object", nullable: true },
            scenes: { type: "array", items: { type: "object" } },
            generatedScenes: { type: "array", items: { type: "object" } },
            editorState: {
              type: "object",
              description: "Editor state: editorData (videoTrack, textTrack, imageTrack, audioTrack), textOverlays, imageOverlays, exportSettings. Set by PUT work or POST .../apply-template.",
              properties: {
                editorData: {
                  type: "object",
                  properties: {
                    videoTrack: { type: "array", items: { $ref: "#/components/schemas/TimelineActionSnapshot" } },
                    textTrack: { type: "array", items: { $ref: "#/components/schemas/TimelineActionSnapshot" } },
                    imageTrack: { type: "array", items: { $ref: "#/components/schemas/TimelineActionSnapshot" } },
                    audioTrack: { type: "array", items: { $ref: "#/components/schemas/TimelineActionSnapshot" } },
                  },
                },
                textOverlays: { type: "object", additionalProperties: { $ref: "#/components/schemas/TextOverlaySnapshot" } },
                imageOverlays: { type: "object", additionalProperties: { $ref: "#/components/schemas/ImageOverlaySnapshot" } },
                exportSettings: { type: "object", properties: { width: { type: "number" }, height: { type: "number" }, fps: { type: "number" } } },
              },
            },
            createdAt: { type: "number", description: "Unix timestamp in milliseconds" },
            updatedAt: { type: "number", description: "Unix timestamp in milliseconds" },
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
        UserIntent: {
          type: "object",
          required: ["mode"],
          description: "What kind of video to create. Required by POST /api/scenario.",
          example: {
            mode: "style_transfer",
            product_name: "EcoBottle",
            product_description: "Sustainable water bottle",
            target_audience: "Eco-conscious users",
            video_duration: 15,
            scene_count: 3,
          },
          properties: {
            mode: { type: "string", enum: ["style_transfer", "content_remix"] },
            product_name: { type: "string" },
            product_description: { type: "string" },
            target_audience: { type: "string" },
            language: { type: "string" },
            video_duration: { type: "number", description: "Target total duration in seconds" },
            scene_count: { type: "number", description: "Sahne sayısı – number of scenes to generate" },
          },
        },
        ScenarioRequest: {
          type: "object",
          required: ["intent"],
          description: "LLM generates scene-by-scene scenario. intent is object (mode required). Sahne sayısı: intent.scene_count.",
          example: {
            intent: { mode: "style_transfer", product_name: "EcoBottle", product_description: "Sustainable bottle", target_audience: "Eco users", video_duration: 15, scene_count: 3 },
            styleGuide: {
              tone: "professional",
              color_palette: ["#3498DB"],
              tempo: "medium",
              brand_voice: "Eco-friendly and trustworthy.",
              must_include: ["natural lighting"],
              must_avoid: ["plastic imagery"],
            },
          },
          properties: {
            analysis: { $ref: "#/components/schemas/ScenarioAnalysisInput" },
            intent: { $ref: "#/components/schemas/UserIntent" },
            systemPrompt: { type: "string" },
            knowledge: { type: "string" },
            styleGuide: { $ref: "#/components/schemas/StyleGuide" },
          },
        },
        ScenarioAnalysisInput: {
          type: "object",
          description: "Optional. Reference video analysis (e.g. from POST /api/analyze). If omitted, scenario is generated from scratch.",
          properties: {
            scene_count: { type: "number" },
            overall_tone: { type: "string" },
            color_palette: { type: "array", items: { type: "string" } },
            tempo: { type: "string" },
            has_text_overlay: { type: "boolean" },
            scenes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  index: { type: "number" },
                  duration_seconds: { type: "number" },
                  description: { type: "string" },
                  transition: { type: "string" },
                  text_overlay: { type: "string" },
                  camera_movement: { type: "string" },
                },
              },
            },
          },
        },
        ScenarioResponse: {
          type: "object",
          description: "Response uses snake_case. Each scene has image_prompt, video_prompt, duration_seconds, etc. Scenes are also persisted to the work (POST .../scenario).",
          example: {
            scenes: [
              {
                scene_index: 0,
                duration_seconds: 5,
                image_prompt: "Low-angle shot of a BMW M4 drifting on asphalt, tire smoke, golden hour.",
                negative_prompt: "illustration, cartoon, blurry, low quality",
                video_prompt: "Camera tracks the drift; tire smoke billows naturally.",
                text_overlay: "",
                transition: "cut",
              },
            ],
          },
          properties: {
            scenes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  scene_index: { type: "integer" },
                  duration_seconds: { type: "number" },
                  image_prompt: { type: "string" },
                  negative_prompt: { type: "string" },
                  video_prompt: { type: "string" },
                  text_overlay: { type: "string" },
                  transition: { type: "string" },
                },
              },
            },
          },
        },

        // AI Generation
        GenerateImageRequest: {
          type: "object",
          required: ["prompt"],
          example: {
            prompt: "Product photo, studio lighting",
            negative_prompt: "blurry, low quality",
            image_instruction: "Realistic photography style.",
            styleGuide: { tone: "professional", color_palette: ["#3498DB"], brand_voice: "Clean and modern." },
          },
          properties: {
            prompt: { type: "string" },
            negative_prompt: { type: "string", default: "" },
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
          example: {
            image_url: "https://example.com/frame.png",
            prompt: "Slow zoom in",
            duration: 5,
            video_instruction: "Smooth motion.",
            styleGuide: { tempo: "medium", brand_voice: "Calm and professional." },
          },
          properties: {
            image_url: { type: "string", format: "uri" },
            prompt: { type: "string" },
            duration: { type: "number", default: 5 },
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

        // Editor Templates (project-level reusable overlay compositions)
        TemplateTextOverlay: {
          type: "object",
          properties: {
            id: { type: "string" },
            text: { type: "string" },
            fontSize: { type: "number" },
            fontColor: { type: "string" },
            centerX: { type: "number" },
            centerY: { type: "number" },
            timingMode: { type: "string", enum: ["relative", "absolute"] },
            startPercent: { type: "number" },
            endPercent: { type: "number" },
            startSeconds: { type: "number" },
            endSeconds: { type: "number" },
          },
        },
        TemplateImageOverlay: {
          type: "object",
          properties: {
            id: { type: "string" },
            assetId: { type: "string" },
            width: { type: "number" },
            height: { type: "number" },
            centerX: { type: "number" },
            centerY: { type: "number" },
            opacity: { type: "number" },
            rotation: { type: "number" },
            maintainAspectRatio: { type: "boolean" },
            timingMode: { type: "string", enum: ["relative", "absolute"] },
            startPercent: { type: "number" },
            endPercent: { type: "number" },
            startSeconds: { type: "number" },
            endSeconds: { type: "number" },
          },
        },
        EditorTemplateContent: {
          type: "object",
          description: "Template content: text and image overlays; optional export settings.",
          properties: {
            textOverlays: { type: "array", items: { $ref: "#/components/schemas/TemplateTextOverlay" } },
            imageOverlays: { type: "array", items: { $ref: "#/components/schemas/TemplateImageOverlay" } },
            defaultTransition: { type: "object", properties: { type: { type: "string" }, duration: { type: "number" } } },
            exportSettings: { type: "object", properties: { width: { type: "number" }, height: { type: "number" }, fps: { type: "number" } } },
          },
        },
        EditorTemplate: {
          type: "object",
          description: "Full template (single template GET response).",
          properties: {
            id: { type: "string" },
            projectId: { type: "string" },
            name: { type: "string" },
            description: { type: "string" },
            thumbnail: { type: "string" },
            createdAt: { type: "number" },
            updatedAt: { type: "number" },
            content: { $ref: "#/components/schemas/EditorTemplateContent" },
            tags: { type: "array", items: { type: "string" } },
          },
        },
        EditorTemplateMeta: {
          type: "object",
          description: "Template list item (meta only). List returns templates array + count.",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            description: { type: "string" },
            thumbnail: { type: "string", description: "URL to GET .../templates/{id}/thumbnail when present" },
            createdAt: { type: "number" },
            updatedAt: { type: "number" },
            tags: { type: "array", items: { type: "string" } },
            textOverlayCount: { type: "number" },
            imageOverlayCount: { type: "number" },
            hasExportSettings: { type: "boolean" },
          },
        },
        CreateTemplateRequest: {
          type: "object",
          required: ["name", "content"],
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            tags: { type: "array", items: { type: "string" } },
            content: { $ref: "#/components/schemas/EditorTemplateContent" },
          },
        },
        UpdateTemplateRequest: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            tags: { type: "array", items: { type: "string" } },
            content: { $ref: "#/components/schemas/EditorTemplateContent" },
          },
        },
        TemplateApplicationRequest: {
          type: "object",
          required: ["videoDuration"],
          description: "Apply template to a video. templateId is in the path. videoDuration (seconds) is used to resolve relative timing. placeholderValues replace {{key}} in text overlays (e.g. product_name, brand, date, custom:label).",
          properties: {
            templateId: { type: "string", description: "Optional; templateId is also in the path." },
            videoDuration: { type: "number", description: "Total video duration in seconds." },
            placeholderValues: { type: "object", additionalProperties: { type: "string" }, description: "e.g. { \"product_name\": \"Su bardağı\", \"brand\": \"Marka\" }" },
          },
          example: { videoDuration: 5, placeholderValues: { product_name: "Su bardağı", brand: "Marka" } },
        },
        TemplateApplicationResult: {
          type: "object",
          description: "Result of apply: overlays and track actions to merge into editor state. Client applies these to the current work's editor.",
          properties: {
            textOverlays: { type: "object", additionalProperties: { $ref: "#/components/schemas/TextOverlaySnapshot" } },
            textTrackActions: { type: "array", items: { $ref: "#/components/schemas/TimelineActionSnapshot" } },
            imageOverlays: { type: "object", additionalProperties: { $ref: "#/components/schemas/ImageOverlaySnapshot" } },
            imageTrackActions: { type: "array", items: { $ref: "#/components/schemas/TimelineActionSnapshot" } },
            exportSettings: { type: "object", properties: { width: { type: "number" }, height: { type: "number" }, fps: { type: "number" } } },
            missingAssetIds: { type: "array", items: { type: "string" }, description: "Asset IDs referenced by template but not found in project" },
          },
        },
        ApplyTemplateToWorkRequest: {
          type: "object",
          required: ["templateId"],
          description: "Apply a template to a work and persist to work.editorState. videoDuration is taken from work.videoDuration or sum of work.scenes[].duration_seconds; overlays are merged into the work's editor state and the work is saved.",
          properties: {
            templateId: { type: "string", description: "ID of the template (same project)." },
            placeholderValues: {
              type: "object",
              additionalProperties: { type: "string" },
              description: "Replace {{key}} in text overlays (e.g. product_name, brand, date).",
            },
          },
        },
        TextOverlaySnapshot: {
          type: "object",
          properties: { text: { type: "string" }, fontSize: { type: "number" }, fontColor: { type: "string" }, centerX: { type: "number" }, centerY: { type: "number" } },
        },
        ImageOverlaySnapshot: {
          type: "object",
          properties: { assetId: { type: "string" }, width: { type: "number" }, height: { type: "number" }, centerX: { type: "number" }, centerY: { type: "number" }, opacity: { type: "number" }, rotation: { type: "number" }, maintainAspectRatio: { type: "boolean" } },
        },
        TimelineActionSnapshot: {
          type: "object",
          properties: { id: { type: "string" }, start: { type: "number" }, end: { type: "number" }, sceneIndex: { type: "number" }, trimStart: { type: "number" }, trimEnd: { type: "number" }, transitionType: { type: "string" }, transitionDuration: { type: "number" } },
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
                      timestamp: { type: "string", format: "date-time", example: "2026-03-05T00:03:22.984Z" },
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

      "/api/auth/me": {
        get: {
          tags: ["Authentication"],
          summary: "Get current user (requires Bearer token)",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Current user info",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/UserResponse" },
                },
              },
            },
            401: {
              description: "Unauthorized - missing or invalid token",
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
              description: "List of projects (each item has id, userId, name, updatedAt only)",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/ProjectMeta" },
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
          description:
            "All CreateProjectRequest fields are applied on create; optional fields use server defaults if omitted.",
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
              description: "Project created; response includes all fields (request body fields applied, rest from defaults).",
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
              schema: { type: "string", example: "proj_1772671743726_8pgu7wu" },
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
                schema: { $ref: "#/components/schemas/UpdateProjectRequest" },
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
            400: {
              description: "Bad Request - body.id must match path id",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
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
          description: "All CreateWorkRequest fields are applied on create; optional use defaults. Default: start from scratch (no reference video).",
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

      "/api/projects/{projectId}/works/{workId}": {
        get: {
          tags: ["Works"],
          summary: "Get work by ID",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "projectId", in: "path", required: true, schema: { type: "string" } },
            { name: "workId", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: {
            200: {
              description: "Work details",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/WorkResponse" },
                },
              },
            },
            404: {
              description: "Project or work not found",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
          },
        },
        put: {
          tags: ["Works"],
          summary: "Update work",
          description:
            "Full work object. Body id and projectId must match path. Use this to persist: (1) Scenario — POST /api/scenario cevabındaki scenes dizisini body.scenes içinde gönderin; ayrı sahne ekleme endpoint'i yok. (2) Editor — Editör sekmesinde videoya eklenen text/image overlay'ler ve timeline (editorData.textTrack, imageTrack, textOverlays, imageOverlays, exportSettings) body.editorState ile kaydedilir; overlay'ler için ayrı endpoint yok, tüm work PUT ile güncellenir.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "projectId", in: "path", required: true, schema: { type: "string" } },
            { name: "workId", in: "path", required: true, schema: { type: "string" } },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UpdateWorkRequest" },
              },
            },
          },
          responses: {
            200: {
              description: "Work updated",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/WorkResponse" },
                },
              },
            },
            400: {
              description: "ID mismatch (body id/projectId must match path)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
            404: {
              description: "Project or work not found",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
          },
        },
      },

      "/api/projects/{projectId}/works/{workId}/apply-template": {
        post: {
          tags: ["Works"],
          summary: "Apply template to work and save",
          description:
            "Loads the work and template, computes video duration from work.videoDuration or sum of work.scenes[].duration_seconds, applies the template (overlays + track actions), merges into work.editorState, and saves the work. One call replaces the UI flow: apply template then PUT work. Use this to automate template application for the whole work (all scenes share the same timeline).",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "projectId", in: "path", required: true, schema: { type: "string", example: "proj_1772672667617_vezu2rd" } },
            { name: "workId", in: "path", required: true, schema: { type: "string", example: "work_1772672676614_cjqkff4" } },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApplyTemplateToWorkRequest" },
                example: { templateId: "tmpl_62dde1ddc540", placeholderValues: { product_name: "Su bardağı", brand: "Marka" } },
              },
            },
          },
          responses: {
            200: {
              description: "Full work with merged editorState (template overlays and tracks applied and persisted). Response includes editorState.editorData.imageTrack, editorState.imageOverlays, etc.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/WorkResponse" },
                },
              },
            },
            400: { description: "templateId is required", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: {
              description: "Project, work or template not found",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
            },
          },
        },
      },

      "/api/projects/{projectId}/works/{workId}/scenario": {
        post: {
          tags: ["Works", "AI Scenario"],
          summary: "Generate scenario from work",
          description:
            "Loads project and work, builds intent/analysis from them (same logic as UI Build Scenario), calls LLM, returns scenes and persists them to the work (work.scenes and work.updatedAt are updated). No request body; uses path projectId and workId. Headers: x-api-key (required), x-llm-provider, x-model-id.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "projectId", in: "path", required: true, schema: { type: "string", example: "proj_1772671743726_8pgu7wu" } },
            { name: "workId", in: "path", required: true, schema: { type: "string", example: "work_1772671775315_yf69ecw" } },
            {
              name: "x-llm-provider",
              in: "header",
              schema: { type: "string" },
              example: "gemini",
            },
            {
              name: "x-model-id",
              in: "header",
              schema: { type: "string" },
              example: "gemini-2.5-flash",
            },
            {
              name: "x-api-key",
              in: "header",
              required: true,
              schema: { type: "string" },
              description: "LLM provider API key (required)",
            },
          ],
          responses: {
            200: {
              description: "Scenario generated; scenes are saved to the work (work.scenes, work.updatedAt). Response returns the generated scenes.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ScenarioResponse" },
                },
              },
            },
            400: {
              description: "Missing x-api-key header",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
            404: {
              description: "Project or work not found",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
          },
        },
      },

      "/api/projects/{projectId}/works/{workId}/generate/scene/{sceneIndex}": {
        post: {
          tags: ["Works", "AI Generation"],
          summary: "Generate image and video for one scene (UI flow)",
          description:
            "Generates image for the scene (work.scenes[sceneIndex]), then generates video from that same image (no re-fetch). Image and video are persisted to work media and work.generatedScenes is updated. Headers: x-api-key (required), x-image-provider, x-image-model-id or x-model-id, x-video-provider, x-video-model-id or x-model-id.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "projectId", in: "path", required: true, schema: { type: "string" } },
            { name: "workId", in: "path", required: true, schema: { type: "string" } },
            { name: "sceneIndex", in: "path", required: true, schema: { type: "integer", example: 0 } },
            { name: "x-api-key", in: "header", required: true, schema: { type: "string" }, description: "Provider API key (required)" },
            { name: "x-image-provider", in: "header", schema: { type: "string", example: "gemini" } },
            { name: "x-image-model-id", in: "header", schema: { type: "string", example: "gemini-2.5-flash-image" } },
            { name: "x-model-id", in: "header", schema: { type: "string", description: "Used for image/video if x-image-model-id / x-video-model-id not set" } },
            { name: "x-video-provider", in: "header", schema: { type: "string", example: "gemini" } },
            { name: "x-video-model-id", in: "header", schema: { type: "string", example: "veo-3.0-generate-001" } },
          ],
          responses: {
            200: {
              description: "Image and video generated and saved; returns media paths.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      imageUrl: { type: "string", example: "/api/projects/{projectId}/works/{workId}/media/scene/0/image" },
                      videoUrl: { type: "string", example: "/api/projects/{projectId}/works/{workId}/media/scene/0/video" },
                    },
                  },
                },
              },
            },
            400: { description: "Invalid scene index or missing x-api-key", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "Project, work, or scene not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },

      "/api/projects/{projectId}/templates": {
        get: {
          tags: ["Templates"],
          summary: "List templates",
          description: "Returns project-level templates (meta only). Used by UI to show template list; thumbnail URL included when available.",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "projectId", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: {
              description: "Template list",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      templates: { type: "array", items: { $ref: "#/components/schemas/EditorTemplateMeta" } },
                      count: { type: "number" },
                    },
                  },
                },
              },
            },
            404: { description: "Project not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
        post: {
          tags: ["Templates"],
          summary: "Create template",
          description: "Save a new template. Content = text/image overlays (from editor). UI saves current overlay layout as template.",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "projectId", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/CreateTemplateRequest" } } },
          },
          responses: {
            201: { description: "Template created", content: { "application/json": { schema: { $ref: "#/components/schemas/EditorTemplate" } } } },
            400: { description: "name and content required", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "Project not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },

      "/api/projects/{projectId}/templates/{templateId}": {
        get: {
          tags: ["Templates"],
          summary: "Get template",
          description: "Single template with full content. Used before applying template.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "projectId", in: "path", required: true, schema: { type: "string" } },
            { name: "templateId", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: {
            200: { description: "Template", content: { "application/json": { schema: { $ref: "#/components/schemas/EditorTemplate" } } } },
            404: { description: "Template not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
        put: {
          tags: ["Templates"],
          summary: "Update template",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "projectId", in: "path", required: true, schema: { type: "string" } },
            { name: "templateId", in: "path", required: true, schema: { type: "string" } },
          ],
          requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateTemplateRequest" } } } },
          responses: {
            200: { description: "Template updated", content: { "application/json": { schema: { $ref: "#/components/schemas/EditorTemplate" } } } },
            404: { description: "Template not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
        delete: {
          tags: ["Templates"],
          summary: "Delete template",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "projectId", in: "path", required: true, schema: { type: "string" } },
            { name: "templateId", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: {
            204: { description: "Template deleted" },
            404: { description: "Template not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },

      "/api/projects/{projectId}/templates/{templateId}/apply": {
        post: {
          tags: ["Templates"],
          summary: "Apply template (returns overlay data only; does not save to work)",
          description:
            "Backend does NOT receive or persist a workId. It only computes overlay/track data from the template and videoDuration, and returns it. The client decides which work is affected: whichever work is currently open in the editor. The client merges the returned textOverlays, imageOverlays, textTrackActions, imageTrackActions into that work's editor state in memory; to persist, the client must then call PUT /api/projects/{projectId}/works/{workId} with the updated work, or use POST .../works/{workId}/apply-template to apply and save in one call. Placeholders (e.g. {{product_name}}) are replaced using placeholderValues.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "projectId", in: "path", required: true, schema: { type: "string", example: "proj_xxx" } },
            { name: "templateId", in: "path", required: true, schema: { type: "string", example: "tmpl_62dde1ddc540" } },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TemplateApplicationRequest" },
                example: { videoDuration: 5, placeholderValues: { product_name: "Su bardağı", brand: "Marka" } },
              },
            },
          },
          responses: {
            200: {
              description: "Overlays and track actions to apply in editor. Client merges these into work editor state; to persist use PUT work or POST .../works/{workId}/apply-template.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/TemplateApplicationResult" },
                  example: {
                    textOverlays: {},
                    textTrackActions: [],
                    imageOverlays: { "applied_image-1": { assetId: "asset_xxx", width: 128, height: 128, centerX: 444, centerY: 344, opacity: 1, rotation: 0, maintainAspectRatio: true } },
                    imageTrackActions: [{ id: "applied_image-1", start: 0, end: 5 }],
                    exportSettings: { width: 1920, height: 1080, fps: 30 },
                  },
                },
              },
            },
            400: { description: "videoDuration must be a positive number", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "Template not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
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
          description:
            "Uses an LLM to generate a video scenario: for each scene returns image_prompt, video_prompt, duration_seconds, transition, etc. Body: intent (object with mode required), optional analysis (reference video analysis), optional styleGuide/knowledge. Requires x-api-key header (provider API key).",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "x-llm-provider",
              in: "header",
              schema: { type: "string" },
              description: "LLM provider (gemini, claude, openai)",
              example: "gemini",
            },
            {
              name: "x-model-id",
              in: "header",
              schema: { type: "string" },
              example: "gemini-2.5-flash",
            },
            {
              name: "x-api-key",
              in: "header",
              required: true,
              schema: { type: "string" },
              description: "Provider API key (required)",
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
              description: "Scenario generated (scenes array, snake_case fields)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ScenarioResponse" },
                },
              },
            },
            400: {
              description: "Bad request (e.g. missing x-api-key or invalid body)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
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
          description:
            "Used by UI per-scene: prompt (scene image_prompt), negative_prompt, optional image_instruction (work/project), styleGuide. Response imageUrl can be persisted via POST .../works/{workId}/media/scene/{index}/image.",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "x-image-provider",
              in: "header",
              schema: { type: "string" },
              example: "gemini",
            },
            {
              name: "x-model-id",
              in: "header",
              schema: { type: "string" },
              example: "gemini-2.5-flash-image",
            },
            {
              name: "x-api-key",
              in: "header",
              required: true,
              schema: { type: "string" },
              description: "Provider API key (required)",
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
          description:
            "Used by UI after image is ready: image_url (from generate/image or media URL), prompt (scene video_prompt), duration. If image_url is internal media URL, backend resolves it with request auth. Response videoUrl can be persisted via POST .../works/{workId}/media/scene/{index}/video.",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "x-video-provider",
              in: "header",
              schema: { type: "string" },
              example: "gemini",
            },
            {
              name: "x-model-id",
              in: "header",
              schema: { type: "string" },
              example: "veo-3.0-generate-001",
            },
            {
              name: "x-api-key",
              in: "header",
              required: true,
              schema: { type: "string" },
              description: "Provider API key (required)",
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
          description: "Returns a flat array of providers; each has id, name, category (vision|llm|image|video), description, and models array.",
          responses: {
            200: {
              description: "List of providers (flat array with category per provider)",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string", example: "gemini" },
                        name: { type: "string", example: "Google Gemini" },
                        category: { type: "string", enum: ["vision", "llm", "image", "video"] },
                        description: { type: "string" },
                        models: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              id: { type: "string" },
                              name: { type: "string" },
                              description: { type: "string" },
                            },
                          },
                        },
                      },
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
