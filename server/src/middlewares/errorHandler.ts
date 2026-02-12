// server/src/middlewares/errorHandler.ts
import type { Request, Response, NextFunction } from "express";
import { env } from "../config/env.js";
import { normalizeError, HttpError } from "../utils/httpError.js";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const { status, payload } = normalizeError(err);

  // Logs
  if (env.NODE_ENV !== "test") {
    if (env.NODE_ENV === "production") {
      const code = err instanceof HttpError ? err.code : "INTERNAL_ERROR";
      console.error("❌", req.method, req.originalUrl, "-", code);
    } else {
      console.error("❌", req.method, req.originalUrl, "-", err);
    }
  }

  // ✅ En prod: on ne renvoie jamais details
  if (env.NODE_ENV === "production" && payload.error.details !== undefined) {
    delete (payload.error as any).details;
  }

  return res.status(status).json(payload);
}
