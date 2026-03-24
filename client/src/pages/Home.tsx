import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { addToCart } from "../features/cart/cartSlice";

import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { SectionTitle } from "../components/ui/SectionTitle";

type HomeCategory = {
  name: string;
  category: string;
  icon?: string;
};

const HOME_CATEGORIES: HomeCategory[] = [
  { name: "TV", category: "TV", icon: "📺" },
  { name: "Réfrigérateurs", category: "Réfrigérateurs", icon: "🧊" },
  { name: "Climatiseurs", category: "Climatiseurs", icon: "❄️" },
  { name: "Smartphones", category: "Smartphones", icon: "📱" },
  { name: "Congélateurs", category: "Congélateurs", icon: "🧺" },
  { name: "Accessoires", category: "Accessoires", icon: "🧩" },
];

const PLACEHOLDER = "/products/placeholder.webp";

function getStockValue(p: any): number {
  const n = Number(p?.stock);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
}

function ProductMiniCard({
  id,
  title,
  category,
  price,
  image,
  stock,
  deliveryPolicy,
}: {
  id: string;
  title: string;
  category: string;
  price: number;
  image?: string;
  stock: number;
  deliveryPolicy: "ARAMEX_10DT" | "CALL_FOR_DELIVERY";
}) {
  const dispatch = useAppDispatch();
  const inStock = stock > 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="relative aspect-[4/3] bg-slate-100">
        <img
          src={image || PLACEHOLDER}
          alt={title}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = PLACEHOLDER;
          }}
        />

        <div className="absolute left-3 top-3">
          <span
            className={`rounded-full px-2 py-1 text-xs font-semibold ${
              inStock ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
            }`}
          >
            {inStock ? "Disponible" : "Rupture"}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="text-xs text-slate-500">{category}</div>
        <div className="mt-1 line-clamp-2 font-semibold text-slate-900">{title}</div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="text-lg font-extrabold text-emerald-700">{price.toFixed(0)} DT</div>
          <div className="text-[11px] text-slate-500">
            {deliveryPolicy === "CALL_FOR_DELIVERY" ? "Appel" : "Aramex 10 DT"}
          </div>
        </div>

        <div className="mt-4">
          <button
            disabled={!inStock}
            onClick={() => {
              if (!inStock) return;
              dispatch(
                addToCart({
                  id,
                  title,
                  price,
                  deliveryPolicy,
                  image: image || PLACEHOLDER,
                  stock,
                  quantity: 1,
                })
              );
            }}
            className={`w-full rounded-xl px-4 py-2 text-sm font-semibold transition ${
              inStock
                ? "bg-zinc-900 text-white hover:bg-zinc-800"
                : "cursor-not-allowed bg-zinc-200 text-zinc-500"
            }`}
          >
            Ajouter au panier
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const products = useAppSelector((s) => s.products.items);

  const best = useMemo(() => {
    const withFlag = (products as any[]).filter((p) => p?.isBestSeller);
    const base = withFlag.length ? withFlag : products;
    return base.slice(0, 3);
  }, [products]);

  return (
    <div className="pb-10">
      <div className="bg-gradient-to-b from-slate-50 to-white">
        <Container>
          <div className="py-8">
            <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
              <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-zinc-900 via-zinc-800 to-black p-6 text-white shadow-sm">
                <div className="flex h-full flex-col justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
                      AL AMIN STORE
                    </p>
                    <h1 className="mt-3 text-3xl font-extrabold leading-tight md:text-5xl">
                      Électroménager & High-Tech au meilleur prix
                    </h1>
                    <p className="mt-4 max-w-xl text-sm text-zinc-200 md:text-base">
                      TV, réfrigérateurs, climatiseurs, smartphones et accessoires avec une
                      expérience d’achat moderne, simple et rapide.
                    </p>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Link to="/products">
                      <Button className="w-full sm:w-auto">Voir les produits</Button>
                    </Link>
                    <Link
                      to="/products?sort=PRICE_ASC"
                      className="inline-flex items-center justify-center rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
                    >
                      Bons plans
                    </Link>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <SectionTitle title="Catégories populaires" subtitle="Clique pour filtrer" />

                <div className="relative mt-4 md:hidden">
                  <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-white to-transparent" />
                  <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-white to-transparent" />

                  <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
                    {HOME_CATEGORIES.map((c) => (
                      <Link
                        key={c.name}
                        to={`/products?category=${encodeURIComponent(c.category)}`}
                        className="w-52 shrink-0 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-white"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{c.icon || "🛒"}</span>
                          <div className="font-semibold">{c.name}</div>
                        </div>
                        <div className="mt-2 text-xs text-slate-600">Explorer →</div>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="mt-4 hidden grid-cols-2 gap-3 md:grid">
                  {HOME_CATEGORIES.map((c) => (
                    <Link
                      key={c.name}
                      to={`/products?category=${encodeURIComponent(c.category)}`}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-white"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{c.icon || "🛒"}</span>
                        <div className="font-semibold">{c.name}</div>
                      </div>
                      <div className="mt-2 text-xs text-slate-600">Explorer →</div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      <Container>
        <div className="py-10">
          <SectionTitle title="Meilleures ventes" subtitle="Sélection du moment" />

          {best.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">
              Aucun produit pour le moment.
            </div>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {best.map((p: any) => (
                <ProductMiniCard
                  key={String(p.id)}
                  id={String(p.id)}
                  title={String(p.title)}
                  category={String(p.category)}
                  price={Number(p.price)}
                  image={p.image}
                  stock={getStockValue(p)}
                  deliveryPolicy={
                    p.deliveryPolicy === "CALL_FOR_DELIVERY"
                      ? "CALL_FOR_DELIVERY"
                      : "ARAMEX_10DT"
                  }
                />
              ))}
            </div>
          )}

          <div className="mt-6 flex justify-center">
            <Link to="/products" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto">Voir tous les produits</Button>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}