// server/src/routes/health.ts
import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "al-amin-store-api",
    time: new Date().toISOString(),
  });
});

export default router;
