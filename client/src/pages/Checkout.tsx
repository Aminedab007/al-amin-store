// src/pages/Checkout.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { clearCart, applyStockSnapshot } from "../features/cart/cartSlice";
import { selectCartTotals, money } from "../features/cart/cartSelectors";
import DeliverySummary from "../components/checkout/DeliverySummary";
import { createOrder } from "../features/orders/ordersApi";
import { stockUi } from "../utils/stockUi";
import { loadProducts } from "../features/products/productsSlice";
import { fetchProducts } from "../features/products/productsApi";

const STORE_PHONE_TEL = "+21699655735";
const STORE_PHONE_DISPLAY = "99655735";

const GOVERNORATES = [
  "Ariana",
  "Béja",
  "Ben Arous",
  "Bizerte",
  "Gabès",
  "Gafsa",
  "Jendouba",
  "Kairouan",
  "Kasserine",
  "Kébili",
  "Le Kef",
  "Mahdia",
  "La Manouba",
  "Médenine",
  "Monastir",
  "Nabeul",
  "Sfax",
  "Sidi Bouzid",
  "Siliana",
  "Sousse",
  "Tataouine",
  "Tozeur",
  "Tunis",
  "Zaghouan",
] as const;

type Governorate = (typeof GOVERNORATES)[number];

function Field({
  label,
  children,
  hint,
  error,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  error?: string | null;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-zinc-800">{label}</label>
      {children}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {hint ? <p className="text-xs text-zinc-500">{hint}</p> : null}
    </div>
  );
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function getStockValue(p: any): number {
  const n = Number(p?.stock);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
}

function newIdempotencyKey() {
  return (globalThis.crypto as any)?.randomUUID?.() ?? `idem_${Date.now()}_${Math.random()}`;
}

export default function Checkout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const totals = useAppSelector(selectCartTotals);
  const cartItems = useMemo(() => totals.small.concat(totals.large), [totals.small, totals.large]);

  const user = useAppSelector((s) => s.auth.user);

  const products = useAppSelector((s) => s.products.items);
  const productsStatus = useAppSelector((s) => s.products.status);

  // ✅ ensure products loaded even if user opens /checkout directly
  useEffect(() => {
    if (productsStatus === "idle") dispatch(loadProducts());
  }, [dispatch, productsStatus]);

  const stockById = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of products as any[]) m.set(String(p.id), getStockValue(p));
    return m;
  }, [products]);

  // UI-only issues (from current store)
  const stockIssues = useMemo(() => {
    return cartItems
      .map((it) => {
        const available = stockById.get(String(it.id)) ?? 0;
        const status = stockUi(available);
        const outOfStock = available <= 0;
        const tooMany = available > 0 && it.quantity > available;

        return {
          id: it.id,
          title: it.title,
          statusText: status.text,
          outOfStock,
          tooMany,
        };
      })
      .filter((x) => x.outOfStock || x.tooMany);
  }, [cartItems, stockById]);

  const stockOk = stockIssues.length === 0;
  const productsLoading = productsStatus === "loading";

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-8">
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-2xl font-extrabold text-zinc-900">Checkout</h2>
          <p className="mt-2 text-zinc-600">Ton panier est vide.</p>
          <div className="mt-5">
            <Link
              to="/products"
              className="inline-flex justify-center rounded-xl bg-zinc-900 px-4 py-2 font-semibold text-white hover:bg-zinc-800 transition"
            >
              Voir les produits
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [governorate, setGovernorate] = useState<Governorate>("Tataouine");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ✅ Idempotency key stable for the current attempt
  const [orderAttemptKey, setOrderAttemptKey] = useState<string>(() => newIdempotencyKey());

  const nameRef = useRef<HTMLInputElement | null>(null);
  const phoneRef = useRef<HTMLInputElement | null>(null);
  const addressRef = useRef<HTMLTextAreaElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);

  const [prefilledOnce, setPrefilledOnce] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (prefilledOnce) return;

    const canFillName = name.trim().length === 0;
    const canFillEmail = email.trim().length === 0;

    if (canFillName) setName(user.name ?? "");
    if (canFillEmail) setEmail(user.email ?? "");

    if (canFillName || canFillEmail) setPrefilledOnce(true);
  }, [user, prefilledOnce, name, email]);

  const applyAccountInfo = () => {
    if (!user) return;
    setName(user.name ?? "");
    setEmail(user.email ?? "");
  };

  const nameOk = name.trim().length >= 2;
  const phoneOk = /^\d{8}$/.test(phone.trim());
  const addressOk = address.trim().length >= 5;

  const emailTrim = email.trim();
  const emailOk = emailTrim.length === 0 ? true : isValidEmail(emailTrim);

  const isValid = nameOk && phoneOk && addressOk && emailOk && stockOk;

  const focusFirstInvalid = () => {
    if (!nameOk) return nameRef.current?.focus();
    if (!phoneOk) return phoneRef.current?.focus();
    if (!addressOk) return addressRef.current?.focus();
    if (!emailOk) return emailRef.current?.focus();
  };

  const inputBase =
    "w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 outline-none transition focus:ring-2 focus:ring-zinc-200";

  // ✅ LIVE re-check stock before submit (source = API right now)
  async function recheckStockLive() {
    const fresh = await fetchProducts(); // GET /api/products
    const map = new Map<string, number>();
    for (const p of fresh as any[]) map.set(String(p.id), getStockValue(p));

    const issues = cartItems
      .map((it) => {
        const available = map.get(String(it.id)) ?? 0;
        const status = stockUi(available);
        const outOfStock = available <= 0;
        const tooMany = available > 0 && it.quantity > available;
        return {
          id: it.id,
          title: it.title,
          statusText: status.text,
          outOfStock,
          tooMany,
        };
      })
      .filter((x) => x.outOfStock || x.tooMany);

    return issues;
  }

  // ✅ helper: refresh stock snapshot + fix cart
  async function refreshStockAndFixCart(): Promise<Record<string, number>> {
    const fresh = await fetchProducts();
    const snapshot: Record<string, number> = {};
    for (const p of fresh as any[]) snapshot[String(p.id)] = getStockValue(p);

    // 🛒 auto-fix cart + resync fallback stock
    dispatch(applyStockSnapshot(snapshot));
    return snapshot;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    setSubmitError(null);

    if (!isValid) {
      focusFirstInvalid();
      return;
    }

    if (productsLoading) {
      setSubmitError("Chargement du stock en cours. Réessaie dans un instant.");
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // ✅ LIVE stock re-check right before creating order
      const liveIssues = await recheckStockLive();

      if (liveIssues.length > 0) {
        // ✅ resync stock + auto-fix panier (comme en 409)
        try {
          await refreshStockAndFixCart();
        } catch {
          // ignore
        }

        const top = liveIssues.slice(0, 3);
        const list = top.map((x) => `• ${x.title} — ${x.statusText}`).join("\n");
        setSubmitError(
          `Stock mis à jour. Ton panier a été ajusté automatiquement.\n${list}${
            liveIssues.length > 3 ? `\n• + ${liveIssues.length - 3} autre(s) article(s)` : ""
          }`
        );

        // ❗ new attempt key for next submit
        setOrderAttemptKey(newIdempotencyKey());

        setIsSubmitting(false);
        return;
      }

      const payloadItems = cartItems.map((it) => ({
        id: it.id,
        quantity: it.quantity,
      }));

      // ✅ Idempotency-Key sent to backend (same key for the attempt)
      const created = await createOrder(
        {
          customer: {
            name: name.trim(),
            phone: phone.trim(),
            governorate,
            address: address.trim(),
            email: emailTrim.length ? emailTrim : null,
            accountEmail: user?.email ?? null,
          },
          items: payloadItems,
        },
        orderAttemptKey
      );

      // ✅ IMPORTANT: backend is source of truth
      // We store only the ID, OrderSuccess will fetch /api/orders/:id/receipt
      localStorage.setItem("lastOrderId", created.id);
      localStorage.setItem("lastOrderCreatedAt", created.createdAt);

      dispatch(clearCart());

      // ✅ prepare next attempt key (clean)
      setOrderAttemptKey(newIdempotencyKey());

      navigate("/order-success");
    } catch (err: any) {
      // ✅ backend stays source of truth
      if (err?.status === 409 && err?.code === "OUT_OF_STOCK") {
        try {
          await refreshStockAndFixCart();
        } catch {
          // ignore refresh error, still show message
        }

        setSubmitError(
          "Le stock a été mis à jour. Ton panier a été ajusté automatiquement. Merci de vérifier avant de payer."
        );

        // ❗ new attempt key for next submit
        setOrderAttemptKey(newIdempotencyKey());

        setIsSubmitting(false);
        return;
      }

      setSubmitError(err?.message ?? "Erreur lors de la validation de la commande.");

      // ❗ new attempt key for next submit
      setOrderAttemptKey(newIdempotencyKey());

      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Paiement</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Remplis tes informations — on confirme par téléphone si des grands gabarits sont présents.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-5 shadow-sm"
        >
          <DeliverySummary
            hasSmall={totals.hasSmall}
            hasLarge={totals.hasLarge}
            shippingFee={totals.shippingFee}
            phone={STORE_PHONE_DISPLAY}
          />

          {!stockOk ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
              <p className="font-extrabold">Ajustement nécessaire</p>
              <p className="mt-1">Certains articles ne sont plus disponibles aux quantités sélectionnées.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  to="/cart"
                  className="inline-flex rounded-xl bg-zinc-900 px-4 py-2 text-xs font-extrabold text-white hover:bg-zinc-800 transition"
                >
                  Retour au panier
                </Link>
              </div>
            </div>
          ) : null}

          {submitError ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900 whitespace-pre-line">
              <p className="font-extrabold">Impossible de valider la commande</p>
              <p className="mt-1">{submitError}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  to="/cart"
                  className="inline-flex rounded-xl bg-zinc-900 px-4 py-2 text-xs font-extrabold text-white hover:bg-zinc-800 transition"
                >
                  Retour au panier
                </Link>
                <Link
                  to="/products"
                  className="inline-flex rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-extrabold text-zinc-900 hover:bg-zinc-50 transition"
                >
                  Voir les produits
                </Link>
              </div>
            </div>
          ) : null}

          {user ? (
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-semibold text-zinc-900">Connecté</p>
                  <p className="text-xs text-zinc-600 truncate">
                    {user.name} • {user.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={applyAccountInfo}
                  className="inline-flex justify-center rounded-xl bg-zinc-900 px-4 py-2 text-xs font-extrabold text-white hover:bg-zinc-800 transition"
                >
                  Utiliser mes infos
                </button>
              </div>
            </div>
          ) : null}

          {totals.hasLarge ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <p className="font-semibold">Info grand gabarit</p>
              <p className="mt-1">
                Des articles grand gabarit sont inclus. Nous te contactons pour confirmer la livraison, ou appelle :{" "}
                <a href={`tel:${STORE_PHONE_TEL}`} className="font-semibold underline">
                  {STORE_PHONE_DISPLAY}
                </a>
              </p>
            </div>
          ) : null}

          <Field label="Nom" hint="Ex: Amine Dab" error={touched && !nameOk ? "Nom trop court (min 2 caractères)." : null}>
            <input
              ref={nameRef}
              className={`${inputBase} ${touched && !nameOk ? "border-red-300 focus:ring-red-200" : ""}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Votre nom"
              autoComplete="name"
            />
          </Field>

          <Field
            label="Téléphone (8 chiffres)"
            hint="Chiffres uniquement (Tunisie)"
            error={touched && !phoneOk ? "Téléphone invalide (8 chiffres)." : null}
          >
            <input
              ref={phoneRef}
              className={`${inputBase} ${touched && !phoneOk ? "border-red-300 focus:ring-red-200" : ""}`}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 8))}
              placeholder="Ex: 22123456"
              inputMode="numeric"
              autoComplete="tel"
            />
          </Field>

          <Field label="Gouvernorat" hint="Choisis ton gouvernorat pour la livraison.">
            <select
              className={inputBase}
              value={governorate}
              onChange={(e) => setGovernorate(e.target.value as Governorate)}
              autoComplete="address-level1"
            >
              {GOVERNORATES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="Adresse"
            hint="Rue, quartier, repère..."
            error={touched && !addressOk ? "Adresse trop courte (min 5 caractères)." : null}
          >
            <textarea
              ref={addressRef}
              className={`${inputBase} ${touched && !addressOk ? "border-red-300 focus:ring-red-200" : ""}`}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Adresse complète"
              rows={3}
              autoComplete="street-address"
            />
          </Field>

          <Field label="Email (optionnel)" hint="Si tu laisses vide, la commande reste valide." error={touched && !emailOk ? "Email invalide." : null}>
            <input
              ref={emailRef}
              className={`${inputBase} ${touched && !emailOk ? "border-red-300 focus:ring-red-200" : ""}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemple@gmail.com"
              inputMode="email"
              autoComplete="email"
            />
          </Field>

          <button
            type="submit"
            onClick={() => setTouched(true)}
            className="w-full rounded-xl bg-zinc-900 px-4 py-2 font-semibold text-white hover:bg-zinc-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!isValid || isSubmitting || productsLoading}
          >
            {isSubmitting ? "Validation..." : productsLoading ? "Chargement..." : "Valider la commande"}
          </button>

          <Link
            to="/cart"
            className="w-full inline-flex justify-center rounded-xl border border-zinc-200 bg-white px-4 py-2 font-semibold text-zinc-900 hover:bg-zinc-50 transition"
          >
            Retour au panier
          </Link>

          {/* Dev note (optional): show current attempt key */}
          {/* <div className="text-[11px] text-zinc-400 break-all">Idem: {orderAttemptKey}</div> */}
        </form>

        {/* Summary */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-4 shadow-sm lg:sticky lg:top-24 h-fit">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-xl font-extrabold text-zinc-900">Résumé</h3>
              <p className="mt-1 text-sm text-zinc-600">Tous les articles (petit + grand gabarit).</p>
            </div>
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-800">
              {totals.count} article(s)
            </span>
          </div>

          <div className="space-y-3">
            {cartItems.map((it) => {
              const available = stockById.get(String(it.id)) ?? 0;
              const s = stockUi(available);
              const pill =
                s.tone === "success"
                  ? "bg-emerald-100 text-emerald-700"
                  : s.tone === "warning"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-rose-100 text-rose-700";

              return (
                <div key={it.id} className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-zinc-900 truncate">{it.title}</p>
                    <p className="text-xs text-zinc-600">
                      {money(it.price)} × {it.quantity} • {it.deliveryPolicy === "ARAMEX_10DT" ? "Aramex" : "Appel"}
                    </p>
                    <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-extrabold ${pill}`}>
                      {s.text}
                    </span>
                  </div>
                  <p className="font-semibold text-zinc-900">{money(it.price * it.quantity)}</p>
                </div>
              );
            })}
          </div>

          <div className="border-t pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-600">Sous-total (petits)</span>
              <span className="font-semibold">{money(totals.subtotalSmall)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600">Sous-total (grands)</span>
              <span className="font-semibold">{money(totals.subtotalLarge)}</span>
            </div>

            <div className="my-2 border-t" />

            <div className="flex justify-between">
              <span className="text-zinc-600">Sous-total</span>
              <span className="font-semibold">{money(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600">Frais de livraison</span>
              <span className="font-semibold">{money(totals.shippingFee)}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="font-semibold text-zinc-900">Total</span>
              <span className="font-extrabold text-zinc-900">{money(totals.total)}</span>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700">
            <p className="font-semibold">Besoin d’aide ?</p>
            <p className="mt-1">
              Appelle-nous :{" "}
              <a href={`tel:${STORE_PHONE_TEL}`} className="font-semibold underline">
                {STORE_PHONE_DISPLAY}
              </a>
            </p>
          </div>

          <p className="text-xs text-zinc-500">
            En validant, tu acceptes d’être contacté par téléphone si la commande contient des produits grand gabarit.
          </p>
        </div>
      </div>
    </div>
  );
}
