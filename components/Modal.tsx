import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  className,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="min-h-full flex items-center justify-center w-full py-8">
        <div
          ref={modalRef}
          className={cn(
            "relative w-full max-w-lg bg-slate-900/90 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200",
            className,
          )}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 bg-slate-800/30">
            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <div className="p-6 max-h-[600px] overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
