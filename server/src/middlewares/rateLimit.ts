// server/src/middlewares/rateLimit.ts
import rateLimit from "express-rate-limit";

/**
 * Limite globale (API)
 * 100 requêtes / 15 minutes / IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Limite stricte pour les commandes
 * 10 commandes / 15 minutes / IP
 */
export const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    ok: false,
    code: "TOO_MANY_REQUESTS",
    message: "Trop de requêtes. Réessayez plus tard.",
  },
});
