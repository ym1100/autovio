import { Image, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { AssetUsageMode, type ProjectAsset } from "@autovio/shared";
import { listProjectAssets, getProjectAssetUrl } from "../../storage/projectStorage";
import { getAuthToken } from "../../store/useAuthStore";

interface AssetSelectorProps {
  projectId: string;
  selectedAssetIds: string[];
  assetUsageMode: AssetUsageMode | undefined;
  onSelectedAssetsChange: (ids: string[]) => void;
  onAssetUsageModeChange: (mode: AssetUsageMode | undefined) => void;
}

export default function AssetSelector({
  projectId,
  selectedAssetIds,
  assetUsageMode,
  onSelectedAssetsChange,
  onAssetUsageModeChange,
}: AssetSelectorProps) {
  const [assets, setAssets] = useState<ProjectAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [thumbUrls, setThumbUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    loadAssets();
  }, [projectId]);

  const loadAssets = async () => {
    try {
      setLoading(true);
      const result = await listProjectAssets(projectId, "image");
      setAssets(result.assets);
    } catch (e) {
      console.error("Failed to load assets:", e);
    } finally {
      setLoading(false);
    }
  };

  // Load thumbnails with auth (same as ProjectAssetsPanel)
  useEffect(() => {
    if (assets.length === 0) {
      setThumbUrls((prev) => {
        Object.values(prev).forEach((u) => URL.revokeObjectURL(u));
        return {};
      });
      return;
    }

    const token = getAuthToken();
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
    let cancelled = false;

    assets.forEach((asset) => {
      if (thumbUrls[asset.id]) return;
      const url = getProjectAssetUrl(projectId, asset.id);
      fetch(url, { headers })
        .then((res) => (res.ok ? res.blob() : null))
        .then((blob) => {
          if (!blob || cancelled) return;
          const blobUrl = URL.createObjectURL(blob);
          setThumbUrls((prev) => {
            if (prev[asset.id]) URL.revokeObjectURL(prev[asset.id]);
            return { ...prev, [asset.id]: blobUrl };
          });
        })
        .catch(() => {});
    });

    setThumbUrls((prev) => {
      const next: Record<string, string> = {};
      const validIds = new Set(assets.map((a) => a.id));
      for (const [id, url] of Object.entries(prev)) {
        if (validIds.has(id)) next[id] = url;
        else URL.revokeObjectURL(url);
      }
      return next;
    });

    return () => {
      cancelled = true;
    };
  }, [assets, projectId]);

  const toggleAsset = (assetId: string) => {
    const newSelection = selectedAssetIds.includes(assetId)
      ? selectedAssetIds.filter((id) => id !== assetId)
      : [...selectedAssetIds, assetId];
    
    console.log('[AssetSelector] Asset selection changed:', newSelection);
    onSelectedAssetsChange(newSelection);
  };

  if (loading) {
    return (
      <div className="text-sm text-gray-400">Loading assets...</div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="text-sm text-gray-400">
        No assets uploaded yet. Upload images in Project Settings to use them in video generation.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Asset Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Select Assets ({selectedAssetIds.length} selected)
        </label>
        <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto">
          {assets.map((asset) => {
            const isSelected = selectedAssetIds.includes(asset.id);
            const thumbUrl = thumbUrls[asset.id];
            
            return (
              <button
                key={asset.id}
                type="button"
                onClick={() => toggleAsset(asset.id)}
                className={`relative rounded-lg border-2 overflow-hidden transition-all aspect-square ${
                  isSelected
                    ? "border-purple-500 ring-2 ring-purple-500/50"
                    : "border-gray-700 hover:border-gray-600"
                }`}
              >
                {thumbUrl ? (
                  <img
                    src={thumbUrl}
                    alt={asset.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gray-800">
                    <Image size={32} className="text-gray-600" />
                  </div>
                )}
                {isSelected && (
                  <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                  <p className="text-xs text-white truncate">{asset.name}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Usage Mode Selection */}
      {selectedAssetIds.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            How should these assets be used?
          </label>
          <div className="space-y-2">
            <label
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                assetUsageMode === AssetUsageMode.REFERENCE
                  ? "border-purple-500 bg-purple-500/10"
                  : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
              }`}
            >
              <input
                type="radio"
                name="assetUsageMode"
                value={AssetUsageMode.REFERENCE}
                checked={assetUsageMode === AssetUsageMode.REFERENCE}
                onChange={(e) => onAssetUsageModeChange(e.target.value as AssetUsageMode)}
                className="mt-0.5 text-purple-600 focus:ring-purple-500"
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white text-sm">As style reference (AI learns style)</div>
                <div className="text-xs text-gray-400 mt-0.5">
                  AI analyzes your assets and generates similar-looking images. Best for maintaining consistent style.
                </div>
              </div>
            </label>

            <label
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                assetUsageMode === AssetUsageMode.DIRECT
                  ? "border-purple-500 bg-purple-500/10"
                  : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
              }`}
            >
              <input
                type="radio"
                name="assetUsageMode"
                value={AssetUsageMode.DIRECT}
                checked={assetUsageMode === AssetUsageMode.DIRECT}
                onChange={(e) => onAssetUsageModeChange(e.target.value as AssetUsageMode)}
                className="mt-0.5 text-purple-600 focus:ring-purple-500"
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white text-sm">Direct use (use actual images)</div>
                <div className="text-xs text-gray-400 mt-0.5">
                  Skip AI image generation and use your actual assets directly. Best for product photos or screenshots.
                </div>
              </div>
            </label>

          </div>

          <div className="flex items-start gap-2 mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <Info size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-300">
              Asset usage settings apply to this work only. You can use different modes for different videos in the same project.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
