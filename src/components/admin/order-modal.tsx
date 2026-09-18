import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Phone, MessageCircle, Copy, Printer, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { orderByIdQO } from "@/lib/orders";
import { formatDA } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
const STATUSES = ["pending", "confirmed", "preparing", "shipped", "delivered", "cancelled"] as const;

export function OrderModal({ orderId, onClose }: { orderId: string | null; onClose: () => void }) {
  const qc = useQueryClient();
  const enabled = Boolean(orderId);
  const { data, isLoading } = useQuery({ ...orderByIdQO(orderId ?? ""), enabled });
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (!orderId) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [orderId, onClose]);

  if (!orderId || !mounted) return null;

  const order = data?.order;
  const items = data?.items ?? [];

  const cleanPhone = order?.phone.replace(/\s+/g, "") ?? "";
  const waNumber = cleanPhone.startsWith("+") ? cleanPhone.slice(1) : cleanPhone.replace(/^0/, "213");
  const waMsg = order ? encodeURIComponent(`Bonjour ${order.full_name}, votre commande ${order.order_number} chez Alpha Store.`) : "";

  const setStatus = async (status: string) => {
    if (!order) return;
    const { error } = await supabase.from("orders").update({ status }).eq("id", order.id);
    if (error) return toast.error(error.message);
    toast.success("Statut mis à jour");
    qc.invalidateQueries();
  };

  const remove = async () => {
    if (!order) return;
    if (!confirm("Supprimer définitivement cette commande ?")) return;
    const { error } = await supabase.from("orders").delete().eq("id", order.id);
    if (error) return toast.error(error.message);
    toast.success("Commande supprimée");
    qc.invalidateQueries();
    onClose();
  };

  const copyInfo = () => {
    if (!order) return;
    const text = [
      `Commande ${order.order_number}`,
      `Client: ${order.full_name}`,
      `Téléphone: ${order.phone}`,
      `Adresse: ${order.address}, ${order.commune}, ${order.wilaya}`,
      `Total: ${formatDA(Number(order.total_da))}`,
    ].join("\n");
    navigator.clipboard.writeText(text);
    toast.success("Info copiée");
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-3 backdrop-blur-[10px]  sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="flex w-full max-w-[760px] flex-col overflow-hidden"
        style={{
          maxHeight: "min(96dvh, 820px)",
          borderRadius: "24px",
          background: "#0B0B0F",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 30px 80px -20px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.02)",
          animation: "orderModalIn 250ms cubic-bezier(0.22,1,0.36,1) both",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`@keyframes orderModalIn { from { opacity: 0; transform: translateY(20px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }`}</style>
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pt-5 pb-5" style={{ WebkitOverflowScrolling: "touch" }}>
          {/* Header row */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate text-[22px] font-bold leading-tight tracking-tight">
                {isLoading || !order ? "Chargement…" : `Commande ${order.order_number}`}
              </h2>
              {order && (
                <p className="mt-1 font-mono text-[12px] text-muted-foreground">
                  {new Date(order.created_at).toLocaleString("fr-FR")}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              aria-label="Fermer"
              className="shrink-0 size-8 rounded-full grid place-items-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition"
            >
              <X className="size-5" />
            </button>
          </div>

          {order && (
            <>
              {/* Action pills */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <a href={`tel:${cleanPhone}`} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/10 px-3.5 text-[13px] font-semibold text-red-400 transition hover:bg-red-500/20">
                  <Phone className="size-4" /> Appeler
                </a>
                <a href={`https://wa.me/${waNumber}?text=${waMsg}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3.5 text-[13px] font-semibold text-emerald-400 transition hover:bg-emerald-500/20">
                  <MessageCircle className="size-4" /> WhatsApp
                </a>
                <button onClick={copyInfo} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/15 px-3.5 text-[13px] font-medium text-foreground/90 transition hover:bg-white/5">
                  <Copy className="size-4" /> Copier
                </button>
                <button onClick={() => window.print()} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/15 px-3.5 text-[13px] font-medium text-foreground/90 transition hover:bg-white/5">
                  <Printer className="size-4" /> Imprimer
                </button>
                <button onClick={remove} className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/10 px-3.5 text-[13px] font-semibold text-red-400 transition hover:bg-red-500/20">
                  <Trash2 className="size-4" /> Supprimer
                </button>
              </div>

              {/* Client + Adresse */}
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="min-w-0">
                  <div className="text-[12px] text-muted-foreground">Client</div>
                  <div className="mt-1 truncate text-[15px] font-semibold">{order.full_name}</div>
                  <div className="truncate font-mono text-[13px] text-foreground/80">{order.phone}</div>
                </div>
                <div className="min-w-0">
                  <div className="text-[12px] text-muted-foreground">Adresse</div>
                  <div className="mt-1 truncate text-[15px] font-semibold">{order.address}</div>
                  <div className="truncate text-[13px] text-foreground/70">{order.commune}, {order.wilaya}</div>
                </div>
              </div>

              {/* Articles */}
              <div className="mt-4">
                <div className="text-[12px] text-muted-foreground mb-1.5">Articles</div>
                <div className="overflow-hidden rounded-xl border border-white/10 divide-y divide-white/10">
                  {items.map((it) => (
                    <div key={it.id} className="flex items-center gap-2.5 px-3.5 py-2.5">
                      {it.image_url && (
                        <div className="size-9 shrink-0 overflow-hidden rounded-md bg-muted">
                          <img src={it.image_url} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1 truncate text-[14px]">
                        <span className="font-medium">{it.product_name}</span>
                        <span className="text-muted-foreground"> x{it.quantity}</span>
                      </div>
                      <div className="whitespace-nowrap text-[14px] font-semibold">{formatDA(Number(it.line_total_da))}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-[18px] font-bold">Total</span>
                <span className="text-[18px] font-bold">{formatDA(Number(order.total_da))}</span>
              </div>

              {order.notes && (
                <div className="mt-3">
                  <div className="text-[11px] text-muted-foreground mb-0.5">Notes</div>
                  <div className="text-[13px]">{order.notes}</div>
                </div>
              )}

              {/* Statut */}
              <div className="mt-4">
                <div className="text-[12px] text-muted-foreground mb-2">Statut</div>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map((s) => {
                    const active = order.status === s;
                    return (
                      <button
                        key={s}
                        onClick={() => setStatus(s)}
                        className={
                          active
                            ? "inline-flex h-8 items-center rounded-full border border-red-500/60 bg-red-500/10 px-3.5 text-[12px] font-semibold text-red-400"
                            : "inline-flex h-8 items-center rounded-full border border-white/15 px-3.5 text-[12px] font-medium text-foreground/70 transition hover:bg-white/5"
                        }
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}