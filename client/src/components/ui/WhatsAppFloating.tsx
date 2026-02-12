// src/components/ui/WhatsAppFloating.tsx
export default function WhatsAppFloating() {
  const phone = "21699655735";
  const text = encodeURIComponent("Bonjour AL AMIN STORE, j’ai besoin d’aide svp.");
  const href = `https://wa.me/${phone}?text=${text}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="whatsapp-floating print:hidden fixed bottom-6 right-6 z-[999] inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg hover:bg-emerald-700"
      aria-label="Contacter sur WhatsApp"
      title="WhatsApp"
    >
      <span className="text-lg">💬</span>
      WhatsApp
    </a>
  );
}
