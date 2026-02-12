type Props = {
  children: React.ReactNode;
  tone?: "dark" | "success" | "warning" | "info";
};

export default function Badge({ children, tone = "dark" }: Props) {
  const cls =
    tone === "success"
      ? "bg-emerald-50 text-emerald-900 border-emerald-200"
      : tone === "warning"
      ? "bg-amber-50 text-amber-900 border-amber-200"
      : tone === "info"
      ? "bg-sky-50 text-sky-900 border-sky-200"
      : "bg-zinc-900 text-white border-zinc-900";

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${cls}`}>
      {children}
    </span>
  );
}
