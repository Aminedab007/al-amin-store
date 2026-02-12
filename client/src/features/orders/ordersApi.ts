// src/features/orders/ordersApi.ts
import { apiGet, apiPost } from "../../lib/api";

export type CreateOrderBody = {
  customer: {
    name: string;
    phone: string;
    governorate?: string;
    address: string;
    email?: string | null;
    accountEmail?: string | null;
  };
  items: { id: string; quantity: number }[];
};

export type CreateOrderResponse = {
  id: string;
  createdAt: string;
};

export async function createOrder(body: CreateOrderBody, idempotencyKey: string) {
  return apiPost<CreateOrderResponse, CreateOrderBody>("/api/orders", body, {
    headers: { "Idempotency-Key": idempotencyKey },
  });
}

export async function fetchMyOrders() {
  return apiGet<any[]>("/api/orders/me");
}

export async function fetchOrderReceipt(orderId: string) {
  return apiGet<any>(`/api/orders/${encodeURIComponent(orderId)}/receipt`);
}
