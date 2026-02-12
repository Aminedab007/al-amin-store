// src/data/products.ts
import type { Category } from "./categories";
import type { ProductSpec } from "./specTemplates";

export type DeliveryPolicy = "ARAMEX_10DT" | "CALL_FOR_DELIVERY";

export type Product = {
  id: string;
  title: string;
  category: Exclude<Category, "Tous">;
  price: number;

  image: string;      // fallback (carte + panier)
  images?: string[];  // galerie

  inStock: boolean;
  deliveryPolicy: DeliveryPolicy;
  isBestSeller?: boolean;

  sku?: string;
  specs?: ProductSpec[];
};

// ✅ Images locales (public/products)
const IMG = {
  placeholder: "/products/placeholder.webp",

  tv_tcl_43: "/products/tv-tcl-43.webp",
  ref_lg_459: "/products/ref-lg-comb-459.webp",
  ac_lg_12: "/products/ac-lg-12.webp",

  phone128: "/products/phone-128.webp",
  wallMount: "/products/wall-mount.webp",
  mixer: "/products/mixer.webp",
};

export const PRODUCTS: Product[] = [
  // ✅ TV TCL
  {
    id: "tv-tcl-43-s5k",
    title: "TV TCL 43'' S5K QLED Full HD Smart + Récepteur intégré",
    sku: "TCL-43S5K",
    category: "TV",
    price: 850,
    image: IMG.tv_tcl_43,
    images: [
      IMG.tv_tcl_43,
      "/products/tv-tcl-43-2.webp",
      "/products/tv-tcl-43-3.webp",
    ],
    inStock: true,
    deliveryPolicy: "CALL_FOR_DELIVERY",
    isBestSeller: true,
    specs: [
      { label: "Marque", value: "TCL" },
      { label: "Modèle", value: "S5K" },
      { label: "Taille", value: '43"' },
      { label: "Résolution", value: "Full HD (1920×1080)" },
      { label: "Système", value: "Google TV" },
      { label: "HDR", value: "HDR10" },
    ],
  },

  // ✅ Réfrigérateur LG
  {
    id: "fr-lg-gr-b459nllm",
    title: "Réfrigérateur LG Combiné GR-B459NLLM 374L NoFrost",
    sku: "LG-GR-B459NLLM",
    category: "Réfrigérateurs",
    price: 2180,
    image: IMG.ref_lg_459,
    images: [IMG.ref_lg_459],
    inStock: true,
    deliveryPolicy: "CALL_FOR_DELIVERY",
    isBestSeller: true,
    specs: [
      { label: "Marque", value: "LG" },
      { label: "Modèle", value: "GR-B459NLLM" },
      { label: "Type", value: "Combiné • 2 portes" },
      { label: "Froid", value: "NoFrost" },
      { label: "Capacité", value: "374 L" },
      { label: "Couleur", value: "Platinum Silver" },
    ],
  },

  // ✅ Climatiseur LG
  {
    id: "ac-lg-dual-inverter-12000",
    title: "Climatiseur LG Dual Inverter 12000 BTU Smart Chaud/Froid",
    sku: "LG-DUAL-INV-12000",
    category: "Climatiseurs",
    price: 1350,
    image: IMG.ac_lg_12,
    images: [IMG.ac_lg_12],
    inStock: true,
    deliveryPolicy: "CALL_FOR_DELIVERY",
    isBestSeller: true,
    specs: [
      { label: "Marque", value: "LG" },
      { label: "Puissance", value: "12000 BTU" },
      { label: "Mode", value: "Chaud & Froid" },
      { label: "Compresseur", value: "Dual Inverter" },
      { label: "Wi-Fi", value: "Oui" },
    ],
  },

  // ✅ Smartphone
  {
    id: "ph-1",
    title: "Smartphone 128GB",
    sku: "PH-128",
    category: "Smartphones",
    price: 699,
    image: IMG.phone128,
    images: [IMG.phone128],
    inStock: true,
    deliveryPolicy: "ARAMEX_10DT",
    isBestSeller: true,
    specs: [
      { label: "Stockage", value: "128 GB" },
      { label: "Réseau", value: "4G/5G (selon modèle)" },
      { label: "OS", value: "Android (selon modèle)" },
    ],
  },

  // ✅ Support mural TV
  {
    id: "ac-1",
    title: "Support mural TV",
    sku: "WM-TV",
    category: "Accessoires",
    price: 79,
    image: IMG.wallMount,
    images: [IMG.wallMount],
    inStock: true,
    deliveryPolicy: "ARAMEX_10DT",
    specs: [
      { label: "Compatibilité", value: '32" → 65"' },
      { label: "Type", value: "Fixe / Inclinable (selon stock)" },
      { label: "VESA", value: "Standard" },
    ],
  },

  // ✅ Mixeur
  {
    id: "pe-1",
    title: "Mixeur 2 vitesses",
    sku: "MX-2S",
    category: "Petit électroménager",
    price: 129,
    image: IMG.mixer,
    images: [IMG.mixer],
    inStock: true,
    deliveryPolicy: "ARAMEX_10DT",
    specs: [
      { label: "Vitesses", value: "2 vitesses" },
      { label: "Bol", value: "Selon modèle" },
      { label: "Glace", value: "Selon modèle" },
    ],
  },
];
