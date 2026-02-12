// src/components/ui/Toast.tsx
import { useEffect } from "react";
import type { ToastTone } from "../../features/ui/uiSlice";

type Props = {
  open: boolean;
  message: string;
  tone?: ToastTone;
  onClose: () => void;
  durationMs?: number;
};

function toneClasses(tone: ToastTone) {
  switch (tone) {
    case "success":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
    case "warning":
      return "border-amber-200 bg-amber-50 text-amber-900";
    case "danger":
      return "border-rose-200 bg-rose-50 text-rose-900";
    default:
      return "border-zinc-200 bg-white text-zinc-900";
  }
}

export default function Toast({
  open,
  message,
  tone = "info",
  onClose,
  durationMs = 2500,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onClose, durationMs);
    return () => clearTimeout(t);
  }, [open, onClose, durationMs]);

  if (!open) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] w-[min(92vw,380px)]">
      <div
        className={[
          "rounded-2xl border px-4 py-3 shadow-lg",
          "animate-[toastIn_160ms_ease-out]",
          toneClasses(tone),
        ].join(" ")}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-snug">{message}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-xs font-bold opacity-70 hover:opacity-100 hover:bg-black/5"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>
      </div>

      {/* keyframes lightweight */}
      <style>{`
        @keyframes toastIn {
          from { transform: translateY(8px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
