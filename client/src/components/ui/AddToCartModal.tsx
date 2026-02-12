// src/components/ui/AddToCartModal.tsx
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { money } from "../../features/cart/cartSelectors";

type DeliveryPolicy = "ARAMEX_10DT" | "CALL_FOR_DELIVERY";

type Props = {
  open: boolean;
  onClose: () => void;

  product: {
    id: string;
    title: string;
    image: string;
    price: number;
    deliveryPolicy: DeliveryPolicy;
  };

  qtyAdded: number;

  cartCount: number;
  cartTotal: number;
};

const STORE_PHONE_DISPLAY = "99655735";

export default function AddToCartModal({
  open,
  onClose,
  product,
  qtyAdded,
  cartCount,
  cartTotal,
}: Props) {
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const content = (
    <div className="fixed inset-0 z-[9999]">
      {/* Overlay */}
      <button
        aria-label="Fermer"
        onClick={onClose}
        className="absolute inset-0 bg-black/35"
      />

      {/* Modal (NO SCROLL) */}
      <div
        className="
          absolute left-1/2 top-1/2
          w-[92vw] max-w-lg
          -translate-x-1/2 -translate-y-1/2
          rounded-2xl border bg-white shadow-2xl
        "
        role="dialog"
        aria-modal="true"
        aria-label="Produit ajouté au panier"
      >
        {/* Header compact */}
        <div className="flex items-start justify-between gap-4 border-b px-4 py-3">
          <div className="min-w-0">
            <p className="text-base font-extrabold text-zinc-900">
              Produit ajouté au panier ✅
            </p>
            <p className="mt-0.5 text-sm text-zinc-600">
              Tu peux continuer ou passer à la commande.
            </p>
          </div>

          <button
            onClick={onClose}
            className="h-9 w-9 rounded-xl border bg-white text-lg font-bold text-zinc-700 hover:bg-zinc-50"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        {/* Body compact */}
        <div className="grid gap-4 px-4 py-4 md:grid-cols-[150px_1fr]">
          {/* Image */}
          <div className="rounded-2xl border bg-zinc-50 p-2">
            <div className="aspect-square overflow-hidden rounded-xl bg-white">
              <img
                src={product.image}
                alt={product.title}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              {product.deliveryPolicy === "ARAMEX_10DT" ? (
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                  ARAMEX_10DT
                </span>
              ) : (
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                  CALL_FOR_DELIVERY
                </span>
              )}

              <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-800">
                Qté: {qtyAdded}
              </span>
            </div>
          </div>

          {/* Infos */}
          <div className="min-w-0">
            <p className="text-lg font-extrabold text-zinc-900 line-clamp-2">
              {product.title}
            </p>

            <div className="mt-2 flex items-baseline justify-between gap-3">
              <p className="text-2xl font-extrabold text-red-600">
                {money(product.price)}
              </p>
              <p className="text-sm text-zinc-700">
                Qté ajoutée : <span className="font-semibold">{qtyAdded}</span>
              </p>
            </div>

            {/* Livraison ultra compacte */}
            {product.deliveryPolicy === "CALL_FOR_DELIVERY" ? (
              <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                <span className="font-semibold">Grand gabarit :</span>{" "}
                livraison à confirmer. <span className="font-semibold">Appel :</span>{" "}
                {STORE_PHONE_DISPLAY}
              </div>
            ) : (
              <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
                <span className="font-semibold">Aramex :</span> 10 DT si au moins 1 petit
                gabarit dans la commande.
              </div>
            )}

            {/* Total panier compact */}
            <div className="mt-3 rounded-2xl border bg-white px-3 py-3">
              <div className="flex items-center justify-between text-sm text-zinc-700">
                <span>
                  Panier :{" "}
                  <span className="font-semibold text-zinc-900">{cartCount}</span>{" "}
                  article(s)
                </span>
                <span className="text-xs text-zinc-500">TTC</span>
              </div>

              <div className="mt-2 flex items-end justify-between">
                <span className="text-base font-semibold text-zinc-900">Total</span>
                <span className="text-2xl font-extrabold text-red-600">
                  {money(cartTotal)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button
                onClick={onClose}
                className="flex-1 rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
              >
                Continuer
              </button>

              <Link
                to="/cart"
                className="flex-1 rounded-xl bg-zinc-900 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-zinc-800"
                onClick={onClose}
              >
                Commander
              </Link>
            </div>
          </div>
        </div>

        {/* Footer mini */}
        <div className="border-t px-4 py-2 text-center text-[11px] text-zinc-500">
          AL AMIN STORE • Support : {STORE_PHONE_DISPLAY}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
