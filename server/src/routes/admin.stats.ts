// server/src/routes/admin.stats.ts
import { Router } from "express";
import { requireAdmin } from "../middlewares/requireAdmin.js";
import { listAllOrders, ORDER_STATUSES } from "../data/orders.store.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get(
  "/stats",
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const orders = await listAllOrders();

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o: any) => sum + (o.total ?? 0), 0);

    const byStatus = ORDER_STATUSES.reduce((acc, s) => {
      acc[s] = orders.filter((o: any) => o.status === s).length;
      return acc;
    }, {} as Record<string, number>);

    const latest = orders.slice(0, 5).map((o: any) => ({
      id: o.id,
      status: o.status,
      total: o.total,
      createdAt: o.createdAt,
      customer: { name: o.customer?.name, phone: o.customer?.phone },
    }));

    return res.json({
      ok: true,
      totals: { orders: totalOrders, revenue: totalRevenue },
      byStatus,
      latest,
    });
  })
);

export default router;
