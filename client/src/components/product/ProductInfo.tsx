import { useMemo, useState, type ReactNode } from "react";
import type { Product } from "../../data/products";
import SpecsTable from "./SpecsTable";

type TabKey = "DESCRIPTION" | "SPECS" | "DELIVERY";

function SectionTitle({ children }: { children: ReactNode }) {
  return <div className="text-sm font-semibold text-zinc-900">{children}</div>;
}

function DeliveryBlock({ product }: { product: Product }) {
  const isCall = product.deliveryPolicy === "CALL_FOR_DELIVERY";

  return (
    <div className="space-y-3 text-sm text-zinc-700">
      {isCall ? (
        <div className="rounded-xl bg-amber-50 p-3 text-amber-900">
          <b>Grand gabarit :</b> la livraison se confirme après la commande. <b>On vous appelle</b>.
        </div>
      ) : (
        <div className="rounded-xl bg-emerald-50 p-3 text-emerald-900">
          Livraison Aramex : <b>10 DT</b> (selon zone)
        </div>
      )}

      <div className="rounded-xl border border-zinc-200 bg-white p-3">
        <SectionTitle>Délais</SectionTitle>
        <p className="mt-1">En général 24–72h selon votre région. Nous confirmons toujours par téléphone/WhatsApp.</p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-3">
        <SectionTitle>Retours</SectionTitle>
        <p className="mt-1">Produit défectueux ? Contactez-nous dès réception, on trouve une solution rapidement.</p>
      </div>
    </div>
  );
}

function DescriptionBlock({ product }: { product: Product }) {
  return (
    <div className="space-y-3 text-sm text-zinc-700">
      <div className="rounded-xl border border-zinc-200 bg-white p-3">
        <SectionTitle>Aperçu</SectionTitle>
        <p className="mt-1">{product.title}</p>
        <p className="mt-1 text-zinc-500">SKU: {(product as any).sku ?? "—"} • Catégorie: {product.category}</p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-3">
        <SectionTitle>Ce qu’on aime</SectionTitle>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Qualité garantie • Service fiable</li>
          <li>Confirmation rapide par téléphone</li>
          <li>Support WhatsApp</li>
        </ul>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "rounded-xl px-3 py-2 text-sm font-semibold transition",
        active ? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-zinc-100",
      ].join(" ")}
      type="button"
    >
      {children}
    </button>
  );
}

function AccordionItem({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
        type="button"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-zinc-900">{title}</span>
        <span className="text-zinc-500">{open ? "—" : "+"}</span>
      </button>

      {open ? <div className="px-4 pb-4">{children}</div> : null}
    </div>
  );
}

export default function ProductInfo({ product }: { product: Product }) {
  const [tab, setTab] = useState<TabKey>("DESCRIPTION");
  const [openAcc, setOpenAcc] = useState<TabKey | null>("DESCRIPTION");

  const content = useMemo(() => {
    if (tab === "DESCRIPTION") return <DescriptionBlock product={product} />;
    if (tab === "SPECS") return <SpecsTable product={product} />;
    return <DeliveryBlock product={product} />;
  }, [tab, product]);

  return (
    <div className="space-y-3">
      {/* Desktop tabs */}
      <div className="hidden md:flex items-center gap-2">
        <TabButton active={tab === "DESCRIPTION"} onClick={() => setTab("DESCRIPTION")}>
          Description
        </TabButton>
        <TabButton active={tab === "SPECS"} onClick={() => setTab("SPECS")}>
          Caractéristiques
        </TabButton>
        <TabButton active={tab === "DELIVERY"} onClick={() => setTab("DELIVERY")}>
          Livraison & Retours
        </TabButton>
      </div>

      <div className="hidden md:block">{content}</div>

      {/* Mobile accordéons */}
      <div className="space-y-3 md:hidden">
        <AccordionItem
          title="Description"
          open={openAcc === "DESCRIPTION"}
          onToggle={() => setOpenAcc(openAcc === "DESCRIPTION" ? null : "DESCRIPTION")}
        >
          <DescriptionBlock product={product} />
        </AccordionItem>

        <AccordionItem
          title="Caractéristiques"
          open={openAcc === "SPECS"}
          onToggle={() => setOpenAcc(openAcc === "SPECS" ? null : "SPECS")}
        >
          <SpecsTable product={product} />
        </AccordionItem>

        <AccordionItem
          title="Livraison & Retours"
          open={openAcc === "DELIVERY"}
          onToggle={() => setOpenAcc(openAcc === "DELIVERY" ? null : "DELIVERY")}
        >
          <DeliveryBlock product={product} />
        </AccordionItem>
      </div>
    </div>
  );
}
