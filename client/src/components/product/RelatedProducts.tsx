// src/components/product/RelatedProducts.tsx
import { Link } from "react-router-dom";
import type { Product } from "../../data/products";
import { useAppDispatch } from "../../app/hooks";
import { addToCart } from "../../features/cart/cartSlice";

function formatPriceDT(value: number) {
  return `${value.toFixed(3)} DT`;
}

function getStock(p: any) {
  const n = Number(p?.stock);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
}

export default function RelatedProducts({
  product,
  all,
  limit = 6,
}: {
  product: Product;
  all: Product[];
  limit?: number;
}) {
  const dispatch = useAppDispatch();

  const related = all
    .filter((p) => {
      if (p.id === product.id) return false;
      if (p.category !== product.category) return false;
      return getStock(p) > 0; // ✅ stock unique
    })
    .slice(0, limit);

  if (!related.length) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-zinc-900">Produits similaires</h2>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {related.map((p) => {
          const stock = getStock(p);
          const inStock = stock > 0;

          return (
            <div
              key={p.id}
              className="min-w-[180px] max-w-[180px] flex-shrink-0 rounded-2xl border border-zinc-200 bg-white p-3"
            >
              <Link to={`/products/${p.id}`} className="block">
                <img
                  src={p.image}
                  alt={p.title}
                  className="h-32 w-full rounded-xl object-contain"
                  loading="lazy"
                />
                <div className="mt-2 line-clamp-2 text-sm font-semibold text-zinc-900">
                  {p.title}
                </div>
              </Link>

              <div className="mt-1 text-sm font-bold text-zinc-900">
                {formatPriceDT(p.price)}
              </div>

              <button
                disabled={!inStock}
                className={`mt-2 w-full rounded-xl px-3 py-2 text-xs font-semibold text-white transition active:scale-[0.98] ${
                  inStock
                    ? "bg-zinc-900 hover:bg-zinc-800"
                    : "cursor-not-allowed bg-zinc-200 text-zinc-500"
                }`}
                onClick={() => {
                  if (!inStock) return;
                  dispatch(
                    addToCart({
                      id: p.id,
                      title: p.title,
                      price: p.price,
                      image: p.image,
                      deliveryPolicy: p.deliveryPolicy,
                      stock, // ✅ IMPORTANT anti-spam reducer
                      quantity: 1,
                    })
                  );
                }}
              >
                {inStock ? "Ajouter" : "Rupture"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
