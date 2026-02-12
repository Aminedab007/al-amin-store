// src/components/orders/OrderReceiptCard.tsx
import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { money } from "../../features/cart/cartSelectors";
import Toast from "../ui/Toast";

type DeliveryPolicy = "ARAMEX_10DT" | "CALL_ONLY" | string;

export type OrderItem = {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image?: string | null;
  deliveryPolicy?: DeliveryPolicy;
};

export type Order = {
  id: string;
  createdAt?: string;
  customer: {
    name: string;
    phone: string;
    governorate?: string;
    address?: string;
    email?: string | null;
  };
  items: OrderItem[];
  subtotal?: number;
  shippingFee?: number;
  total: number;
  delivery?: {
    providerLabel?: string;
    note?: string;
    hasLarge?: boolean;
  };
};

type Props = {
  order: Order;
  variant?: "full" | "compact";
  showActions?: boolean;
  className?: string;
  onSetAsLastOrder?: (order: Order) => void;
};

const STORE_PHONE_TEL = "+21699655735";
const STORE_PHONE_DISPLAY = "99655735";
const STORE_WHATSAPP = "21699655735";
const LOGO_SRC = "/store-logo.png"; // public/logo.png

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

function calcItemsTotal(items: OrderItem[]) {
  return items.reduce(
    (s, it) => s + (Number(it.price) || 0) * (Number(it.quantity) || 0),
    0
  );
}

function deliveryBadge(policy?: string) {
  if (policy === "ARAMEX_10DT") {
    return {
      label: "Aramex",
      cls: "bg-emerald-100 text-emerald-800 border-emerald-200",
    };
  }
  if (policy === "CALL_ONLY") {
    return {
      label: "Appel",
      cls: "bg-amber-100 text-amber-900 border-amber-200",
    };
  }
  return { label: "—", cls: "bg-zinc-100 text-zinc-700 border-zinc-200" };
}

export default function OrderReceiptCard({
  order,
  variant = "full",
  showActions = true,
  className = "",
  onSetAsLastOrder,
}: Props) {
  const location = useLocation();

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastVariant, setToastVariant] =
    useState<"success" | "warning">("success");

  const items = Array.isArray(order.items) ? order.items : [];

  const itemsCount = useMemo(
    () => items.reduce((s, it) => s + (it.quantity || 0), 0),
    [items]
  );

  const itemsTotal = useMemo(() => calcItemsTotal(items), [items]);

  const subtotal =
    Number.isFinite(order.subtotal as number) ? order.subtotal! : itemsTotal;

  const shippingFee =
    Number.isFinite(order.shippingFee as number) ? order.shippingFee! : 0;

  const total =
    Number.isFinite(order.total as number)
      ? order.total
      : subtotal + shippingFee;

  const createdAt = formatDate(order.createdAt);
  const hasLarge = Boolean(order.delivery?.hasLarge);

  const providerLabel =
    order.delivery?.providerLabel ??
    (hasLarge ? "Confirmation" : "Aramex + Confirmation");

  const deliveryNote =
    order.delivery?.note ??
    (hasLarge
      ? "Commande grand gabarit : livraison à confirmer par téléphone."
      : "Petits gabarits : Aramex 10 DT. Grands gabarits : livraison à confirmer par téléphone.");

  const whatsappText = encodeURIComponent(
    [
      `Bonjour AL AMIN STORE,`,
      `Commande ID: ${order.id}`,
      `Total: ${money(total)}`,
      `Nom: ${order.customer?.name ?? ""}`,
      `Téléphone: ${order.customer?.phone ?? ""}`,
      `Gouvernorat: ${order.customer?.governorate ?? ""}`,
      `Adresse: ${order.customer?.address ?? ""}`,
      `Merci.`,
    ].join("\n")
  );

  const whatsappHref = `https://wa.me/${STORE_WHATSAPP}?text=${whatsappText}`;

  const isOnOrderSuccess = location.pathname === "/order-success";
  const compact = variant === "compact";

  const onCopyOrderId = async () => {
    try {
      await navigator.clipboard.writeText(order.id);
      setToastVariant("success");
      setToastMsg("ID de commande copié ✅");
    } catch {
      setToastVariant("warning");
      setToastMsg("Impossible de copier automatiquement");
    }
  };

  const onPrint = () => window.print();

  const customerName = order.customer?.name ?? "—";
  const customerPhone = order.customer?.phone ?? "—";
  const customerEmail = order.customer?.email ?? null;
  const customerGovernorate = order.customer?.governorate ?? "—";
  const customerAddress = order.customer?.address ?? "—";

  return (
    <div
      className={[
        "relative rounded-3xl border border-zinc-200 bg-white shadow-sm",
        "print:border-none print:shadow-none",
        compact ? "p-4" : "p-6 sm:p-8",
        className,
      ].join(" ")}
    >
      {/* Toast (non imprimé) */}
      {toastMsg ? (
        <div className="print:hidden">
          <Toast
            message={toastMsg}
            variant={toastVariant}
            mode="card"
            onClose={() => setToastMsg(null)}
          />
        </div>
      ) : null}

      {/* Header logo + meta */}
      <div className="mb-6 flex items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={LOGO_SRC}
            alt="AL AMIN STORE"
            className="h-12 w-auto object-contain print:h-14"
          />
          <div className="min-w-0">
            <p className="text-lg font-extrabold text-zinc-900">AL AMIN STORE</p>
            <p className="text-xs text-zinc-600 truncate">
              Reçu de commande • {createdAt} • {providerLabel}
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div
            className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold ${
              hasLarge
                ? "bg-amber-50 text-amber-900"
                : "bg-emerald-50 text-emerald-800"
            }`}
          >
            ✅ Commande confirmée
          </div>
          <p className="mt-2 text-sm font-extrabold text-zinc-900 break-all print:text-base">
            {order.id}
          </p>
          <p className="text-xs text-zinc-600">{itemsCount} article(s)</p>
        </div>
      </div>

      {/* ✅ INFOS CLIENT + LIVRAISON (nouveau) */}
      {!compact ? (
        <div className="mb-6 grid gap-4 lg:grid-cols-2">
          {/* Client */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <h3 className="text-sm font-extrabold text-zinc-900">Client</h3>

            <div className="mt-3 space-y-2 text-sm text-zinc-700">
              <p>
                <span className="font-semibold">Nom :</span> {customerName}
              </p>
              <p>
                <span className="font-semibold">Téléphone :</span> {customerPhone}
              </p>

              {customerEmail ? (
                <p className="break-all">
                  <span className="font-semibold">Email :</span> {customerEmail}
                </p>
              ) : null}
            </div>

            <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
              <p className="text-xs font-extrabold text-zinc-900">
                Adresse de livraison
              </p>
              <p className="mt-1 text-xs text-zinc-600">
                Gouvernorat :{" "}
                <span className="font-semibold text-zinc-900">
                  {customerGovernorate}
                </span>
              </p>
              <p className="mt-1 text-sm text-zinc-700">{customerAddress}</p>
            </div>
          </div>

          {/* Livraison / Support */}
          <div
            className={[
              "rounded-2xl border p-4 text-sm",
              hasLarge
                ? "border-amber-200 bg-amber-50 text-amber-900"
                : "border-emerald-200 bg-emerald-50 text-emerald-900",
            ].join(" ")}
          >
            <h3 className="text-sm font-extrabold">Livraison</h3>
            <p className="mt-2">{deliveryNote}</p>

            <div className="mt-4 rounded-xl border border-white/60 bg-white/50 p-3 text-sm">
              <p className="font-extrabold">Contact magasin</p>
              <p className="mt-1">
                📞{" "}
                <a
                  href={`tel:${STORE_PHONE_TEL}`}
                  className="font-extrabold underline"
                >
                  {STORE_PHONE_DISPLAY}
                </a>
              </p>
              <p className="mt-1">💬 WhatsApp disponible</p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Articles */}
      <div className="divide-y divide-zinc-100">
        {items.map((it) => {
          const badge = deliveryBadge(it.deliveryPolicy);
          return (
            <div key={it.id} className="py-3 flex justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-zinc-900 truncate">{it.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-extrabold ${badge.cls}`}
                  >
                    {badge.label}
                  </span>
                  <span className="text-xs text-zinc-600">
                    {money(it.price)} × {it.quantity}
                  </span>
                </div>
              </div>
              <p className="font-extrabold text-zinc-900">
                {money(it.price * it.quantity)}
              </p>
            </div>
          );
        })}
      </div>

      {/* Totaux */}
      <div className="mt-4 border-t pt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-zinc-700">Sous-total</span>
          <span className="font-semibold">{money(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-700">Livraison</span>
          <span className="font-semibold">{money(shippingFee)}</span>
        </div>
        <div className="flex justify-between text-base">
          <span className="font-extrabold">Total</span>
          <span className="font-extrabold">{money(total)}</span>
        </div>
      </div>

      {/* Actions */}
      {showActions ? (
        <div className="mt-4 grid gap-2 print:hidden">
          <button
            type="button"
            onClick={onCopyOrderId}
            className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-extrabold text-white hover:bg-zinc-800"
          >
            📋 Copier l’ID
          </button>

          <button
            type="button"
            onClick={onPrint}
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-extrabold text-zinc-900 hover:bg-zinc-50"
          >
            🖨️ Imprimer
          </button>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl bg-emerald-600 px-4 py-2 text-center text-sm font-extrabold text-white hover:bg-emerald-700"
          >
            WhatsApp
          </a>

          {hasLarge ? (
            <a
              href={`tel:${STORE_PHONE_TEL}`}
              className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm font-extrabold text-amber-900 hover:bg-amber-100"
            >
              📞 Appeler {STORE_PHONE_DISPLAY}
            </a>
          ) : null}

          {!isOnOrderSuccess ? (
            onSetAsLastOrder ? (
              <button
                type="button"
                onClick={() => onSetAsLastOrder(order)}
                className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-extrabold text-zinc-900 hover:bg-zinc-100"
              >
                Voir le reçu
              </button>
            ) : (
              <Link
                to="/order-success"
                className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-center text-sm font-extrabold text-zinc-900 hover:bg-zinc-100"
              >
                Voir le reçu
              </Link>
            )
          ) : null}
        </div>
      ) : null}

      {/* Footer */}
      <div className="mt-6 border-t pt-4 text-xs text-zinc-500">
        📞 {STORE_PHONE_DISPLAY} • AL AMIN STORE • Merci pour votre confiance.
      </div>
    </div>
  );
}
