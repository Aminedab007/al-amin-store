// server/src/middlewares/requireAdmin.ts
import type { Request, Response, NextFunction } from "express";
import { env } from "../config/env.js";

function parseEmails(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Admin OK si :
 * 1) Header x-admin-token == ADMIN_TOKEN
 * OU
 * 2) User connecté et email ∈ ADMIN_EMAILS (ou ADMIN_EMAIL legacy)
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const headerToken = String(req.header("x-admin-token") ?? "").trim();
  const tokenOk = !!env.ADMIN_TOKEN && !!headerToken && headerToken === env.ADMIN_TOKEN;

  const sessionEmail = String((req.session as any)?.user?.email ?? "").trim().toLowerCase();

  const emails =
    env.ADMIN_EMAILS.trim() !== ""
      ? parseEmails(env.ADMIN_EMAILS)
      : env.ADMIN_EMAIL
      ? [env.ADMIN_EMAIL.trim().toLowerCase()]
      : [];

  const emailOk = !!sessionEmail && emails.includes(sessionEmail);

  if (!tokenOk && !emailOk) {
    return res.status(403).json({
      ok: false,
      error: { code: "FORBIDDEN", message: "Accès admin refusé." },
    });
  }

  next();
}
