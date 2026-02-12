// server/src/app.ts
import express from "express";
import cors from "cors";
import session from "express-session";
import { env } from "./config/env.js";

import authRouter from "./routes/auth.routes.js";
import productsRouter from "./routes/products.js";
import ordersRouter from "./routes/orders.routes.js";
import adminOrdersRouter from "./routes/admin.orders.js";
import adminStatsRouter from "./routes/admin.stats.js";

import { errorHandler } from "./middlewares/errorHandler.js";

export function createApp() {
  const app = express();

  // ✅ IMPORTANT for secure cookies behind Render/Railway/NGINX
  if (env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
  }

  // ✅ CORS strict
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    })
  );

  app.use(express.json({ limit: "1mb" }));

  app.use(
    session({
      name: "alamin.sid",
      secret: env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: env.NODE_ENV === "production" ? "none" : "lax",
        secure: env.NODE_ENV === "production",
      },
    })
  );

  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  app.use("/api/auth", authRouter);
  app.use("/api/products", productsRouter);
  app.use("/api/orders", ordersRouter);
  app.use("/api/admin", adminOrdersRouter);
  app.use("/api/admin", adminStatsRouter);

  app.use("/api", (_req, res) =>
    res.status(404).json({
      ok: false,
      error: { code: "NOT_FOUND", message: "Route introuvable." },
    })
  );

  app.use(errorHandler);

  return app;
}
