// src/features/products/productsApi.ts
import { apiGet } from "../../lib/api";

export type ApiProduct = {
  id?: string;
  _id?: string;
  title: string;
  price: number;
  category: string;
  image: string;
  isLarge?: boolean;
  stock?: number;
};

export async function fetchProducts() {
  return apiGet<ApiProduct[]>("/api/products");
}

export async function fetchProductById(id: string) {
  return apiGet<ApiProduct>(`/api/products/${encodeURIComponent(id)}`);
}
