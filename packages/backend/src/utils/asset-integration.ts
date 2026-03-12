import type { AssetUsageMode, ProjectAsset } from "@autovio/shared";
import { getAsset } from "../storage/assets.js";

/**
 * Build asset context for REFERENCE mode
 * Returns a string to inject into image prompts
 */
export function buildAssetReferenceContext(assets: ProjectAsset[]): string {
  if (assets.length === 0) return "";
  
  const descriptions = assets
    .filter(a => a.description)
    .map(a => `- ${a.name}: ${a.description}`)
    .join("\n");
  
  if (!descriptions) return "";
  
  return `\n\n## Reference Assets\nUse these assets as visual style reference:\n${descriptions}\n\nMatch the visual style, colors, and aesthetic of these reference images.`;
}

/**
 * Get selected assets for a work
 */
export async function getWorkAssets(
  projectId: string,
  selectedAssetIds: string[] | undefined
): Promise<ProjectAsset[]> {
  if (!selectedAssetIds || selectedAssetIds.length === 0) return [];
  
  const assets: ProjectAsset[] = [];
  for (const assetId of selectedAssetIds) {
    const asset = await getAsset(projectId, assetId);
    if (asset && asset.type === "image") {
      assets.push(asset);
    }
  }
  
  return assets;
}

/**
 * Check if we should skip AI image generation (DIRECT mode)
 */
export function shouldSkipImageGeneration(
  assetUsageMode: AssetUsageMode | undefined,
  selectedAssets: ProjectAsset[]
): boolean {
  return assetUsageMode === "direct" && selectedAssets.length > 0;
}

/**
 * Get asset URL for direct use
 * Returns the first selected asset's URL
 */
export function getDirectAssetUrl(
  projectId: string,
  selectedAssets: ProjectAsset[]
): string | null {
  if (selectedAssets.length === 0) return null;
  
  // Use first asset (could be enhanced to match scene index)
  const asset = selectedAssets[0];
  return `/api/projects/${projectId}/assets/${asset.id}`;
}
