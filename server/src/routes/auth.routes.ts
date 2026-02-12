// server/src/routes/auth.routes.ts
import { Router } from "express";
import { createUser, verifyUser } from "../data/users.store.js";
import { httpError } from "../utils/httpError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const name = String(req.body?.name ?? "").trim();
    const email = String(req.body?.email ?? "").trim().toLowerCase();
    const password = String(req.body?.password ?? "");

    if (!name || !email || !password) {
      throw httpError(400, "VALIDATION_ERROR", "Champs requis manquants.");
    }
    if (password.length < 6) {
      throw httpError(400, "WEAK_PASSWORD", "Mot de passe trop court (min 6).");
    }

    try {
      const user = await createUser({ name, email, password });

      req.session.user = { id: user.id, name: user.name, email: user.email };
      return res.status(201).json({ ok: true, user: req.session.user });
    } catch (e: any) {
      if (e?.message === "USER_EXISTS") {
        throw httpError(409, "USER_EXISTS", "Utilisateur déjà existant.");
      }
      throw e;
    }
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const email = String(req.body?.email ?? "").trim().toLowerCase();
    const password = String(req.body?.password ?? "");

    if (!email || !password) {
      throw httpError(400, "VALIDATION_ERROR", "Email et mot de passe requis.");
    }

    const user = await verifyUser({ email, password });
    if (!user) {
      throw httpError(401, "INVALID_CREDENTIALS", "Identifiants invalides.");
    }

    req.session.user = { id: user.id, name: user.name, email: user.email };
    return res.json({ ok: true, user: req.session.user });
  })
);

router.get(
  "/me",
  asyncHandler(async (req, res) => {
    if (!req.session?.user) {
      throw httpError(401, "UNAUTHORIZED", "Non connecté.");
    }
    return res.json({ ok: true, user: req.session.user });
  })
);

router.post("/logout", (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(httpError(500, "LOGOUT_FAILED", "Échec de la déconnexion."));
    res.clearCookie("alamin.sid");
    return res.json({ ok: true });
  });
});

export default router;
