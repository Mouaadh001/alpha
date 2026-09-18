import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { allProductsAdminQO, allOrdersAdminQO } from "@/lib/queries";
import { formatDA } from "@/lib/format";
import { Package, ShoppingBag, Wallet, AlertTriangle, Plus } from "lucide-react";
import { AdminPage, AdminCard, AdminEmpty, btnPrimary } from "@/components/admin/shell";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const { data: products = [] } = useQuery(allProductsAdminQO);
  const { data: orders = [] } = useQuery(allOrdersAdminQO);

  const revenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((n, o) => n + Number(o.total_da), 0);
  const pending = orders.filter((o) => o.status === "pending").length;
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 3);
  const outOfStock = products.filter((p) => p.stock === 0);

  const kpis = [
    { label: "Revenu total", value: formatDA(revenue), hint: `${orders.length} commande(s)`, icon: Wallet, tint: "bg-accent/10 text-accent" },
    { label: "En attente", value: String(pending), hint: "à traiter", icon: ShoppingBag, tint: "bg-amber-500/10 text-amber-400" },
    { label: "Produits actifs", value: String(products.filter((p) => p.active).length), hint: `${products.length} au total`, icon: Package, tint: "bg-emerald-500/10 text-emerald-400" },
  ];

  return (
    <AdminPage
      title="Tableau de bord"
      subtitle="Vue d'ensemble de votre boutique."
      actions={<Link to="/admin/products/new" className={btnPrimary}><Plus className="size-4" /> Nouveau produit</Link>}
    >
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-8">
        {kpis.map((s) => (
          <AdminCard key={s.label} className="!p-4 md:!p-5">
            <div className="flex items-start justify-between gap-2 mb-3">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">{s.label}</span>
              <div className={`size-8 rounded-lg grid place-items-center ${s.tint}`}><s.icon className="size-4" /></div>
            </div>
            <div className="text-xl md:text-2xl font-display font-extrabold truncate">{s.value}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{s.hint}</div>
          </AdminCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <AdminCard className="lg:col-span-2 !p-0 overflow-hidden">
          <div className="p-5 border-b border-hairline flex items-center justify-between">
            <h2 className="font-semibold">Commandes récentes</h2>
            <Link to="/admin/orders" className="text-xs font-semibold text-accent hover:underline">Tout voir →</Link>
          </div>
          {orders.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">Aucune commande pour le moment.</div>
          ) : (
            <div className="divide-y divide-hairline">
              {orders.slice(0, 6).map((o) => (
                <Link key={o.id} to="/admin/orders/$id" params={{ id: o.id }} className="p-4 flex items-center gap-3 hover:bg-white/[0.03] transition-colors">
                  <div className="size-9 rounded-full bg-accent/15 text-accent grid place-items-center text-xs font-bold shrink-0">
                    {o.full_name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{o.full_name}</div>
                    <div className="text-[11px] text-muted-foreground truncate">#{o.order_number} · {o.wilaya}</div>
                  </div>
                  <StatusPill status={o.status} />
                  <div className="text-sm font-semibold whitespace-nowrap hidden sm:block">{formatDA(o.total_da)}</div>
                </Link>
              ))}
            </div>
          )}
        </AdminCard>

        {/* Stock alerts */}
        <AdminCard className="!p-0 overflow-hidden">
          <div className="p-5 border-b border-hairline flex items-center gap-2">
            <AlertTriangle className="size-4 text-amber-400" />
            <h2 className="font-semibold">Alertes stock</h2>
          </div>
          {lowStock.length + outOfStock.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">Tout est en stock ✓</div>
          ) : (
            <div className="divide-y divide-hairline">
              {outOfStock.slice(0, 4).map((p) => (
                <Link key={p.id} to="/admin/products/$id" params={{ id: p.id }} className="p-4 flex items-center gap-3 hover:bg-white/[0.03]">
                  <div className="flex-1 min-w-0 text-sm truncate">{p.name_fr}</div>
                  <span className="text-[10px] font-bold text-destructive px-2 py-0.5 rounded-full bg-destructive/15">RUPTURE</span>
                </Link>
              ))}
              {lowStock.slice(0, 4).map((p) => (
                <Link key={p.id} to="/admin/products/$id" params={{ id: p.id }} className="p-4 flex items-center gap-3 hover:bg-white/[0.03]">
                  <div className="flex-1 min-w-0 text-sm truncate">{p.name_fr}</div>
                  <span className="text-[10px] font-bold text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/15">{p.stock} restants</span>
                </Link>
              ))}
            </div>
          )}
        </AdminCard>
      </div>

      {orders.length === 0 && products.length === 0 && (
        <AdminEmpty title="Prêt à démarrer" action={<Link to="/admin/products/new" className={btnPrimary}><Plus className="size-4" /> Ajouter votre premier produit</Link>}>
          Ajoutez vos premières catégories et produits pour lancer la boutique.
        </AdminEmpty>
      )}
    </AdminPage>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    pending:   { cls: "bg-amber-500/15 text-amber-400",   label: "En attente" },
    confirmed: { cls: "bg-sky-500/15 text-sky-400",       label: "Confirmée" },
    preparing: { cls: "bg-blue-500/15 text-blue-400",     label: "Préparation" },
    shipped:   { cls: "bg-violet-500/15 text-violet-300", label: "Expédiée" },
    delivered: { cls: "bg-emerald-500/15 text-emerald-400", label: "Livrée" },
    cancelled: { cls: "bg-destructive/15 text-destructive", label: "Annulée" },
  };
  const s = map[status];
  return (
    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${s?.cls ?? "bg-white/5 text-muted-foreground"}`}>
      {s?.label ?? status}
    </span>
  );
}