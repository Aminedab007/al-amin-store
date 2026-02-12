// src/pages/Cart.tsx
import { Link } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { decrement, increment, removeFromCart } from "../features/cart/cartSlice";
import { selectCartTotals, money } from "../features/cart/cartSelectors";
import DeliverySummary from "../components/checkout/DeliverySummary";
import { stockUi } from "../utils/stockUi";
import { loadProducts } from "../features/products/productsSlice";

function getStockValue(p: any): number {
  const n = Number(p?.stock);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
}

export default function CartPage() {
  const dispatch = useAppDispatch();
  const totals = useAppSelector(selectCartTotals);

  // ✅ stock source = products slice
  const products = useAppSelector((s) => s.products.items);
  const productsStatus = useAppSelector((s) => s.products.status);

  // ✅ ensure products loaded even if user opens /cart directly
  useEffect(() => {
    if (productsStatus === "idle") dispatch(loadProducts());
  }, [dispatch, productsStatus]);

  // map id -> stock (fast)
  const stockById = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of products as any[]) m.set(String(p.id), getStockValue(p));
    return m;
  }, [products]);

  if (totals.count === 0) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-8">
        <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-zinc-900">Panier vide</p>
          <p className="mt-2 text-sm text-zinc-600">
            Ajoute des produits et reviens ici pour finaliser ta commande.
          </p>
          <Link
            to="/products"
            className="mt-5 inline-flex rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            Voir les produits
          </Link>
        </div>
      </div>
    );
  }

  const list = totals.small.concat(totals.large);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Votre panier</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Vérifie les quantités avant de passer au paiement.
          </p>
          {productsStatus === "loading" ? (
            <p className="mt-2 text-xs text-zinc-500">Mise à jour du stock...</p>
          ) : null}
        </div>

        <Link
          to="/products"
          className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
        >
          Continuer vos achats
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Items */}
        <div className="space-y-4">
          {list.map((it) => {
            const available = stockById.get(String(it.id)) ?? 0;

            // ✅ UI guard (mais reducer est aussi blindé)
            const canInc = available > 0 && it.quantity < available;

            const s = stockUi(available);
            const pill =
              s.tone === "success"
                ? "bg-emerald-100 text-emerald-700"
                : s.tone === "warning"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-rose-100 text-rose-700";

            return (
              <div key={it.id} className="flex gap-4 rounded-2xl border bg-white p-4 shadow-sm">
                <img
                  src={it.image}
                  alt={it.title}
                  className="h-20 w-20 rounded-xl object-cover"
                  loading="lazy"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-zinc-900">{it.title}</p>

                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <p className="text-xs text-zinc-600">
                          {it.deliveryPolicy === "ARAMEX_10DT"
                            ? "Petit gabarit • Aramex"
                            : "Grand gabarit • Appel pour livraison"}
                        </p>

                        {/* ✅ Stock badge (sans chiffres) */}
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-extrabold ${pill}`}>
                          {s.text}
                        </span>
                      </div>

                      {available === 0 ? (
                        <p className="mt-2 text-xs font-semibold text-rose-700">
                          Produit en rupture — supprime-le du panier.
                        </p>
                      ) : null}
                    </div>

                    <button
                      onClick={() => dispatch(removeFromCart(it.id))}
                      className="rounded-lg px-2 py-1 text-xs font-semibold text-zinc-600 hover:bg-zinc-100"
                      aria-label="Supprimer"
                    >
                      Supprimer
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => dispatch(decrement(it.id))}
                        className="h-9 w-9 rounded-xl border bg-white text-sm font-bold hover:bg-zinc-50"
                        aria-label="Diminuer"
                      >
                        −
                      </button>

                      <span className="w-10 text-center text-sm font-semibold text-zinc-900">
                        {it.quantity}
                      </span>

                      <button
                        disabled={!canInc}
                        onClick={() => {
                          if (!canInc) return;
                          // ✅ IMPORTANT: on envoie le stock actuel => reducer resync + anti-spam
                          dispatch(increment({ id: it.id, stock: available }));
                        }}
                        className={`h-9 w-9 rounded-xl border text-sm font-bold transition ${
                          canInc ? "bg-white hover:bg-zinc-50" : "cursor-not-allowed bg-zinc-100 text-zinc-400"
                        }`}
                        aria-label="Augmenter"
                        title={!canInc ? "Quantité max atteinte" : "Augmenter"}
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-zinc-600">Prix</p>
                      <p className="text-sm font-bold text-zinc-900">
                        {money(it.price * it.quantity)}
                      </p>
                    </div>
                  </div>

                  {/* cas rare: stock a baissé sous la quantité */}
                  {available > 0 && it.quantity > available ? (
                    <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">
                      Stock insuffisant. Ajuste la quantité avant de payer.
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <DeliverySummary
            hasSmall={totals.hasSmall}
            hasLarge={totals.hasLarge}
            shippingFee={totals.shippingFee}
            phone="99655735"
          />

          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-zinc-900">Résumé</p>

            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-zinc-600">Sous-total (petits)</span>
                <span className="font-semibold text-zinc-900">{money(totals.subtotalSmall)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-600">Sous-total (grands)</span>
                <span className="font-semibold text-zinc-900">{money(totals.subtotalLarge)}</span>
              </div>

              <div className="my-2 border-t" />

              <div className="flex items-center justify-between">
                <span className="text-zinc-600">Sous-total</span>
                <span className="font-semibold text-zinc-900">{money(totals.subtotal)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-600">Frais de livraison</span>
                <span className="font-semibold text-zinc-900">{money(totals.shippingFee)}</span>
              </div>

              <div className="my-2 border-t" />

              <div className="flex items-center justify-between">
                <span className="text-zinc-900 font-semibold">Total</span>
                <span className="text-zinc-900 font-bold">{money(totals.total)}</span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="mt-4 flex w-full items-center justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
            >
              Passer au paiement
            </Link>

            <p className="mt-3 text-xs text-zinc-500">
              En validant, vous confirmez vos informations et acceptez d’être contacté
              par téléphone si des grands gabarits sont présents.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
