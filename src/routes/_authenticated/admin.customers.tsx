import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { allOrdersAdminQO } from "@/lib/queries";
import { formatDA } from "@/lib/format";
import { Search, Phone, MessageCircle } from "lucide-react";
import { AdminPage, AdminCard, AdminEmpty, inputCls } from "@/components/admin/shell";

export const Route = createFileRoute("/_authenticated/admin/customers")({
  component: Customers,
});

type Customer = {
  phone: string;
  name: string;
  wilaya: string;
  orders: number;
  total: number;
  last: string;
};

function Customers() {
  const { data: orders = [] } = useQuery(allOrdersAdminQO);
  const [q, setQ] = useState("");

  const customers = useMemo<Customer[]>(() => {
    const map = new Map<string, Customer>();
    for (const o of orders) {
      const key = o.phone.replace(/\s+/g, "");
      const cur = map.get(key);
      if (cur) {
        cur.orders += 1;
        cur.total += o.total_da ?? 0;
        if (new Date(o.created_at) > new Date(cur.last)) cur.last = o.created_at;
      } else {
        map.set(key, { phone: o.phone, name: o.full_name, wilaya: o.wilaya, orders: 1, total: o.total_da ?? 0, last: o.created_at });
      }
    }
    return [...map.values()].sort((a, b) => b.total - a.total);
  }, [orders]);

  const filtered = useMemo(() => {
    if (!q.trim()) return customers;
    const s = q.toLowerCase();
    return customers.filter((c) => c.name.toLowerCase().includes(s) || c.phone.includes(s) || c.wilaya.toLowerCase().includes(s));
  }, [customers, q]);

  return (
    <AdminPage title="Clients" subtitle={`${customers.length} client(s) unique(s)`}>
      <AdminCard className="!p-3 md:!p-4 mb-4">
        <div className="relative">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input placeholder="Rechercher…" value={q} onChange={(e) => setQ(e.target.value)} className={inputCls + " pl-10 !py-3"} />
        </div>
      </AdminCard>

      {filtered.length === 0 ? (
        <AdminEmpty title="Aucun client">Les clients apparaîtront ici après leur première commande.</AdminEmpty>
      ) : (
        <>
          <AdminCard className="!p-0 overflow-hidden hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-hairline text-left text-[11px] uppercase tracking-widest text-muted-foreground">
                    <th className="p-3">Client</th>
                    <th className="p-3">Téléphone</th>
                    <th className="p-3">Wilaya</th>
                    <th className="p-3 text-center">Commandes</th>
                    <th className="p-3 text-right">Total dépensé</th>
                    <th className="p-3">Dernière</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => {
                    const clean = c.phone.replace(/\s+/g, "");
                    const wa = clean.startsWith("+") ? clean.slice(1) : clean.replace(/^0/, "213");
                    return (
                      <tr key={c.phone} className="border-b border-hairline last:border-b-0">
                        <td className="p-3 font-medium">{c.name}</td>
                        <td className="p-3 font-mono text-xs">{c.phone}</td>
                        <td className="p-3 text-xs">{c.wilaya}</td>
                        <td className="p-3 text-center font-mono font-bold">{c.orders}</td>
                        <td className="p-3 text-right font-mono font-semibold">{formatDA(c.total)}</td>
                        <td className="p-3 text-xs text-muted-foreground">{new Date(c.last).toLocaleDateString("fr-FR")}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <a href={`tel:${clean}`} className="p-1.5 rounded-lg border border-hairline hover:bg-white/5"><Phone className="size-3.5" /></a>
                            <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg border border-hairline hover:bg-white/5"><MessageCircle className="size-3.5" /></a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </AdminCard>

          <div className="md:hidden space-y-2">
            {filtered.map((c) => (
              <div key={c.phone} className="rounded-xl border border-hairline bg-card p-3">
                <div className="font-semibold truncate">{c.name}</div>
                <div className="text-[11px] text-muted-foreground truncate">{c.wilaya} · {c.phone}</div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{c.orders} cmd</span>
                  <span className="font-mono font-semibold">{formatDA(c.total)}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </AdminPage>
  );
}
