import { useState } from "react";
import { Loader2 } from "lucide-react";
import { AuthenticatedImg } from "../ui/AuthenticatedMedia";

export interface VideoEditPanelProps {
  sceneIndex: number;
  referenceImageUrl?: string;
  videoPrompt: string;
  duration: number;
  onRegenerate: (videoPrompt: string, duration: number) => void;
  onClose: () => void;
  isLoading?: boolean;
}

const DURATION_OPTIONS = [3, 4, 5, 6, 7, 8, 9, 10];
const MAX_PROMPT_CHARS = 500;

export default function VideoEditPanel({
  sceneIndex,
  referenceImageUrl,
  videoPrompt,
  duration,
  onRegenerate,
  onClose,
  isLoading = false,
}: VideoEditPanelProps) {
  const [prompt, setPrompt] = useState(videoPrompt);
  const [durationSec, setDurationSec] = useState(duration);

  const handleSubmit = () => {
    onRegenerate(prompt.trim(), durationSec);
    onClose();
  };

  return (
    <div className="space-y-4">
      {referenceImageUrl && (
        <div className="space-y-1">
          <div className="flex justify-center">
            <AuthenticatedImg
              url={referenceImageUrl}
              alt={`Scene ${sceneIndex + 1} reference`}
              className="rounded-lg object-cover w-[150px] h-[150px] border border-gray-700"
            />
          </div>
          <p className="text-xs text-gray-500 text-center">
            This image will be animated
          </p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Video Prompt <span className="text-red-400">*</span>
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value.slice(0, MAX_PROMPT_CHARS))}
          placeholder="Camera movement, motion, cinematic style..."
          className="w-full h-28 px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none"
          disabled={isLoading}
        />
        <p className="text-xs text-gray-500 mt-0.5">
          {prompt.length}/{MAX_PROMPT_CHARS}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Duration (seconds)
        </label>
        <select
          value={durationSec}
          onChange={(e) => setDurationSec(Number(e.target.value))}
          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          disabled={isLoading}
        >
          {DURATION_OPTIONS.map((sec) => (
            <option key={sec} value={sec}>
              {sec} seconds
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isLoading || !prompt.trim()}
        className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 text-white py-2.5 rounded-lg font-medium transition-colors"
      >
        {isLoading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Regenerating...
          </>
        ) : (
          "Regenerate Video"
        )}
      </button>
    </div>
  );
}
