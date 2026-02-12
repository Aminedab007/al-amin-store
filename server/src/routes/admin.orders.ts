// server/src/routes/admin.orders.ts
import { Router } from "express";
import { requireAdmin } from "../middlewares/requireAdmin.js";
import {
  ORDER_STATUSES,
  type OrderStatus,
  listAllOrders,
  getOrderById,
  setOrderStatus,
} from "../data/orders.store.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { httpError } from "../utils/httpError.js";

const router = Router();

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
    userId: order.userId,
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
    idempotencyKey: order.idempotencyKey ?? null,
  };
}

router.get(
  "/orders",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const status = String(req.query.status ?? "").trim() as OrderStatus;
    const q = String(req.query.q ?? "").trim().toLowerCase();
    const userId = String(req.query.userId ?? "").trim();
    const limitRaw = Number(req.query.limit ?? 200);
    const limit = Number.isFinite(limitRaw)
      ? Math.min(Math.max(1, Math.floor(limitRaw)), 500)
      : 200;

    let items = await listAllOrders();

    if (ORDER_STATUSES.includes(status)) items = items.filter((o) => o.status === status);

    if (q) {
      items = items.filter((o) => {
        const hay = [
          o.id,
          o.userId,
          o.customer?.name ?? "",
          o.customer?.phone ?? "",
          o.customer?.email ?? "",
          o.customer?.address ?? "",
          o.customer?.governorate ?? "",
          o.customer?.city ?? "",
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }

    if (userId) items = items.filter((o) => o.userId === userId);

    items = items.slice(0, limit);
    return res.json({ ok: true, count: items.length, items });
  })
);

router.get(
  "/orders/:id",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = String(req.params.id ?? "").trim();
    const order = await getOrderById(id);
    if (!order) throw httpError(404, "NOT_FOUND", "Commande introuvable.");
    return res.json({ ok: true, order });
  })
);

router.get(
  "/orders/:id/receipt",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = String(req.params.id ?? "").trim();
    const order = await getOrderById(id);
    if (!order) throw httpError(404, "NOT_FOUND", "Commande introuvable.");
    return res.json({ ok: true, receipt: buildReceipt(order) });
  })
);

router.patch(
  "/orders/:id/status",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = String(req.params.id ?? "").trim();
    const status = String(req.body?.status ?? "").trim() as OrderStatus;

    if (!ORDER_STATUSES.includes(status)) {
      throw httpError(400, "BAD_REQUEST", `Statut invalide. Valeurs: ${ORDER_STATUSES.join(", ")}`);
    }

    const updated = await setOrderStatus(id, status);
    if (!updated) throw httpError(404, "NOT_FOUND", "Commande introuvable.");

    return res.json({ ok: true, order: updated });
  })
);

export default router;
