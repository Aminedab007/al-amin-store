export default function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-3">
      <div className="aspect-[4/3] w-full animate-pulse rounded-xl bg-zinc-100" />
      <div className="mt-3 space-y-2">
        <div className="h-4 w-5/6 animate-pulse rounded bg-zinc-100" />
        <div className="h-4 w-3/5 animate-pulse rounded bg-zinc-100" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-zinc-100" />
        <div className="mt-3 h-10 w-full animate-pulse rounded-xl bg-zinc-100" />
      </div>
    </div>
  );
}
