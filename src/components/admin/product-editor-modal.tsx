import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { ProductEditor } from "./product-editor";
import type { Product } from "@/lib/queries";

export function ProductEditorModal({
  open,
  product,
  onClose,
}: {
  open: boolean;
  product?: Product;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-x-0 top-0 bottom-0 z-[9999] flex h-dvh items-start justify-center bg-black/70 px-3 py-4 backdrop-blur-sm  sm:px-4 sm:py-10"
      style={{
        paddingTop: "max(16px, env(safe-area-inset-top))",
        paddingBottom: "max(20px, env(safe-area-inset-bottom))",
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="flex w-full max-w-[640px] flex-col overflow-hidden rounded-3xl border border-[#23262F] bg-[#0B0B0F] shadow-2xl sm:w-[94vw] sm:rounded-2xl"
        style={{ maxHeight: "calc(100dvh - max(16px, env(safe-area-inset-top)) - max(20px, env(safe-area-inset-bottom)) - 24px)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-[#23262F] flex items-center justify-between gap-3 shrink-0 bg-[#0B0B0F]">
          <h2 className="font-semibold text-[17px] text-white truncate">
            {product ? "Modifier le produit" : "Nouveau produit"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="shrink-0 size-9 rounded-full grid place-items-center hover:bg-white/5 text-white/60 hover:text-white transition"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-4 md:px-5 pt-5 pb-0 flex-1">
          <ProductEditor product={product} onDone={onClose} />
        </div>
      </div>
    </div>,
    document.body,
  );
}