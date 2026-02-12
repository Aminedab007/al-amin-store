// src/pages/OrderSuccess.tsx
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useAppSelector } from "../app/hooks";
import OrderReceiptCard from "../components/orders/OrderReceiptCard";
import type { Order } from "../components/orders/OrderReceiptCard";
import { fetchOrderReceipt } from "../features/orders/ordersApi";

function getLastOrderId(): string | null {
  try {
    const id = localStorage.getItem("lastOrderId");
    if (!id) return null;
    const s = id.trim();
    return s.length ? s : null;
  } catch {
    return null;
  }
}

// ✅ Backend receipt -> OrderReceiptCard Order
function receiptToOrder(receipt: any): Order {
  const lines = Array.isArray(receipt?.lines) ? receipt.lines : [];
  const totals = receipt?.totals ?? {};
  const shipping = receipt?.shipping ?? {};

  const items = lines.map((l: any) => ({
    id: String(l.id ?? ""),
    title: String(l.title ?? ""),
    price: Number(l.unitPrice ?? l.price ?? 0),
    quantity: Number(l.quantity ?? 0),
    deliveryPolicy: l.deliveryPolicy,
  }));

  const subtotal = Number(totals?.subtotal ?? 0);
  const shippingFee = Number(totals?.shippingFee ?? shipping?.fee ?? 0);
  const total = Number(totals?.total ?? subtotal + shippingFee);

  return {
    id: String(receipt?.id ?? ""),
    createdAt: receipt?.createdAt,
    customer: {
      name: receipt?.customer?.name ?? "—",
      phone: receipt?.customer?.phone ?? "—",
      governorate: receipt?.customer?.governorate,
      address: receipt?.customer?.address,
      email: receipt?.customer?.email ?? null,
    },
    items,
    subtotal,
    shippingFee,
    total,
    delivery: {
      providerLabel: shipping?.provider ? String(shipping.provider) : undefined,
      note: shipping?.note ? String(shipping.note) : undefined,
      hasLarge: items.some((it) => String(it.deliveryPolicy) !== "ARAMEX_10DT"),
    },
  };
}

export default function OrderSuccess() {
  const user = useAppSelector((s) => s.auth.user);

  const lastOrderId = useMemo(() => getLastOrderId(), []);
  const [status, setStatus] = useState<"idle" | "loading" | "succeeded" | "failed">("idle");
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);

  const load = async () => {
    if (!lastOrderId) return;
    setStatus("loading");
    setError(null);

    try {
      const data = await fetchOrderReceipt(lastOrderId);

      // ✅ TON backend renvoie: { ok:true, receipt: {...} }
      // mais on supporte aussi data direct au cas où
      const receipt = (data as any)?.receipt ?? (data as any)?.order ?? data;

      if (!receipt?.id) {
        throw new Error("Reçu invalide (id manquant).");
      }

      const mapped = receiptToOrder(receipt);
      setOrder(mapped);
      setStatus("succeeded");
    } catch (e: any) {
      setStatus("failed");
      setError(e?.message ?? "Impossible de charger le reçu.");
    }
  };

  useEffect(() => {
    if (!lastOrderId) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastOrderId]);

  // ✅ Aucun ID => page ouverte directement
  if (!lastOrderId) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 text-center">
          <h1 className="text-2xl font-extrabold text-zinc-900">Aucune commande trouvée</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Il semble que cette page ait été ouverte directement (ou que l’ID soit manquant).
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {user ? (
              <Link
                to="/account"
                className="inline-flex justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
              >
                Mon compte
              </Link>
            ) : null}
            <Link
              to="/products"
              className="inline-flex justify-center rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
            >
              Voir les produits
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Loading
  if (status === "loading" || status === "idle") {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 space-y-6">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6">
          <h1 className="text-2xl font-extrabold text-zinc-900">Reçu de commande</h1>
          <p className="mt-2 text-sm text-zinc-600">Chargement du reçu…</p>
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white p-6">
          <div className="h-4 w-48 rounded bg-zinc-100" />
          <div className="mt-4 h-3 w-full rounded bg-zinc-100" />
          <div className="mt-2 h-3 w-5/6 rounded bg-zinc-100" />
          <div className="mt-2 h-3 w-2/3 rounded bg-zinc-100" />
        </div>
      </div>
    );
  }

  // ✅ Error
  if (status === "failed") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8">
          <h1 className="text-2xl font-extrabold text-rose-900">Impossible de charger le reçu</h1>
          <p className="mt-2 text-sm text-rose-900">{error ?? "Erreur inconnue."}</p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={load}
              className="inline-flex justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-extrabold text-white hover:bg-zinc-800"
            >
              Réessayer
            </button>

            <Link
              to="/products"
              className="inline-flex justify-center rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-extrabold text-zinc-900 hover:bg-zinc-50"
            >
              Voir les produits
            </Link>

            {user ? (
              <Link
                to="/account"
                className="inline-flex justify-center rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-extrabold text-zinc-900 hover:bg-zinc-50"
              >
                Mon compte
              </Link>
            ) : null}
          </div>

          <p className="mt-4 text-xs text-rose-900/80">
            ID: <span className="font-mono">{lastOrderId}</span>
          </p>
        </div>
      </div>
    );
  }

  // ✅ Success
  if (!order) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 text-center">
          <h1 className="text-2xl font-extrabold text-zinc-900">Reçu indisponible</h1>
          <p className="mt-2 text-sm text-zinc-600">Le reçu n’a pas pu être construit.</p>
          <div className="mt-6 flex justify-center">
            <Link
              to="/products"
              className="inline-flex justify-center rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
            >
              Voir les produits
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 space-y-6">
      <div className="print:hidden">
        <div className="rounded-3xl border border-zinc-200 bg-white p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-zinc-900">Reçu de commande</h1>
              <p className="mt-1 text-sm text-zinc-600">
                Tout est prêt ✅ Tu peux imprimer ou envoyer l’ID au support.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              {user ? (
                <Link
                  to="/account"
                  className="inline-flex justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-extrabold text-white hover:bg-zinc-800"
                >
                  Mon compte
                </Link>
              ) : null}
              <Link
                to="/products"
                className="inline-flex justify-center rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-extrabold text-zinc-900 hover:bg-zinc-50"
              >
                Continuer les achats
              </Link>
            </div>
          </div>
        </div>
      </div>

      <OrderReceiptCard order={order} variant="full" showActions />
    </div>
  );
}
