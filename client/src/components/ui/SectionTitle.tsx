type Props = {
  title: string;
  subtitle?: string;
};

export function SectionTitle({ title, subtitle }: Props) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold tracking-tight text-zinc-900">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-1 text-sm text-zinc-600">
          {subtitle}
        </p>
      )}
    </div>
  );
}
