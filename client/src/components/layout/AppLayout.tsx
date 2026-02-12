// src/components/layout/AppLayout.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import WhatsAppFloating from "../ui/WhatsAppFloating";

// ✅ FIX PATH (2 niveaux)
import { logoutThunk } from "../../features/auth/authSlice";

import ToastHost from "../ui/ToastHost";

const linkCls = ({ isActive }: { isActive: boolean }) =>
  `rounded-xl px-3 py-2 text-sm font-semibold transition ${
    isActive ? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-zinc-100"
  }`;

function formatMoneyDT(n: number) {
  if (!Number.isFinite(n)) return "0 DT";
  return `${Math.round(n)} DT`;
}

export default function AppLayout() {
  const dispatch = useAppDispatch();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const items = useAppSelector((s) => s.cart.items);
  const user = useAppSelector((s) => s.auth.user);

  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement | null>(null);

  const { count, total } = useMemo(() => {
    const c = items.reduce((s, i) => s + i.quantity, 0);
    const t = items.reduce((s, i) => s + i.price * i.quantity, 0);
    return { count: c, total: t };
  }, [items]);

  useEffect(() => {
    setOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);

  // close dropdown on outside click
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!accountRef.current) return;
      if (!accountRef.current.contains(e.target as Node)) setAccountOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const onLogout = async () => {
    try {
      // ✅ clean: attendre la réponse backend
      await dispatch(logoutThunk()).unwrap();
    } catch {
      // ignore (si backend down, on veut quand même sortir côté UI)
    } finally {
      nav("/", { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex h-16 items-center justify-between gap-3">
            <Link to="/" className="flex items-center gap-2 font-extrabold tracking-tight">
              <span className="text-zinc-900">AL AMIN</span>
              <span className="text-emerald-600">STORE</span>
            </Link>

            <nav className="hidden items-center gap-2 md:flex">
              <NavLink to="/" className={linkCls}>
                Accueil
              </NavLink>
              <NavLink to="/products" className={linkCls}>
                Produits
              </NavLink>
              <NavLink to="/cart" className={linkCls}>
                Panier
              </NavLink>

              {/* ✅ Compte dropdown (desktop) */}
              {user ? (
                <div className="relative" ref={accountRef}>
                  <button
                    type="button"
                    onClick={() => setAccountOpen((v) => !v)}
                    className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
                  >
                    Salut, <span className="font-extrabold text-zinc-900">{user.name}</span> ▾
                  </button>

                  {accountOpen ? (
                    <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-lg">
                      <Link
                        to="/account"
                        className="block px-4 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
                      >
                        Mon compte
                      </Link>
                      <button
                        type="button"
                        onClick={onLogout}
                        className="w-full text-left px-4 py-3 text-sm font-semibold text-rose-700 hover:bg-rose-50"
                      >
                        Déconnexion
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : (
                <NavLink to="/login" className={linkCls}>
                  Connexion
                </NavLink>
              )}

              <Link
                to="/checkout"
                className="ml-2 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-extrabold text-white transition hover:bg-emerald-700"
              >
                Commander
              </Link>
            </nav>

            <div className="flex items-center gap-2">
              <Link
                to="/cart"
                className="hidden items-center gap-2 rounded-xl bg-zinc-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 md:inline-flex"
              >
                <span>Panier</span>
                <span className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-extrabold">
                  {count}
                </span>
                <span className="font-extrabold text-emerald-300">{formatMoneyDT(total)}</span>
              </Link>

              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50 md:hidden"
                aria-label="Menu"
              >
                ☰
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {open ? (
            <div className="pb-4 md:hidden">
              <div className="space-y-2 rounded-2xl border border-zinc-200 bg-white p-3">
                <NavLink to="/" className={linkCls}>
                  Accueil
                </NavLink>
                <NavLink to="/products" className={linkCls}>
                  Produits
                </NavLink>
                <NavLink to="/cart" className={linkCls}>
                  Panier
                </NavLink>

                {user ? (
                  <>
                    <Link
                      to="/account"
                      className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-semibold text-zinc-900"
                    >
                      <span>Mon compte</span>
                      <span className="font-extrabold">{user.name}</span>
                    </Link>
                    <button
                      type="button"
                      onClick={onLogout}
                      className="w-full rounded-xl bg-rose-600 px-4 py-2 text-sm font-extrabold text-white transition hover:bg-rose-700"
                    >
                      Déconnexion
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="w-full inline-flex justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-extrabold text-white transition hover:bg-zinc-800"
                  >
                    Connexion
                  </Link>
                )}

                <Link
                  to="/checkout"
                  className="inline-flex w-full justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-extrabold text-white transition hover:bg-emerald-700"
                >
                  Commander
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>

      {/* ✅ Global toast */}
      <ToastHost />

      <WhatsAppFloating />
    </div>
  );
}
