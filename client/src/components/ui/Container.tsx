// src/components/ui/Container.tsx
export function Container({ children }: { children: React.ReactNode }) {
  return <div className="container">{children}</div>;
}

// src/components/ui/SectionTitle.tsx
export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      {subtitle ? <p className="text-sm text-slate-600 mt-1">{subtitle}</p> : null}
    </div>
  );
}
