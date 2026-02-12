// server/src/models/product.model.ts

export type DeliveryPolicy = "ARAMEX_10DT" | "CALL_FOR_DELIVERY";

export type Product = {
  id: string;
  title: string;
  price: number;
  stock: number;

  // ✅ tu l'utilises déjà dans products.data.ts
  isLarge: boolean;

  // ✅ calculable à partir de isLarge (donc optionnel)
  deliveryPolicy?: "ARAMEX_10DT" | "CALL_FOR_DELIVERY";

  category?: string;
  brand?: string;
  image?: string;
  description?: string;
};
