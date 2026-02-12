export const CATEGORIES = [
  "Tous",
  "TV",
  "Réfrigérateurs",
  "Climatiseurs",
  "Congélateurs",
  "Smartphones",
  "Accessoires",
  "Petit électroménager",
] as const;

export type Category = (typeof CATEGORIES)[number];
