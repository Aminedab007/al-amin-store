// server/src/data/products.store.ts
import { ProductModel, policyFromIsLarge } from "../models/Product.mongo.js";
import type { DeliveryPolicy } from "../models/Product.mongo.js";

export type Product = {
  id: string; // pid
  title: string;
  price: number;
  stock: number;
  isLarge: boolean;
  deliveryPolicy: DeliveryPolicy;
  category?: string;
  brand?: string;
  image?: string;
  description?: string;
};

function toApiProduct(doc: any): Product {
  return {
    id: doc.pid,
    title: doc.title,
    price: doc.price,
    stock: doc.stock,
    isLarge: doc.isLarge,
    deliveryPolicy: policyFromIsLarge(doc.isLarge),
    category: doc.category,
    brand: doc.brand,
    image: doc.image,
    description: doc.description,
  };
}

export async function listProducts(): Promise<Product[]> {
  const docs = await ProductModel.find({}).sort({ createdAt: -1 }).lean();
  return docs.map(toApiProduct);
}

export async function getProductById(id: string): Promise<Product | null> {
  const doc = await ProductModel.findOne({ pid: id }).lean();
  return doc ? toApiProduct(doc) : null;
}

export type StockFailure = {
  productId: string;
  title: string;
  requested: number;
  available: number;
};

/**
 * ✅ Décrément stock atomique (par produit) via filtre stock >= qty
 * Pour plusieurs items:
 * - tente toutes les updates
 * - si une échoue, rollback celles déjà décrémentées
 *
 * (En prod idéal: transactions replica set. Ici: safe rollback)
 */
export async function tryDecrementMany(items: { id: string; quantity: number }[]) {
  // basic validate + normalize
  const normalized = items.map((it) => ({
    id: String(it.id ?? "").trim(),
    quantity: Math.max(1, Math.floor(Number(it.quantity ?? 0))),
  }));

  for (const it of normalized) {
    if (!it.id) return { ok: false as const, code: "BAD_ITEM" as const };
    if (!Number.isFinite(it.quantity) || it.quantity <= 0) {
      return { ok: false as const, code: "BAD_ITEM" as const };
    }
  }

  const applied: { id: string; quantity: number }[] = [];

  try {
    for (const it of normalized) {
      // On récupère le produit (pour title + available en cas d'échec)
      const p = await ProductModel.findOne({ pid: it.id }).lean();
      if (!p) {
        return { ok: false as const, code: "NOT_FOUND" as const, productId: it.id };
      }

      // ✅ update atomique si stock suffisant
      const updated = await ProductModel.findOneAndUpdate(
        { pid: it.id, stock: { $gte: it.quantity } },
        { $inc: { stock: -it.quantity } },
        { new: true }
      ).lean();

      if (!updated) {
        const details: StockFailure = {
          productId: p.pid,
          title: p.title,
          requested: it.quantity,
          available: p.stock,
        };
        return { ok: false as const, code: "OUT_OF_STOCK" as const, details };
      }

      applied.push(it);
    }

    return { ok: true as const };
  } catch (e) {
    // rollback si crash au milieu
    for (const it of applied) {
      await ProductModel.updateOne({ pid: it.id }, { $inc: { stock: it.quantity } });
    }
    return { ok: false as const, code: "ROLLBACK" as const };
  }
}
