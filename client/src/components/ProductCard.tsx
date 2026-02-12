// src/components/ProductCard.tsx
import { Link } from "react-router-dom";
import type { Product } from "../../data/products";
import { useAppDispatch } from "../../app/hooks";
import { addToCart } from "../../features/cart/cartSlice";
import Badge from "./Badge";
import SmartImage from "./SmartImage";

function formatPriceDT(price: number) {
  return `${price.toFixed(3)} DT`;
}

function getStock(p: any) {
  const n = Number(p?.stock);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
}

export default function ProductCard({ product }: { product: Product }) {
  const dispatch = useAppDispatch();

  const stock = getStock(product);
  const inStock = stock > 0;

  return (
    <div className="relative rounded-2xl border border-zinc-200 bg-white p-3 transition hover:shadow-sm">
      {/* BADGES */}
      <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2">
        {(product as any).isBestSeller && <Badge>Best Seller</Badge>}

        {inStock ? (
          <Badge tone="success">En stock</Badge>
        ) : (
          <Badge tone="warning">Rupture</Badge>
        )}

        {product.deliveryPolicy === "ARAMEX_10DT" ? (
          <Badge tone="info">Livraison 10 DT</Badge>
        ) : (
          <Badge tone="warning">On vous appelle</Badge>
        )}
      </div>

      {/* IMAGE */}
      <Link to={`/products/${product.id}`} className="block">
        <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-zinc-50">
          <SmartImage
            src={product.image}
            alt={product.title}
            className="h-full w-full object-contain"
            loading="lazy"
          />
        </div>
      </Link>

      {/* INFO */}
      <div className="mt-3 space-y-1">
        <Link
          to={`/products/${product.id}`}
          className="line-clamp-2 text-sm font-semibold text-zinc-900 hover:underline"
        >
          {product.title}
        </Link>

        <div className="text-sm font-bold text-zinc-900">{formatPriceDT(product.price)}</div>
      </div>

      {/* CTA */}
      <button
        disabled={!inStock}
        className={`mt-3 w-full rounded-xl px-3 py-2 text-sm font-semibold text-white transition active:scale-[0.99] ${
          inStock ? "bg-zinc-900 hover:bg-zinc-800" : "cursor-not-allowed bg-zinc-200 text-zinc-500"
        }`}
        onClick={() => {
          if (!inStock) return;
          dispatch(
            addToCart({
              id: product.id,
              title: product.title,
              price: product.price,
              image: product.image,
              deliveryPolicy: product.deliveryPolicy,
              stock, // ✅ IMPORTANT
              quantity: 1,
            })
          );
        }}
      >
        {inStock ? "Ajouter" : "Indisponible"}
      </button>
    </div>
  );
}
