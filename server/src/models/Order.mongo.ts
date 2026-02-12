// server/src/models/Order.mongo.ts
import mongoose, { Schema } from "mongoose";

export type DeliveryPolicy = "ARAMEX_10DT" | "CALL_FOR_DELIVERY";
export type OrderStatus = "CONFIRMED" | "CONTACTING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

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

export type OrderDoc = {
  id: string; // ALAMIN-XXXX
  userId: string; // session userId
  customer: OrderCustomer;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  idempotencyKey?: string;

  deliveryProvider?: "ARAMEX" | null;
  deliveryNote?: string;
  noteAboutCallItems?: string | null;
};

const ItemSchema = new Schema<OrderItem>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    deliveryPolicy: { type: String, required: false },
  },
  { _id: false }
);

const CustomerSchema = new Schema<OrderCustomer>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    governorate: { type: String, required: false },
    city: { type: String, required: false },
    address: { type: String, required: true },
    email: { type: String, required: false },
  },
  { _id: false }
);

const OrderSchema = new Schema<OrderDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },

    customer: { type: CustomerSchema, required: true },
    items: { type: [ItemSchema], required: true },

    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, required: true },
    total: { type: Number, required: true },

    status: { type: String, required: true, index: true },
    idempotencyKey: { type: String, required: false, index: true },

    deliveryProvider: { type: String, required: false },
    deliveryNote: { type: String, required: false },
    noteAboutCallItems: { type: String, required: false },
  },
  { timestamps: true }
);

// ✅ Idempotency unique per userId + idempotencyKey (si key existe)
OrderSchema.index(
  { userId: 1, idempotencyKey: 1 },
  { unique: true, partialFilterExpression: { idempotencyKey: { $exists: true, $type: "string" } } }
);

export const OrderModel = mongoose.models.Order || mongoose.model<OrderDoc>("Order", OrderSchema);
