// src/utils/stockUi.ts
export type StockTone = "success" | "warning" | "danger";

export function stockUi(stock: number): { text: string; tone: StockTone } {
  const s = Number(stock);

  if (!Number.isFinite(s) || s <= 0) {
    return { text: "Indisponible", tone: "danger" };
  }

  if (s === 1) {
    return { text: "Dernière pièce disponible", tone: "warning" };
  }

  if (s <= 3) {
    return { text: "Stock limité", tone: "warning" };
  }

  return { text: "Disponible", tone: "success" };
}
