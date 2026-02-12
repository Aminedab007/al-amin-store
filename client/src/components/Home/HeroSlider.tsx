// src/components/home/HeroSlider.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PRODUCTS } from "../../data/products";
import { money } from "../../features/cart/cartSelectors";

export default function HeroSlider() {
  const navigate = useNavigate();

  const slides = useMemo(() => {
    const best = PRODUCTS.filter((p) => p.isBestSeller);
    return (best.length ? best : PRODUCTS).slice(0, 5);
  }, []);

  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = setInterval(() => {
      setAnimate(false); // reset animation
      setTimeout(() => {
        setIndex((i) => (i + 1) % slides.length);
        setAnimate(true);
      }, 50);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const current = slides[index];
  if (!current) return null;

  const go = (next: number) => {
    setAnimate(false);
    setTimeout(() => {
      setIndex((next + slides.length) % slides.length);
      setAnimate(true);
    }, 50);
  };

  return (
    <div
      className="relative overflow-hidden rounded-3xl shadow-sm cursor-pointer group"
      onClick={() => navigate(`/products/${current.id}`)}
    >
      {/* IMAGE FULL */}
      <div className="relative aspect-[16/9] w-full">
        <img
          src={current.image}
          alt={current.title}
          className={`
            absolute inset-0 h-full w-full object-cover
            transition-all duration-700 ease-out
            ${animate ? "scale-100 opacity-100" : "scale-105 opacity-0"}
            group-hover:scale-[1.03]
          `}
          loading="lazy"
        />

        {/* OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-transparent" />

        {/* TEXTE */}
        <div className="absolute inset-0 flex items-center pointer-events-none">
          <div className="px-6 md:px-10 max-w-xl">
            <h2 className="text-2xl font-extrabold text-white md:text-4xl leading-tight">
              {current.title}
            </h2>

            <div className="mt-4">
              <p className="text-4xl font-extrabold text-white md:text-6xl">
                {money(current.price)}
              </p>
              <p className="mt-1 text-sm text-white/80">
                Prix étudié • Service fiable
              </p>
            </div>
          </div>
        </div>

        {/* FLECHES (ne bloquent pas le clic slide) */}
        {slides.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                go(index - 1);
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 px-3 py-2 text-lg font-bold text-zinc-900 hover:bg-white"
              aria-label="Précédent"
            >
              ‹
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                go(index + 1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 px-3 py-2 text-lg font-bold text-zinc-900 hover:bg-white"
              aria-label="Suivant"
            >
              ›
            </button>

            {/* DOTS */}
            <div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => go(i)}
                  className={`h-2.5 w-2.5 rounded-full transition ${
                    i === index
                      ? "bg-white"
                      : "bg-white/40 hover:bg-white/70"
                  }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
