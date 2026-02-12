// src/pages/Products.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { CATEGORIES, type Category } from "../data/categories";
import {
  loadProducts,
  setCategory,
  setSearch,
  setSort,
  setStock,
  setDelivery,
  setMinPrice,
  setMaxPrice,
  resetFilters,
  type SortKey,
  type StockFilter,
  type DeliveryFilter,
} from "../features/products/productsSlice";
import { addToCart } from "../features/cart/cartSlice";
import Drawer from "../components/ui/Drawer";
import ProductCardSkeleton from "../components/ui/ProductCardSkeleton";
import SmartImage from "../components/ui/SmartImage";
import { stockUi } from "../utils/stockUi";

const STORE_PHONE_TEL = "+21699655735";
const STORE_PHONE_DISPLAY = "99655735";

const P = {
  category: "category",
  q: "q",
  sort: "sort",
  stock: "stock",
  delivery: "delivery",
  min: "min",
  max: "max",
} as const;

function isValidCategory(cat: string | null): cat is Category {
  if (!cat) return false;
  return (CATEGORIES as readonly string[]).includes(cat);
}
function isValidSort(v: string | null): v is SortKey {
  return v === "RELEVANCE" || v === "PRICE_ASC" || v === "PRICE_DESC" || v === "TITLE_ASC" || v === "TITLE_DESC";
}
function isValidStock(v: string | null): v is StockFilter {
  return v === "ALL" || v === "IN_STOCK";
}
function isValidDelivery(v: string | null): v is DeliveryFilter {
  return v === "ALL" || v === "ARAMEX_10DT" || v === "CALL_FOR_DELIVERY";
}

function parsePriceInput(v: string): number | null {
  const s = String(v ?? "").trim();
  if (s.length === 0) return null;
  const x = Number(s.replace(",", "."));
  if (!Number.isFinite(x)) return null;
  if (x < 0) return 0;
  return x;
}
function normalizePrice(v: string) {
  return v.replace(/[^\d.,]/g, "");
}

function sortLabel(sort: SortKey) {
  switch (sort) {
    case "PRICE_ASC":
      return "Prix ↑";
    case "PRICE_DESC":
      return "Prix ↓";
    case "TITLE_ASC":
      return "A → Z";
    case "TITLE_DESC":
      return "Z → A";
    case "RELEVANCE":
    default:
      return "Pertinence";
  }
}
function deliveryLabel(d: DeliveryFilter) {
  switch (d) {
    case "ARAMEX_10DT":
      return "Aramex 10 DT";
    case "CALL_FOR_DELIVERY":
      return "Appel (grand gabarit)";
    case "ALL":
    default:
      return "Toutes";
  }
}

type FiltersVariant = "drawer" | "desktop";

function getStockValue(p: any): number {
  const n = Number(p?.stock);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
}

export default function Products() {
  const dispatch = useAppDispatch();
  const { items, selectedCategory, search, sort, stock, delivery, minPrice, maxPrice, status, error } =
    useAppSelector((s) => s.products);

  const [params, setParams] = useSearchParams();
  const [openFilters, setOpenFilters] = useState(false);

  useEffect(() => {
    if (status === "idle") dispatch(loadProducts());
  }, [dispatch, status]);

  const handleRefresh = () => {
    dispatch(loadProducts());
  };

  const setParam = (key: string, value: string, defaultValue: string) => {
    const next = new URLSearchParams(params);
    const v = value.trim();
    if (v.length === 0 || v === defaultValue) next.delete(key);
    else next.set(key, v);
    setParams(next, { replace: true });
  };

  const clearParams = (keys: string[]) => {
    const next = new URLSearchParams(params);
    keys.forEach((k) => next.delete(k));
    setParams(next, { replace: true });
  };

  // Sync URL -> Redux
  useEffect(() => {
    const urlCat = params.get(P.category);
    const urlQ = params.get(P.q);
    const urlSort = params.get(P.sort);
    const urlStock = params.get(P.stock);
    const urlDelivery = params.get(P.delivery);
    const urlMin = params.get(P.min);
    const urlMax = params.get(P.max);

    if (isValidCategory(urlCat) && selectedCategory !== urlCat) dispatch(setCategory(urlCat));
    if (typeof urlQ === "string" && search !== urlQ) dispatch(setSearch(urlQ));
    if (urlQ === null && search !== "") dispatch(setSearch(""));

    if (isValidSort(urlSort) && sort !== urlSort) dispatch(setSort(urlSort));
    if (urlSort === null && sort !== "RELEVANCE") dispatch(setSort("RELEVANCE"));

    if (isValidStock(urlStock) && stock !== urlStock) dispatch(setStock(urlStock));
    if (urlStock === null && stock !== "ALL") dispatch(setStock("ALL"));

    if (isValidDelivery(urlDelivery) && delivery !== urlDelivery) dispatch(setDelivery(urlDelivery));
    if (urlDelivery === null && delivery !== "ALL") dispatch(setDelivery("ALL"));

    if (typeof urlMin === "string" && minPrice !== urlMin) dispatch(setMinPrice(urlMin));
    if (urlMin === null && minPrice !== "") dispatch(setMinPrice(""));

    if (typeof urlMax === "string" && maxPrice !== urlMax) dispatch(setMaxPrice(urlMax));
    if (urlMax === null && maxPrice !== "") dispatch(setMaxPrice(""));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const onCategory = (cat: Category) => {
    dispatch(setCategory(cat));
    setParam(P.category, cat, "Tous");
  };
  const onQ = (v: string) => {
    dispatch(setSearch(v));
    setParam(P.q, v, "");
  };
  const onSort = (v: SortKey) => {
    dispatch(setSort(v));
    setParam(P.sort, v, "RELEVANCE");
  };
  const onStock = (v: StockFilter) => {
    dispatch(setStock(v));
    setParam(P.stock, v, "ALL");
  };
  const onDelivery = (v: DeliveryFilter) => {
    dispatch(setDelivery(v));
    setParam(P.delivery, v, "ALL");
  };
  const onMin = (v: string) => {
    const nv = normalizePrice(v);
    dispatch(setMinPrice(nv));
    setParam(P.min, nv, "");
  };
  const onMax = (v: string) => {
    const nv = normalizePrice(v);
    dispatch(setMaxPrice(nv));
    setParam(P.max, nv, "");
  };

  const clearAllFiltersButCategory = () => {
    dispatch(resetFilters());
    clearParams([P.q, P.sort, P.stock, P.delivery, P.min, P.max]);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const min = parsePriceInput(minPrice);
    const max = parsePriceInput(maxPrice);

    let list = items.filter((p: any) => {
      const stockN = getStockValue(p);
      const inStockDerived = stockN > 0;

      const matchCategory = selectedCategory === "Tous" ? true : p.category === selectedCategory;
      const matchSearch = q.length === 0 ? true : String(p.title ?? "").toLowerCase().includes(q);

      const matchStock = stock === "ALL" ? true : inStockDerived;
      const matchDelivery = delivery === "ALL" ? true : p.deliveryPolicy === delivery;

      const priceN = Number(p.price ?? 0);
      const matchMin = min === null ? true : priceN >= min;
      const matchMax = max === null ? true : priceN <= max;

      return matchCategory && matchSearch && matchStock && matchDelivery && matchMin && matchMax;
    });

    switch (sort) {
      case "PRICE_ASC":
        list = [...list].sort((a: any, b: any) => Number(a.price ?? 0) - Number(b.price ?? 0));
        break;
      case "PRICE_DESC":
        list = [...list].sort((a: any, b: any) => Number(b.price ?? 0) - Number(a.price ?? 0));
        break;
      case "TITLE_ASC":
        list = [...list].sort((a: any, b: any) => String(a.title ?? "").localeCompare(String(b.title ?? ""), "fr"));
        break;
      case "TITLE_DESC":
        list = [...list].sort((a: any, b: any) => String(b.title ?? "").localeCompare(String(a.title ?? ""), "fr"));
        break;
      default:
        break;
    }

    return list;
  }, [items, selectedCategory, search, sort, stock, delivery, minPrice, maxPrice]);

  const chips = useMemo(() => {
    const out: { key: string; label: string; onClear: () => void }[] = [];
    if (selectedCategory !== "Tous") out.push({ key: "cat", label: `Catégorie: ${selectedCategory}`, onClear: () => onCategory("Tous") });
    if (search.trim()) out.push({ key: "q", label: `Recherche: ${search.trim()}`, onClear: () => onQ("") });
    if (sort !== "RELEVANCE") out.push({ key: "sort", label: `Tri: ${sortLabel(sort)}`, onClear: () => onSort("RELEVANCE") });
    if (stock !== "ALL") out.push({ key: "stock", label: "Disponible", onClear: () => onStock("ALL") });
    if (delivery !== "ALL") out.push({ key: "delivery", label: `Livraison: ${deliveryLabel(delivery)}`, onClear: () => onDelivery("ALL") });
    if (minPrice.trim()) out.push({ key: "min", label: `Prix min: ${minPrice.trim()} DT`, onClear: () => onMin("") });
    if (maxPrice.trim()) out.push({ key: "max", label: `Prix max: ${maxPrice.trim()} DT`, onClear: () => onMax("") });
    return out;
  }, [selectedCategory, search, sort, stock, delivery, minPrice, maxPrice]);

  const onAdd = (p: any) => {
    const stockN = getStockValue(p);
    if (stockN <= 0) return;

    dispatch(
      addToCart({
        id: p.id,
        title: p.title,
        price: p.price,
        deliveryPolicy: p.deliveryPolicy,
        image: p.image,
        stock: stockN,
        quantity: 1,
      })
    );
  };

  const FiltersForm = ({ variant }: { variant: FiltersVariant }) => {
    const selectBase =
      "w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-300";
    const inputBase =
      "w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 pr-10 text-sm outline-none focus:ring-2 focus:ring-zinc-300";
    const gridClass = variant === "desktop" ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-6" : "grid gap-3";

    return (
      <div className="space-y-3">
        <div className={gridClass}>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700">Trier</label>
            <select value={sort} onChange={(e) => onSort(e.target.value as SortKey)} className={selectBase}>
              <option value="RELEVANCE">Pertinence</option>
              <option value="PRICE_ASC">Prix ↑</option>
              <option value="PRICE_DESC">Prix ↓</option>
              <option value="TITLE_ASC">A → Z</option>
              <option value="TITLE_DESC">Z → A</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700">Disponibilité</label>
            <select value={stock} onChange={(e) => onStock(e.target.value as StockFilter)} className={selectBase}>
              <option value="ALL">Tous</option>
              <option value="IN_STOCK">Disponible</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700">Livraison</label>
            <select value={delivery} onChange={(e) => onDelivery(e.target.value as DeliveryFilter)} className={selectBase}>
              <option value="ALL">Toutes</option>
              <option value="ARAMEX_10DT">Aramex 10 DT</option>
              <option value="CALL_FOR_DELIVERY">Appel (grand gabarit)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700">Prix min</label>
            <div className="relative">
              <input value={minPrice} onChange={(e) => onMin(e.target.value)} placeholder="ex: 100" inputMode="decimal" className={inputBase} />
              {minPrice.trim() && (
                <button
                  type="button"
                  onClick={() => onMin("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-lg border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700">Prix max</label>
            <div className="relative">
              <input value={maxPrice} onChange={(e) => onMax(e.target.value)} placeholder="ex: 2000" inputMode="decimal" className={inputBase} />
              {maxPrice.trim() && (
                <button
                  type="button"
                  onClick={() => onMax("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-lg border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 opacity-0 select-none">Reset</label>
            <button
              type="button"
              onClick={clearAllFiltersButCategory}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 transition"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>
    );
  };

  const isLoading = status === "loading";
  const isError = status === "failed";

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-zinc-900">Produits</h1>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={isLoading}
              className={`rounded-xl border px-3 py-1.5 text-xs font-extrabold transition ${
                isLoading ? "cursor-not-allowed bg-zinc-100 text-zinc-400" : "bg-white text-zinc-900 hover:bg-zinc-50"
              }`}
              title="Actualiser le stock"
            >
              {isLoading ? "Mise à jour..." : "Actualiser"}
            </button>
          </div>

          <p className="text-sm text-zinc-600">{filtered.length} résultat(s)</p>
        </div>

        <input
          value={search}
          onChange={(e) => onQ(e.target.value)}
          placeholder="Rechercher un produit..."
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-300 md:w-96"
        />
      </div>

      {isError ? (
        <div className="rounded-3xl border border-zinc-200 bg-white p-6">
          <h3 className="text-lg font-extrabold text-zinc-900">Erreur de chargement</h3>
          <p className="mt-1 text-sm text-zinc-600">{error ?? "Impossible de charger les produits."}</p>
          <button onClick={handleRefresh} className="mt-4 inline-flex rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800">
            Réessayer
          </button>
        </div>
      ) : null}

      {/* Categories */}
      <div className="relative">
        <div className="pointer-events-none absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-zinc-50 to-transparent md:hidden" />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-zinc-50 to-transparent md:hidden" />

        <div className="flex gap-2 overflow-x-auto whitespace-nowrap pb-1 -mx-1 px-1 md:flex-wrap md:overflow-visible md:whitespace-normal">
          {CATEGORIES.map((cat) => {
            const active = cat === selectedCategory;
            return (
              <button
                key={cat}
                onClick={() => onCategory(cat as Category)}
                className={`shrink-0 rounded-xl px-3 py-2 text-sm transition ${active ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-800 hover:bg-zinc-200"}`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile filters */}
      <div className="flex gap-2 md:hidden">
        <button
          type="button"
          onClick={() => setOpenFilters(true)}
          className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 transition"
        >
          Filtres & Tri{chips.length > 0 ? ` (${chips.length})` : ""}
        </button>

        {chips.length > 0 ? (
          <button
            type="button"
            onClick={clearAllFiltersButCategory}
            className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 transition"
          >
            Reset
          </button>
        ) : null}
      </div>

      <Drawer open={openFilters} onClose={() => setOpenFilters(false)} title="Filtres & Tri">
        <FiltersForm variant="drawer" />
      </Drawer>

      {chips.length > 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-zinc-800">Filtres actifs :</span>
            {chips.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={c.onClear}
                className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-sm text-zinc-800 hover:bg-zinc-100 transition"
              >
                <span className="truncate max-w-[220px]">{c.label}</span>
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white border border-zinc-200 text-zinc-600">
                  ✕
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="hidden md:block rounded-2xl border border-zinc-200 bg-white p-4">
        <FiltersForm variant="desktop" />
      </div>

      {/* GRID */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 text-center">
          <div className="text-3xl">🔎</div>
          <h3 className="mt-2 text-lg font-extrabold text-zinc-900">Aucun résultat</h3>
          <p className="mt-1 text-sm text-zinc-600">Essaie de changer la recherche ou de réinitialiser les filtres.</p>
          <button onClick={clearAllFiltersButCategory} className="mt-4 inline-flex rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800">
            Réinitialiser
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p: any) => {
            const stockN = getStockValue(p);
            const inStock = stockN > 0;
            const s = stockUi(stockN);

            const pill =
              s.tone === "success"
                ? "bg-emerald-100 text-emerald-700"
                : s.tone === "warning"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-rose-100 text-rose-700";

            return (
              <Link
                key={p.id}
                to={`/products/${p.id}`}
                className="relative block rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm hover:shadow-md transition"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm text-zinc-500">{p.category}</div>
                    <div className="text-base font-semibold text-zinc-900 truncate">{p.title}</div>

                    <div className="mt-2 text-xs text-zinc-600">
                      {p.deliveryPolicy === "CALL_FOR_DELIVERY"
                        ? `Livraison: Appel obligatoire — ${STORE_PHONE_DISPLAY}`
                        : "Livraison: Aramex 10 DT (toute la Tunisie)"}
                    </div>
                  </div>

                  <span className={`rounded-full px-2 py-1 text-xs font-extrabold ${pill}`}>{s.text}</span>
                </div>

                <div className="mb-4 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 aspect-[4/3]">
                  <SmartImage
                    src={p.image || "/products/placeholder.webp"}
                    alt={p.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>

                <div className="mb-4 text-xl font-bold text-zinc-900">{p.price} DT</div>

                <button
                  disabled={!inStock}
                  onClick={(e) => {
                    e.preventDefault();
                    if (!inStock) return;
                    onAdd(p);
                  }}
                  className={`w-full rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    inStock ? "bg-zinc-900 text-white hover:bg-zinc-800" : "cursor-not-allowed bg-zinc-200 text-zinc-500"
                  }`}
                >
                  {inStock ? "Ajouter au panier" : "Indisponible"}
                </button>

                {p.deliveryPolicy === "CALL_FOR_DELIVERY" ? (
                  <a
                    href={`tel:${STORE_PHONE_TEL}`}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-2 inline-flex w-full justify-center rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-100 transition"
                  >
                    Appeler {STORE_PHONE_DISPLAY}
                  </a>
                ) : null}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
