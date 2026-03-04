import { z } from "zod";

// ============================================================================
// Auth Schemas
// ============================================================================

export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string(),
  }),
});

export const RefreshRequestSchema = z.object({
  refreshToken: z.string(),
});

export const UserResponseSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  createdAt: z.string().datetime(),
});

// ============================================================================
// API Token Schemas
// ============================================================================

export const CreateTokenRequestSchema = z.object({
  name: z.string().min(1).max(100),
  scopes: z.array(
    z.enum([
      "projects:read",
      "projects:write",
      "works:read",
      "works:write",
      "ai:analyze",
      "ai:generate",
    ])
  ),
  expiresInDays: z.number().positive().optional().nullable(),
});

export const TokenResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  token: z.string().optional(),
  scopes: z.array(z.string()),
  expiresAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
});

// ============================================================================
// Style Guide Schemas
// ============================================================================

export const StyleGuideSchema = z.object({
  tone: z.string().optional(),
  color_palette: z.array(z.string()).optional(),
  tempo: z.string().optional(),
  camera_style: z.string().optional(),
  brand_voice: z.string().optional(),
  must_include: z.array(z.string()).optional(),
  must_avoid: z.array(z.string()).optional(),
});

export const ExtractStyleGuideRequestSchema = z.object({
  text: z.string(),
});

export const ExtractStyleGuideFromLandingRequestSchema = z.object({
  url: z.string().url(),
  includeProductInfo: z.boolean().optional(),
  mode: z.enum(["quick", "detailed"]).optional(),
});

// ============================================================================
// Project Schemas
// ============================================================================

export const CreateProjectRequestSchema = z.object({
  name: z.string().min(1),
  systemPrompt: z.string().optional(),
  knowledge: z.string().optional(),
  styleGuide: StyleGuideSchema.optional(),
  imageSystemPrompt: z.string().optional(),
  videoSystemPrompt: z.string().optional(),
});

export const UpdateProjectRequestSchema = z.object({
  name: z.string().min(1).optional(),
  systemPrompt: z.string().optional(),
  knowledge: z.string().optional(),
  styleGuide: StyleGuideSchema.optional(),
  imageSystemPrompt: z.string().optional(),
  videoSystemPrompt: z.string().optional(),
});

export const ProjectResponseSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  name: z.string(),
  systemPrompt: z.string().optional(),
  knowledge: z.string().optional(),
  styleGuide: StyleGuideSchema.optional(),
  imageSystemPrompt: z.string().optional(),
  videoSystemPrompt: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// ============================================================================
// Work Schemas
// ============================================================================

export const CreateWorkRequestSchema = z.object({
  mode: z.enum(["style_transfer", "content_remix"]),
  productName: z.string().optional(),
  productDescription: z.string().optional(),
  targetAudience: z.string().optional(),
});

export const WorkResponseSchema = z.object({
  _id: z.string(),
  projectId: z.string(),
  userId: z.string(),
  currentStep: z.number().min(0).max(4),
  mode: z.enum(["style_transfer", "content_remix"]),
  hasReferenceVideo: z.boolean(),
  productName: z.string().optional(),
  productDescription: z.string().optional(),
  targetAudience: z.string().optional(),
  intent: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// ============================================================================
// AI Analysis Schemas
// ============================================================================

export const AnalyzeRequestSchema = z.object({
  mode: z.enum(["style_transfer", "content_remix"]),
  analyzerPrompt: z.string().optional(),
});

export const SceneSchema = z.object({
  timestamp: z.number(),
  duration: z.number(),
  description: z.string(),
  visualElements: z.string(),
  cameraMovement: z.string(),
  transition: z.string(),
});

export const AnalysisResponseSchema = z.object({
  scenes: z.array(SceneSchema),
  tone: z.string(),
  colors: z.array(z.string()),
  tempo: z.string(),
  textOverlays: z
    .array(
      z.object({
        text: z.string(),
        timestamp: z.number(),
        style: z.string(),
      })
    )
    .optional(),
  cameraMovements: z.array(z.string()),
});

// ============================================================================
// AI Scenario Schemas
// ============================================================================

export const ScenarioRequestSchema = z.object({
  analysis: AnalysisResponseSchema.optional(),
  intent: z.string(),
  systemPrompt: z.string().optional(),
  knowledge: z.string().optional(),
  styleGuide: StyleGuideSchema.optional(),
});

export const TextOverlaySchema = z.object({
  text: z.string(),
  timestamp: z.number(),
  duration: z.number(),
  position: z.string(),
});

export const ScenarioSceneSchema = z.object({
  index: z.number(),
  imagePrompt: z.string(),
  videoPrompt: z.string(),
  duration: z.number(),
  transition: z.string(),
  textOverlays: z.array(TextOverlaySchema).optional(),
});

export const ScenarioResponseSchema = z.object({
  scenes: z.array(ScenarioSceneSchema),
});

// ============================================================================
// AI Generation Schemas
// ============================================================================

export const GenerateImageRequestSchema = z.object({
  prompt: z.string(),
  negative_prompt: z.string().default(""),
  image_instruction: z.string().optional(),
  styleGuide: StyleGuideSchema.optional(),
});

export const GenerateImageResponseSchema = z.object({
  imageUrl: z.string(),
});

export const GenerateVideoRequestSchema = z.object({
  image_url: z.string().url(),
  prompt: z.string(),
  duration: z.number().default(5),
  video_instruction: z.string().optional(),
  styleGuide: StyleGuideSchema.optional(),
});

export const GenerateVideoResponseSchema = z.object({
  videoUrl: z.string(),
});

// ============================================================================
// Asset Schemas
// ============================================================================

export const AssetResponseSchema = z.object({
  _id: z.string(),
  projectId: z.string(),
  userId: z.string(),
  name: z.string(),
  type: z.enum(["logo", "watermark", "font", "image", "audio", "other"]),
  filename: z.string(),
  mimeType: z.string(),
  size: z.number(),
  tags: z.array(z.string()).optional(),
  createdAt: z.string().datetime(),
});

export const UpdateAssetRequestSchema = z.object({
  name: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// ============================================================================
// Template Schemas
// ============================================================================

export const TemplateOverlaysSchema = z.object({
  texts: z
    .array(
      z.object({
        content: z.string(),
        startTime: z.number(),
        duration: z.number(),
        position: z.object({
          x: z.number(),
          y: z.number(),
        }),
        style: z.object({
          fontSize: z.number(),
          color: z.string(),
        }),
      })
    )
    .optional(),
  images: z.array(z.any()).optional(),
});

export const CreateTemplateRequestSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  content: TemplateOverlaysSchema,
});

export const TemplateResponseSchema = z.object({
  _id: z.string(),
  projectId: z.string(),
  userId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  content: TemplateOverlaysSchema,
  createdAt: z.string().datetime(),
});

// ============================================================================
// Provider Schemas
// ============================================================================

export const ProviderResponseSchema = z.object({
  vision: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      models: z.array(z.string()),
    })
  ),
  llm: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      models: z.array(z.string()),
    })
  ),
  image: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      models: z.array(z.string()),
    })
  ),
  video: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      models: z.array(z.string()),
    })
  ),
});

// ============================================================================
// Error Schema
// ============================================================================

export const ErrorResponseSchema = z.object({
  error: z.string(),
  details: z.string().optional(),
});
