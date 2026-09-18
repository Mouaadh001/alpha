import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { orderByIdQO } from "@/lib/orders";
import { formatDA } from "@/lib/format";
import { StatusPill } from "./admin.index";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Phone, MessageCircle, Copy, Printer, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/orders/$id")({
  component: OrderDetail,
});

const STATUSES = ["pending", "preparing", "shipped", "delivered", "cancelled"] as const;

function OrderDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery(orderByIdQO(id));

  if (isLoading) return <div className="text-muted-foreground text-sm">Chargement…</div>;
  if (!data) return <div className="text-muted-foreground text-sm">Commande introuvable.</div>;

  const { order, items } = data;

  const setStatus = async (status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", order.id);
    if (error) return toast.error(error.message);
    toast.success("Statut mis à jour");
    qc.invalidateQueries();
  };

  const remove = async () => {
    if (!confirm("Supprimer définitivement cette commande ?")) return;
    const { error } = await supabase.from("orders").delete().eq("id", order.id);
    if (error) return toast.error(error.message);
    toast.success("Commande supprimée");
    qc.invalidateQueries();
    navigate({ to: "/admin/orders" });
  };

  const cleanPhone = order.phone.replace(/\s+/g, "");
  const waNumber = cleanPhone.startsWith("+") ? cleanPhone.slice(1) : cleanPhone.replace(/^0/, "213");
  const waMsg = encodeURIComponent(`Bonjour ${order.full_name}, votre commande ${order.order_number} chez Alpha Store.`);

  return (
    <div className="max-w-6xl print:max-w-full">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3 print:hidden">
        <Link to="/admin/orders" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-lime inline-flex items-center gap-2">
          <ArrowLeft className="size-3" /> Commandes
        </Link>
        <div className="flex flex-wrap gap-2">
          <a href={`tel:${cleanPhone}`} className="btn-ghost"><Phone className="size-4" /> Appeler</a>
          <a href={`https://wa.me/${waNumber}?text=${waMsg}`} target="_blank" rel="noopener noreferrer" className="btn-ghost"><MessageCircle className="size-4" /> WhatsApp</a>
          <button onClick={() => { navigator.clipboard.writeText(order.phone); toast.success("Téléphone copié"); }} className="btn-ghost"><Copy className="size-4" /> Copier</button>
          <button onClick={() => window.print()} className="btn-ghost"><Printer className="size-4" /> Imprimer</button>
          <button onClick={remove} className="btn-ghost text-destructive"><Trash2 className="size-4" /> Supprimer</button>
        </div>
      </div>

      <div className="mb-8 flex items-end justify-between flex-wrap gap-4">
        <div>
          <span className="eyebrow text-lime">\\ Commande</span>
          <h1 className="font-display font-bold text-4xl mt-3 uppercase tracking-tight">{order.order_number}</h1>
          <p className="text-xs text-muted-foreground font-mono mt-2">{new Date(order.created_at).toLocaleString("fr-FR")}</p>
        </div>
        <StatusPill status={order.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="border border-hairline">
            <div className="p-4 border-b border-hairline eyebrow">Articles</div>
            <div className="divide-y divide-hairline">
              {items.map((it) => (
                <div key={it.id} className="p-4 flex items-center gap-4">
                  <div className="size-16 bg-muted shrink-0">{it.image_url && <img src={it.image_url} alt="" className="w-full h-full object-cover" />}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{it.product_name}</div>
                    <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Qté {it.quantity} × {formatDA(it.unit_price_da)}</div>
                  </div>
                  <div className="font-mono text-sm">{formatDA(it.line_total_da)}</div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-hairline flex justify-between items-center">
              <span className="eyebrow">Total</span>
              <span className="font-display text-2xl font-bold">{formatDA(order.total_da)}</span>
            </div>
          </div>

          {/* Status changer */}
          <div className="border border-hairline p-4 print:hidden">
            <div className="eyebrow mb-3">Changer le statut</div>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`text-[10px] font-mono uppercase tracking-widest px-3 py-2 border transition-colors ${
                    order.status === s ? "border-lime text-lime bg-lime/10" : "border-hairline text-muted-foreground hover:border-lime hover:text-lime"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Customer panel */}
        <div className="space-y-6">
          <div className="border border-hairline p-4">
            <div className="eyebrow mb-4">Client</div>
            <div className="space-y-3 text-sm">
              <Field label="Nom" value={order.full_name} />
              <Field label="Téléphone" value={order.phone} mono />
              <Field label="Wilaya" value={order.wilaya} />
              <Field label="Commune" value={order.commune} />
              <Field label="Adresse" value={order.address} />
              {order.notes && <Field label="Notes" value={order.notes} />}
            </div>
          </div>

          <div className="border border-hairline p-4">
            <div className="eyebrow mb-4">Montants</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Sous-total</span><span className="font-mono">{formatDA(order.subtotal_da)}</span></div>
              <div className="flex justify-between font-display text-lg pt-2 border-t border-hairline"><span>Total</span><span>{formatDA(order.total_da)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">{label}</div>
      <div className={mono ? "font-mono" : ""}>{value}</div>
    </div>
  );
}