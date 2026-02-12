import type { CartItem } from "../features/cart/cartSlice";

export const ARAMEX_FEE = 10;

export function cartRequiresCall(items: CartItem[]) {
  return items.some((i) => i.deliveryPolicy === "CALL_FOR_DELIVERY");
}

export function getShippingFee(items: CartItem[]) {
  return cartRequiresCall(items) ? null : ARAMEX_FEE;
}
