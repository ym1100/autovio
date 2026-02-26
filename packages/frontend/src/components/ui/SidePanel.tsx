import { X } from "lucide-react";

export interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function SidePanel({ isOpen, onClose, title, children }: SidePanelProps) {
  if (!isOpen) return null;
  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-200 ease-out"
        aria-hidden
        onClick={onClose}
      />
      <div
        className="fixed top-0 right-0 h-full w-[400px] max-w-[100vw] bg-gray-900 border-l border-gray-700 z-50 shadow-xl flex flex-col transition-transform duration-200 ease-out"
        role="dialog"
        aria-modal="true"
        aria-labelledby="side-panel-title"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 id="side-panel-title" className="text-lg font-semibold text-white">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            aria-label="Close panel"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </>
  );
}
