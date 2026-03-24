import { useMemo, useState } from "react";
import { money } from "../../features/cart/cartSelectors";
import Toast from "../ui/Toast";

type DeliveryPolicy = "ARAMEX_10DT" | "CALL_ONLY" | "CALL_FOR_DELIVERY" | string;

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

const STORE_PHONE_DISPLAY = "99655735";
const STORE_WHATSAPP = "21699655735";
const LOGO_SRC = "/store-logo.png";

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
  return items.reduce((s, it) => {
    return s + (Number(it.price) || 0) * (Number(it.quantity) || 0);
  }, 0);
}

function deliveryBadge(policy?: string) {
  if (policy === "ARAMEX_10DT") {
    return {
      label: "Aramex",
      cls: "bg-emerald-100 text-emerald-800 border-emerald-200",
    };
  }

  if (policy === "CALL_ONLY" || policy === "CALL_FOR_DELIVERY") {
    return {
      label: "Appel",
      cls: "bg-amber-100 text-amber-900 border-amber-200",
    };
  }

  return {
    label: "—",
    cls: "bg-zinc-100 text-zinc-700 border-zinc-200",
  };
}

export default function OrderReceiptCard({
  order,
  variant = "full",
  showActions = true,
  className = "",
}: Props) {
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const items = Array.isArray(order.items) ? order.items : [];

  const itemsCount = useMemo(() => {
    return items.reduce((s, it) => s + (it.quantity || 0), 0);
  }, [items]);

  const itemsTotal = useMemo(() => calcItemsTotal(items), [items]);

  const subtotal =
    Number.isFinite(order.subtotal as number) ? Number(order.subtotal) : itemsTotal;

  const shippingFee =
    Number.isFinite(order.shippingFee as number) ? Number(order.shippingFee) : 0;

  const total =
    Number.isFinite(order.total as number) ? Number(order.total) : subtotal + shippingFee;

  const createdAt = formatDate(order.createdAt);
  const hasLarge = Boolean(order.delivery?.hasLarge);

  const providerLabel =
    order.delivery?.providerLabel ?? (hasLarge ? "Confirmation" : "Aramex + Confirmation");

  const whatsappText = encodeURIComponent(
    [
      "Bonjour AL AMIN STORE,",
      `Commande ID: ${order.id}`,
      `Total: ${money(total)}`,
      `Nom: ${order.customer?.name ?? ""}`,
      `Téléphone: ${order.customer?.phone ?? ""}`,
      "Merci.",
    ].join("\n")
  );

  const whatsappHref = `https://wa.me/${STORE_WHATSAPP}?text=${whatsappText}`;
  const compact = variant === "compact";

  const onCopyOrderId = async () => {
    try {
      await navigator.clipboard.writeText(order.id);
      setToastMsg("ID de commande copié ✅");
    } catch {
      setToastMsg("Impossible de copier automatiquement");
    }
  };

  const onPrint = () => window.print();

  return (
    <div
      className={[
        "relative rounded-3xl border border-zinc-200 bg-white shadow-sm",
        "print:border-none print:shadow-none",
        compact ? "p-4" : "p-6 sm:p-8",
        className,
      ].join(" ")}
    >
      {toastMsg ? (
        <div className="print:hidden">
          <Toast
            open={true}
            message={toastMsg}
            onClose={() => setToastMsg(null)}
          />
        </div>
      ) : null}

      <div className="mb-6 flex items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <img
            src={LOGO_SRC}
            alt="AL AMIN STORE"
            className="h-12 w-auto object-contain print:h-14"
          />

          <div>
            <p className="text-lg font-extrabold text-zinc-900">AL AMIN STORE</p>
            <p className="text-xs text-zinc-600">
              Reçu de commande • {createdAt} • {providerLabel}
            </p>
          </div>
        </div>

        <div className="text-right">
          <div
            className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold ${
              hasLarge ? "bg-amber-50 text-amber-900" : "bg-emerald-50 text-emerald-800"
            }`}
          >
            ✅ Commande confirmée
          </div>

          <p className="mt-2 text-sm font-extrabold text-zinc-900">{order.id}</p>
          <p className="text-xs text-zinc-600">{itemsCount} article(s)</p>
        </div>
      </div>

      <div className="divide-y divide-zinc-100">
        {items.map((it) => {
          const badge = deliveryBadge(it.deliveryPolicy);

          return (
            <div key={it.id} className="flex justify-between gap-3 py-3">
              <div>
                <p className="font-semibold text-zinc-900">{it.title}</p>

                <div className="mt-1 flex items-center gap-2">
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

      <div className="mt-4 space-y-2 border-t pt-4 text-sm">
        <div className="flex justify-between">
          <span>Sous-total</span>
          <span className="font-semibold">{money(subtotal)}</span>
        </div>

        <div className="flex justify-between">
          <span>Livraison</span>
          <span className="font-semibold">{money(shippingFee)}</span>
        </div>

        <div className="flex justify-between text-base">
          <span className="font-extrabold">Total</span>
          <span className="font-extrabold">{money(total)}</span>
        </div>
      </div>

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
            className="rounded-xl border px-4 py-2 text-sm font-extrabold"
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
        </div>
      ) : null}

      <div className="mt-6 border-t pt-4 text-xs text-zinc-500">
        📞 {STORE_PHONE_DISPLAY} • AL AMIN STORE • Merci pour votre confiance.
      </div>
    </div>
  );
}