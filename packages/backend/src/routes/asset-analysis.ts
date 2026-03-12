import { Router } from "express";
import { authenticate, requireScope } from "../middleware/auth.js";
import { getAsset, updateAssetMeta, getAssetFilePath } from "../storage/assets.js";
import { getVisionProvider } from "../providers/registry.js";
import fs from "fs/promises";

const router = Router();

router.use(authenticate);

/**
 * POST /api/projects/:projectId/assets/:assetId/analyze
 * Analyze an asset with Vision AI and generate description
 */
router.post("/:projectId/assets/:assetId/analyze", requireScope("projects:write"), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const projectId = String(req.params.projectId ?? "");
    const assetId = String(req.params.assetId ?? "");

    // Get asset
    const asset = await getAsset(projectId, assetId, userId);
    if (!asset) {
      res.status(404).json({ error: "Asset not found" });
      return;
    }

    // Only analyze images
    if (asset.type !== "image") {
      res.status(400).json({ error: "Only image assets can be analyzed" });
      return;
    }

    // Get vision provider from headers
    const providerId = (req.headers["x-vision-provider"] as string) || "gemini";
    const modelId = req.headers["x-model-id"] as string | undefined;
    const apiKey = req.headers["x-api-key"] as string;

    if (!apiKey) {
      res.status(400).json({ error: "x-api-key header required" });
      return;
    }

    // Load image file
    const filePath = await getAssetFilePath(projectId, assetId);
    if (!filePath) {
      res.status(404).json({ error: "Asset file not found" });
      return;
    }
    const imageBuffer = await fs.readFile(filePath);

    // Analyze with Vision AI
    const provider = getVisionProvider(providerId);
    
    // Create a simple prompt for asset description
    const prompt = `Analyze this image and provide a detailed description focusing on:
1. Visual style (colors, lighting, composition)
2. Subject matter and key elements
3. Mood and aesthetic qualities
4. Technical aspects (photography style, quality)

Provide a concise but comprehensive description suitable for AI image generation prompts.`;

    // Use the vision provider to analyze
    // Since we don't have a direct "describe" method, we'll use the analyze method with a custom prompt
    const visionResult = await provider.analyze(
      imageBuffer,
      asset.mimeType,
      "content_remix", // mode doesn't matter for simple description
      apiKey,
      modelId,
      prompt
    );

    // Extract description from analysis
    // The analysis returns AnalysisResult, we'll use the first scene's description as the asset description
    const description = visionResult.scenes && visionResult.scenes.length > 0
      ? visionResult.scenes[0].description
      : `${visionResult.overall_tone} image with ${visionResult.color_palette?.join(", ") || "various colors"}`;

    // Update asset with description
    const updated = await updateAssetMeta(projectId, assetId, {
      description,
    }, userId);

    if (!updated) {
      res.status(500).json({ error: "Failed to update asset" });
      return;
    }

    res.json({
      assetId,
      description,
    });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/projects/:projectId/assets/analyze-batch
 * Analyze multiple assets in batch
 */
router.post("/:projectId/assets/analyze-batch", requireScope("projects:write"), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const projectId = String(req.params.projectId ?? "");
    const { assetIds } = req.body as { assetIds: string[] };

    if (!Array.isArray(assetIds) || assetIds.length === 0) {
      res.status(400).json({ error: "assetIds array required" });
      return;
    }

    const providerId = (req.headers["x-vision-provider"] as string) || "gemini";
    const modelId = req.headers["x-model-id"] as string | undefined;
    const apiKey = req.headers["x-api-key"] as string;

    if (!apiKey) {
      res.status(400).json({ error: "x-api-key header required" });
      return;
    }

    const provider = getVisionProvider(providerId);
    const results: Array<{ assetId: string; description?: string; error?: string }> = [];

    for (const assetId of assetIds) {
      try {
        const asset = await getAsset(projectId, assetId, userId);
        if (!asset || asset.type !== "image") {
          results.push({ assetId, error: "Asset not found or not an image" });
          continue;
        }

        const filePath = await getAssetFilePath(projectId, assetId);
        if (!filePath) {
          results.push({ assetId, error: "Asset file not found" });
          continue;
        }
        const imageBuffer = await fs.readFile(filePath);

        const prompt = `Analyze this image and provide a detailed description focusing on visual style, subject matter, mood, and technical aspects. Provide a concise description suitable for AI image generation prompts.`;

        const visionResult = await provider.analyze(
          imageBuffer,
          asset.mimeType,
          "content_remix",
          apiKey,
          modelId,
          prompt
        );

        const description = visionResult.scenes && visionResult.scenes.length > 0
          ? visionResult.scenes[0].description
          : `${visionResult.overall_tone} image with ${visionResult.color_palette?.join(", ") || "various colors"}`;

        await updateAssetMeta(projectId, assetId, { description }, userId);
        results.push({ assetId, description });
      } catch (e) {
        results.push({ assetId, error: String(e) });
      }
    }

    res.json({ results });
  } catch (e) {
    next(e);
  }
});

export default router;
