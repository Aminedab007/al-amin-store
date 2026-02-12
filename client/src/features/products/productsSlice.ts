// src/features/products/productsSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import type { Category } from "../../data/categories";
import type { DeliveryPolicy } from "../../data/products";
import { fetchProducts, type ApiProduct } from "./productsApi";

export type SortKey = "RELEVANCE" | "PRICE_ASC" | "PRICE_DESC" | "TITLE_ASC" | "TITLE_DESC";
export type StockFilter = "ALL" | "IN_STOCK";
export type DeliveryFilter = "ALL" | DeliveryPolicy;

export type Product = {
  id: string;
  title: string;
  price: number;
  category: Category | string;
  image: string;
  isLarge?: boolean;
  deliveryPolicy?: DeliveryPolicy;
  stock: number;
};

type ProductsState = {
  items: Product[];
  selectedCategory: Category;
  search: string;

  sort: SortKey;
  stock: StockFilter;
  delivery: DeliveryFilter;
  minPrice: string;
  maxPrice: string;

  // ✅ load state
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

const initialState: ProductsState = {
  // ✅ IMPORTANT: plus de mock PRODUCTS ici
  items: [],
  selectedCategory: "Tous",
  search: "",

  sort: "RELEVANCE",
  stock: "ALL",
  delivery: "ALL",
  minPrice: "",
  maxPrice: "",

  status: "idle",
  error: null,
};

// ✅ thunk: charge depuis l'API
export const loadProducts = createAsyncThunk<Product[]>(
  "products/loadProducts",
  async (_, { rejectWithValue }) => {
    try {
      const apiItems = await fetchProducts();

      // ✅ Mapping strict: on garde l'ID API (p-tv-001, etc.)
      const mapped: Product[] = apiItems.map((p: ApiProduct) => ({
        id: p.id,
        title: p.title,
        price: p.price,
        category: p.category,
        image: p.image,
        isLarge: p.isLarge,
        stock: Number.isFinite(Number(p.stock)) ? Math.max(0, Math.floor(Number(p.stock))) : 0,
        deliveryPolicy: p.isLarge ? "CALL_FOR_DELIVERY" : "ARAMEX_10DT",
      }));

      return mapped;
    } catch (e: any) {
      return rejectWithValue(e?.message ?? "Impossible de charger les produits.");
    }
  }
);

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setCategory(state, action: PayloadAction<Category>) {
      state.selectedCategory = action.payload;
    },
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },

    setSort(state, action: PayloadAction<SortKey>) {
      state.sort = action.payload;
    },
    setStock(state, action: PayloadAction<StockFilter>) {
      state.stock = action.payload;
    },
    setDelivery(state, action: PayloadAction<DeliveryFilter>) {
      state.delivery = action.payload;
    },
    setMinPrice(state, action: PayloadAction<string>) {
      state.minPrice = action.payload;
    },
    setMaxPrice(state, action: PayloadAction<string>) {
      state.maxPrice = action.payload;
    },

    resetFilters(state) {
      state.sort = "RELEVANCE";
      state.stock = "ALL";
      state.delivery = "ALL";
      state.minPrice = "";
      state.maxPrice = "";
      state.search = "";
    },
  },
  extraReducers(builder) {
    builder
      .addCase(loadProducts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loadProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(loadProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) ?? "Erreur inconnue.";
      });
  },
});

export const {
  setCategory,
  setSearch,
  setSort,
  setStock,
  setDelivery,
  setMinPrice,
  setMaxPrice,
  resetFilters,
} = productsSlice.actions;

export default productsSlice.reducer;
