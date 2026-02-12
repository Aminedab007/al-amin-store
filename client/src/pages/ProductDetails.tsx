// src/pages/ProductDetails.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import ImageGallery from "../components/product/ImageGallery";
import AddToCartBarMobile from "../components/product/AddToCartBarMobile";
import ProductInfo from "../components/product/ProductInfo";
import RelatedProducts from "../components/product/RelatedProducts";
import Badge from "../components/ui/Badge";

import { useAppDispatch, useAppSelector } from "../app/hooks";
import { addToCart } from "../features/cart/cartSlice";
import { money } from "../features/cart/cartSelectors";
import { stockUi } from "../utils/stockUi";
import { fetchProductById } from "../features/products/productsApi";

const STORE_PHONE = "99655735";
const STORE_PHONE_TN = "+21699655735";

type DeliveryPolicy = "ARAMEX_10DT" | "CALL_FOR_DELIVERY";

type ProductApi = {
  id: string;
  title: string;
  price: number;
  category: string;
  image: string;

  // ✅ source unique
  stock: number;

  // optionnels
  isLarge?: boolean;
  deliveryPolicy?: DeliveryPolicy;
  images?: string[];
  sku?: string;
  isBestSeller?: boolean;
  description?: string;
};

function ProductDetailsSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-3 pb-24 pt-4 md:px-6 md:pb-10">
      <div className="mb-3 h-4 w-1/2 animate-pulse rounded bg-zinc-100" />
      <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <div className="h-7 w-2/3 animate-pulse rounded bg-zinc-100 md:hidden" />
          <div className="aspect-square animate-pulse rounded-2xl bg-zinc-100" />
          <div className="h-64 animate-pulse rounded-2xl bg-zinc-100" />
        </div>
        <div className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="h-8 w-4/5 animate-pulse rounded bg-zinc-100" />
          <div className="h-8 w-1/3 animate-pulse rounded bg-zinc-100" />
          <div className="h-10 w-full animate-pulse rounded-xl bg-zinc-100" />
          <div className="h-10 w-full animate-pulse rounded-xl bg-zinc-100" />
          <div className="h-20 w-full animate-pulse rounded-xl bg-zinc-100" />
        </div>
      </div>
    </div>
  );
}

function getStockValue(p: ProductApi): number {
  const n = Number(p?.stock);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
}

export default function ProductDetails() {
  const { id } = useParams();
  const nav = useNavigate();
  const dispatch = useAppDispatch();

  // produits déjà chargés via Products page (utile pour related)
  const all = useAppSelector((s) => s.products.items);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<ProductApi | null>(null);

  useEffect(() => {
    let alive = true;

    async function run() {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        const p = await fetchProductById(id);
        if (!alive) return;
        setProduct(p as ProductApi);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? "Impossible de charger le produit.");
        setProduct(null);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, [id]);

  const normalized = useMemo(() => {
    if (!product) return null;

    const stock = getStockValue(product);
    const stockInfo = stockUi(stock); // ✅ messages pro (sans chiffres)
    const inStock = stock > 0;

    const deliveryPolicy: DeliveryPolicy =
      (product.deliveryPolicy as DeliveryPolicy | undefined) ??
      (product.isLarge ? "CALL_FOR_DELIVERY" : "ARAMEX_10DT");

    const images =
      Array.isArray(product.images) && product.images.length
        ? product.images
        : product.image
          ? [product.image]
          : ["/products/placeholder.webp"];

    return {
      ...product,
      stock,
      stockInfo,
      inStock,
      deliveryPolicy,
      images,
    };
  }, [product]);

  if (!id) return <ProductDetailsSkeleton />;
  if (loading) return <ProductDetailsSkeleton />;

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-3 py-16 md:px-6">
        <h1 className="text-xl font-semibold text-zinc-900">Erreur</h1>
        <p className="mt-2 text-sm text-zinc-600">{error}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => nav(0)}
            className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-extrabold text-white hover:bg-zinc-800"
          >
            Réessayer
          </button>

          <Link
            to="/products"
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-extrabold text-zinc-900 hover:bg-zinc-50"
          >
            Retour aux produits
          </Link>
        </div>
      </div>
    );
  }

  if (!normalized) {
    return (
      <div className="mx-auto max-w-6xl px-3 py-16 md:px-6">
        <h1 className="text-xl font-semibold text-zinc-900">Produit introuvable</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Le produit demandé n’existe pas.{" "}
          <Link to="/products" className="font-semibold text-zinc-900 underline">
            Retour aux produits
          </Link>
        </p>
      </div>
    );
  }

  const isCall = normalized.deliveryPolicy === "CALL_FOR_DELIVERY";

  const stockPill =
    normalized.stockInfo.tone === "success"
      ? "bg-emerald-100 text-emerald-700"
      : normalized.stockInfo.tone === "warning"
        ? "bg-amber-100 text-amber-800"
        : "bg-rose-100 text-rose-700";

    function handleAdd(qty = 1) {
    if (!normalized.inStock) return;

    dispatch(
      addToCart({
        id: normalized.id,
        title: normalized.title,
        price: normalized.price,
        deliveryPolicy: normalized.deliveryPolicy,
        image: normalized.image,
        stock: normalized.stock, // ✅ IMPORTANT
        quantity: qty,
      })
    );
  }

  function handleBuyNow() {
    handleAdd(1);
    nav("/checkout");
  }

  return (
    <div className="mx-auto max-w-6xl px-3 pb-24 pt-4 md:px-6 md:pb-10">
      {/* Breadcrumb */}
      <div className="mb-3 text-sm text-zinc-500">
        <Link to="/" className="hover:underline">
          Accueil
        </Link>{" "}
        /{" "}
        <Link to="/products" className="hover:underline">
          Produits
        </Link>{" "}
        / {normalized.category} / {normalized.title}
      </div>

      {/* Badges */}
      <div className="mb-4 flex flex-wrap gap-2">
        {normalized.isBestSeller ? <Badge>Best Seller</Badge> : null}

        <Badge tone={normalized.inStock ? "success" : "warning"}>
          {normalized.inStock ? "Disponible" : "Rupture"}
        </Badge>

        {/* ✅ Stock marketing (sans chiffres) */}
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold ${stockPill}`}>
          {normalized.stockInfo.text}
        </span>

        {normalized.deliveryPolicy === "ARAMEX_10DT" ? (
          <Badge tone="info">Livraison 10 DT</Badge>
        ) : (
          <Badge tone="warning">On vous appelle</Badge>
        )}

        {normalized.sku ? <Badge tone="info">SKU: {normalized.sku}</Badge> : null}
      </div>

      <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
        {/* LEFT */}
        <div className="space-y-4">
          <h1 className="text-xl font-semibold text-zinc-900 md:hidden">{normalized.title}</h1>
          <ImageGallery images={normalized.images} alt={normalized.title} />
          <ProductInfo product={normalized as any} />
        </div>

        {/* RIGHT */}
        <aside className="md:sticky md:top-4 md:self-start">
          <div className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4">
            <h1 className="hidden text-2xl font-semibold text-zinc-900 md:block">{normalized.title}</h1>

            <div className="text-2xl font-bold text-zinc-900">{money(normalized.price)}</div>

            {/* ✅ stock pro (sans chiffres) */}
            <div className="text-sm text-zinc-700">
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold ${stockPill}`}>
                {normalized.stockInfo.text}
              </span>
            </div>

            {/* Delivery */}
            {isCall ? (
              <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
                <b>Grand gabarit :</b> livraison à confirmer. <b>On vous appelle</b> après la commande.
              </div>
            ) : (
              <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">
                Livraison Aramex : <b>10 DT</b> (selon zone)
              </div>
            )}

            {/* CTA */}
            <button
              disabled={!normalized.inStock}
              onClick={() => handleAdd(1)}
              className={`w-full rounded-xl px-4 py-3 text-sm font-semibold transition active:scale-[0.99] ${
                normalized.inStock ? "bg-zinc-900 text-white hover:bg-zinc-800" : "cursor-not-allowed bg-zinc-200 text-zinc-500"
              }`}
            >
              {normalized.inStock ? "Ajouter au panier" : "Indisponible"}
            </button>

            {/* Appeler maintenant (CALL_FOR_DELIVERY) */}
            {isCall ? (
              <a
                href={`tel:${STORE_PHONE_TN}`}
                className="w-full inline-flex items-center justify-center rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-extrabold text-amber-900 hover:bg-amber-100 transition"
              >
                Appeler maintenant • {STORE_PHONE}
              </a>
            ) : null}

            <button
              type="button"
              disabled={!normalized.inStock}
              onClick={handleBuyNow}
              className={`w-full rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                normalized.inStock ? "border-zinc-200 text-zinc-900 hover:bg-zinc-50" : "cursor-not-allowed border-zinc-200 text-zinc-400"
              }`}
            >
              Acheter maintenant
            </button>

            <div className="text-xs text-zinc-500">
              Paiement à la livraison (selon zone) • Support WhatsApp • Qualité Garantie 
            </div>
          </div>
        </aside>
      </div>

      {/* Related products */}
      <div className="mt-10">
        <RelatedProducts product={normalized as any} all={all as any} />
      </div>

      {/* Mobile sticky add */}
      <AddToCartBarMobile product={normalized as any} />
    </div>
  );
}
