// src/pages/Login.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { clearAuthError, loginThunk } from "../features/auth/authSlice";

export default function Login() {
  const dispatch = useAppDispatch();
  const nav = useNavigate();
  const location = useLocation() as any;

  const { status, error, user } = useAppSelector((s) => s.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const from = useMemo(() => location?.state?.from ?? "/account", [location]);

  // ✅ clear error when typing
  useEffect(() => {
    if (error) dispatch(clearAuthError());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, password]);

  // ✅ redirect when logged in
  useEffect(() => {
    if (user) nav(from, { replace: true });
  }, [user, nav, from]);

  const canSubmit = email.trim().length > 0 && password.length > 0 && status !== "loading";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      await dispatch(loginThunk({ email: email.trim(), password })).unwrap();
      // ✅ redirect handled by effect
    } catch {
      // error already in slice
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-extrabold text-zinc-900">Connexion</h1>
        <p className="mt-1 text-sm text-zinc-600">Accède à ton compte AL AMIN STORE.</p>

        {error ? (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
            {error}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-300"
              placeholder="ex: client@gmail.com"
              inputMode="email"
              autoComplete="email"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700">Mot de passe</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-300"
              placeholder="••••••••"
              type="password"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className={`w-full rounded-xl px-4 py-3 text-sm font-extrabold text-white transition active:scale-[0.99] ${
              status === "loading"
                ? "bg-zinc-400 cursor-not-allowed"
                : "bg-zinc-900 hover:bg-zinc-800"
            }`}
          >
            {status === "loading" ? "Connexion..." : "Se connecter"}
          </button>

          {/* ✅ Google (UI prêt, pas branché) */}
          <button
            type="button"
            disabled
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-extrabold text-zinc-500"
            title="Google login sera ajouté plus tard"
          >
            Continuer avec Google (bientôt)
          </button>

          <div className="text-sm text-zinc-600">
            Pas de compte ?{" "}
            <Link to="/register" className="font-semibold text-zinc-900 underline">
              Créer un compte
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
