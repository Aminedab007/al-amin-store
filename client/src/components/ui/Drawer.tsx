// src/components/ui/Drawer.tsx
import { useEffect } from "react";

export default function Drawer({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Fermer"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      {/* Panel */}
      <div className="absolute inset-x-0 bottom-0 max-h-[85vh] rounded-t-3xl bg-white shadow-xl border border-zinc-200 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-10 rounded-full bg-zinc-300" />
          </div>

          <div className="text-sm font-extrabold text-zinc-900">{title}</div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 transition"
          >
            Fermer
          </button>
        </div>

        <div className="p-4 overflow-auto">{children}</div>
      </div>
    </div>
  );
}
