import type { Product } from "../../data/products";

export default function SpecsTable({ product }: { product: Product }) {
  const specs = Array.isArray(product.specs) ? product.specs : [];

  if (!specs.length) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
      <div className="px-4 py-3 text-sm font-semibold text-zinc-900">
        Caractéristiques
      </div>

      <div className="divide-y divide-zinc-100">
        {specs.map((s, idx) => (
          <div
            key={`${s.label}-${idx}`}
            className="grid grid-cols-[1fr_1fr] gap-3 px-4 py-3 text-sm"
          >
            <div className="text-zinc-600">{s.label}</div>
            <div className="text-zinc-900">{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
