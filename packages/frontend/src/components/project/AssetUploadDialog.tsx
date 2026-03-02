import { useState, useRef } from "react";
import { X, Upload, Loader2 } from "lucide-react";
import { uploadProjectAsset } from "../../storage/projectStorage";
import { useToastStore } from "../../store/useToastStore";

interface AssetUploadDialogProps {
  open: boolean;
  projectId: string;
  onClose: () => void;
  onUploaded: () => void;
}

const ACCEPT = "image/*,video/mp4,video/webm,audio/*,.ttf,.otf,.woff,.woff2";

export default function AssetUploadDialog({
  open,
  projectId,
  onClose,
  onUploaded,
}: AssetUploadDialogProps) {
  const addToast = useToastStore((s) => s.addToast);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setFile(f ?? null);
    if (f) setName(f.name.replace(/\.[^.]+$/, "") || f.name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      addToast("Select a file", "error");
      return;
    }
    setUploading(true);
    try {
      await uploadProjectAsset(projectId, file, { name: name.trim() || undefined });
      setFile(null);
      setName("");
      inputRef.current?.form?.reset();
      onUploaded();
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setFile(null);
      setName("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="bg-gray-900 border border-gray-700 rounded-xl shadow-xl w-full max-w-md overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-asset-title"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <h2 id="upload-asset-title" className="text-lg font-semibold text-white">
            Upload asset
          </h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={uploading}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">File</label>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              onChange={handleFileChange}
              className="w-full text-sm text-gray-300 file:mr-3 file:py-2 file:px-3 file:rounded file:border-0 file:bg-purple-600 file:text-white file:font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Name (optional)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Display name"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={uploading}
              className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!file || uploading}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg font-medium"
            >
              {uploading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Upload
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
