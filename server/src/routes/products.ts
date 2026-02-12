// server/src/routes/products.ts
import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { httpError } from "../utils/httpError.js";
import { getProductById, listProducts } from "../data/products.store.js";

const router = Router();

/**
 * GET /api/products
 * Query: q, category, brand, inStock=1
 */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const q = String(req.query.q ?? "").trim().toLowerCase();
    const category = String(req.query.category ?? "").trim().toLowerCase();
    const brand = String(req.query.brand ?? "").trim().toLowerCase();
    const inStock = String(req.query.inStock ?? "");

    let items = await listProducts();

    if (q) items = items.filter((p) => p.title.toLowerCase().includes(q));
    if (category) items = items.filter((p) => (p.category ?? "").toLowerCase() === category);
    if (brand) items = items.filter((p) => (p.brand ?? "").toLowerCase() === brand);
    if (inStock === "1") items = items.filter((p) => Number(p.stock ?? 0) > 0);

    return res.json(items);
  })
);

/**
 * GET /api/products/:id
 */
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = String(req.params.id ?? "").trim();
    const p = await getProductById(id);
    if (!p) throw httpError(404, "PRODUCT_NOT_FOUND", `Produit introuvable (${id}).`);
    return res.json(p);
  })
);

export default router;
