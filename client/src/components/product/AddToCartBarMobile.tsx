// src/components/product/AddToCartBarMobile.tsx
import type { Product } from "../../data/products";
import { useAppDispatch } from "../../app/hooks";
import { addToCart } from "../../features/cart/cartSlice";

function formatPriceDT(value: unknown) {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return "—";
  return `${n.toFixed(3)} DT`;
}

function getStock(p: any) {
  const n = Number(p?.stock);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
}

export default function AddToCartBarMobile({ product }: { product: Product }) {
  const dispatch = useAppDispatch();
  if (!product?.id) return null;

  const stock = getStock(product);
  const inStock = stock > 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[99] border-t border-zinc-200 bg-white p-3 md:hidden">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-zinc-900">{product.title}</div>
          <div className="text-sm font-bold text-zinc-900">{formatPriceDT(product.price)}</div>
        </div>

        <button
          disabled={!inStock}
          className={`rounded-xl px-4 py-3 text-sm font-semibold text-white transition active:scale-[0.99] ${
            inStock ? "bg-zinc-900 hover:bg-zinc-800" : "cursor-not-allowed bg-zinc-200 text-zinc-500"
          }`}
          onClick={() => {
            if (!inStock) return;
            dispatch(
              addToCart({
                id: product.id,
                title: product.title,
                price: product.price,
                deliveryPolicy: product.deliveryPolicy,
                image: product.image, // ✅ IMPORTANT pour ton panier
                stock, // ✅ IMPORTANT anti-spam reducer
                quantity: 1,
              })
            );
          }}
        >
          {inStock ? "Ajouter" : "Rupture"}
        </button>
      </div>
    </div>
  );
}
