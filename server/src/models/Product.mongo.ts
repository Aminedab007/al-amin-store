// server/src/models/Product.mongo.ts
import mongoose, { Schema } from "mongoose";

export type DeliveryPolicy = "ARAMEX_10DT" | "CALL_FOR_DELIVERY";

export type ProductDoc = {
  pid: string; // ex: "p-tv-001" (id fonctionnel côté API)
  title: string;
  price: number;
  stock: number;
  isLarge: boolean;
  category?: string;
  brand?: string;
  image?: string;
  description?: string;
};

const ProductSchema = new Schema<ProductDoc>(
  {
    pid: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true, min: 0 },
    isLarge: { type: Boolean, required: true },

    category: { type: String, required: false },
    brand: { type: String, required: false },
    image: { type: String, required: false },
    description: { type: String, required: false },
  },
  { timestamps: true }
);

export const ProductModel =
  mongoose.models.Product || mongoose.model<ProductDoc>("Product", ProductSchema);

export function policyFromIsLarge(isLarge: boolean): DeliveryPolicy {
  return isLarge ? "CALL_FOR_DELIVERY" : "ARAMEX_10DT";
}
