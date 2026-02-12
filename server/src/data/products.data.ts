// server/src/data/products.data.ts
import type { Product } from "../models/product.model.js";

export const PRODUCTS: Product[] = [
  {
    id: "p-fridge-001",
    title: "Réfrigérateur 2 portes 340L",
    price: 1699,
    category: "Froid",
    image: "/products/fridge-2doors.webp",
    isLarge: true,
    stock: 0, // ✅ mets 1 pour tester le stock insuffisant
  },
  {
    id: "p-tv-001",
    title: "TV Smart 55'' 4K UHD",
    price: 1299,
    category: "TV",
    image: "/products/tv-55.webp",
    isLarge: true,
    stock: 5,
  },
  {
    id: "p-phone-001",
    title: "Smartphone 128GB",
    price: 899,
    category: "Smartphones",
    image: "/products/phone-128.webp",
    isLarge: false,
    stock: 10,
  },
];
