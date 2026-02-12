// server/src/routes/orders.routes.ts
import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { httpError } from "../utils/httpError.js";

import { getProductById, tryDecrementMany } from "../data/products.store.js";
import {
  createOrder,
  computeDelivery,
  getOrderById,
  listOrdersByUser,
  getOrderByIdempotency,
} from "../data/orders.store.js";

type OrderItemInput = { id: string; quantity: number };
type CustomerInput = {
  name: string;
  phone: string;
  address: string;
  email?: string | null;
};

const router = Router();

function readIdempotencyKey(req: any) {
  const h = req.header("Idempotency-Key");
  if (!h) return null;
  const key = String(h).trim();
  if (key.length < 8 || key.length > 200) return null;
  return key;
}

function buildReceipt(order: any) {
  const lines = (order.items ?? []).map((it: any) => ({
    id: it.id,
    title: it.title,
    unitPrice: it.price,
    quantity: it.quantity,
    lineTotal: it.price * it.quantity,
    deliveryPolicy: it.deliveryPolicy,
  }));

  return {
    id: order.id,
    status: order.status,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    customer: order.customer,
    lines,
    totals: {
      subtotal: order.subtotal,
      shippingFee: order.shippingFee,
      total: order.total,
    },
    shipping: {
      fee: order.shippingFee,
      provider: order.deliveryProvider ?? null,
      note: order.deliveryNote ?? "",
      noteAboutCallItems: order.noteAboutCallItems ?? null,
    },
  };
}

/**
 * GET /api/orders/me
 */
router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req: any, res) => {
    const userId = req.session.user.id as string;
    const items = await listOrdersByUser(userId);
    return res.json({ ok: true, items });
  })
);

/**
 * GET /api/orders/:id/receipt
 */
router.get(
  "/:id/receipt",
  requireAuth,
  asyncHandler(async (req: any, res) => {
    const userId = req.session.user.id as string;
    const id = String(req.params.id ?? "").trim();

    const o = await getOrderById(id);
    if (!o || o.userId !== userId) throw httpError(404, "ORDER_NOT_FOUND", "Commande introuvable.");

    return res.json({ ok: true, receipt: buildReceipt(o) });
  })
);

/**
 * GET /api/orders/:id
 */
router.get(
  "/:id",
  requireAuth,
  asyncHandler(async (req: any, res) => {
    const userId = req.session.user.id as string;
    const id = String(req.params.id ?? "").trim();

    const o = await getOrderById(id);
    if (!o || o.userId !== userId) throw httpError(404, "ORDER_NOT_FOUND", "Commande introuvable.");

    return res.json({ ok: true, order: o });
  })
);

/**
 * POST /api/orders
 */
router.post(
  "/",
  requireAuth,
  asyncHandler(async (req: any, res) => {
    const userId = req.session.user.id as string;

    const idemKey = readIdempotencyKey(req);
    if (idemKey) {
      const existing = await getOrderByIdempotency(userId, idemKey);
      if (existing) {
        return res.status(200).json({
          ok: true,
          id: existing.id,
          status: existing.status,
          createdAt: existing.createdAt,
          idempotent: true,
        });
      }
    }

    const items = req.body?.items as OrderItemInput[] | undefined;
    const customer = req.body?.customer as CustomerInput | undefined;

    if (!customer?.name || !customer?.phone || !customer?.address) {
      throw httpError(400, "BAD_CUSTOMER", "Informations client invalides.");
    }
    if (!Array.isArray(items) || items.length === 0) {
      throw httpError(400, "BAD_ITEMS", "Panier vide ou invalide.");
    }

    const normalized = items.map((it) => ({
      id: String(it?.id ?? "").trim(),
      quantity: Math.max(1, Math.floor(Number(it?.quantity ?? 0))),
    }));

    // validate products exist
    for (const it of normalized) {
      if (!it.id) throw httpError(400, "BAD_ITEM", "Un article est invalide.");
      const p = await getProductById(it.id);
      if (!p) throw httpError(404, "PRODUCT_NOT_FOUND", `Produit introuvable (${it.id}).`);
    }

    // ✅ decrement stock in Mongo
    const r = await tryDecrementMany(normalized);
    if (!r.ok) {
      if (r.code === "OUT_OF_STOCK" && (r as any).details) {
        const d = (r as any).details;
        throw httpError(
          409,
          "OUT_OF_STOCK",
          `Stock insuffisant : "${d.title}". Il reste ${d.available} pièce(s), vous avez demandé ${d.requested}.`,
          d
        );
      }
      if (r.code === "NOT_FOUND" && (r as any).productId) {
        throw httpError(404, "PRODUCT_NOT_FOUND", `Produit introuvable (${(r as any).productId}).`);
      }
      throw httpError(400, r.code, "Commande invalide.");
    }

    // build items from DB truth
    const orderItems = [];
    for (const it of normalized) {
      const p = await getProductById(it.id);
      if (!p) throw httpError(500, "PRODUCT_MISSING", `Produit manquant (${it.id}).`);
      orderItems.push({
        id: p.id,
        title: p.title,
        price: p.price,
        quantity: it.quantity,
        deliveryPolicy: p.deliveryPolicy,
      });
    }

    const subtotal = orderItems.reduce((sum, it) => sum + it.price * it.quantity, 0);
    const del = computeDelivery(orderItems);
    const total = subtotal + del.shippingFee;

    const order = await createOrder({
      userId,
      customer: {
        name: customer.name.trim(),
        phone: customer.phone.trim(),
        address: customer.address.trim(),
        email: customer.email ?? null,
      },
      items: orderItems,
      subtotal,
      shippingFee: del.shippingFee,
      total,
      idempotencyKey: idemKey ?? undefined,
      deliveryProvider: del.deliveryProvider,
      deliveryNote: del.deliveryNote,
      noteAboutCallItems: del.noteAboutCallItems,
    });

    return res.status(201).json({ ok: true, id: order.id, status: order.status, createdAt: order.createdAt });
  })
);

export default router;
