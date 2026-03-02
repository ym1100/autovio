import { useState, useEffect } from "react";
import { X } from "lucide-react";

export interface SaveTemplateFormData {
  name: string;
  description: string;
  tags: string;
}

interface SaveTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: SaveTemplateFormData) => void;
  textCount: number;
  imageCount: number;
  isSaving?: boolean;
}

export default function SaveTemplateDialog({
  open,
  onClose,
  onSubmit,
  textCount,
  imageCount,
  isSaving,
}: SaveTemplateDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");

  useEffect(() => {
    if (open) {
      setName("");
      setDescription("");
      setTags("");
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    onSubmit({
      name: trimmedName,
      description: description.trim(),
      tags: tags.trim(),
    });
  };

  if (!open) return null;

  const summary = [
    textCount > 0 && `${textCount} text overlay${textCount > 1 ? "s" : ""}`,
    imageCount > 0 && `${imageCount} image overlay${imageCount > 1 ? "s" : ""}`,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-700 shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Save as template</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Template name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Instagram Story Branding"
              className="w-full rounded-lg bg-gray-800 border border-gray-600 text-white px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={2}
              className="w-full rounded-lg bg-gray-800 border border-gray-600 text-white px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Tags (comma separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. instagram, branding"
              className="w-full rounded-lg bg-gray-800 border border-gray-600 text-white px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            />
          </div>
          {summary && (
            <p className="text-sm text-gray-400">
              This template will include: {summary}. Timing will be saved as relative to video duration.
            </p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isSaving}
              className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 disabled:bg-gray-700 disabled:text-gray-500 text-white transition-colors"
            >
              {isSaving ? "Saving..." : "Save template"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
