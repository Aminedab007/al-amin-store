import { useState } from "react";

type Props = {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  loading?: "lazy" | "eager";
};

const DEFAULT_FALLBACK = "/products/placeholder.webp";

export default function SmartImage({
  src,
  alt,
  className = "",
  fallbackSrc = DEFAULT_FALLBACK,
  loading = "lazy",
}: Props) {
  const [err, setErr] = useState(false);

  return (
    <img
      src={err ? fallbackSrc : src}
      alt={alt}
      className={className}
      loading={loading}
      decoding="async"
      onError={() => setErr(true)}
    />
  );
}
