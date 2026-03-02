import { Trash2 } from "lucide-react";
import type {
  SelectedItem,
  ClipMetaMap,
  TextOverlayMap,
  TextOverlay,
  ImageOverlayMap,
  ImageOverlay,
  AudioMeta,
  TimelineRow,
  TransitionType,
} from "./types";

interface PropertiesPanelProps {
  selectedItem: SelectedItem;
  clipMeta: ClipMetaMap;
  textOverlays: TextOverlayMap;
  imageOverlays?: ImageOverlayMap;
  audioFile: File | null;
  audioUrl: string | null;
  audioMeta: AudioMeta;
  editorData: TimelineRow[];
  onUpdateTextOverlay: (id: string, partial: Partial<TextOverlay>) => void;
  onUpdateImageOverlay?: (id: string, partial: Partial<ImageOverlay>) => void;
  onUpdateAudioMeta: (meta: Partial<AudioMeta>) => void;
  onDeleteTextOverlay: (id: string) => void;
  onDeleteImageOverlay?: (id: string) => void;
  onRemoveAudio: () => void;
  onUpdateClipMeta?: (actionId: string, partial: Partial<{ trimStart: number; trimEnd: number; transitionType?: TransitionType; transitionDuration?: number }>) => void;
}

const TRANSITION_OPTIONS: { value: TransitionType; label: string }[] = [
  { value: "cut", label: "Cut (no transition)" },
  { value: "fade", label: "Fade" },
  { value: "dissolve", label: "Dissolve" },
  { value: "wipeleft", label: "Wipe Left" },
  { value: "wiperight", label: "Wipe Right" },
  { value: "slideup", label: "Slide Up" },
  { value: "slidedown", label: "Slide Down" },
];

export default function PropertiesPanel({
  selectedItem,
  clipMeta,
  textOverlays,
  imageOverlays = {},
  audioFile,
  audioUrl,
  audioMeta,
  editorData,
  onUpdateTextOverlay,
  onUpdateImageOverlay,
  onUpdateAudioMeta,
  onDeleteTextOverlay,
  onDeleteImageOverlay,
  onRemoveAudio,
  onUpdateClipMeta,
}: PropertiesPanelProps) {
  if (!selectedItem) {
    return (
      <div className="bg-gray-900 rounded-lg p-4 h-full flex items-center justify-center">
        <p className="text-sm text-gray-500">Select an item to edit properties</p>
      </div>
    );
  }

  if (selectedItem.type === "clip") {
    const meta = clipMeta[selectedItem.actionId];
    const videoTrack = editorData.find((r) => r.id === "video-track");
    const action = videoTrack?.actions.find((a) => a.id === selectedItem.actionId);
    const duration = action ? (action.end - action.start).toFixed(1) : "—";
    const origDur = meta?.originalDuration ?? 5;
    const trimStart = meta?.trimStart ?? 0;
    const trimEnd = meta?.trimEnd ?? 0;

    return (
      <div className="bg-gray-900 rounded-lg p-4 space-y-3">
        <p className="text-xs text-gray-500 uppercase tracking-wider">Clip Properties</p>
        {meta ? (
          <>
            <p className="text-sm text-gray-200 font-medium">{meta.label}</p>
            {meta.imageUrl && (
              <img
                src={meta.imageUrl}
                alt={meta.label}
                className="w-full rounded aspect-video object-cover"
              />
            )}
            <div className="text-xs text-gray-400 space-y-1">
              <p>Scene: {meta.sceneIndex}</p>
              <p>Duration: {duration}s / {origDur.toFixed(1)}s</p>
              <p>Type: {meta.videoUrl ? "Video" : "Image"}</p>
            </div>
            {onUpdateClipMeta && meta.videoUrl && (
              <>
                <div className="space-y-2 pt-2 border-t border-gray-800">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Trim</p>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Trim start (s)</label>
                    <input
                      type="number"
                      min={0}
                      max={Math.max(0, origDur - trimEnd - 0.5)}
                      step={0.1}
                      value={trimStart.toFixed(1)}
                      onChange={(e) =>
                        onUpdateClipMeta(selectedItem.actionId, {
                          trimStart: Math.max(0, Number(e.target.value)),
                        })
                      }
                      className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-gray-200"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Trim end (s)</label>
                    <input
                      type="number"
                      min={0}
                      max={Math.max(0, origDur - trimStart - 0.5)}
                      step={0.1}
                      value={trimEnd.toFixed(1)}
                      onChange={(e) =>
                        onUpdateClipMeta(selectedItem.actionId, {
                          trimEnd: Math.max(0, Number(e.target.value)),
                        })
                      }
                      className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-gray-200"
                    />
                  </div>
                </div>
                {videoTrack && videoTrack.actions.sort((a, b) => a.start - b.start).findIndex((a) => a.id === selectedItem.actionId) < videoTrack.actions.length - 1 && (
                  <div className="space-y-2 pt-2 border-t border-gray-800">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Transition to next</p>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Type</label>
                      <select
                        value={meta.transitionType ?? "cut"}
                        onChange={(e) =>
                          onUpdateClipMeta(selectedItem.actionId, {
                            transitionType: e.target.value as TransitionType,
                            transitionDuration: e.target.value === "cut" ? 0 : (meta.transitionDuration ?? 0.5),
                          })
                        }
                        className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-gray-200"
                      >
                        {TRANSITION_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    {(meta.transitionType ?? "cut") !== "cut" && (
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">Duration (s)</label>
                        <input
                          type="number"
                          min={0.1}
                          max={2}
                          step={0.1}
                          value={(meta.transitionDuration ?? 0.5).toFixed(1)}
                          onChange={(e) =>
                            onUpdateClipMeta(selectedItem.actionId, {
                              transitionDuration: Math.max(0.1, Math.min(2, Number(e.target.value))),
                            })
                          }
                          className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-gray-200"
                        />
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <p className="text-sm text-gray-400">Clip not found</p>
        )}
      </div>
    );
  }

  if (selectedItem.type === "text") {
    const overlay = textOverlays[selectedItem.actionId];
    if (!overlay) {
      return (
        <div className="bg-gray-900 rounded-lg p-4">
          <p className="text-sm text-gray-400">Text overlay not found</p>
        </div>
      );
    }

    return (
      <div className="bg-gray-900 rounded-lg p-4 space-y-3">
        <p className="text-xs text-gray-500 uppercase tracking-wider">Text Properties</p>

        <div>
          <label className="text-xs text-gray-400 block mb-1">Content</label>
          <textarea
            value={overlay.text}
            onChange={(e) => onUpdateTextOverlay(overlay.id, { text: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-gray-200 focus:border-purple-500 focus:outline-none resize-none"
            rows={2}
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1">
            Font Size: {overlay.fontSize}px
          </label>
          <input
            type="range"
            min={12}
            max={120}
            value={overlay.fontSize}
            onChange={(e) =>
              onUpdateTextOverlay(overlay.id, { fontSize: Number(e.target.value) })
            }
            className="w-full accent-purple-500"
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1">Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={overlay.fontColor}
              onChange={(e) =>
                onUpdateTextOverlay(overlay.id, { fontColor: e.target.value })
              }
              className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
            />
            <span className="text-xs text-gray-400 font-mono">{overlay.fontColor}</span>
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1">
            Position X: {overlay.centerX}px
          </label>
          <input
            type="range"
            min={-500}
            max={500}
            value={overlay.centerX}
            onChange={(e) =>
              onUpdateTextOverlay(overlay.id, { centerX: Number(e.target.value) })
            }
            className="w-full accent-purple-500"
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1">
            Position Y: {overlay.centerY}px
          </label>
          <input
            type="range"
            min={-500}
            max={500}
            value={overlay.centerY}
            onChange={(e) =>
              onUpdateTextOverlay(overlay.id, { centerY: Number(e.target.value) })
            }
            className="w-full accent-purple-500"
          />
        </div>

        <button
          onClick={() => onDeleteTextOverlay(overlay.id)}
          className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 bg-red-900/20 hover:bg-red-900/40 px-3 py-1.5 rounded transition-colors w-full justify-center"
        >
          <Trash2 size={12} /> Delete Text Overlay
        </button>
      </div>
    );
  }

  if (selectedItem.type === "image") {
    const overlay = imageOverlays[selectedItem.actionId];
    if (!overlay || !onUpdateImageOverlay || !onDeleteImageOverlay) {
      return (
        <div className="bg-gray-900 rounded-lg p-4">
          <p className="text-sm text-gray-400">Image overlay not found</p>
        </div>
      );
    }

    return (
      <div className="bg-gray-900 rounded-lg p-4 space-y-3">
        <p className="text-xs text-gray-500 uppercase tracking-wider">Image Properties</p>

        <div>
          <label className="text-xs text-gray-400 block mb-1">Width (px)</label>
          <input
            type="number"
            min={8}
            max={800}
            value={overlay.width}
            onChange={(e) => onUpdateImageOverlay(overlay.id, { width: Number(e.target.value) })}
            className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-gray-200"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">Height (px)</label>
          <input
            type="number"
            min={8}
            max={800}
            value={overlay.height}
            onChange={(e) => onUpdateImageOverlay(overlay.id, { height: Number(e.target.value) })}
            className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-gray-200"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">Position X: {overlay.centerX}px</label>
          <input
            type="range"
            min={-500}
            max={500}
            value={overlay.centerX}
            onChange={(e) => onUpdateImageOverlay(overlay.id, { centerX: Number(e.target.value) })}
            className="w-full accent-amber-500"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">Position Y: {overlay.centerY}px</label>
          <input
            type="range"
            min={-500}
            max={500}
            value={overlay.centerY}
            onChange={(e) => onUpdateImageOverlay(overlay.id, { centerY: Number(e.target.value) })}
            className="w-full accent-amber-500"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">Opacity: {Math.round(overlay.opacity * 100)}%</label>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(overlay.opacity * 100)}
            onChange={(e) => onUpdateImageOverlay(overlay.id, { opacity: Number(e.target.value) / 100 })}
            className="w-full accent-amber-500"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">Rotation: {overlay.rotation}°</label>
          <input
            type="number"
            min={-180}
            max={180}
            value={overlay.rotation}
            onChange={(e) => onUpdateImageOverlay(overlay.id, { rotation: Number(e.target.value) })}
            className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-gray-200"
          />
        </div>

        <button
          onClick={() => onDeleteImageOverlay(overlay.id)}
          className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 bg-red-900/20 hover:bg-red-900/40 px-3 py-1.5 rounded transition-colors w-full justify-center"
        >
          <Trash2 size={12} /> Delete Image Overlay
        </button>
      </div>
    );
  }

  if (selectedItem.type === "audio") {
    return (
      <div className="bg-gray-900 rounded-lg p-4 space-y-3">
        <p className="text-xs text-gray-500 uppercase tracking-wider">Audio Properties</p>

        {(audioFile || audioUrl) ? (
          <>
            <p className="text-sm text-gray-200 truncate">{audioFile?.name ?? "Audio file"}</p>

            <div>
              <label className="text-xs text-gray-400 block mb-1">
                Volume: {Math.round(audioMeta.volume * 100)}%
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(audioMeta.volume * 100)}
                onChange={(e) =>
                  onUpdateAudioMeta({ volume: Number(e.target.value) / 100 })
                }
                className="w-full accent-green-500"
              />
            </div>

            <button
              onClick={onRemoveAudio}
              className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 bg-red-900/20 hover:bg-red-900/40 px-3 py-1.5 rounded transition-colors w-full justify-center"
            >
              <Trash2 size={12} /> Remove Audio
            </button>
          </>
        ) : (
          <p className="text-sm text-gray-400">No audio file loaded</p>
        )}
      </div>
    );
  }

  return null;
}
