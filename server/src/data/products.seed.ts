// server/src/data/products.seed.ts
import { ProductModel } from "../models/Product.mongo.js";
import { PRODUCTS } from "./products.data.js";

export async function seedProductsIfEmpty() {
  const count = await ProductModel.countDocuments();
  if (count > 0) return;

  const docs = PRODUCTS.map((p: any) => ({
    pid: p.id,
    title: p.title,
    price: p.price,
    stock: p.stock ?? 0,
    isLarge: !!p.isLarge,
    category: p.category,
    brand: p.brand,
    image: p.image,
    description: p.description,
  }));

  await ProductModel.insertMany(docs);
  console.log(`✅ Seeded products: ${docs.length}`);
}
