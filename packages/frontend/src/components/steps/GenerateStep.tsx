import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Image,
  Video,
  Pencil,
  RotateCcw,
} from "lucide-react";
import { useStore, type GeneratedScene } from "../../store/useStore";
import SidePanel from "../ui/SidePanel";
import { AuthenticatedImg, AuthenticatedVideo } from "../ui/AuthenticatedMedia";
import ImageEditPanel from "./ImageEditPanel";
import VideoEditPanel from "./VideoEditPanel";

type PanelMode = "image" | "video" | null;

export default function GenerateStep() {
  const {
    scenes,
    generatedScenes,
    setStep,
    generateSceneImage,
    approveImageAndGenerateVideo,
    updateAndRegenerateImage,
    updateAndRegenerateVideo,
    backToImageStage,
    generateAllImages,
  } = useStore();

  const [panelMode, setPanelMode] = useState<PanelMode>(null);
  const [panelSceneIndex, setPanelSceneIndex] = useState<number>(0);

  const openImagePanel = (sceneIndex: number) => {
    setPanelSceneIndex(sceneIndex);
    setPanelMode("image");
  };
  const openVideoPanel = (sceneIndex: number) => {
    setPanelSceneIndex(sceneIndex);
    setPanelMode("video");
  };
  const closePanel = () => setPanelMode(null);

  const anyGenerating = generatedScenes.some(
    (s) =>
      s.status === "generating_image" || s.status === "generating_video",
  );
  const doneCount = generatedScenes.filter((s) => s.status === "done").length;
  const totalCount = scenes.length;

  if (generatedScenes.length === 0 || scenes.length === 0) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-4 text-amber-200">
          <p>
            No scenes to generate. Go back to Scenario and click &quot;Generate
            Videos&quot; to continue.
          </p>
        </div>
        <button
          onClick={() => setStep(2)}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
        >
          <ArrowLeft size={16} /> Back to Scenario
        </button>
      </div>
    );
  }

  const sceneForPanel = scenes[panelSceneIndex];
  const generatedForPanel = generatedScenes[panelSceneIndex];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-2xl font-bold">Generate</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">
            {doneCount}/{totalCount} scenes complete
          </span>
          <button
            onClick={() => generateAllImages()}
            disabled={anyGenerating}
            className="flex items-center gap-2 border border-purple-500 text-purple-400 hover:bg-purple-500/10 disabled:border-gray-600 disabled:text-gray-500 disabled:hover:bg-transparent px-4 py-2 rounded-lg text-sm transition-colors"
          >
            {anyGenerating ? (
              <Loader2 size={14} className="animate-spin" />
            ) : null}
            Generate All Images
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {generatedScenes.map((gs, i) => {
          const scene = scenes[i];
          if (!scene) return null;
          const status = gs.status;

          return (
            <div
              key={gs.sceneIndex}
              className="bg-gray-900 rounded-lg p-5 border border-gray-800"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-purple-400">
                  Scene {gs.sceneIndex}
                </span>
                <StatusBadge status={status} />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Image area */}
                <div className="rounded-lg aspect-video bg-gray-800 flex items-center justify-center overflow-hidden min-h-[120px]">
                  {status === "generating_image" && (
                    <div className="flex flex-col items-center gap-2 text-yellow-400">
                      <Loader2 size={28} className="animate-spin" />
                      <span className="text-xs">Generating image...</span>
                    </div>
                  )}
                  {status !== "generating_image" && gs.imageUrl && (
                    <AuthenticatedImg
                      url={gs.imageUrl}
                      alt={`Scene ${gs.sceneIndex}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {status !== "generating_image" && !gs.imageUrl && (
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                      <Image size={24} />
                      <span className="text-xs">
                        {status === "pending"
                          ? "Click to generate"
                          : "Waiting for image"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Video area */}
                <div className="rounded-lg aspect-video bg-gray-800 flex items-center justify-center overflow-hidden min-h-[120px]">
                  {status === "generating_video" && (
                    <div className="flex flex-col items-center gap-2 text-blue-400">
                      <Loader2 size={28} className="animate-spin" />
                      <span className="text-xs">Generating video...</span>
                    </div>
                  )}
                  {status !== "generating_video" && status === "image_ready" && (
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                      <Video size={24} className="opacity-60" />
                      <span className="text-xs">Waiting for approval...</span>
                    </div>
                  )}
                  {status !== "generating_video" && status === "pending" && (
                    <div className="flex flex-col items-center gap-2 text-gray-600">
                      <Video size={24} />
                      <span className="text-xs">Waiting for image</span>
                    </div>
                  )}
                  {status === "done" && gs.videoUrl ? (
                    <AuthenticatedVideo
                      url={gs.videoUrl}
                      className="w-full h-full object-cover"
                      controls
                    />
                  ) : null}
                  {status === "error" && (
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                      <Video size={24} />
                    </div>
                  )}
                </div>
              </div>

              {gs.error && (
                <p className="text-red-400 text-sm mb-3">{gs.error}</p>
              )}

              <div className="flex flex-wrap gap-2">
                {status === "pending" && (
                  <button
                    onClick={() => generateSceneImage(i)}
                    disabled={anyGenerating}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                  >
                    <Image size={14} /> Generate Image
                  </button>
                )}

                {status === "image_ready" && (
                  <>
                    <button
                      onClick={() => approveImageAndGenerateVideo(i)}
                      disabled={anyGenerating}
                      className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                    >
                      <CheckCircle size={14} /> Approve & Generate Video
                    </button>
                    <button
                      onClick={() => openImagePanel(i)}
                      disabled={anyGenerating}
                      className="flex items-center gap-1.5 border border-gray-600 text-gray-300 hover:bg-gray-700 px-3 py-2 rounded-lg text-sm transition-colors"
                    >
                      <Pencil size={14} /> Edit & Regenerate
                    </button>
                  </>
                )}

                {status === "done" && (
                  <>
                    <button
                      onClick={() => openVideoPanel(i)}
                      disabled={anyGenerating}
                      className="flex items-center gap-1.5 border border-gray-600 text-gray-300 hover:bg-gray-700 px-3 py-2 rounded-lg text-sm transition-colors"
                    >
                      <RefreshCw size={14} /> Regenerate Video
                    </button>
                    <button
                      onClick={() => backToImageStage(i)}
                      disabled={anyGenerating}
                      className="flex items-center gap-1.5 text-gray-400 hover:text-gray-200 px-3 py-2 rounded-lg text-sm transition-colors"
                    >
                      <RotateCcw size={14} /> Back to Image
                    </button>
                  </>
                )}

                {status === "error" && (
                  <>
                    <button
                      onClick={() =>
                        gs.imageUrl
                          ? approveImageAndGenerateVideo(i)
                          : generateSceneImage(i)
                      }
                      disabled={anyGenerating}
                      className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                    >
                      <RefreshCw size={14} /> Retry
                    </button>
                    <button
                      onClick={() =>
                        gs.imageUrl ? openVideoPanel(i) : openImagePanel(i)
                      }
                      disabled={anyGenerating}
                      className="flex items-center gap-1.5 border border-gray-600 text-gray-300 hover:bg-gray-700 px-3 py-2 rounded-lg text-sm transition-colors"
                    >
                      <Pencil size={14} /> Edit Prompt
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setStep(2)}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <ArrowLeft size={16} /> Back to Scenario
        </button>
        <button
          disabled={doneCount < totalCount}
          onClick={() => setStep(4)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 px-6 py-2 rounded-lg font-medium transition-colors text-white"
        >
          Continue to Editor
          <ArrowRight size={18} />
        </button>
      </div>

      <SidePanel
        isOpen={panelMode === "image"}
        onClose={closePanel}
        title="Edit Image Prompt"
      >
        {sceneForPanel && (
          <ImageEditPanel
            sceneIndex={panelSceneIndex}
            currentImageUrl={generatedForPanel?.imageUrl}
            imagePrompt={sceneForPanel.image_prompt}
            negativePrompt={sceneForPanel.negative_prompt ?? ""}
            onRegenerate={(imagePrompt, negativePrompt) => {
              closePanel();
              updateAndRegenerateImage(panelSceneIndex, imagePrompt, negativePrompt);
            }}
            onClose={closePanel}
          />
        )}
      </SidePanel>

      <SidePanel
        isOpen={panelMode === "video"}
        onClose={closePanel}
        title="Edit Video Prompt"
      >
        {sceneForPanel && (
          <VideoEditPanel
            sceneIndex={panelSceneIndex}
            referenceImageUrl={generatedForPanel?.imageUrl}
            videoPrompt={sceneForPanel.video_prompt}
            duration={sceneForPanel.duration_seconds ?? 5}
            onRegenerate={(videoPrompt, duration) => {
              closePanel();
              updateAndRegenerateVideo(
                panelSceneIndex,
                videoPrompt,
                duration,
              );
            }}
            onClose={closePanel}
          />
        )}
      </SidePanel>
    </div>
  );
}

function StatusBadge({ status }: { status: GeneratedScene["status"] }) {
  switch (status) {
    case "pending":
      return (
        <span className="flex items-center gap-1 text-xs text-gray-500">
          <span className="w-1.5 h-1.5 rounded-full border border-gray-500" />
          Pending
        </span>
      );
    case "generating_image":
      return (
        <span className="flex items-center gap-1 text-xs text-amber-400">
          <Loader2 size={12} className="animate-spin" />
          Generating image...
        </span>
      );
    case "image_ready":
      return (
        <span className="flex items-center gap-1 text-xs text-blue-400">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500/80" />
          Image ready
        </span>
      );
    case "generating_video":
      return (
        <span className="flex items-center gap-1 text-xs text-blue-400">
          <Loader2 size={12} className="animate-spin" />
          Generating video...
        </span>
      );
    case "done":
      return (
        <span className="flex items-center gap-1 text-xs text-green-400">
          <CheckCircle size={12} /> Complete
        </span>
      );
    case "error":
      return (
        <span className="flex items-center gap-1 text-xs text-red-400">
          <AlertCircle size={12} /> Error
        </span>
      );
    default:
      return null;
  }
}
