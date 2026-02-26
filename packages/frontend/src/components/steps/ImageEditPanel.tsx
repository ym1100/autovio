import { useState } from "react";
import { Loader2 } from "lucide-react";
import { AuthenticatedImg } from "../ui/AuthenticatedMedia";

export interface ImageEditPanelProps {
  sceneIndex: number;
  currentImageUrl?: string;
  imagePrompt: string;
  negativePrompt: string;
  onRegenerate: (imagePrompt: string, negativePrompt: string) => void;
  onClose: () => void;
  isLoading?: boolean;
}

const MAX_PROMPT_CHARS = 500;

export default function ImageEditPanel({
  sceneIndex,
  currentImageUrl,
  imagePrompt,
  negativePrompt,
  onRegenerate,
  onClose,
  isLoading = false,
}: ImageEditPanelProps) {
  const [prompt, setPrompt] = useState(imagePrompt);
  const [negative, setNegative] = useState(negativePrompt);

  const handleSubmit = () => {
    onRegenerate(prompt.trim(), negative.trim());
    onClose();
  };

  return (
    <div className="space-y-4">
      {currentImageUrl && (
        <div className="flex justify-center">
          <AuthenticatedImg
            url={currentImageUrl}
            alt={`Scene ${sceneIndex + 1}`}
            className="rounded-lg object-cover w-[150px] h-[150px] border border-gray-700"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Image Prompt <span className="text-red-400">*</span>
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value.slice(0, MAX_PROMPT_CHARS))}
          placeholder="Describe the image to generate..."
          className="w-full h-28 px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none"
          disabled={isLoading}
        />
        <p className="text-xs text-gray-500 mt-0.5">
          {prompt.length}/{MAX_PROMPT_CHARS}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Negative Prompt (optional)
        </label>
        <textarea
          value={negative}
          onChange={(e) => setNegative(e.target.value)}
          placeholder="blurry, low quality, text, watermark..."
          className="w-full h-20 px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none"
          disabled={isLoading}
        />
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
          "Regenerate Image"
        )}
      </button>
    </div>
  );
}
