// src/app/store.ts
import {
  configureStore,
  createListenerMiddleware,
  isAnyOf,
} from "@reduxjs/toolkit";

import cartReducer, {
  addToCart,
  increment,
  applyStockSnapshot,
} from "../features/cart/cartSlice";
import productsReducer from "../features/products/productsSlice";
import authReducer from "../features/auth/authSlice";

import uiReducer, { showToast } from "../features/ui/uiSlice";

// ✅ listener: déclenche toasts UX selon actions panier
const listener = createListenerMiddleware();

listener.startListening({
  matcher: isAnyOf(addToCart, increment, applyStockSnapshot),
  effect: async (action, api) => {
    // ✅ typage safe sans RootState (défini plus bas)
    const state = api.getState() as any;

    // 1) increment: stock max atteint
    if (increment.match(action)) {
      const payload =
        typeof action.payload === "string"
          ? { id: action.payload }
          : action.payload;

      const it = state.cart.items.find((x: any) => x.id === payload.id);

      if (it && it.stock > 0 && it.quantity >= it.stock) {
        api.dispatch(
          showToast({
            tone: "warning",
            message: "Quantité maximale atteinte (stock).",
          })
        );
      }
      return;
    }

    // 2) applyStockSnapshot: panier ajusté automatiquement
    if (applyStockSnapshot.match(action)) {
      api.dispatch(
        showToast({
          tone: "info",
          message: "Stock mis à jour — panier ajusté automatiquement.",
        })
      );
      return;
    }

    // 3) addToCart: succès / refus (rupture)
    if (addToCart.match(action)) {
      const id = action.payload.id;
      const exists = state.cart.items.some((x: any) => x.id === id);

      if (!exists) {
        api.dispatch(
          showToast({
            tone: "danger",
            message: "Produit indisponible (rupture de stock).",
          })
        );
      } else {
        api.dispatch(
          showToast({
            tone: "success",
            message: "Ajouté au panier.",
          })
        );
      }
      return;
    }
  },
});

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    products: productsReducer,
    auth: authReducer,
    ui: uiReducer,
  },
  middleware: (getDefault) => getDefault().prepend(listener.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
