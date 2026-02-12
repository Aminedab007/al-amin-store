// src/components/checkout/DeliverySummary.tsx
import { money } from "../../features/cart/cartSelectors";

type Props = {
  hasSmall: boolean;
  hasLarge: boolean;
  shippingFee: number;
  phone?: string;
  className?: string;
};

export default function DeliverySummary({
  hasSmall,
  hasLarge,
  shippingFee,
  phone = "99655735",
  className = "",
}: Props) {
  return (
    <div className={`rounded-2xl border bg-white p-4 shadow-sm ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-zinc-900">Récap Livraison</p>
          <p className="mt-1 text-xs text-zinc-600">
            Les règles de livraison dépendent du gabarit des produits.
          </p>
        </div>
        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-800">
          Tunisie 🇹🇳
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {/* Petit gabarit */}
        <div className={`rounded-xl border p-3 ${hasSmall ? "" : "opacity-70"}`}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-zinc-900">Petit gabarit</p>
            <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
              ARAMEX_10DT
            </span>
          </div>

          <p className="mt-1 text-xs text-zinc-600">
            Livraison Aramex partout en Tunisie.
          </p>

          <div className="mt-2 flex items-center justify-between">
            <p className="text-xs text-zinc-600">Frais</p>

            {hasSmall ? (
              <p className="text-sm font-semibold text-zinc-900">
                {money(shippingFee)}
              </p>
            ) : (
              <p className="text-sm font-semibold text-zinc-600">
                Non applicable
              </p>
            )}
          </div>

          {!hasSmall && (
            <p className="mt-2 text-xs text-zinc-500">
              Aucun petit gabarit dans la commande.
            </p>
          )}
        </div>

        {/* Grand gabarit */}
        <div className={`rounded-xl border p-3 ${hasLarge ? "" : "opacity-70"}`}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-zinc-900">Grand gabarit</p>
            <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
              CALL_FOR_DELIVERY
            </span>
          </div>

          <p className="mt-1 text-xs text-zinc-600">
            Livraison à confirmer par téléphone (frais selon distance/volume).
          </p>

          {hasLarge ? (
            <div className="mt-2 rounded-lg bg-zinc-50 p-2 text-xs text-zinc-700">
              📞 Nous vous appelons pour confirmer la livraison :{" "}
              <span className="font-semibold">{phone}</span>
            </div>
          ) : (
            <p className="mt-2 text-xs text-zinc-500">
              Aucun grand gabarit dans la commande.
            </p>
          )}
        </div>
      </div>

      {/* Note mixte */}
      {hasSmall && hasLarge && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
          ✅ Commande mixte : <span className="font-semibold">Aramex</span> pour
          les petits gabarits + <span className="font-semibold">appel</span> pour
          les grands gabarits.
        </div>
      )}

      {/* Note “100% grand” */}
      {!hasSmall && hasLarge && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          ℹ️ Commande 100% grand gabarit : la livraison sera confirmée par téléphone.
        </div>
      )}
    </div>
  );
}
