import { useState, useRef } from "react";
import { X, Upload, Loader2, Trash2, Image as ImageIcon } from "lucide-react";
import { uploadProjectAsset } from "../../storage/projectStorage";
import { useToastStore } from "../../store/useToastStore";

interface AssetUploadDialogProps {
  open: boolean;
  projectId: string;
  onClose: () => void;
  onUploaded: () => void;
}

interface FileWithMeta {
  file: File;
  id: string;
  name: string;
  description: string;
  preview?: string;
}

const ACCEPT = "image/*,video/mp4,video/webm,audio/*,.ttf,.otf,.woff,.woff2";

export default function MultiAssetUploadDialog({
  open,
  projectId,
  onClose,
  onUploaded,
}: AssetUploadDialogProps) {
  const addToast = useToastStore((s) => s.addToast);
  const [files, setFiles] = useState<FileWithMeta[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, boolean>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const newFiles: FileWithMeta[] = selectedFiles.map((file) => {
      const id = Math.random().toString(36).slice(2);
      const preview = file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined;
      
      return {
        file,
        id,
        name: file.name.replace(/\.[^.]+$/, "") || file.name,
        description: "",
        preview,
      };
    });
    
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.preview) URL.revokeObjectURL(file.preview);
      return prev.filter((f) => f.id !== id);
    });
  };

  const updateFile = (id: string, updates: Partial<FileWithMeta>) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      addToast("Add at least one file", "error");
      return;
    }

    setUploading(true);
    const progress: Record<string, boolean> = {};
    
    try {
      for (const fileMeta of files) {
        progress[fileMeta.id] = false;
        setUploadProgress({ ...progress });
        
        await uploadProjectAsset(projectId, fileMeta.file, {
          name: fileMeta.name.trim() || undefined,
          description: fileMeta.description.trim() || undefined,
        });
        
        progress[fileMeta.id] = true;
        setUploadProgress({ ...progress });
      }

      // Cleanup
      files.forEach((f) => {
        if (f.preview) URL.revokeObjectURL(f.preview);
      });
      
      setFiles([]);
      setUploadProgress({});
      onUploaded();
      addToast(`${files.length} asset(s) uploaded successfully`, "success");
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      files.forEach((f) => {
        if (f.preview) URL.revokeObjectURL(f.preview);
      });
      setFiles([]);
      setUploadProgress({});
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="bg-gray-900 border border-gray-700 rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-asset-title"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <h2 id="upload-asset-title" className="text-lg font-semibold text-white">
            Upload Assets
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

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-4 space-y-4 flex-1 overflow-y-auto">
            {/* File Input */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Select Files</label>
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPT}
                multiple
                onChange={handleFilesChange}
                disabled={uploading}
                className="w-full text-sm text-gray-300 file:mr-3 file:py-2 file:px-3 file:rounded file:border-0 file:bg-purple-600 file:text-white file:font-medium file:cursor-pointer disabled:opacity-50"
              />
              <p className="text-xs text-gray-500 mt-1">
                You can select multiple files. Images, videos, audio, and fonts are supported.
              </p>
            </div>

            {/* Files List */}
            {files.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-300">
                  Files to upload ({files.length})
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {files.map((fileMeta) => (
                    <div
                      key={fileMeta.id}
                      className={`border rounded-lg p-3 ${
                        uploadProgress[fileMeta.id]
                          ? "border-green-500/50 bg-green-500/10"
                          : "border-gray-700 bg-gray-800/50"
                      }`}
                    >
                      <div className="flex gap-3">
                        {/* Preview */}
                        {fileMeta.preview ? (
                          <img
                            src={fileMeta.preview}
                            alt={fileMeta.name}
                            className="w-16 h-16 object-cover rounded flex-shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
                            <ImageIcon size={24} className="text-gray-500" />
                          </div>
                        )}

                        {/* Fields */}
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={fileMeta.name}
                            onChange={(e) => updateFile(fileMeta.id, { name: e.target.value })}
                            placeholder="Display name"
                            disabled={uploading}
                            className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white placeholder-gray-500 disabled:opacity-50"
                          />
                          <textarea
                            value={fileMeta.description}
                            onChange={(e) => updateFile(fileMeta.id, { description: e.target.value })}
                            placeholder="Description (optional - useful for AI reference mode)"
                            disabled={uploading}
                            rows={2}
                            className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white placeholder-gray-500 resize-none disabled:opacity-50"
                          />
                          <p className="text-xs text-gray-500">
                            {(fileMeta.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>

                        {/* Remove button */}
                        {!uploading && (
                          <button
                            type="button"
                            onClick={() => removeFile(fileMeta.id)}
                            className="p-1.5 rounded text-red-400 hover:bg-red-500/20 self-start"
                            title="Remove"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                        
                        {uploadProgress[fileMeta.id] && (
                          <div className="text-green-400 self-start">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 p-4 border-t border-gray-700">
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
              disabled={files.length === 0 || uploading}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg font-medium"
            >
              {uploading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Uploading... ({Object.values(uploadProgress).filter(Boolean).length}/{files.length})
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Upload {files.length > 0 ? `${files.length} file(s)` : ""}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
