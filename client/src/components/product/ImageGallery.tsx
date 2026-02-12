import { useMemo, useRef, useState } from "react";

type Props = {
  images: string[];
  alt: string;
};

export default function ImageGallery({ images, alt }: Props) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState({ on: false, x: 50, y: 50 });
  const [lightbox, setLightbox] = useState(false);

  const main = images?.[active] ?? images?.[0];
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const bgPos = useMemo(() => `${zoom.x}% ${zoom.y}%`, [zoom.x, zoom.y]);

  function onMove(e: React.MouseEvent) {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    setZoom((z) => ({ ...z, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) }));
  }

  if (!images?.length) return null;

  return (
    <div className="grid gap-3 md:grid-cols-[80px_1fr]">
      {/* Thumbnails */}
      <div className="flex gap-2 overflow-auto md:flex-col md:overflow-visible">
        {images.map((src, i) => (
          <button
            key={src + i}
            onClick={() => setActive(i)}
            className={[
              "h-16 w-16 shrink-0 overflow-hidden rounded-xl border transition",
              i === active ? "border-zinc-900" : "border-zinc-200 hover:border-zinc-400",
            ].join(" ")}
            aria-label={`Voir image ${i + 1}`}
          >
            <img src={src} alt={`${alt} ${i + 1}`} className="h-full w-full object-cover" loading="lazy" />
          </button>
        ))}
      </div>

      {/* Main image + zoom */}
      <div className="space-y-2">
        <div
          ref={wrapRef}
          className="relative aspect-square overflow-hidden rounded-2xl border border-zinc-200 bg-white"
          onMouseEnter={() => setZoom((z) => ({ ...z, on: true }))}
          onMouseLeave={() => setZoom((z) => ({ ...z, on: false }))}
          onMouseMove={onMove}
        >
          {/* image normale */}
          <img
            src={main}
            alt={alt}
            className="h-full w-full object-contain"
            loading="eager"
            onClick={() => setLightbox(true)}
          />

          {/* couche zoom desktop */}
          <div
            className={[
              "pointer-events-none absolute inset-0 hidden md:block",
              zoom.on ? "opacity-100" : "opacity-0",
              "transition-opacity",
            ].join(" ")}
            style={{
              backgroundImage: `url(${main})`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: bgPos,
              backgroundSize: "220%",
            }}
          />
        </div>

        <button
          onClick={() => setLightbox(true)}
          className="text-sm text-zinc-600 hover:text-zinc-900"
        >
          Ouvrir en plein écran
        </button>

        {lightbox && (
          <div
            className="fixed inset-0 z-[999] grid place-items-center bg-black/70 p-4"
            onClick={() => setLightbox(false)}
            role="dialog"
            aria-modal="true"
          >
            <div className="max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl bg-white" onClick={(e) => e.stopPropagation()}>
              <img src={main} alt={alt} className="h-full w-full object-contain" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
