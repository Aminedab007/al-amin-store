import type { ProductCategory } from "../../types/product";

export type SpecField = { key: string; label: string };

export const SPEC_TEMPLATES: Record<ProductCategory, SpecField[]> = {
  TV: [
    { key: "size_inch", label: "Taille (pouces)" },
    { key: "resolution", label: "Résolution" },
    { key: "panel", label: "Type de dalle" },
    { key: "hdr", label: "HDR" },
    { key: "smart_tv", label: "Smart TV" },
    { key: "os", label: "Système" },
    { key: "hdmi", label: "HDMI" },
    { key: "usb", label: "USB" },
    { key: "warranty", label: "Garantie" },
  ],
  FROID: [
    { key: "capacity_l", label: "Capacité (L)" },
    { key: "type", label: "Type" },
    { key: "no_frost", label: "No Frost" },
    { key: "energy_class", label: "Classe énergétique" },
    { key: "warranty", label: "Garantie" },
  ],
  CLIM: [
    { key: "btu", label: "Puissance (BTU)" },
    { key: "inverter", label: "Inverter" },
    { key: "gas", label: "Gaz" },
    { key: "energy_class", label: "Classe énergétique" },
    { key: "warranty", label: "Garantie" },
  ],
  SMARTPHONE: [
    { key: "ram", label: "RAM" },
    { key: "storage", label: "Stockage" },
    { key: "screen", label: "Écran" },
    { key: "battery", label: "Batterie" },
    { key: "camera", label: "Caméra" },
    { key: "warranty", label: "Garantie" },
  ],
  CONGELATEUR: [{ key: "capacity_l", label: "Capacité (L)" }, { key: "warranty", label: "Garantie" }],
  RECEPTEUR: [{ key: "quality", label: "Qualité" }, { key: "iptv", label: "IPTV" }, { key: "warranty", label: "Garantie" }],
  AUTRE: [{ key: "warranty", label: "Garantie" }],
};

export function formatSpecValue(v: unknown) {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "boolean") return v ? "Oui" : "Non";
  return String(v);
}
