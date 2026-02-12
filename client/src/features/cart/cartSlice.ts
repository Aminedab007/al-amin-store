// src/features/cart/cartSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { DeliveryPolicy } from "../../data/products";

export type CartItem = {
  id: string;
  title: string;
  price: number;
  quantity: number;
  deliveryPolicy: DeliveryPolicy;
  image: string; // ✅ IMPORTANT
  stock: number; // ✅ fallback stock côté panier (anti-spam reducer)
};

type CartState = {
  items: CartItem[];
};

const PLACEHOLDER = "/products/placeholder.webp";

const clampStock = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
};

const loadCart = (): CartItem[] => {
  try {
    const raw = localStorage.getItem("cart");
    const data = raw ? (JSON.parse(raw) as any[]) : [];
    if (!Array.isArray(data)) return [];

    // ✅ migration sécurité (anciens paniers sans image/stock)
    return data.map((i) => ({
      id: String(i?.id ?? ""),
      title: String(i?.title ?? ""),
      price: Number(i?.price ?? 0),
      quantity: Math.max(1, Math.floor(Number(i?.quantity ?? 1))),
      deliveryPolicy: (i?.deliveryPolicy as DeliveryPolicy) ?? "ARAMEX_10DT",
      image: i?.image || PLACEHOLDER,
      stock: clampStock(i?.stock),
    }));
  } catch {
    return [];
  }
};

const saveCart = (items: CartItem[]) => {
  localStorage.setItem("cart", JSON.stringify(items));
};

const initialState: CartState = {
  items: loadCart(),
};

type AddPayload = {
  id: string;
  title: string;
  price: number;
  deliveryPolicy: DeliveryPolicy;
  image?: string;
  stock: number; // ✅ obligatoire
  quantity?: number;
};

type IncPayload = { id: string; stock?: number }; // ✅ stock optionnel (mais recommandé)

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<AddPayload>) {
      const qty = Math.max(1, Math.floor(Number(action.payload.quantity ?? 1)));
      const payloadStock = clampStock(action.payload.stock);

      // ✅ si stock inconnu/0 => refuse (safe)
      if (payloadStock <= 0) {
        saveCart(state.items);
        return;
      }

      const item = state.items.find((i) => i.id === action.payload.id);

      if (item) {
        // ✅ refresh fallback stock
        item.stock = payloadStock;

        // ✅ clamp hard au stock
        item.quantity = Math.min(payloadStock, item.quantity + qty);

        // image fallback
        if (!item.image && action.payload.image) item.image = action.payload.image;
      } else {
        state.items.push({
          id: action.payload.id,
          title: action.payload.title,
          price: action.payload.price,
          deliveryPolicy: action.payload.deliveryPolicy,
          image: action.payload.image || PLACEHOLDER,
          stock: payloadStock,
          quantity: Math.min(payloadStock, qty),
        });
      }

      saveCart(state.items);
    },

    removeFromCart(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.id !== action.payload);
      saveCart(state.items);
    },

    removeMany(state, action: PayloadAction<string[]>) {
      const toRemove = new Set(action.payload);
      state.items = state.items.filter((i) => !toRemove.has(i.id));
      saveCart(state.items);
    },

    increment(state, action: PayloadAction<string | IncPayload>) {
      const payload = typeof action.payload === "string" ? { id: action.payload } : action.payload;

      const item = state.items.find((i) => i.id === payload.id);
      if (!item) return;

      // ✅ si on reçoit stock depuis l’UI (recommandé), on resync
      if (payload.stock !== undefined) {
        const s = clampStock(payload.stock);
        if (s > 0) item.stock = s;
      }

      const maxAllowed = clampStock(item.stock);
      if (maxAllowed <= 0) {
        saveCart(state.items);
        return;
      }

      if (item.quantity < maxAllowed) item.quantity += 1;

      saveCart(state.items);
    },

    decrement(state, action: PayloadAction<string>) {
      const item = state.items.find((i) => i.id === action.payload);
      if (item && item.quantity > 1) item.quantity -= 1;
      saveCart(state.items);
    },

    clearCart(state) {
      state.items = [];
      saveCart(state.items);
    },

    // ✅ C1: snapshot stock -> resync + auto-fix panier
    // payload: { [productId]: stockNumber }
    applyStockSnapshot(state, action: PayloadAction<Record<string, number>>) {
      const snap = action.payload;

      state.items = state.items
        .map((it) => {
          const next = snap[it.id];
          if (next === undefined) return it;

          const s = clampStock(next);

          // clamp qty
          const q = Math.min(it.quantity, s);

          return {
            ...it,
            stock: s,
            quantity: q,
          };
        })
        // remove stock=0 or qty=0
        .filter((it) => it.stock > 0 && it.quantity > 0);

      saveCart(state.items);
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  removeMany,
  increment,
  decrement,
  clearCart,
  applyStockSnapshot, // ✅ IMPORTANT
} = cartSlice.actions;

export default cartSlice.reducer;
