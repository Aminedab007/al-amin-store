// server/src/middlewares/requireAuth.ts
import type { Request, Response, NextFunction } from "express";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!(req.session as any)?.user?.id) {
    return res.status(401).json({
      ok: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Vous devez être connecté pour accéder à cette ressource.",
      },
    });
  }
  next();
}
