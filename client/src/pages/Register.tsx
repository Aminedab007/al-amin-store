// src/pages/Register.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { clearAuthError, registerThunk } from "../features/auth/authSlice";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function Register() {
  const dispatch = useAppDispatch();
  const nav = useNavigate();

  const { status, error, user } = useAppSelector((s) => s.auth);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const nameOk = useMemo(() => name.trim().length >= 2, [name]);
  const emailOk = useMemo(() => isValidEmail(email), [email]);
  const passOk = useMemo(() => password.length >= 6, [password]);

  const canSubmit = nameOk && emailOk && passOk && status !== "loading";

  // ✅ clear error when typing
  useEffect(() => {
    if (error) dispatch(clearAuthError());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, email, password]);

  // ✅ redirect if already logged in
  useEffect(() => {
    if (user) nav("/account", { replace: true });
  }, [user, nav]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      await dispatch(
        registerThunk({
          name: name.trim(),
          email: email.trim(),
          password,
        })
      ).unwrap();
      // ✅ redirect handled by effect
    } catch {
      // error already in slice
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-extrabold text-zinc-900">Créer un compte</h1>
        <p className="mt-1 text-sm text-zinc-600">Commande plus vite, historique, adresse…</p>

        {error ? (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
            {error}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700">Nom</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-300"
              placeholder="ex: Amine"
              autoComplete="name"
            />
            {!nameOk && name.length > 0 ? (
              <p className="text-xs text-rose-700">Nom trop court (min 2 caractères).</p>
            ) : null}
          </div>

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
            {email.length > 0 && !emailOk ? (
              <p className="text-xs text-rose-700">Email invalide.</p>
            ) : null}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700">Mot de passe</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-300"
              placeholder="min 6 caractères"
              type="password"
              autoComplete="new-password"
            />
            {password.length > 0 && !passOk ? (
              <p className="text-xs text-rose-700">Mot de passe trop court (min 6).</p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className={`w-full rounded-xl px-4 py-3 text-sm font-extrabold text-white transition active:scale-[0.99] ${
              status === "loading"
                ? "bg-zinc-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {status === "loading" ? "Création..." : "Créer mon compte"}
          </button>

          <div className="text-sm text-zinc-600">
            Déjà un compte ?{" "}
            <Link to="/login" className="font-semibold text-zinc-900 underline">
              Se connecter
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
