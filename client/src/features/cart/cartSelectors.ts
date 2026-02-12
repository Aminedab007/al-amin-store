// src/features/cart/cartSelectors.ts
import type { RootState } from "../../app/store";
import type { CartItem } from "./cartSlice";
import type { DeliveryPolicy } from "../../data/products";

export const selectCartItems = (state: RootState) => state.cart.items;

/**
 * ✅ Format DT propre (2 décimales max), safe.
 */
export const money = (n: number) => {
  const x = Number.isFinite(n) ? n : 0;
  const rounded = Math.round(x * 100) / 100;

  // évite 1.5 -> "1.5" (on veut "1.50" visuellement)
  const formatted = rounded.toFixed(2).replace(/\.00$/, "").replace(/(\.\d)$/, "$10");

  return `${formatted} DT`;
};

export const splitByDelivery = (items: CartItem[]) => {
  const small: CartItem[] = [];
  const large: CartItem[] = [];

  for (const it of items) {
    if (it.deliveryPolicy === "ARAMEX_10DT") small.push(it);
    else large.push(it);
  }

  return { small, large };
};

export const lineTotal = (it: { price: number; quantity: number }) => it.price * it.quantity;

export const subtotalOf = (items: CartItem[]) => items.reduce((sum, it) => sum + lineTotal(it), 0);

export const hasDelivery = (items: CartItem[], policy: DeliveryPolicy) =>
  items.some((i) => i.deliveryPolicy === policy);

export const computeShippingFeeOptionA = (items: CartItem[]) => {
  // ✅ Option A: 10 DT seulement s’il y a AU MOINS 1 petit gabarit
  return hasDelivery(items, "ARAMEX_10DT") ? 10 : 0;
};

export const computeCartTotals = (items: CartItem[]) => {
  const { small, large } = splitByDelivery(items);

  const subtotalSmall = subtotalOf(small);
  const subtotalLarge = subtotalOf(large);
  const subtotal = subtotalSmall + subtotalLarge;

  const shippingFee = computeShippingFeeOptionA(items);
  const total = subtotal + shippingFee;

  const count = items.reduce((s, i) => s + i.quantity, 0);

  return {
    count,
    subtotalSmall,
    subtotalLarge,
    subtotal,
    shippingFee,
    total,
    hasSmall: small.length > 0,
    hasLarge: large.length > 0,
    small,
    large,
  };
};

export const selectCartTotals = (state: RootState) => {
  const items = selectCartItems(state);
  return computeCartTotals(items);
};
