// src/components/ui/Button.tsx
import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ variant = "primary", className = "", ...props }: Props) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed";
  const styles = {
    primary: "bg-brand-700 text-white hover:bg-brand-800 shadow-sm",
    secondary: "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50",
    ghost: "bg-transparent text-slate-900 hover:bg-slate-100"
  }[variant];

  return <button className={`${base} ${styles} ${className}`} {...props} />;
}
