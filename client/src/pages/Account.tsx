// src/pages/Account.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { logoutThunk } from "../features/auth/authSlice";
import OrderReceiptCard from "../components/orders/OrderReceiptCard";
import type { Order } from "../components/orders/OrderReceiptCard";
import { money } from "../features/cart/cartSelectors";
import { fetchMyOrders, fetchOrderReceipt } from "../features/orders/ordersApi";

function formatDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("fr-TN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getLastOrderId(): string | null {
  try {
    const raw = localStorage.getItem("lastOrderId");
    const id = raw ? raw.trim() : "";
    return id.length ? id : null;
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
    subtotal: Number(totals?.subtotal ?? 0),
    shippingFee: Number(totals?.shippingFee ?? shipping?.fee ?? 0),
    total: Number(totals?.total ?? 0),
    delivery: {
      providerLabel: shipping?.provider ? String(shipping.provider) : undefined,
      note: shipping?.note ? String(shipping.note) : undefined,
      hasLarge: items.some((it: any) => String(it.deliveryPolicy) !== "ARAMEX_10DT"),
    },
  };
}

export default function Account() {
  const dispatch = useAppDispatch();
  const nav = useNavigate();

  const user = useAppSelector((s) => s.auth.user);

  const [ordersStatus, setOrdersStatus] = useState<"idle" | "loading" | "succeeded" | "failed">(
    "idle"
  );
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);

  const [lastStatus, setLastStatus] = useState<"idle" | "loading" | "succeeded" | "failed">("idle");
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);

  const lastOrderId = useMemo(() => getLastOrderId(), []);

  // ✅ Load history from backend
  const loadOrders = async () => {
    setOrdersStatus("loading");
    setOrdersError(null);
    try {
      const items = await fetchMyOrders(); // { ok, items } ou items
      const list = Array.isArray((items as any)?.items) ? (items as any).items : (items as any);
      setOrders(Array.isArray(list) ? list : []);
      setOrdersStatus("succeeded");
    } catch (e: any) {
      setOrdersStatus("failed");
      setOrdersError(e?.message ?? "Impossible de charger l’historique.");
    }
  };

  // ✅ Load last receipt (optional)
  const loadLastReceipt = async () => {
    if (!lastOrderId) {
      setLastOrder(null);
      return;
    }
    setLastStatus("loading");
    setLastError(null);

    try {
      const data = await fetchOrderReceipt(lastOrderId); // doit renvoyer receipt ou {receipt}
      const receipt = (data as any)?.receipt ?? data;
      const mapped = receiptToOrder(receipt);
      setLastOrder(mapped);
      setLastStatus("succeeded");
    } catch (e: any) {
      setLastStatus("failed");
      setLastError(e?.message ?? "Impossible de charger le reçu.");
    }
  };

  useEffect(() => {
    if (!user) return;
    void loadOrders();
    void loadLastReceipt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const onLogout = async () => {
    try {
      await dispatch(logoutThunk()).unwrap();
    } catch {
      // ignore
    } finally {
      nav("/", { replace: true });
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6">
          <h1 className="text-2xl font-extrabold text-zinc-900">Mon compte</h1>
          <p className="mt-2 text-sm text-zinc-600">Tu n’es pas connecté.</p>
          <div className="mt-4 flex gap-2">
            <Link to="/login" className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-extrabold text-white">
              Connexion
            </Link>
            <Link to="/register" className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-extrabold text-zinc-900">
              Créer un compte
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-zinc-900">Mon compte</h1>
            <p className="mt-1 text-sm text-zinc-600">
              {user.name} • {user.email}
            </p>
          </div>

          <button
            onClick={onLogout}
            className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-extrabold text-white hover:bg-rose-700"
          >
            Déconnexion
          </button>
        </div>
      </div>

      {/* Dernière commande */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-zinc-900">Dernière commande</h2>
            <p className="mt-1 text-sm text-zinc-600">
              {lastOrderId ? `ID: ${lastOrderId}` : "Aucune commande récente."}
            </p>
          </div>

          {lastOrderId ? (
            <Link
              to="/order-success"
              className="inline-flex justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-extrabold text-white hover:bg-zinc-800"
            >
              Voir le reçu
            </Link>
          ) : (
            <Link
              to="/products"
              className="inline-flex justify-center rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-extrabold text-zinc-900 hover:bg-zinc-50"
            >
              Voir les produits
            </Link>
          )}
        </div>

        {lastOrderId ? (
          <div className="mt-4">
            {lastStatus === "loading" ? (
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
                Chargement du reçu…
              </div>
            ) : lastStatus === "failed" ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
                {lastError ?? "Impossible de charger le reçu."}
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={loadLastReceipt}
                    className="rounded-xl bg-zinc-900 px-4 py-2 text-xs font-extrabold text-white hover:bg-zinc-800"
                  >
                    Réessayer
                  </button>
                </div>
              </div>
            ) : lastOrder ? (
              <OrderReceiptCard order={lastOrder} variant="compact" showActions={false} className="bg-zinc-50" />
            ) : (
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
                Aucun reçu disponible.
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Historique */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-zinc-900">Historique</h2>
            <p className="mt-1 text-sm text-zinc-600">
              {ordersStatus === "succeeded" ? `${orders.length} commande(s)` : "—"}
            </p>
          </div>

          <button
            type="button"
            onClick={loadOrders}
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-extrabold text-zinc-900 hover:bg-zinc-50"
          >
            Rafraîchir
          </button>
        </div>

        {ordersStatus === "loading" ? (
          <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 text-sm text-zinc-600">
            Chargement de l’historique…
          </div>
        ) : ordersStatus === "failed" ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-900">
            {ordersError ?? "Erreur lors du chargement."}
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 text-center">
            <div className="text-3xl">🧾</div>
            <h3 className="mt-2 text-lg font-extrabold text-zinc-900">Aucune commande</h3>
            <p className="mt-1 text-sm text-zinc-600">Fais ta première commande et elle apparaîtra ici.</p>
            <Link
              to="/products"
              className="mt-4 inline-flex rounded-xl bg-zinc-900 px-4 py-2 text-sm font-extrabold text-white hover:bg-zinc-800"
            >
              Continuer les achats
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-3">
            {orders.map((o: any) => {
              const id = String(o?.id ?? o?._id ?? "");
              const total = Number(o?.total ?? 0);
              return (
                <div key={id} className="rounded-2xl border border-zinc-200 bg-white p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="text-sm font-extrabold text-zinc-900">{id}</div>
                      <div className="text-xs text-zinc-600">{formatDate(o?.createdAt)}</div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-sm font-extrabold text-zinc-900">{money(total)}</div>
                      <Link
                        to="/order-success"
                        className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-extrabold text-zinc-900 hover:bg-zinc-100"
                        onClick={() => {
                          // ✅ on définit l'id de reçu à afficher
                          localStorage.setItem("lastOrderId", id);
                        }}
                      >
                        Voir reçu
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
