// server/src/data/orders.store.ts
import crypto from "crypto";
import { OrderModel } from "../models/Order.mongo.js";

export type DeliveryPolicy = "ARAMEX_10DT" | "CALL_FOR_DELIVERY";

export const ORDER_STATUSES = [
  "CONFIRMED",
  "CONTACTING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type OrderItem = {
  id: string;
  title: string;
  price: number;
  quantity: number;
  deliveryPolicy?: DeliveryPolicy;
};

export type OrderCustomer = {
  name: string;
  phone: string;
  governorate?: string;
  city?: string;
  address: string;
  email?: string | null;
};

export type Order = {
  id: string;
  userId: string;
  customer: OrderCustomer;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  idempotencyKey?: string;

  deliveryProvider?: "ARAMEX" | null;
  deliveryNote?: string;
  noteAboutCallItems?: string | null;
};

function genOrderId() {
  const code = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `ALAMIN-${code}`;
}

export function computeDelivery(items: OrderItem[]) {
  const hasSmall = items.some((it) => it.deliveryPolicy === "ARAMEX_10DT");
  const hasLarge = items.some((it) => it.deliveryPolicy === "CALL_FOR_DELIVERY");

  const shippingFee = hasSmall ? 10 : 0;
  const deliveryProvider: "ARAMEX" | null = hasSmall ? "ARAMEX" : null;

  const deliveryNote = hasSmall
    ? "Les articles petits gabarits seront livrés via Aramex (10 DT). Nous vous appelons pour confirmer."
    : "Nous vous appelons pour organiser la livraison.";

  const noteAboutCallItems = hasLarge
    ? "Attention : les articles grands gabarits seront confirmés par appel et livrés séparément."
    : null;

  return { shippingFee, deliveryProvider, deliveryNote, noteAboutCallItems };
}

export async function createOrder(
  input: Omit<Order, "id" | "createdAt" | "updatedAt" | "status">
) {
  const id = genOrderId();

  const doc = await OrderModel.create({
    ...input,
    id,
    status: "CONFIRMED",
  });

  return toOrder(doc);
}

export async function listOrdersByUser(userId: string) {
  const docs = await OrderModel.find({ userId }).sort({ createdAt: -1 }).lean();
  return docs.map(toOrderLean);
}

export async function getOrderById(id: string) {
  const doc = await OrderModel.findOne({ id }).lean();
  return doc ? toOrderLean(doc) : null;
}

export async function listAllOrders() {
  const docs = await OrderModel.find({}).sort({ createdAt: -1 }).lean();
  return docs.map(toOrderLean);
}

export async function setOrderStatus(id: string, status: OrderStatus) {
  const doc = await OrderModel.findOneAndUpdate(
    { id },
    { $set: { status } },
    { new: true }
  ).lean();

  return doc ? toOrderLean(doc) : null;
}

export async function getOrderByIdempotency(userId: string, key: string) {
  const doc = await OrderModel.findOne({ userId, idempotencyKey: key }).lean();
  return doc ? toOrderLean(doc) : null;
}

// helpers
function toOrder(doc: any): Order {
  return {
    id: doc.id,
    userId: doc.userId,
    customer: doc.customer,
    items: doc.items,
    subtotal: doc.subtotal,
    shippingFee: doc.shippingFee,
    total: doc.total,
    status: doc.status,
    createdAt: new Date(doc.createdAt).toISOString(),
    updatedAt: new Date(doc.updatedAt).toISOString(),
    idempotencyKey: doc.idempotencyKey,
    deliveryProvider: doc.deliveryProvider ?? null,
    deliveryNote: doc.deliveryNote,
    noteAboutCallItems: doc.noteAboutCallItems ?? null,
  };
}
function toOrderLean(doc: any): Order {
  return toOrder(doc);
}
