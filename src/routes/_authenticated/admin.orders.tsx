import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { allOrdersAdminQO } from "@/lib/queries";
import { formatDA } from "@/lib/format";
import { StatusPill } from "./admin.index";
import { Search, Phone } from "lucide-react";
import { useMemo, useState } from "react";
import { AdminPage, AdminCard, AdminEmpty, inputCls } from "@/components/admin/shell";
import { OrderModal } from "@/components/admin/order-modal";

export const Route = createFileRoute("/_authenticated/admin/orders")({
  component: OrdersList,
});

const TABS = [
  { key: "", label: "Toutes" },
  { key: "pending", label: "En attente" },
  { key: "confirmed", label: "Confirmées" },
  { key: "preparing", label: "Préparation" },
  { key: "shipped", label: "Expédiées" },
  { key: "delivered", label: "Livrées" },
  { key: "cancelled", label: "Annulées" },
];

function OrdersList() {
  const { data: orders = [] } = useQuery(allOrdersAdminQO);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = orders;
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter((o) =>
        o.order_number.toLowerCase().includes(s) ||
        o.full_name.toLowerCase().includes(s) ||
        o.phone.includes(s) ||
        o.wilaya.toLowerCase().includes(s),
      );
    }
    if (status) list = list.filter((o) => o.status === status);
    return list;
  }, [orders, q, status]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { "": orders.length };
    for (const o of orders) c[o.status] = (c[o.status] ?? 0) + 1;
    return c;
  }, [orders]);

  return (
    <AdminPage title="Commandes" subtitle={`${filtered.length} sur ${orders.length}`}>
      {/* Status filter — dropdown on mobile, pill tabs on desktop */}
      <div className="mb-4">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className={inputCls + " md:hidden !py-3 font-semibold"}
        >
          {TABS.map((t) => (
            <option key={t.key} value={t.key}>
              {t.label} ({counts[t.key] ?? 0})
            </option>
          ))}
        </select>
        <div className="hidden md:flex flex-wrap gap-1.5">
          {TABS.map((t) => {
            const active = status === t.key;
            const n = counts[t.key] ?? 0;
            return (
              <button
                key={t.key}
                onClick={() => setStatus(t.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5 ${active ? "bg-accent text-white" : "border border-hairline hover:bg-white/5"}`}
              >
                {t.label} <span className={`text-[10px] ${active ? "opacity-80" : "text-muted-foreground"}`}>{n}</span>
              </button>
            );
          })}
        </div>
      </div>

      <AdminCard className="!p-3 md:!p-4 mb-4">
        <div className="relative">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input placeholder="Numéro, nom, téléphone, wilaya…" value={q} onChange={(e) => setQ(e.target.value)} className={inputCls + " pl-10 !py-3"} />
        </div>
      </AdminCard>

      {filtered.length === 0 ? (
        <AdminEmpty title={orders.length === 0 ? "Aucune commande" : "Aucun résultat"}>
          {orders.length === 0 ? "Les commandes clients apparaîtront ici." : "Aucune commande ne correspond aux filtres."}
        </AdminEmpty>
      ) : (
        <>
          {/* Desktop table */}
          <AdminCard className="!p-0 overflow-hidden hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-hairline text-left text-[11px] uppercase tracking-widest text-muted-foreground">
                    <th className="p-3">N°</th>
                    <th className="p-3">Client</th>
                    <th className="p-3">Wilaya</th>
                    <th className="p-3">Téléphone</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Total</th>
                    <th className="p-3">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o) => (
                    <tr key={o.id} className="border-b border-hairline last:border-b-0 hover:bg-white/[0.02] cursor-pointer" onClick={() => setOpenId(o.id)}>
                      <td className="p-3"><span className="font-mono text-xs text-accent font-semibold">{o.order_number}</span></td>
                      <td className="p-3">{o.full_name}</td>
                      <td className="p-3 text-xs">{o.wilaya}</td>
                      <td className="p-3 font-mono text-xs">{o.phone}</td>
                      <td className="p-3 text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString("fr-FR")}</td>
                      <td className="p-3 font-mono text-xs font-semibold">{formatDA(o.total_da)}</td>
                      <td className="p-3"><StatusPill status={o.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AdminCard>

          {/* Mobile cards */}
          <div className="md:hidden space-y-2">
            {filtered.map((o) => (
              <button key={o.id} type="button" onClick={() => setOpenId(o.id)} className="w-full text-left block rounded-xl border border-hairline bg-card p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-accent font-bold">{o.order_number}</span>
                  <StatusPill status={o.status} />
                </div>
                <div className="mt-1 font-semibold truncate">{o.full_name}</div>
                <div className="text-[11px] text-muted-foreground truncate">{o.wilaya}</div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1"><Phone className="size-3" />{o.phone}</span>
                  <span className="font-mono font-semibold">{formatDA(o.total_da)}</span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
      <OrderModal orderId={openId} onClose={() => setOpenId(null)} />
    </AdminPage>
  );
}
